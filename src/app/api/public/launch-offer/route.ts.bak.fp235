import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const docRef = adminDb.collection('settings').doc('launch_offer');
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      const data = docSnap.data();
      const totalSlots = data?.totalSlots ?? 100;
      const usedSlots = data?.usedSlots ?? 0;
      const remainingSlots = Math.max(0, totalSlots - usedSlots);
      const active = data?.active ?? true;

      return NextResponse.json({
        totalSlots,
        usedSlots,
        remainingSlots,
        active,
      });
    }
  } catch (error) {
    console.error('Error fetching launch offer from admin Firestore:', error);
  }

  // Fallback seguro em caso de indisponibilidade ou documento inexistente
  return NextResponse.json({
    totalSlots: 100,
    usedSlots: 0,
    remainingSlots: 100,
    active: true,
  });
}
