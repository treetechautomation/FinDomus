import { NextRequest, NextResponse } from 'next/server';
import { parseB3Pdf } from '@/services/import/b3/b3-parser';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const password = formData.get('password') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado.' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    let text = '';

    if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      // Usa o leitor de PDF (que já está isolado no core) para pegar o texto
      const { extractTextFromPDF } = await import('@/core/finance/pdf-reader');
      text = await extractTextFromPDF(buffer, password || undefined);
    } else {
      // Se for CSV/Texto
      text = buffer.toString('utf-8');
    }

    // Chama o parser puramente B3
    const parsedData = parseB3Pdf(text);

    return NextResponse.json({ 
      success: true,
      data: parsedData,
      rawTextLen: text.length
    });
  } catch (error: any) {
    console.error('B3 Import Error:', error);
    
    if (error.message === 'PDF_PROTEGIDO_OU_SENHA_INVALIDA') {
      return NextResponse.json(
        { code: 'PDF_PASSWORD_REQUIRED', error: 'Este PDF está protegido ou a senha está incorreta.' },
        { status: 423 }
      );
    }

    const message = String(error?.message || error || 'Erro ao processar arquivo B3.');
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
