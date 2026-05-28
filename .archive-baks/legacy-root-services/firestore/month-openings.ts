import {
  addDoc,
  collection,
  getDocs,
  query,
  where,
} from 'firebase/firestore';

import { db } from '@/lib/firebase';

import { addMonths } from '@/core/finance/financial-period-engine';
import { buildMonthOpening } from '@/core/finance/month-opening-engine';

export async function getMonthOpening(
  owner: 'PF' | 'PJ',
  monthKey: string
) {
  const q = query(
    collection(db, 'month_openings'),
    where('owner', '==', owner),
    where('monthKey', '==', monthKey)
  );

  const snap = await getDocs(q);

  if (snap.empty) return null;

  return {
    id: snap.docs[0].id,
    ...snap.docs[0].data(),
  };
}

export async function openMonth(
  owner: 'PF' | 'PJ',
  monthKey: string
) {
  const existing = await getMonthOpening(
    owner,
    monthKey
  );

  if (existing) {
    return existing;
  }

  const previousMonth = addMonths(monthKey, -1);

  const closuresSnap = await getDocs(
    query(
      collection(db, 'monthly_closures'),
      where('owner', '==', owner),
      where('month', '==', previousMonth)
    )
  );

  const previousClosure = closuresSnap.empty
    ? null
    : {
        id: closuresSnap.docs[0].id,
        ...closuresSnap.docs[0].data(),
      };

  const opening = buildMonthOpening({
    owner,
    monthKey,
    previousClosure,
  });

  const ref = await addDoc(
    collection(db, 'month_openings'),
    opening
  );

  return {
    id: ref.id,
    ...opening,
  };
}
