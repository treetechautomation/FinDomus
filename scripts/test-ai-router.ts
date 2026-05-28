import { aiChat } from '../src/ai/providers';

async function main() {
  const response = await aiChat(
    'deepseek',
    'Responda apenas: AI Router FinDomus conectado com DeepSeek.'
  );

  console.log(response);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
