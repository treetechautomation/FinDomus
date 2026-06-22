import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface Household {
  id: string;
  name: string;
  ownerId: string;
  planId: string;
  createdAt: string;
  updatedAt: string;
}

export interface HouseholdMember {
  id: string; // "householdId_userId"
  householdId: string;
  userId: string;
  email: string;
  displayName: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: string;
  updatedAt: string;
  inviteToken?: string;
}

export interface HouseholdInvite {
  id: string; // Token (UUID)
  householdId: string;
  invitedEmail: string;
  role: 'admin' | 'member';
  invitedBy: string;
  status: 'pending' | 'accepted' | 'declined' | 'revoked';
  createdAt: string;
  expiresAt: string;
}

export interface Subscription {
  id: string;
  householdId: string;
  planId: string;
  status: 'active' | 'canceled' | 'past_due';
  currentPeriodEnd: string | null;
  createdAt: string;
  updatedAt: string;
}

export async function createHouseholdForOwner(
  userId: string,
  email: string,
  displayName: string,
  planId: string
): Promise<string> {
  const now = new Date().toISOString();

  // 1. Create household document
  const householdRef = doc(collection(db, 'households'));
  const householdId = householdRef.id;
  await setDoc(householdRef, {
    name: `Família de ${displayName || email}`,
    ownerId: userId,
    planId: planId,
    createdAt: now,
    updatedAt: now,
  });

  // 2. Create household member document
  const memberId = `${householdId}_${userId}`;
  await setDoc(doc(db, 'household_members', memberId), {
    householdId,
    userId,
    email,
    displayName: displayName || '',
    role: 'owner',
    joinedAt: now,
    updatedAt: now,
  });

  // 3. Create or update user profile
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    await setDoc(
      userRef,
      {
        activeHouseholdId: householdId,
        defaultRole: 'owner',
        email,
        displayName: displayName || '',
        updatedAt: now,
      },
      { merge: true }
    );
  } else {
    await setDoc(userRef, {
      uid: userId,
      email,
      displayName: displayName || '',
      activeHouseholdId: householdId,
      defaultRole: 'owner',
      onboardingCompleted: false,
      createdAt: now,
      updatedAt: now,
    });
  }

  // 4. Create active subscription
  const subRef = doc(collection(db, 'subscriptions'));
  await setDoc(subRef, {
    householdId,
    planId,
    status: 'active',
    currentPeriodEnd: null,
    createdAt: now,
    updatedAt: now,
  });

  return householdId;
}

export async function getActiveHouseholdForUser(userId: string): Promise<Household | null> {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) return null;
  const userData = userSnap.data();
  const activeId = userData.activeHouseholdId;
  if (!activeId) return null;

  const hhSnap = await getDoc(doc(db, 'households', activeId));
  if (hhSnap.exists()) {
    return { id: hhSnap.id, ...hhSnap.data() } as Household;
  }
  return null;
}

export async function createHouseholdInvite(
  householdId: string,
  invitedEmail: string,
  role: 'admin' | 'member',
  invitedBy: string
): Promise<HouseholdInvite> {
  const now = new Date().toISOString();
  // Expires in 7 days
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  const inviteRef = doc(collection(db, 'household_invites'));
  const token = inviteRef.id;
  const invite: HouseholdInvite = {
    id: token,
    householdId,
    invitedEmail,
    role,
    invitedBy,
    status: 'pending',
    createdAt: now,
    expiresAt,
  };
  await setDoc(inviteRef, invite);
  return invite;
}

export async function acceptHouseholdInvite(
  token: string,
  userId: string,
  email: string,
  displayName: string
): Promise<boolean> {
  const inviteRef = doc(db, 'household_invites', token);
  const inviteSnap = await getDoc(inviteRef);
  if (!inviteSnap.exists()) return false;
  const invite = inviteSnap.data() as HouseholdInvite;

  if (invite.status !== 'pending') return false;
  const expires = new Date(invite.expiresAt).getTime();
  if (expires < Date.now()) return false;

  const now = new Date().toISOString();

  // 1. Mark invite as accepted
  await updateDoc(inviteRef, {
    status: 'accepted',
    updatedAt: now,
  });

  // 2. Set/update user profile
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    await setDoc(
      userRef,
      {
        activeHouseholdId: invite.householdId,
        defaultRole: invite.role,
        email,
        displayName: displayName || '',
        updatedAt: now,
      },
      { merge: true }
    );
  } else {
    await setDoc(userRef, {
      uid: userId,
      email,
      displayName: displayName || '',
      activeHouseholdId: invite.householdId,
      defaultRole: invite.role,
      onboardingCompleted: false,
      createdAt: now,
      updatedAt: now,
    });
  }

  // 3. Create household member document
  const memberId = `${invite.householdId}_${userId}`;
  await setDoc(doc(db, 'household_members', memberId), {
    householdId: invite.householdId,
    userId,
    email,
    displayName: displayName || '',
    role: invite.role,
    joinedAt: now,
    updatedAt: now,
    inviteToken: token,
  });

  return true;
}

export async function getHouseholdMembers(householdId: string): Promise<HouseholdMember[]> {
  const q = query(collection(db, 'household_members'), where('householdId', '==', householdId));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }) as HouseholdMember);
}

export async function getSubscriptionByHousehold(householdId: string): Promise<Subscription | null> {
  const q = query(collection(db, 'subscriptions'), where('householdId', '==', householdId));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const activeSub = snap.docs.find(d => d.data().status === 'active');
  if (activeSub) {
    return { id: activeSub.id, ...activeSub.data() } as Subscription;
  }
  return { id: snap.docs[0].id, ...snap.docs[0].data() } as Subscription;
}
