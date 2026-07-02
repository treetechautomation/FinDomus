import { NextRequest, NextResponse } from 'next/server';

import { adminDb } from '@/lib/firebase-admin';
import { verifyIdToken } from '@/lib/verify-id-token';

function formatDateOFX(value: any, isoFallback?: string) {
  const raw = String(value || '').trim();

  const brMatch = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (brMatch) {
    const [, dd, mm, yyyy] = brMatch;
    return `${yyyy}${mm.padStart(2, '0')}${dd.padStart(2, '0')}000000`;
  }

  const isoMatch = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    const [, yyyy, mm, dd] = isoMatch;
    return `${yyyy}${mm}${dd}000000`;
  }

  if (isoFallback) {
    const iso2 = String(isoFallback).trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (iso2) {
      const [, yyyy, mm, dd] = iso2;
      return `${yyyy}${mm}${dd}000000`;
    }
  }

  return '20260101000000';
}

export async function GET(req: NextRequest) {
  let rows: any[] = [];
  let owner = 'PF';
  try {
    const authHeader = req.headers.get('authorization');
    const decoded = await verifyIdToken(authHeader);
    const userId = decoded.uid;

    owner = req.nextUrl.searchParams.get('owner') || 'PF';

    const snap = await adminDb.collection('transactions')
      .where('userId', '==', userId)
      .where('owner', '==', owner)
      .get();

    rows = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));
  } catch (error) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const body = rows
      .map((t: any) => {
        const type =
          t.type === 'income'
            ? 'CREDIT'
            : 'DEBIT';

        return `
<STMTTRN>
<TRNTYPE>${type}
<DTPOSTED>${formatDateOFX(t.date, t.dateISO)}
<TRNAMT>${Number(
          t.type === 'income'
            ? t.amount
            : -Math.abs(t.amount)
        ).toFixed(2)}
<FITID>${t.externalId || t.id}
<NAME>${String(t.description || '')
  .replace(/[<>]/g, '')
  .slice(0, 80)}
<MEMO>${String(
          t.category || ''
        ).replace(/[<>]/g, '')}
</STMTTRN>`;
      })
      .join('\n');

    const ofx = `OFXHEADER:100
DATA:OFXSGML
VERSION:102
SECURITY:NONE
ENCODING:UTF-8
CHARSET:UTF-8
COMPRESSION:NONE
OLDFILEUID:NONE
NEWFILEUID:NONE

<OFX>
<BANKMSGSRSV1>
<STMTTRNRS>
<STMTRS>
<BANKTRANLIST>
${body}
</BANKTRANLIST>
</STMTRS>
</STMTTRNRS>
</BANKMSGSRSV1>
</OFX>`;

    return new NextResponse(ofx, {
      status: 200,
      headers: {
        'content-type': 'application/x-ofx',
        'content-disposition': `attachment; filename="findomus-${owner}.ofx"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: String(
          error?.message || error || 'EXPORT_ERROR'
        ),
      },
      { status: 500 }
    );
  }
}
