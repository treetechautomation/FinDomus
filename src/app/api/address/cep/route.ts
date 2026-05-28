import { NextResponse } from 'next/server';
import { verifyIdToken } from '@/lib/verify-id-token';
import { getAddressByCEP } from '@/services/free-apis/viacep';
import { getCEP as getBrasilAPICEP } from '@/services/free-apis/brasilapi';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    await verifyIdToken(authHeader);
  } catch {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const cep = searchParams.get('cep')?.replace(/\D/g, '');
  const source = searchParams.get('source') || 'viacep';

  if (!cep || cep.length !== 8) {
    return NextResponse.json({ ok: false, error: 'CEP inválido. Informe 8 dígitos.' }, { status: 400 });
  }

  try {
    if (source === 'brasilapi') {
      const data = await getBrasilAPICEP(cep);
      return NextResponse.json({
        ok: true,
        source: 'brasilapi',
        data: {
          cep: data.cep,
          logradouro: data.street,
          bairro: data.neighborhood,
          localidade: data.city,
          uf: data.state,
        },
      });
    }

    const data = await getAddressByCEP(cep);
    return NextResponse.json({
      ok: true,
      source: 'viacep',
      data: {
        cep: data.cep,
        logradouro: data.logradouro,
        complemento: data.complemento,
        bairro: data.bairro,
        localidade: data.localidade,
        uf: data.uf,
        ibge: data.ibge,
        ddd: data.ddd,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 404 });
  }
}
