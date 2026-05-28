import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const classifyPixFlow = ai.defineFlow(
  {
    name: 'classifyPix',
    inputSchema: z.object({
      text: z.string(),
      amount: z.number(),
    }),
    outputSchema: z.object({
      type: z.enum(['income', 'transfer']),
      confidence: z.number(),
      reason: z.string(),
    }),
  },
  async (input) => {
    const prompt = `
Você é um classificador financeiro.

Analise a transação:

Texto: "${input.text}"
Valor: ${input.amount}

Classifique como:
- income → dinheiro vindo de fora (salário, cliente, venda)
- transfer → movimentação entre contas próprias

Regras:
- PIX enviado → transfer
- PIX recebido sem contexto → transfer
- PIX com palavras como salário, pagamento, cliente → income

Responda JSON:
{
  "type": "income" ou "transfer",
  "confidence": 0 a 1,
  "reason": "explicação curta"
}
`;

    const res = await ai.generate({
      prompt,
    });

    return JSON.parse(res.text);
  }
);
