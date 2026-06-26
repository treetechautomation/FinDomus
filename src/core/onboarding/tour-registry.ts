import { Tour } from './types';

export const MAIN_TOUR_ID = 'MAIN_TOUR';
export const INVESTMENTS_TOUR_ID = 'INVESTMENTS_TOUR';
export const IMPORT_TOUR_ID = 'IMPORT_TOUR';
export const PLANNING_TOUR_ID = 'PLANNING_TOUR';
export const REPORTS_TOUR_ID = 'REPORTS_TOUR';

export const tourRegistry: Record<string, Tour> = {
  [MAIN_TOUR_ID]: {
    id: MAIN_TOUR_ID,
    steps: [
      {
        id: 'main-welcome',
        title: 'Bem-vindo ao FinDomus! 💳',
        description: 'Sua plataforma executiva de gestão financeira e patrimonial. Vamos fazer um tour de 1 minuto para conhecer os principais recursos.',
        target: '', // Vazio indica centro da tela
        placement: 'center',
        order: 1
      },
      {
        id: 'main-dashboard',
        title: 'Dashboard Consolidado 📊',
        description: 'Aqui você acompanha o seu patrimônio líquido consolidado, ativos, passivos e evolução mensal em tempo real.',
        target: '#tour-step-dashboard',
        placement: 'bottom',
        order: 2
      },
      {
        id: 'main-import',
        title: 'Importações Inteligentes ☁️',
        description: 'Importe arquivos OFX, PDF de cartões de crédito ou planilhas de corretoras/B3. Nossa IA analisa e categoriza seus lançamentos.',
        target: '#sidebar-link-importacoes',
        placement: 'right',
        order: 3
      },
      {
        id: 'main-planning',
        title: 'Planejamento e Metas 🎯',
        description: 'Defina suas metas de riqueza, orçamentos mensais e acompanhe sua evolução estratégica de forma simplificada.',
        target: '#sidebar-link-planejamento',
        placement: 'right',
        order: 4
      },
      {
        id: 'main-investments',
        title: 'Gestão de Investimentos 📈',
        description: 'Consolide suas ações, FIIs, renda fixa e criptoativos com gráficos interativos de alocação de ativos.',
        target: '#sidebar-link-investimentos',
        placement: 'right',
        order: 5
      },
      {
        id: 'main-reports',
        title: 'DRE e Relatórios 📋',
        description: 'Visualize análises do fluxo de caixa e a Demonstração do Resultado do Exercício (DRE) PF/PJ estruturada automaticamente.',
        target: '#sidebar-link-relatorios',
        placement: 'right',
        order: 6
      },
      {
        id: 'main-privacy',
        title: 'Modo de Privacidade 👁🗨',
        description: 'Oculte ou revele todos os saldos, patrimônio e gráficos confidenciais instantaneamente ao usar a plataforma em público.',
        target: '#tour-step-visibility-toggle',
        placement: 'bottom',
        order: 7
      },
      {
        id: 'main-finish',
        title: 'Tudo Pronto! 🚀',
        description: 'Você está pronto para assumir o controle total das suas finanças. Se precisar rever este tour, acesse as Configurações.',
        target: '',
        placement: 'center',
        order: 8
      }
    ]
  },
  [INVESTMENTS_TOUR_ID]: {
    id: INVESTMENTS_TOUR_ID,
    steps: [
      {
        id: 'invest-wallet',
        title: 'Sua Carteira de Investimentos 💎',
        description: 'Aqui você acompanha o saldo total investido, o rendimento histórico e os lucros de suas posições.',
        target: '#tour-step-invest-wallet',
        placement: 'bottom',
        order: 1
      },
      {
        id: 'invest-distribution',
        title: 'Distribuição de Ativos 🍕',
        description: 'Visualize a alocação percentual por classe (ações, fundos, renda fixa) para garantir o balanceamento ideal da carteira.',
        target: '#tour-step-invest-distribution',
        placement: 'left',
        order: 2
      }
    ]
  },
  [IMPORT_TOUR_ID]: {
    id: IMPORT_TOUR_ID,
    steps: [
      {
        id: 'import-actions',
        title: 'Nova Importação 📂',
        description: 'Selecione e envie arquivos OFX do seu banco, PDFs de fatura de cartão de crédito, ou relatórios de investimentos.',
        target: '#tour-step-import-upload',
        placement: 'bottom',
        order: 1
      },
      {
        id: 'import-rules',
        title: 'Regras da IA 🤖',
        description: 'Nossa inteligência artificial memoriza suas classificações de despesas e as aplica automaticamente nos próximos envios.',
        target: '#tour-step-import-rules',
        placement: 'top',
        order: 2
      }
    ]
  },
  [PLANNING_TOUR_ID]: {
    id: PLANNING_TOUR_ID,
    steps: [
      {
        id: 'plan-wealth',
        title: 'Perfil de Riqueza 🎯',
        description: 'Preencha suas premissas financeiras de longo prazo, como idade desejada de aposentadoria e taxas de rentabilidade projetadas.',
        target: '#tour-step-plan-profile',
        placement: 'bottom',
        order: 1
      },
      {
        id: 'plan-simulator',
        title: 'Simulador Financeiro 🔮',
        description: 'Veja em quanto tempo você atingirá sua liberdade financeira com base nos aportes atuais.',
        target: '#tour-step-plan-simulator',
        placement: 'top',
        order: 2
      }
    ]
  },
  [REPORTS_TOUR_ID]: {
    id: REPORTS_TOUR_ID,
    steps: [
      {
        id: 'report-dre',
        title: 'DRE Pessoal 📝',
        description: 'Exibe suas receitas totais, despesas operacionais divididas por categoria de estilo de vida, e capacidade de poupança mensal.',
        target: '#tour-step-report-dre',
        placement: 'bottom',
        order: 1
      }
    ]
  }
};
