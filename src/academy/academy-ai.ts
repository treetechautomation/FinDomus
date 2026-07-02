import type { AcademyLevel } from './academy-types';
import { AcademyLevels } from './academy-levels';

export function getAITone(level: AcademyLevel): string {
  const def = AcademyLevels[level];
  return def?.aiTone || 'simple';
}

export function getAIContextPrompt(
  level: AcademyLevel,
  currentLesson: number,
  achievements: string[],
  completedLessons: number[]
): string {
  const def = AcademyLevels[level];
  const tone = def?.aiTone || 'simple';
  const totalAchievements = achievements.length;
  const totalLessons = completedLessons.length;

  const toneInstructions: Record<string, string> = {
    simple: `
      O usuário é um EXPLORADOR FINANCEIRO (nível iniciante).
      REGRAS:
      - Use linguagem simples, sem jargões técnicos.
      - Explique cada termo financeiro que usar.
      - Seja encorajador e motivacional.
      - Use analogias do dia a dia.
      - Mantenha respostas curtas (máx. 3 parágrafos).
    `,
    detailed: `
      O usuário é um ORGANIZADOR ou PLANEJADOR (nível intermediário).
      REGRAS:
      - Use linguagem técnica moderada.
      - Pode mencionar conceitos como DRE, fluxo de caixa, rentabilidade.
      - Ofereça análises comparativas quando relevante.
      - Sugira próximos passos baseados nos dados.
    `,
    expert: `
      O usuário é um MESTRE DA LIBERDADE FINANCEIRA (nível avançado).
      REGRAS:
      - Use linguagem técnica livremente (DRE, CAPM, Sharpe, etc.).
      - Faça análises profundas com dados reais.
      - Compare cenários e sugira estratégias avançadas.
      - Trate o usuário como um par financeiro.
    `,
  };

  return `
    CONTEXTO DO USUÁRIO NA ACADEMIA FINDOMUS:
    - Nível: ${def?.name || 'Explorador'} ${def?.icon || '🌱'}
    - Aula atual: ${currentLesson} de 12
    - Aulas concluídas: ${totalLessons} de 12
    - Conquistas desbloqueadas: ${totalAchievements} de 15

    ${toneInstructions[tone] || toneInstructions.simple}
  `;
}

export function getWelcomeMessage(level: AcademyLevel, name: string): string {
  switch (level) {
    case 1:
      return `Olá! Eu sou seu Copiloto Financeiro. Estou aqui para te guiar na sua jornada. Você está no nível ${name}. Pode me perguntar qualquer coisa sobre suas finanças — vou explicar tudo de forma simples.`;
    case 2:
      return `Que bom ver você evoluindo! Agora que você já organizou suas contas, posso te ajudar com análises mais detalhadas. Como posso ajudar hoje, ${name}?`;
    case 3:
      return `Seu planejamento está no caminho certo. Já consigo fazer projeções e comparar cenários para você. O que deseja analisar?`;
    case 4:
      return `Investidor! Seus aportes estão rendendo. Posso analisar sua carteira, calcular rentabilidade e sugerir ajustes. Vamos otimizar seus investimentos?`;
    case 5:
      return `Mestre, é uma honra. Você domina o sistema. Posso fazer análises avançadas, comparar cenários complexos e sugerir estratégias de longo prazo. O que vamos explorar hoje?`;
    default:
      return `Olá! Sou seu Copiloto Financeiro. Como posso ajudar?`;
  }
}
