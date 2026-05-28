import { NextResponse } from 'next/server';
import { db } from '@/services/firebase';
import { collection, query, where, getDocs, updateDoc } from 'firebase/firestore';

function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

export async function POST(req: Request) {
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

    const snap = await getDocs(
      query(collection(db, 'categories'), where('name', '==', category))
    );

    if (snap.empty) {
      return NextResponse.json({ ok: false });
    }

    const docRef = snap.docs[0].ref;
    const data = snap.docs[0].data();

    const keywords = new Set(data.keywords || []);
    keywords.add(keyword);

    await updateDoc(docRef, {
      keywords: Array.from(keywords)
    });

    return NextResponse.json({ ok: true });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro aprendizado' }, { status: 500 });
  }
}
