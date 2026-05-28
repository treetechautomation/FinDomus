'use server';

import { extractTransactionsFromDocument, ExtractTransactionsFromDocumentOutput } from '@/ai/flows/extract-transactions-from-document';

export async function handleFileExtract(dataUri: string): Promise<{ success: boolean; data?: ExtractTransactionsFromDocumentOutput; error?: string }> {
  try {
    const result = await extractTransactionsFromDocument({ documentDataUri: dataUri });
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Falha ao extrair transações do documento. Por favor, tente novamente.' };
  }
}
