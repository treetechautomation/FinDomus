export * from './gemini';

export type AIProvider = 'gemini';

export async function aiChat(
  provider: AIProvider,
  prompt: string
): Promise<string> {
  // Todas as requisições agora utilizam o Gemini 2.5 Flash nativo e gratuito
  const { geminiChat } = await import('./gemini');
  return geminiChat(prompt);
}
