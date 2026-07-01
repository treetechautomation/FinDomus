import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { TourState } from '@/core/onboarding/types';

export async function getTourProgress(userId: string): Promise<TourState | null> {
  if (!userId) return null;
  try {
    const docRef = doc(db, 'tour_progress', userId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as TourState;
    }
  } catch (error) {
    console.error('Error fetching tour progress:', error);
  }
  return null;
}

export async function saveTourProgress(userId: string, state: TourState): Promise<void> {
  if (!userId) return;
  try {
    const docRef = doc(db, 'tour_progress', userId);
    await setDoc(docRef, state, { merge: true });
  } catch (error) {
    console.error('Error saving tour progress:', error);
  }
}
