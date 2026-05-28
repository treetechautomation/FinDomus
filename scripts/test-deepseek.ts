import { deepseekChat } from '../src/ai/deepseek';

async function main() {
  const response = await deepseekChat(
    'Responda em português: DeepSeek conectado ao FinDomus.'
  );

  console.log(response);
}

main();