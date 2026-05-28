export * from './deepseek';
export * from './gemini';

export type AIProvider = 'deepseek' | 'gemini';

export async function aiChat(
  provider: AIProvider,
  prompt: string
): Promise<string> {
  if (provider === 'deepseek') {
    const { deepseekChat } = await import('./deepseek');

    return deepseekChat([
      {
        role: 'system',
        content:
          'Você é o assistente financeiro do FinDomus. Responda em português do Brasil, com clareza e precisão.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ]);
  }

  if (provider === 'gemini') {
    const { geminiChat } = await import('./gemini');
    return geminiChat();
  }

  throw new Error(`Provider não suportado: ${provider}`);
}
