import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { verifyIdToken } from '@/lib/verify-id-token';

function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

export async function POST(req: Request) {
  let decodedToken;
  try {
    const authHeader = req.headers.get('authorization');
    decodedToken = await verifyIdToken(authHeader);
  } catch (error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { text, category } = await req.json();

    if (!text || !category) {
      return NextResponse.json({ ok: false });
    }

    const keyword = normalize(text)
      .split(' ')
      .filter(w => w.length > 3)[0];

    if (!keyword) {
      return NextResponse.json({ ok: false });
    }

    const snap = await adminDb.collection('categories').where('name', '==', category).get();

    if (snap.empty) {
      return NextResponse.json({ ok: false });
    }

    const docRef = snap.docs[0].ref;
    const data = snap.docs[0].data();

    const keywords = new Set(data.keywords || []);
    keywords.add(keyword);

    await docRef.update({
      keywords: Array.from(keywords)
    });

    // Também aprende por fingerprint (Sistema A)
    const fingerprint = text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\b\d{2}\/\d{2}(\/\d{2,4})?\b/g, ' ')
      .replace(/\b\d{2}:\d{2}\b/g, ' ')
      .replace(/\b\d{3,}\b/g, ' ')
      .replace(/\b\d+\b/g, ' ')
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (fingerprint) {
      const learnSnap = await adminDb.collection('category_learning')
        .where('fingerprint', '==', fingerprint)
        .where('userId', '==', decodedToken.uid || null)
        .get();

      if (!learnSnap.empty) {
        const existingDoc = learnSnap.docs[0];
        const existingData = existingDoc.data();
        await existingDoc.ref.update({
          category,
          learnCount: Number(existingData.learnCount || 0) + 1,
          updatedAt: new Date().toISOString(),
        });
      } else {
        await adminDb.collection('category_learning').add({
          fingerprint,
          originalDescription: text,
          category,
          userId: decodedToken.uid || null,
          confidence: 1,
          learnCount: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    }

    return NextResponse.json({ ok: true });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro aprendizado' }, { status: 500 });
  }
}
