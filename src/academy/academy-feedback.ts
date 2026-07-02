export const AcademyMessages = {
  account_created: {
    title: '🏦 Excelente!',
    body: 'Seu patrimônio começou hoje. Você acaba de dar o primeiro passo rumo à liberdade financeira.',
  },
  import_completed: {
    title: '📥 Dados importados!',
    body: 'Seus extratos estão no sistema. A IA já classificou cada transação. Seu Dashboard agora tem informações reais.',
  },
  transaction_created: {
    title: '💰 Lançamento registrado!',
    body: 'Seu fluxo de caixa está cada vez mais completo. Cada registro te aproxima do controle total.',
  },
  budget_saved: {
    title: '🎯 Planejamento salvo!',
    body: 'Seu orçamento está definido. Agora cada gasto tem um propósito. Você está no controle do seu dinheiro.',
  },
  investment_created: {
    title: '📈 Investimento registrado!',
    body: 'Seu dinheiro começa a trabalhar por você. Este é o caminho para a renda passiva.',
  },
  liability_created: {
    title: '📊 Passivo registrado!',
    body: 'Conhecer suas dívidas é o primeiro passo para vencê-las. Use o simulador para planejar a quitação.',
  },
  lesson_completed: {
    title: '📚 Aula concluída!',
    body: 'Mais uma etapa vencida. Cada aula te deixa mais perto de dominar suas finanças.',
  },
  achievement_unlocked: {
    title: '🏆 Conquista desbloqueada!',
    body: '',
  },
  freedom_improved: {
    title: '🎯 Freedom Index subiu!',
    body: 'Você ficou mais próximo da independência financeira. Continue assim.',
  },
  reserve_improved: {
    title: '🏦 Reserva aumentou!',
    body: 'Sua proteção financeira está mais forte. Continue construindo sua reserva de emergência.',
  },
  academy_started: {
    title: '🎓 Jornada iniciada!',
    body: 'Bem-vindo à Academia FinDomus. Em 12 aulas você vai dominar suas finanças e conquistar sua liberdade.',
  },
  academy_completed: {
    title: '👑 ACADEMIA CONCLUÍDA!',
    body: 'Você completou todas as 12 aulas. Agora você é um Mestre da Liberdade Financeira. Seu Dashboard está completo.',
  },
  level_up: {
    title: '⬆️ LEVEL UP!',
    body: '',
  },
};

export function getAccountCreatedMessage(): typeof AcademyMessages.account_created {
  return AcademyMessages.account_created;
}

export function getFreedomMessage(oldScore: number, newScore: number): string {
  const delta = newScore - oldScore;
  if (delta > 0) {
    return `${AcademyMessages.freedom_improved.title} ${oldScore} → ${newScore}\n${AcademyMessages.freedom_improved.body}`;
  }
  return '';
}

export function getReserveMessage(coveredMonths: number, gap: number): string {
  if (gap <= 0) return '🏦 Sua reserva de emergência atingiu a meta de 6 meses! Você está protegido.';
  return `${AcademyMessages.reserve_improved.title}\nFaltam ${gap.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} para completar ${6 - coveredMonths} meses de proteção.`;
}
