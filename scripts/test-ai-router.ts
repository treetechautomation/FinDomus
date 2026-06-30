import { aiChat } from '../src/ai/providers';

async function main() {
  const response = await aiChat(
    'gemini',
    'Responda apenas: AI Router FinDomus conectado com Gemini.'
  );

  console.log(response);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
