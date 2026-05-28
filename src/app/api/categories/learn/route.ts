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
  try {
    const authHeader = req.headers.get('authorization');
    await verifyIdToken(authHeader);
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

    return NextResponse.json({ ok: true });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro aprendizado' }, { status: 500 });
  }
}
