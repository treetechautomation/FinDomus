import { NextRequest, NextResponse } from 'next/server';

import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

function formatDateOFX(value: any) {
  const raw = String(value || '').trim();

  const [day, month, year] = raw.split('/');

  if (!day || !month || !year) {
    return '20260101000000';
  }

  return `${year}${month}${day}000000`;
}

export async function GET(req: NextRequest) {
  try {
    const owner =
      req.nextUrl.searchParams.get('owner') || 'PF';

    const snap = await getDocs(
      collection(db, 'transactions')
    );

    const rows = snap.docs
      .map((d) => ({
        id: d.id,
        ...d.data(),
      }))
      .filter((t: any) => t.owner === owner);

    const body = rows
      .map((t: any) => {
        const type =
          t.type === 'income'
            ? 'CREDIT'
            : 'DEBIT';

        return `
<STMTTRN>
<TRNTYPE>${type}
<DTPOSTED>${formatDateOFX(t.date)}
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
