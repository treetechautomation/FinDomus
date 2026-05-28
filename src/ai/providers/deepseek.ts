import OpenAI from 'openai';

export type DeepSeekMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com',
});

export async function deepseekChat(
  messages: DeepSeekMessage[],
  options?: {
    model?: 'deepseek-chat' | 'deepseek-reasoner';
    temperature?: number;
  }
): Promise<string> {
  if (!process.env.DEEPSEEK_API_KEY) {
    throw new Error('DEEPSEEK_API_KEY não configurada.');
  }

  const response = await deepseek.chat.completions.create({
    model: options?.model ?? 'deepseek-chat',
    messages,
    temperature: options?.temperature ?? 0.2,
  });

  return response.choices[0]?.message?.content ?? '';
}
