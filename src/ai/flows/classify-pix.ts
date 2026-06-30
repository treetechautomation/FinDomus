import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const PixInputSchema = z.object({
  text: z.string(),
  amount: z.number(),
});

const PixOutputSchema = z.object({
  type: z.enum(['income', 'transfer']),
  confidence: z.number(),
  reason: z.string(),
});

const classifyPixPrompt = ai.definePrompt({
  name: 'classifyPixPrompt',
  input: { schema: PixInputSchema },
  output: { schema: PixOutputSchema },
  prompt: `Você é um classificador financeiro.

Analise a transação:

Texto: "{{input.text}}"
Valor: {{input.amount}}

Classifique como:
- income → dinheiro vindo de fora (salário, cliente, venda)
- transfer → movimentação entre contas próprias

Regras:
- PIX enviado → transfer
- PIX recebido sem contexto → transfer
- PIX com palavras como salário, pagamento, cliente → income

Responda no formato JSON estruturado.`,
});

export const classifyPixFlow = ai.defineFlow(
  {
    name: 'classifyPix',
    inputSchema: PixInputSchema,
    outputSchema: PixOutputSchema,
  },
  async (input) => {
    const { output } = await classifyPixPrompt(input);
    if (!output) {
      throw new Error('Failed to classify Pix transaction.');
    }
    return output;
  }
);
