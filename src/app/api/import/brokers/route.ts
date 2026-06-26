import { NextRequest, NextResponse } from 'next/server';
import { detectBrokerDocument } from '@/services/import/brokers/detector';
import { parseB3BrokerXlsx } from '@/services/import/brokers/universal-xlsx-parser';
import { parseSinacorPdf } from '@/services/import/brokers/sinacor-pdf-parser';
import { normalizeBrokerImport } from '@/services/import/brokers/normalizer';
import { validateBrokerImport } from '@/services/import/brokers/validation-engine';
import { evaluateImportDecisions } from '@/services/import/brokers/import-decision-engine';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const password = formData.get('password') as string | null;
    const userId = formData.get('userId') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado.' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let pdfText = '';

    const isPdf = file.type === 'application/pdf' || file.name.endsWith('.pdf');

    if (isPdf) {
      // Dynamic import to avoid next.js bundling failures on runtime CJS packages
      const { extractTextFromPDF } = await import('@/core/finance/pdf-reader');
      pdfText = await extractTextFromPDF(buffer, password || undefined);
    }

    // 1. Run Detector
    const detected = detectBrokerDocument(buffer, file.name, file.type, pdfText);

    if (detected.source === 'UNKNOWN' || detected.documentType === 'UNKNOWN') {
      return NextResponse.json(
        { error: 'Documento de corretora não reconhecido ainda.', detected },
        { status: 422 }
      );
    }

    let parsedResult;

    // 2. Route to correct parser
    if (detected.format === 'XLSX' && detected.schemaKey) {
      parsedResult = parseB3BrokerXlsx(buffer, detected.schemaKey, file.name);
    } else if (detected.format === 'PDF' && detected.documentType === 'BROKERAGE_NOTE') {
      parsedResult = parseSinacorPdf(pdfText);
    } else {
      return NextResponse.json(
        { error: 'Documento de corretora não reconhecido ainda.', detected },
        { status: 422 }
      );
    }

    // Override detected info if the parser adjusted it
    parsedResult.detected = {
      ...detected,
      ...parsedResult.detected
    };

    // 3. Normalize, Validate & Decide
    const normalized = normalizeBrokerImport(parsedResult, file.name, userId || undefined);
    const validated = validateBrokerImport(normalized);
    const withDecisions = await evaluateImportDecisions(validated, userId || 'preview');

    return NextResponse.json({
      success: true,
      data: withDecisions
    });

  } catch (error: any) {
    console.error('Broker Import Error:', error);
    
    if (error.message === 'PDF_PROTEGIDO_OU_SENHA_INVALIDA') {
      return NextResponse.json(
        { code: 'PDF_PASSWORD_REQUIRED', error: 'Este PDF está protegido ou a senha está incorreta.' },
        { status: 423 }
      );
    }

    const message = String(error?.message || error || 'Erro ao processar arquivo de corretora.');
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
