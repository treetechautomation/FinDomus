import { NextRequest, NextResponse } from 'next/server';
import { execFile as execFileCb } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import crypto from 'crypto';
import { verifyIdToken } from '@/lib/verify-id-token';
import type { ParsedTransaction } from '@/core/finance/transaction-classifier';
import type { NubankInvoiceParseMetadata } from '@/core/imports/nubank-invoice-pdf-parser';

const execFile = promisify(execFileCb);

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function isQpdfAvailable(): Promise<boolean> {
  try {
    await execFile('qpdf', ['--version']);
    return true;
  } catch {
    return false;
  }
}

export type ProcessPdfTextResult = {
  status: number;
  body: {
    code?: string;
    error?: string;
    text?: string;
    transactions?: ParsedTransaction[];
    metadata?: Partial<NubankInvoiceParseMetadata>;
    docKind?: string;
    cardIssuer?: string;
  };
};

/**
 * Deterministic PDF text routing helper.
 * Exported for testability and routing contract verification.
 */
export async function processPdfText(text: string, userId: string): Promise<ProcessPdfTextResult> {
  const { detectPDFDocumentKind, detectCreditCardInvoiceIssuer } = await import('@/core/imports/pdf-document-detector');
  const docKind = detectPDFDocumentKind(text);
  const cardIssuer = detectCreditCardInvoiceIssuer(text);

  let transactions: ParsedTransaction[] = [];
  let metadata: Partial<NubankInvoiceParseMetadata> | undefined = undefined;

  if (docKind === 'credit_card_invoice' && cardIssuer === 'nubank') {
    const { parseNubankInvoicePDF } = await import('@/core/imports/nubank-invoice-pdf-parser');
    const parseResult = await parseNubankInvoicePDF(text, userId);

    if (!parseResult.success) {
      return {
        status: 422,
        body: {
          code: parseResult.code,
          error: parseResult.error,
          metadata: parseResult.metadata ? {
            invoiceTotal: parseResult.metadata.invoiceTotal,
            grossExpenses: parseResult.metadata.grossExpenses,
            refundTotal: parseResult.metadata.refundTotal,
            ignoredPayments: parseResult.metadata.ignoredPayments,
            netParsedTotal: parseResult.metadata.netParsedTotal,
            difference: parseResult.metadata.difference,
            reconciled: parseResult.metadata.reconciled,
            layoutVersion: parseResult.metadata.layoutVersion,
          } : undefined,
        },
      };
    }

    transactions = parseResult.transactions;
    metadata = {
      invoiceTotal: parseResult.metadata.invoiceTotal,
      grossExpenses: parseResult.metadata.grossExpenses,
      refundTotal: parseResult.metadata.refundTotal,
      ignoredPayments: parseResult.metadata.ignoredPayments,
      netParsedTotal: parseResult.metadata.netParsedTotal,
      difference: parseResult.metadata.difference,
      reconciled: parseResult.metadata.reconciled,
      layoutVersion: parseResult.metadata.layoutVersion,
    };
  } else if (docKind === 'bank_statement') {
    const { parseBankStatementText } = await import('@/core/finance/invoice-parser');
    transactions = await parseBankStatementText(text, userId);
  } else {
    // Unknown card issuer or unknown document kind:
    // Returns empty transactions, allowing client to invoke existing AI fallback
    transactions = [];
  }

  return {
    status: 200,
    body: {
      text,
      transactions,
      metadata,
      docKind,
      cardIssuer,
    },
  };
}

export async function POST(req: NextRequest) {
  const tempFiles: string[] = [];
  try {
    const authHeader = req.headers.get('authorization');
    let decodedToken;
    try {
      decodedToken = await verifyIdToken(authHeader);
    } catch (err: any) {
      const isMissing = !authHeader || !authHeader.startsWith('Bearer ');
      return NextResponse.json(
        { success: false, error: isMissing ? "UNAUTHORIZED" : "FORBIDDEN" },
        { status: isMissing ? 401 : 403 }
      );
    }
    const userId = decodedToken.uid;

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const password = formData.get('password') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado.' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const tempDir = os.tmpdir();
    const inputPath = path.join(tempDir, `input_${crypto.randomUUID()}.pdf`);
    const outputPath = path.join(tempDir, `output_${crypto.randomUUID()}.pdf`);
    
    await fs.writeFile(inputPath, buffer);
    tempFiles.push(inputPath);

    let finalPdfPath = inputPath;

    if (password) {
      const qpdfOk = await isQpdfAvailable();
      if (!qpdfOk) {
        return NextResponse.json(
          { code: 'QPDF_NOT_AVAILABLE', error: 'qpdf não está disponível no ambiente para processar arquivos protegidos.' },
          { status: 500 }
        );
      }

      try {
        await execFile('qpdf', [
          `--password=${password}`,
          '--decrypt',
          inputPath,
          outputPath
        ]);
        tempFiles.push(outputPath);
        finalPdfPath = outputPath;
      } catch (err: any) {
        return NextResponse.json(
          { code: 'PDF_PASSWORD_REQUIRED', error: 'Senha incorreta ou erro ao descriptografar o PDF.' },
          { status: 423 }
        );
      }
    }

    const { extractTextFromPDF } = await import('@/core/finance/pdf-reader');
    const decryptedBuffer = await fs.readFile(finalPdfPath);
    
    try {
      const text = await extractTextFromPDF(decryptedBuffer);

      if (!userId) {
        return NextResponse.json(
          { code: 'USER_ID_REQUIRED', error: 'Usuário não identificado para classificar PDF.' },
          { status: 401 }
        );
      }

      const result = await processPdfText(text, userId);
      return NextResponse.json(result.body, { status: result.status });
    } catch (error: any) {
      if (error.message === 'PDF_PROTEGIDO_OU_SENHA_INVALIDA') {
        return NextResponse.json(
          { code: 'PDF_PASSWORD_REQUIRED', error: 'Este PDF está protegido ou a senha está incorreta.' },
          { status: 423 }
        );
      }
      throw error;
    }

  } catch (error: any) {
    console.error('PDF Import Error:', error);
    const message = String(error?.message || error || 'Erro ao processar PDF.');

    return new NextResponse(
      JSON.stringify({
        code: 'PDF_IMPORT_ERROR',
        error: message,
        stack: process.env.NODE_ENV === 'development' ? String(error?.stack || '') : undefined,
      }),
      {
        status: 500,
        headers: {
          'content-type': 'application/json; charset=utf-8',
        },
      }
    );
  } finally {
    for (const f of tempFiles) {
      try {
        await fs.unlink(f);
      } catch {}
    }
  }
}
