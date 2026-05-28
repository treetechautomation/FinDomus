'use server';

import { extractTransactionsFromDocument, ExtractTransactionsFromDocumentOutput } from '@/ai/flows/extract-transactions-from-document';
import { verifyIdToken } from '@/lib/verify-id-token';

export async function handleFileExtract(dataUri: string, idToken?: string): Promise<{ success: boolean; data?: ExtractTransactionsFromDocumentOutput; error?: string }> {
  try {
    if (!idToken) {
      return { success: false, error: 'Não autorizado: Token ausente' };
    }
    await verifyIdToken(`Bearer ${idToken}`);

    const result = await extractTransactionsFromDocument({ documentDataUri: dataUri });
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Falha ao extrair transações do documento. Por favor, tente novamente.' };
  }
}
