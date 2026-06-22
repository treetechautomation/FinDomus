import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { verifyIdToken } from '@/lib/verify-id-token';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const decodedToken = await verifyIdToken(authHeader);
    const { uid, email = '', name: displayName = '' } = decodedToken;

    if (!uid) {
      return NextResponse.json({ error: 'Invalid user token.' }, { status: 401 });
    }

    const userRef = adminDb.collection('users').doc(uid);
    const userDoc = await userRef.get();

    if (userDoc.exists) {
      const userData = userDoc.data();
      if (userData && userData.activeHouseholdId) {
        return NextResponse.json({
          ok: true,
          alreadyBootstrapped: true,
          householdId: userData.activeHouseholdId,
        });
      }
    }

    // Initialize bootstrapping
    const now = new Date().toISOString();
    
    // Generate new household ID
    const householdRef = adminDb.collection('households').doc();
    const householdId = householdRef.id;

    const memberId = `${householdId}_${uid}`;
    const memberRef = adminDb.collection('household_members').doc(memberId);
    
    const subRef = adminDb.collection('subscriptions').doc();

    const batch = adminDb.batch();

    // 1. Create household
    batch.set(householdRef, {
      name: `Família de ${displayName || email.split('@')[0] || 'Usuário'}`,
      ownerId: uid,
      planId: 'individual',
      createdAt: now,
      updatedAt: now,
    });

    // 2. Create household member (role owner)
    batch.set(memberRef, {
      householdId,
      userId: uid,
      email,
      displayName,
      role: 'owner',
      joinedAt: now,
      updatedAt: now,
    });

    // 3. Create/update user profile
    batch.set(
      userRef,
      {
        uid,
        email,
        displayName,
        activeHouseholdId: householdId,
        onboardingCompleted: false,
        createdAt: userDoc.exists ? (userDoc.data()?.createdAt || now) : now,
        updatedAt: now,
      },
      { merge: true }
    );

    // 4. Create active subscription
    batch.set(subRef, {
      householdId,
      planId: 'individual',
      status: 'active',
      currentPeriodEnd: null,
      createdAt: now,
      updatedAt: now,
    });

    await batch.commit();

    return NextResponse.json({
      ok: true,
      householdId,
    });
  } catch (error: any) {
    console.error('Error bootstrapping onboarding:', error);
    const status = error.message?.includes('Unauthorized') ? 401 : 500;
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status }
    );
  }
}
