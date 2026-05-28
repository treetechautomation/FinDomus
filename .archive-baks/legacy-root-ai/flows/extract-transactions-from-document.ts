'use server';
/**
 * @fileOverview A Genkit flow for extracting financial transaction details from a document.
 *
 * - extractTransactionsFromDocument - A function that processes a financial document to extract transactions.
 * - ExtractTransactionsFromDocumentInput - The input type for the extractTransactionsFromDocument function.
 * - ExtractTransactionsFromDocumentOutput - The return type for the extractTransactionsFromDocument function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractedTransactionSchema = z.object({
  date: z.string().describe('The date of the transaction in DD/MM/YYYY format.'),
  description: z.string().describe('A brief description of the transaction.'),
  value: z.number().describe('The value of the transaction. For expenses, it should be a negative number. For income, it should be a positive number.'),
  suggestedCategory: z.string().describe('A suggested category for the transaction (e.g., Alimentação, Moradia, Transporte, Lazer, Salário).'),
  transactionType: z.enum(['income', 'expense']).describe('The type of transaction: "income" or "expense".'),
  source: z.string().describe('The name of the bank or card associated with the transaction.'),
  isInstallment: z.boolean().describe('True if this transaction is part of an installment payment, otherwise false.'),
});

const ExtractTransactionsFromDocumentInputSchema = z.object({
  documentDataUri: z
    .string()
    .describe(
      "A financial document (e.g., invoice, statement) as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ExtractTransactionsFromDocumentInput = z.infer<typeof ExtractTransactionsFromDocumentInputSchema>;

const ExtractTransactionsFromDocumentOutputSchema = z.array(ExtractedTransactionSchema).describe('A list of extracted financial transactions from the document.');
export type ExtractTransactionsFromDocumentOutput = z.infer<typeof ExtractTransactionsFromDocumentOutputSchema>;

export async function extractTransactionsFromDocument(
  input: ExtractTransactionsFromDocumentInput
): Promise<ExtractTransactionsFromDocumentOutput> {
  return extractTransactionsFromDocumentFlow(input);
}

const extractTransactionsPrompt = ai.definePrompt({
  name: 'extractTransactionsPrompt',
  input: { schema: ExtractTransactionsFromDocumentInputSchema },
  output: { schema: ExtractTransactionsFromDocumentOutputSchema },
  prompt: `You are an expert financial assistant specialized in extracting transaction details from financial documents.
Your task is to analyze the provided financial document (which can be an invoice, bank statement, or credit card statement) and extract all individual transactions.
For each transaction, you must identify its date, a clear description, its value, and determine if it's an income or an expense.
Additionally, you need to suggest a suitable category for each transaction, identify the source (bank or card name), and indicate if it's part of an installment payment.

Provide the extracted transactions as a JSON array, strictly following the provided schema. Ensure values are correctly formatted.
For expenses, the 'value' should be a negative number. For income, it should be a positive number.

Document: {{media url=documentDataUri}}`,
});

const extractTransactionsFromDocumentFlow = ai.defineFlow(
  {
    name: 'extractTransactionsFromDocumentFlow',
    inputSchema: ExtractTransactionsFromDocumentInputSchema,
    outputSchema: ExtractTransactionsFromDocumentOutputSchema,
  },
  async (input) => {
    const { output } = await extractTransactionsPrompt(input);
    if (!output) {
      throw new Error('Failed to extract transactions from document.');
    }
    return output;
  }
);
