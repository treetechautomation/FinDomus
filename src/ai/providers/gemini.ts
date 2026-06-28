import { ai } from '../genkit';

export async function geminiChat(prompt: string): Promise<string> {
  const res = await ai.generate({
    prompt,
  });

  return res.text;
}
