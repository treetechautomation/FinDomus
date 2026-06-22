import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  activeHouseholdId: string;
  defaultRole: 'owner' | 'admin' | 'member';
  onboardingCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  if (!userId) return null;
  try {
    const docRef = doc(db, 'users', userId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { uid: snap.id, ...snap.data() } as UserProfile;
    }
  } catch (error) {
    console.error('Error fetching user profile:', error);
  }
  return null;
}

export async function updateUserProfile(
  userId: string,
  data: Partial<Omit<UserProfile, 'uid' | 'createdAt'>>
): Promise<void> {
  if (!userId) return;
  const docRef = doc(db, 'users', userId);
  const now = new Date().toISOString();
  await setDoc(
    docRef,
    {
      ...data,
      updatedAt: now,
    },
    { merge: true }
  );
}
