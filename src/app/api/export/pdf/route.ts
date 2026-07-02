import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { verifyIdToken } from '@/lib/verify-id-token';

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

    rows = snap.docs
      .map((d) => ({ id: d.id, ...(d.data() as any) }));
  } catch (error) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const html = `
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: Arial, sans-serif; padding: 32px; font-size: 12px; }
          h1 { font-size: 22px; margin-bottom: 4px; }
          p { color: #555; margin-top: 0; }
          table { width: 100%; border-collapse: collapse; margin-top: 24px; }
          th, td { border-bottom: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background: #f3f4f6; }
          .right { text-align: right; }
        </style>
      </head>
      <body>
        <h1>Extrato FinDomus - ${owner}</h1>
        <p>Gerado em ${new Date().toLocaleString('pt-BR')}</p>

        <table>
          <thead>
            <tr>
              <th>Data</th>
              <th>Descricao</th>
              <th>Categoria</th>
              <th>Tipo</th>
              <th class="right">Valor</th>
            </tr>
          </thead>
          <tbody>
            ${rows.map((t: any) => `
              <tr>
                <td>${t.date || ''}</td>
                <td>${String(t.description || '').replace(/[<>]/g, '')}</td>
                <td>${String(t.category || '').replace(/[<>]/g, '')}</td>
                <td>${t.type || ''}</td>
                <td class="right">R$ ${Number(t.amount || 0).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
    </html>
  `;

  return new NextResponse(html, {
    status: 200,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'content-disposition': `attachment; filename="findomus-${owner}-extrato.html"`,
    },
  });
}
