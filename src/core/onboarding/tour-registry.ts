import { Tour } from './types';

export const MAIN_TOUR_ID = 'MAIN_TOUR';
export const DASHBOARD_TOUR_ID = 'DASHBOARD_TOUR';
export const CONTAS_TOUR_ID = 'CONTAS_TOUR';
export const PESSOAL_TOUR_ID = 'PESSOAL_TOUR';
export const PASSIVOS_TOUR_ID = 'PASSIVOS_TOUR';
export const EMPRESAS_TOUR_ID = 'EMPRESAS_TOUR';
export const PLANNING_TOUR_ID = 'PLANNING_TOUR';
export const INVESTMENTS_TOUR_ID = 'INVESTMENTS_TOUR';
export const REPORTS_TOUR_ID = 'REPORTS_TOUR';
export const IMPORTACOES_TOUR_ID = 'IMPORTACOES_TOUR';
export const ASSINATURAS_TOUR_ID = 'ASSINATURAS_TOUR';
export const FISCAL_TOUR_ID = 'FISCAL_TOUR';
export const CALCULADORAS_TOUR_ID = 'CALCULADORAS_TOUR';
export const RESERVA_CALC_TOUR_ID = 'RESERVA_CALC_TOUR';

export const tourRegistry: Record<string, Tour> = {
  [MAIN_TOUR_ID]: {
    id: MAIN_TOUR_ID,
    steps: [
      {
        id: 'main-welcome',
        title: 'Bem-vindo ao FinDomus! 💳',
        description: 'Sua plataforma executiva de gestão financeira e patrimonial. Vamos fazer um tour de 1 minuto para conhecer os principais recursos.',
        target: '',
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
        order: 3,
        route: '/importacoes'
      },
      {
        id: 'main-contas',
        title: 'Contas Bancárias 🏦',
        description: 'Gerencie suas contas pessoais (PF) e empresariais (PJ) com saldos consolidados e indicadores.',
        target: '#sidebar-link-contas',
        placement: 'right',
        order: 4,
        route: '/contas'
      },
      {
        id: 'main-planning',
        title: 'Planejamento e Metas 🎯',
        description: 'Defina suas metas de riqueza, orçamentos mensais e acompanhe sua evolução estratégica.',
        target: '#sidebar-link-planejamento',
        placement: 'right',
        order: 5,
        route: '/planejamento'
      },
      {
        id: 'main-investments',
        title: 'Gestão de Investimentos 📈',
        description: 'Consolide suas ações, FIIs, renda fixa e criptoativos com gráficos interativos de alocação.',
        target: '#sidebar-link-investimentos',
        placement: 'right',
        order: 6,
        route: '/investimentos'
      },
      {
        id: 'main-passivos',
        title: 'Passivos e Dívidas 📉',
        description: 'Monitore suas obrigações financeiras, empréstimos e planeje sua quitação estratégica.',
        target: '#sidebar-link-passivos',
        placement: 'right',
        order: 7,
        route: '/passivos'
      },
      {
        id: 'main-reports',
        title: 'DRE e Relatórios 📋',
        description: 'Visualize análises do fluxo de caixa e a Demonstração do Resultado do Exercício (DRE) PF/PJ estruturada automaticamente.',
        target: '#sidebar-link-relatorios',
        placement: 'right',
        order: 8,
        route: '/relatorios'
      },
      {
        id: 'main-privacy',
        title: 'Modo de Privacidade 👁🗨',
        description: 'Oculte ou revele todos os saldos, patrimônio e gráficos confidenciais instantaneamente ao usar a plataforma em público.',
        target: '#tour-step-visibility-toggle',
        placement: 'bottom',
        order: 9
      },
      {
        id: 'main-finish',
        title: 'Tudo Pronto! 🚀',
        description: 'Você está pronto para assumir o controle total das suas finanças. Se precisar rever este tour, acesse as Configurações.',
        target: '',
        placement: 'center',
        order: 10
      }
    ]
  },
  [DASHBOARD_TOUR_ID]: {
    id: DASHBOARD_TOUR_ID,
    steps: [
      {
        id: 'dash-summary',
        title: 'Resumo Consolidado 💼',
        description: 'O coração do seu dashboard. Acompanhe o patrimônio líquido, total de ativos e total de obrigações em tempo real.',
        target: '#tour-step-dashboard-summary',
        placement: 'bottom',
        order: 1
      },
      {
        id: 'dash-chart',
        title: 'Evolução Patrimonial 📊',
        description: 'Acompanhe a curva de crescimento do seu patrimônio ao longo dos meses.',
        target: '#tour-step-dashboard-chart',
        placement: 'top',
        order: 2
      },
      {
        id: 'dash-actions',
        title: 'Ações Rápidas ⚡',
        description: 'Acesse rapidamente funções essenciais como importar extratos ou lançar transações manuais.',
        target: '#tour-step-dashboard-actions',
        placement: 'left',
        order: 3
      }
    ]
  },
  [CONTAS_TOUR_ID]: {
    id: CONTAS_TOUR_ID,
    steps: [
      {
        id: 'contas-summary',
        title: 'Liquidez e Saldos 🏦',
        description: 'Veja o total de caixa disponível consolidado em todas as suas contas bancárias.',
        target: '#tour-step-contas-saldo',
        placement: 'bottom',
        order: 1
      },
      {
        id: 'contas-reserva',
        title: 'Reserva de Emergência 🛡️',
        description: 'Acompanhe quantos meses de despesas seu caixa atual é capaz de cobrir com segurança.',
        target: '#tour-step-contas-reserva',
        placement: 'bottom',
        order: 2
      },
      {
        id: 'contas-pf',
        title: 'Contas Pessoais (PF) 👤',
        description: 'Suas contas de pessoa física, poupanças e carteiras de dinheiro.',
        target: '#tour-step-contas-pf',
        placement: 'right',
        order: 3
      },
      {
        id: 'contas-pj',
        title: 'Contas Jurídicas (PJ) 🏢',
        description: 'Contas das suas empresas para gestão separada e controle de caixa PJ.',
        target: '#tour-step-contas-pj',
        placement: 'left',
        order: 4
      }
    ]
  },
  [PESSOAL_TOUR_ID]: {
    id: PESSOAL_TOUR_ID,
    steps: [
      {
        id: 'pessoal-stats',
        title: 'Resumo Mensal PF 👤',
        description: 'Veja suas receitas, despesas e taxa de poupança pessoal do mês selecionado.',
        target: '#tour-step-pessoal-stats',
        placement: 'bottom',
        order: 1
      },
      {
        id: 'pessoal-novo',
        title: 'Nova Transação ➕',
        description: 'Adicione receitas, despesas ou transferências manuais de forma rápida.',
        target: '#tour-step-pessoal-novo',
        placement: 'bottom',
        order: 2
      },
      {
        id: 'pessoal-grafico',
        title: 'Distribuição de Gastos 🍕',
        description: 'Identifique para onde está indo seu dinheiro com a categorização automática da IA.',
        target: '#tour-step-pessoal-grafico',
        placement: 'top',
        order: 3
      },
      {
        id: 'pessoal-tabela',
        title: 'Extrato de Lançamentos 📋',
        description: 'Veja todas as suas transações, edite categorias ou reconcilie transferências aqui.',
        target: '#tour-step-pessoal-tabela',
        placement: 'top',
        order: 4
      }
    ]
  },
  [PASSIVOS_TOUR_ID]: {
    id: PASSIVOS_TOUR_ID,
    steps: [
      {
        id: 'passivos-resumo',
        title: 'Visão Geral de Obrigações 📉',
        description: 'Acompanhe o saldo devedor total, parcelas a vencer e taxas médias de juros.',
        target: '#tour-step-passivos-resumo',
        placement: 'bottom',
        order: 1
      },
      {
        id: 'passivos-previsao',
        title: 'Cronograma de Pagamentos 📅',
        description: 'Projete o desembolso mensal futuro para pagamento de dívidas e financiamentos.',
        target: '#tour-step-passivos-previsao',
        placement: 'top',
        order: 2
      },
      {
        id: 'passivos-item',
        title: 'Detalhamento por Passivo 🔍',
        description: 'Cada empréstimo ou financiamento cadastrado com saldo devedor e evolução.',
        target: '#tour-step-passivos-item',
        placement: 'top',
        order: 3
      },
      {
        id: 'passivos-simular',
        title: 'Simular Quitação 🔮',
        description: 'Simule amortizações extraordinárias e veja a economia em juros e redução de tempo.',
        target: '#tour-step-passivos-simular',
        placement: 'bottom',
        order: 4
      }
    ]
  },
  [EMPRESAS_TOUR_ID]: {
    id: EMPRESAS_TOUR_ID,
    steps: [
      {
        id: 'empresas-selector',
        title: 'Seletor de Empresas 🏢',
        description: 'Alterne rapidamente entre as empresas (PJ) cadastradas no seu perfil.',
        target: '#tour-step-empresas-selector',
        placement: 'bottom',
        order: 1
      },
      {
        id: 'empresas-stats',
        title: 'DRE Simplificado PJ 📈',
        description: 'Acompanhe faturamento bruto, impostos e margem líquida da empresa no mês.',
        target: '#tour-step-empresas-stats',
        placement: 'bottom',
        order: 2
      },
      {
        id: 'empresas-contas',
        title: 'Contas PJ da Empresa 🏦',
        description: 'Contas bancárias vinculadas à empresa selecionada para evitar mistura de caixa.',
        target: '#tour-step-empresas-contas',
        placement: 'right',
        order: 3
      },
      {
        id: 'empresas-extrato',
        title: 'Extrato da Empresa 📋',
        description: 'Todas as movimentações PJ separadas e categorizadas da empresa.',
        target: '#tour-step-empresas-extrato',
        placement: 'top',
        order: 4
      }
    ]
  },
  [PLANNING_TOUR_ID]: {
    id: PLANNING_TOUR_ID,
    steps: [
      {
        id: 'plan-profile',
        title: 'Premissas de Riqueza 🎯',
        description: 'Preencha suas metas financeiras, idade desejada de aposentadoria e taxas projetadas.',
        target: '#tour-step-plan-profile',
        placement: 'bottom',
        order: 1
      },
      {
        id: 'plan-simulator',
        title: 'Simulador de Independência 🔮',
        description: 'Visualize a curva de acumulação patrimonial projetada até a sua independência financeira.',
        target: '#tour-step-plan-simulator',
        placement: 'top',
        order: 2
      },
      {
        id: 'plan-orcamento',
        title: 'Orçamento de Categorias 🍕',
        description: 'Defina limites de gastos por categorias e acompanhe o percentual realizado.',
        target: '#tour-step-plan-orcamento',
        placement: 'top',
        order: 3
      },
      {
        id: 'plan-metas',
        title: 'Metas Ativas 🏁',
        description: 'Acompanhe o andamento de objetivos específicos de médio/longo prazo.',
        target: '#tour-step-plan-metas',
        placement: 'bottom',
        order: 4
      }
    ]
  },
  [INVESTMENTS_TOUR_ID]: {
    id: INVESTMENTS_TOUR_ID,
    steps: [
      {
        id: 'invest-wallet',
        title: 'Sua Carteira de Investimentos 💎',
        description: 'Acompanhe o saldo total investido, o rendimento histórico e a evolução das posições.',
        target: '#tour-step-invest-wallet',
        placement: 'bottom',
        order: 1
      },
      {
        id: 'invest-distribution',
        title: 'Distribuição de Ativos 🍕',
        description: 'Visualize a alocação percentual por classe de ativos (Ações, FIIs, Renda Fixa).',
        target: '#tour-step-invest-distribution',
        placement: 'left',
        order: 2
      },
      {
        id: 'invest-aportes',
        title: 'Aportes e Transações ➕',
        description: 'Registre novas compras, vendas e movimentações na carteira de investimentos.',
        target: '#tour-step-invest-aportes',
        placement: 'top',
        order: 3
      },
      {
        id: 'invest-proventos',
        title: 'Proventos e Dividendos 💰',
        description: 'Acompanhe o fluxo de renda passiva recebida e provisionada para os próximos meses.',
        target: '#tour-step-invest-proventos',
        placement: 'top',
        order: 4
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
      },
      {
        id: 'report-filtro',
        title: 'Filtros de Período 📅',
        description: 'Alterne o período de análise para comparar o desempenho de diferentes meses.',
        target: '#tour-step-report-filtro',
        placement: 'bottom',
        order: 2
      },
      {
        id: 'report-exportar',
        title: 'Exportação de Dados 📂',
        description: 'Exporte seus relatórios e DRE estruturados em PDF para contabilidade ou arquivos.',
        target: '#tour-step-report-exportar',
        placement: 'left',
        order: 3
      }
    ]
  },
  [IMPORTACOES_TOUR_ID]: {
    id: IMPORTACOES_TOUR_ID,
    steps: [
      {
        id: 'import-upload',
        title: 'Upload de Extratos 📂',
        description: 'Selecione e envie arquivos OFX, CSV ou PDF de faturas para importação.',
        target: '#tour-step-import-upload',
        placement: 'bottom',
        order: 1
      },
      {
        id: 'import-ofx',
        title: 'Status de Processamento ⏳',
        description: 'Acompanhe os arquivos carregados e o histórico de importações executadas.',
        target: '#tour-step-import-ofx',
        placement: 'top',
        order: 2
      },
      {
        id: 'import-rules',
        title: 'Regras de IA 🤖',
        description: 'Visualize e configure as regras de categorização automática aprendidas pela IA.',
        target: '#tour-step-import-rules',
        placement: 'top',
        order: 3
      },
      {
        id: 'import-broker',
        title: 'Importar Notas de Corretora 📈',
        description: 'Faça upload de extratos B3 ou PDFs XP/BTG para atualizar a carteira automaticamente.',
        target: '#tour-step-import-broker',
        placement: 'bottom',
        order: 4
      }
    ]
  },
  [ASSINATURAS_TOUR_ID]: {
    id: ASSINATURAS_TOUR_ID,
    steps: [
      {
        id: 'assinaturas-total',
        title: 'Comprometimento Mensal 💳',
        description: 'Visualize a soma total de todas as suas assinaturas e despesas fixas recorrentes.',
        target: '#tour-step-assinaturas-total',
        placement: 'bottom',
        order: 1
      },
      {
        id: 'assinaturas-impacto',
        title: 'Impacto no Orçamento 📊',
        description: 'Veja o percentual da sua renda mensal consumido por custos fixos e assinaturas.',
        target: '#tour-step-assinaturas-impacto',
        placement: 'bottom',
        order: 2
      },
      {
        id: 'assinaturas-calendario',
        title: 'Calendário de Vencimento 📅',
        description: 'Acompanhe os dias do mês em que cada assinatura vence e se já foram pagas.',
        target: '#tour-step-assinaturas-calendario',
        placement: 'top',
        order: 3
      },
      {
        id: 'assinaturas-adicionar',
        title: 'Adicionar Nova Recorrência ➕',
        description: 'Adicione novas assinaturas ou custos fixos para controle de fluxo de caixa futuro.',
        target: '#tour-step-assinaturas-adicionar',
        placement: 'bottom',
        order: 4
      }
    ]
  },
  [FISCAL_TOUR_ID]: {
    id: FISCAL_TOUR_ID,
    steps: [
      {
        id: 'fiscal-obrigacoes',
        title: 'Obrigações Fiscais 📝',
        description: 'Acompanhe vencimentos de guias, impostos e obrigações contábeis de suas empresas.',
        target: '#tour-step-fiscal-obrigacoes',
        placement: 'bottom',
        order: 1
      },
      {
        id: 'fiscal-dashboard',
        title: 'Painel de Documentos 📂',
        description: 'Armazene e visualize arquivos importantes como balancetes e comprovantes fiscais.',
        target: '#tour-step-fiscal-dashboard',
        placement: 'top',
        order: 2
      },
      {
        id: 'fiscal-empresa',
        title: 'Dados da Empresa 🏢',
        description: 'Confira o status CNPJ e o regime tributário configurado para a empresa selecionada.',
        target: '#tour-step-fiscal-empresa',
        placement: 'bottom',
        order: 3
      }
    ]
  },
  [CALCULADORAS_TOUR_ID]: {
    id: CALCULADORAS_TOUR_ID,
    steps: [
      {
        id: 'calc-hub',
        title: 'Hub de Calculadoras 🔮',
        description: 'Simule diferentes decisões financeiras com ferramentas científicas de apoio à decisão.',
        target: '#tour-step-calc-hub',
        placement: 'bottom',
        order: 1
      },
      {
        id: 'calc-milhao',
        title: 'Primeiro Milhão 🚀',
        description: 'Descubra quanto precisa poupar por mês para atingir seu primeiro milhão de reais.',
        target: '#tour-step-calc-milhao',
        placement: 'top',
        order: 2
      },
      {
        id: 'calc-juros',
        title: 'Simulador de Juros Compostos 📈',
        description: 'Projete o crescimento dos seus investimentos com o poder dos juros compostos.',
        target: '#tour-step-calc-juros',
        placement: 'top',
        order: 3
      },
      {
        id: 'calc-aposentadoria',
        title: 'Aposentadoria e Renda 👴',
        description: 'Calcule a necessidade de patrimônio acumulado para garantir uma renda passiva perpétua.',
        target: '#tour-step-calc-aposentadoria',
        placement: 'bottom',
        order: 4
      }
    ]
  },
  [RESERVA_CALC_TOUR_ID]: {
    id: RESERVA_CALC_TOUR_ID,
    steps: [
      {
        id: 'reserva-params',
        title: 'Parâmetros da Reserva 🛡️',
        description: 'Defina seus custos mensais essenciais e o número de meses de cobertura desejados.',
        target: '#tour-step-reserva-params',
        placement: 'bottom',
        order: 1
      },
      {
        id: 'reserva-cenarios',
        title: 'Cenários de Simulação 🔮',
        description: 'Simule e compare o tempo para preencher a reserva sob diferentes rendimentos SELIC/CDI.',
        target: '#tour-step-reserva-cenarios',
        placement: 'top',
        order: 2
      },
      {
        id: 'reserva-resultado',
        title: 'Resultado Projetado 🏁',
        description: 'Veja o valor total da meta de reserva de emergência ideal baseada nos parâmetros informados.',
        target: '#tour-step-reserva-resultado',
        placement: 'top',
        order: 3
      },
      {
        id: 'reserva-breakdown',
        title: 'Alocação Recomendada 📊',
        description: 'Veja quais ativos da sua carteira se enquadram em alta liquidez para compor a reserva.',
        target: '#tour-step-reserva-breakdown',
        placement: 'bottom',
        order: 4
      }
    ]
  }
};
