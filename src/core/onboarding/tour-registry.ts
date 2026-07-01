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
export const CHAT_IA_TOUR_ID = 'CHAT_IA_TOUR';

export const tourRegistry: Record<string, Tour> = {
  [MAIN_TOUR_ID]: {
    id: MAIN_TOUR_ID,
    steps: [
      {
        id: 'main-welcome',
        title: 'Bem-vindo ao FinDomus',
        description: 'Em 5 minutos você vai importar seu extrato, organizar suas contas e ver seu patrimônio líquido real. Sem planilhas, sem complicação. Vamos começar?',
        target: '',
        placement: 'center',
        order: 1
      },
      {
        id: 'main-dashboard',
        title: 'Dashboard: patrimônio real',
        description: 'Este é seu Patrimônio Líquido: tudo que você tem (contas + investimentos) menos tudo que você deve (dívidas). Esse número é o que importa. Ele será calculado automaticamente dos dados que você vai configurar nos próximos passos.',
        target: '#tour-step-dashboard',
        placement: 'bottom',
        order: 2
      },
      {
        id: 'main-import',
        title: 'Importe o primeiro extrato',
        description: 'Tudo começa pela importação. Sem extrato importado, a plataforma fica vazia. Clique em Importações no menu e envie um arquivo OFX do seu banco. A IA categoriza cada transação sozinha.',
        target: '#sidebar-link-importacoes',
        placement: 'right',
        order: 3,
        route: '/importacoes'
      },
      {
        id: 'main-contas',
        title: 'Confira as contas bancárias',
        description: 'O extrato que você importou já populou o saldo das suas contas. Confira se todas as suas contas PF e PJ estão aqui. Se faltar alguma, clique em Adicionar Conta. O saldo de cada conta alimenta o Dashboard automaticamente.',
        target: '#sidebar-link-contas',
        placement: 'right',
        order: 4,
        route: '/contas'
      },
      {
        id: 'main-planning',
        title: 'Crie seu primeiro orçamento',
        description: 'Agora que suas contas têm saldo real, defina seu orçamento. No Planejamento, você distribui sua renda entre categorias e acompanha se está gastando mais do que deveria. Os dados vêm das transações que você importou.',
        target: '#sidebar-link-planejamento',
        placement: 'right',
        order: 5,
        route: '/planejamento'
      },
      {
        id: 'main-investments',
        title: 'Registre os investimentos',
        description: 'Cadastre seus investimentos aqui. Ações, FIIs, renda fixa, cripto. Eles entram no cálculo do seu Patrimônio Líquido e aumentam seu Freedom Index. Tudo consolida automaticamente.',
        target: '#sidebar-link-investimentos',
        placement: 'right',
        order: 6,
        route: '/investimentos'
      },
      {
        id: 'main-passivos',
        title: 'Controle seus passivos',
        description: 'Financiamento, empréstimo, cartão parcelado. Cadastre seus passivos para ver o impacto real no seu patrimônio. Eles reduzem seu Patrimônio Líquido — mas com controle, você pode simular a quitação e acelerar sua liberdade.',
        target: '#sidebar-link-passivos',
        placement: 'right',
        order: 7,
        route: '/passivos'
      },
      {
        id: 'main-reports',
        title: 'DRE: demonstração de resultado',
        description: 'Este é seu DRE Pessoal: receitas menos despesas = sua capacidade real de poupança. É o \'lucro\' das suas finanças. Os dados vêm de tudo que você já configurou: importações, contas, orçamento.',
        target: '#sidebar-link-relatorios',
        placement: 'right',
        order: 8,
        route: '/relatorios'
      },
      {
        id: 'main-privacy',
        title: 'Modo Privacidade',
        description: 'Clique no ícone do olho no cabeçalho para ocultar todos os saldos. Use quando estiver em público ou compartilhando a tela.',
        target: '#tour-step-visibility-toggle',
        placement: 'bottom',
        order: 9
      },
      {
        id: 'main-finish',
        title: 'Você está pronto',
        description: 'Você configurou: importação, contas, orçamento, investimentos, passivos e DRE. Sua vida financeira está sob controle. Agora explore as Calculadoras, o Chat com IA e a Timeline da Liberdade. Se precisar rever algo, acesse Configurações.',
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
        title: 'Resumo Consolidado',
        description: 'Você viu o Dashboard no tour inicial. Agora explore cada seção em detalhe. O coração do seu dashboard. Acompanhe o patrimônio líquido, total de ativos e total de obrigações em tempo real.',
        target: '#tour-step-dashboard-summary',
        placement: 'bottom',
        order: 1
      },
      {
        id: 'dash-chart',
        title: 'Evolução Patrimonial',
        description: 'Acompanhe a curva de crescimento do seu patrimônio ao longo dos meses.',
        target: '#tour-step-dashboard-chart',
        placement: 'top',
        order: 2
      },
      {
        id: 'dash-actions',
        title: 'Ações Rápidas',
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
        title: 'Saldos Consolidados',
        description: 'No tour inicial você viu as Contas por cima. Agora vamos a fundo. Este é o saldo total de todas as suas contas PF e PJ somadas. Esse valor veio das transações que você importou. Ele alimenta o Dashboard e o DRE automaticamente.',
        target: '#tour-step-contas-saldo',
        placement: 'bottom',
        order: 1
      },
      {
        id: 'contas-reserva',
        title: 'Reserva de Emergência',
        description: 'Com base no saldo das suas contas com liquidez imediata, o FinDomus calcula quantos meses de gastos essenciais você cobre. A meta recomendada é 6 meses. Se estiver abaixo, priorize a reserva antes de investir em renda variável.',
        target: '#tour-step-contas-reserva',
        placement: 'bottom',
        order: 2
      },
      {
        id: 'contas-pf',
        title: 'Contas Pessoais',
        description: 'Contas pessoais (PF). O saldo de cada uma vem das transações importadas e de lançamentos manuais. Clique em Editar para ajustar nome, tipo ou saldo. Cada conta PF contribui para o seu Patrimônio Líquido pessoal.',
        target: '#tour-step-contas-pf',
        placement: 'right',
        order: 3
      },
      {
        id: 'contas-pj',
        title: 'Contas Empresariais',
        description: 'Contas empresariais (PJ). Cada conta PJ precisa estar vinculada a uma empresa cadastrada no módulo Empresas. Isso garante que os relatórios PJ fiquem separados dos PF.',
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
        title: 'Estatísticas Mensais',
        description: 'Você importou extratos — agora veja como gerenciar suas finanças mês a mês. Receitas, despesas e saldo do mês atual. Esses números vêm das transações que você importou e foram categorizadas pela IA. Se algo parece errado, confira as categorias nas transações.',
        target: '#tour-step-pessoal-stats',
        placement: 'bottom',
        order: 1
      },
      {
        id: 'pessoal-novo',
        title: 'Lançamento Manual',
        description: 'Nem tudo vem do extrato bancário. Use Novo Lançamento para registrar despesas em dinheiro, transferências entre contas ou receitas avulsas. Cada lançamento atualiza o saldo das contas automaticamente.',
        target: '#tour-step-pessoal-novo',
        placement: 'bottom',
        order: 2
      },
      {
        id: 'pessoal-grafico',
        title: 'Gastos por Categorias',
        description: 'O gráfico mostra para onde seu dinheiro está indo. Clicar em uma fatia filtra a tabela de transações. Isso ajuda a identificar onde cortar gastos para aumentar sua poupança mensal.',
        target: '#tour-step-pessoal-grafico',
        placement: 'top',
        order: 3
      },
      {
        id: 'pessoal-tabela',
        title: 'Filtro e Edição',
        description: 'Cada linha é uma transação importada ou lançada manualmente. Você pode editar a categoria, o valor ou a descrição. A IA aprende com suas correções — quanto mais você classifica, mais preciso fica nas próximas importações.',
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
        title: 'Resumo das Dívidas',
        description: 'Você conheceu os Passivos no tour inicial. Agora aprenda a controlar cada dívida. Total devido, comprometimento mensal e projeção de quitação. Passivos são dívidas estruturadas: financiamento, empréstimo, consórcio. Esse valor reduz seu Patrimônio Líquido no Dashboard.',
        target: '#tour-step-passivos-resumo',
        placement: 'bottom',
        order: 1
      },
      {
        id: 'passivos-previsao',
        title: 'Projeção de Caixa',
        description: 'Veja quanto você vai pagar nos próximos 6 meses, passivo por passivo. Isso ajuda a planejar seu fluxo de caixa e evita surpresas com vencimentos.',
        target: '#tour-step-passivos-previsao',
        placement: 'top',
        order: 2
      },
      {
        id: 'passivos-item',
        title: 'Evolução de Contratos',
        description: 'Detalhe de um passivo: valor total, parcelas restantes, taxa de juros e instituição. A barra de progresso mostra quanto já foi pago. Edite os dados se houver amortização ou renegociação.',
        target: '#tour-step-passivos-item',
        placement: 'top',
        order: 3
      },
      {
        id: 'passivos-simular',
        title: 'Simulação Extraordinária',
        description: 'Clique em Simular Amortização para ver quanto você economiza se antecipar parcelas. A simulação usa os juros reais do contrato e mostra o impacto no seu patrimônio e no prazo de quitação.',
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
        title: 'Seletor Empresarial',
        description: 'Você tem contas PJ. Agora aprenda a gerenciar cada empresa separadamente. Se você tem mais de uma empresa, alterne entre elas aqui. Cada empresa tem suas próprias contas, transações e obrigações fiscais isoladas. Cadastre uma nova em Adicionar Empresa.',
        target: '#tour-step-empresas-selector',
        placement: 'bottom',
        order: 1
      },
      {
        id: 'empresas-stats',
        title: 'Resultado Financeiro',
        description: 'Receitas, despesas e resultado do mês para a empresa selecionada. É um mini-DRE empresarial. Os dados vêm das transações PJ importadas e categorizadas.',
        target: '#tour-step-empresas-stats',
        placement: 'bottom',
        order: 2
      },
      {
        id: 'empresas-contas',
        title: 'Contas Bancárias PJ',
        description: 'Contas bancárias PJ vinculadas a esta empresa. Cada conta PJ precisa estar associada a uma empresa aqui — senão o saldo não aparece nos relatórios corretos e se mistura com PF.',
        target: '#tour-step-empresas-contas',
        placement: 'right',
        order: 3
      },
      {
        id: 'empresas-extrato',
        title: 'Movimentações PJ',
        description: 'Transações da empresa, mês a mês. Funciona igual ao módulo Pessoal: importe extratos PJ, categorize e feche o mês. O fechamento mensal PJ é independente do PF.',
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
        title: 'Perfil Estratégico',
        description: 'Você definiu premissas no tour inicial. Agora monte seu orçamento completo. Defina suas premissas de longo prazo: meta de patrimônio, rentabilidade esperada, idade de aposentadoria. Esses números alimentam o simulador e a Timeline da Liberdade. Preencha com dados realistas.',
        target: '#tour-step-plan-profile',
        placement: 'bottom',
        order: 1
      },
      {
        id: 'plan-simulator',
        title: 'Simulação de Prazo',
        description: 'Com base nas suas premissas, o simulador projeta quando você atinge a independência financeira. Ajuste os parâmetros e veja o impacto no prazo. Os dados reais das suas contas e investimentos são usados aqui.',
        target: '#tour-step-plan-simulator',
        placement: 'top',
        order: 2
      },
      {
        id: 'plan-orcamento',
        title: 'Limites Coloridos',
        description: 'Distribua sua renda entre as categorias de gasto. A barra colorida mostra o planejado vs o real. Vermelho = estourou o orçamento. Verde = dentro da meta. Os gastos reais vêm das transações importadas.',
        target: '#tour-step-plan-orcamento',
        placement: 'top',
        order: 3
      },
      {
        id: 'plan-metas',
        title: 'Acompanhar Objetivos',
        description: 'Crie metas específicas: \'Reserva de emergência\', \'Entrada de apartamento\', \'Viagem\'. Cada meta tem valor-alvo e prazo. O gráfico mostra seu progresso. Isso ajuda a manter o foco no que importa.',
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
        title: 'Investimentos Totais',
        description: 'Você conheceu a carteira no tour inicial. Agora gerencie cada investimento. Saldo total investido, rentabilidade e evolução das posições. Todos os seus ativos consolidados. Este valor soma ao seu Patrimônio Líquido no Dashboard automaticamente.',
        target: '#tour-step-invest-wallet',
        placement: 'bottom',
        order: 1
      },
      {
        id: 'invest-distribution',
        title: 'Diversificação de Risco',
        description: 'Veja a alocação por classe de ativos. Uma carteira balanceada reduz risco. O ideal depende do seu perfil de investidor, que você pode ajustar no Planejamento.',
        target: '#tour-step-invest-distribution',
        placement: 'left',
        order: 2
      },
      {
        id: 'invest-aportes',
        title: 'Aportes e Custos',
        description: 'Adicione um novo investimento ou registre um aporte. Cada aporte atualiza o saldo da carteira e entra no histórico de rentabilidade. Use as calculadoras para simular antes de investir.',
        target: '#tour-step-invest-aportes',
        placement: 'top',
        order: 3
      },
      {
        id: 'invest-proventos',
        title: 'Renda Passiva Real',
        description: 'Dividendos de ações, aluguéis de FIIs, juros de renda fixa. Essa é sua renda passiva real. Ela entra no cálculo do Freedom Index — quanto maior, mais perto da liberdade financeira.',
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
        title: 'Capacidade de Poupança',
        description: 'Você viu o DRE no tour inicial. Agora aprenda a analisar relatórios completos. Receitas totais menos despesas por categoria = sua capacidade de poupança. Esse é o número mais importante: quanto sobra por mês para investir ou quitar dívidas. Os dados vêm das suas transações importadas.',
        target: '#tour-step-report-dre',
        placement: 'bottom',
        order: 1
      },
      {
        id: 'report-filtro',
        title: 'Filtros e Períodos',
        description: 'Compare meses diferentes para ver a evolução. Selecione o tipo de relatório: DRE Pessoal PF, Consolidado Geral com gráficos, ou Fluxo de Caixa.',
        target: '#tour-step-report-filtro',
        placement: 'bottom',
        order: 2
      },
      {
        id: 'report-exportar',
        title: 'Relatório para Impressão',
        description: 'Clique em Exportar PDF para gerar um relatório pronto para seu contador, planejador financeiro ou para sua própria análise anual. Inclui todos os dados do período selecionado.',
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
        title: 'Upload de Extratos',
        description: 'A importação é a base de tudo. Agora domine cada formato e as regras da IA. Arraste ou selecione arquivos para importar. Formatos aceitos: OFX, PDF de fatura, CSV, XLSX. Este é o ponto de partida de tudo — cada importação alimenta contas, dashboard e relatórios.',
        target: '#tour-step-import-upload',
        placement: 'bottom',
        order: 1
      },
      {
        id: 'import-ofx',
        title: 'Status Processado',
        description: 'Status dos arquivos enviados. OFX é o formato mais completo — traz data, valor, descrição e tipo de cada transação. Depois de processado, os dados aparecem no módulo Pessoal.',
        target: '#tour-step-import-ofx',
        placement: 'top',
        order: 2
      },
      {
        id: 'import-rules',
        title: 'Memorização Automática',
        description: 'A IA aprende com você. Se você sempre categoriza \'IFOOD\' como Alimentação, ela fará isso automaticamente nas próximas. Quanto mais você classifica, mais preciso fica.',
        target: '#tour-step-import-rules',
        placement: 'top',
        order: 3
      },
      {
        id: 'import-broker',
        title: 'Notas de Corretora',
        description: 'Importe dados da B3 ou de corretoras (XP, BTG, Clear). Suas posições em ações, FIIs e tesouro direto aparecem automaticamente na carteira de Investimentos.',
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
        title: 'Total Consolidado',
        description: 'Além das contas e passivos, suas despesas fixas também impactam seu fluxo de caixa. Quanto você gasta por mês com assinaturas e contas recorrentes. Netflix, Spotify, academia, aluguel, plano de saúde. Saber esse número é essencial para calcular sua reserva de emergência.',
        target: '#tour-step-assinaturas-total',
        placement: 'bottom',
        order: 1
      },
      {
        id: 'assinaturas-impacto',
        title: 'Percentual da Renda',
        description: 'Qual o impacto das suas despesas fixas na renda. Uma assinatura de R$ 49,90/mês parece pouco, mas são R$ 598,80 por ano. Esse percentual alto indica que você precisa rever seus custos fixos.',
        target: '#tour-step-assinaturas-impacto',
        placement: 'bottom',
        order: 2
      },
      {
        id: 'assinaturas-calendario',
        title: 'Calendário Mensal',
        description: 'Visualize todos os vencimentos do mês em um calendário. Planeje seu fluxo de caixa para cobrir todas as contas em dia e evite juros por atraso.',
        target: '#tour-step-assinaturas-calendario',
        placement: 'top',
        order: 3
      },
      {
        id: 'assinaturas-adicionar',
        title: 'Nova Despesa Fixa',
        description: 'Cadastre cada despesa fixa com nome, valor, vencimento e categoria. Associe a uma conta bancária para rastrear de onde sai o pagamento e manter o controle total.',
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
        title: 'Guias de Impostos',
        description: 'Para suas empresas PJ, as obrigações fiscais são críticas. Veja como gerenciá-las. Impostos e obrigações das suas empresas: DAS, ISS, ICMS, IRPJ. Cada obrigação tem vencimento, valor e status. Não perder prazos evita multas e juros.',
        target: '#tour-step-fiscal-obrigacoes',
        placement: 'bottom',
        order: 1
      },
      {
        id: 'fiscal-dashboard',
        title: 'Resumo por Empresa',
        description: 'Visão consolidada de todas as obrigações fiscais. Total devido, próximo vencimento, status geral. Os dados são segregados por empresa automaticamente.',
        target: '#tour-step-fiscal-dashboard',
        placement: 'top',
        order: 2
      },
      {
        id: 'fiscal-empresa',
        title: 'Separação por CNPJ',
        description: 'Cada obrigação fiscal precisa estar vinculada a uma empresa. Isso garante que os relatórios fiquem separados por CNPJ e que você não misture impostos de empresas diferentes.',
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
        title: 'Hub de Simulações',
        description: 'Agora que seus dados estão na plataforma, simule cenários para tomar decisões. Hub de calculadoras financeiras. Primeiro milhão, juros compostos, aposentadoria, reserva de emergência. Cada calculadora pode usar seus dados reais quando disponíveis.',
        target: '#tour-step-calc-hub',
        placement: 'bottom',
        order: 1
      },
      {
        id: 'calc-milhao',
        title: 'Primeiro Milhão',
        description: 'Quanto tempo para chegar ao primeiro milhão? Informe seu aporte mensal e a rentabilidade esperada. O simulador mostra a evolução ano a ano com o efeito dos juros compostos.',
        target: '#tour-step-calc-milhao',
        placement: 'top',
        order: 2
      },
      {
        id: 'calc-juros',
        title: 'Crescimento Composto',
        description: 'A ferramenta mais poderosa do investidor. Simule quanto seu dinheiro rende ao longo do tempo. Compare os modos: \'Quanto vai render?\' vs \'Quanto preciso poupar para a meta?\'.',
        target: '#tour-step-calc-juros',
        placement: 'top',
        order: 3
      },
      {
        id: 'calc-aposentadoria',
        title: 'Aposentadoria Perpetuidade',
        description: 'Quanto você precisa acumular para se aposentar com a renda desejada? O simulador sugere um valor-alvo (FIRE Number) baseado nas suas despesas e na rentabilidade esperada.',
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
        title: 'Custo de Vida',
        description: 'Sua reserva de emergência é a base da segurança financeira. Calcule o valor ideal. Quanto você gasta por mês para viver? E por quantos meses quer ter esse valor guardado? O FinDomus recomenda 6 meses. Use o botão Sincronizar para puxar seus gastos reais.',
        target: '#tour-step-reserva-params',
        placement: 'bottom',
        order: 1
      },
      {
        id: 'reserva-cenarios',
        title: 'Comparador de Taxas',
        description: 'Ative a comparação de cenários para ver o impacto de diferentes taxas de rendimento ou valores de gasto mensal. Compare lado a lado e veja qual estratégia atinge a meta mais rápido.',
        target: '#tour-step-reserva-cenarios',
        placement: 'top',
        order: 2
      },
      {
        id: 'reserva-resultado',
        title: 'Meta de Cobertura',
        description: 'Meta alvo da reserva, quanto falta guardar e diagnóstico. Se estiver abaixo da meta, priorize construir a reserva antes de fazer investimentos de maior risco.',
        target: '#tour-step-reserva-resultado',
        placement: 'top',
        order: 3
      },
      {
        id: 'reserva-breakdown',
        title: 'Ativos com Liquidez',
        description: 'Quais ativos contam para a reserva? Apenas ativos com liquidez imediata: conta corrente, poupança, CDB com liquidez diária. Ações e FIIs não contam — podem demorar para vender.',
        target: '#tour-step-reserva-breakdown',
        placement: 'bottom',
        order: 4
      }
    ]
  },
  [CHAT_IA_TOUR_ID]: {
    id: CHAT_IA_TOUR_ID,
    steps: [
      {
        id: 'chat-botao',
        title: 'Assistente Financeiro IA',
        description: 'Você configurou tudo. Agora use a IA para tirar dúvidas e receber recomendações. O botão flutuante no canto inferior direito abre o FinDomus AI. É um assistente que conhece seus dados: saldos, gastos, investimentos. Pergunte em português natural, como se fosse seu consultor financeiro.',
        target: '#tour-step-chat-botao',
        placement: 'left',
        order: 1
      },
      {
        id: 'chat-input',
        title: 'Faça a primeira pergunta',
        description: 'Experimente perguntar: \'Qual foi meu maior gasto este mês?\', \'Minha reserva de emergência está adequada?\' ou \'Quanto meus investimentos renderam?\'. A IA analisa seus dados em tempo real.',
        target: '#tour-step-chat-input',
        placement: 'top',
        order: 2
      },
      {
        id: 'chat-exemplo',
        title: 'Exemplos de Uso',
        description: 'A IA pode: fazer diagnóstico financeiro, sugerir corte de gastos, simular cenários, explicar termos financeiros ou te ajudar a usar qualquer funcionalidade do FinDomus. Quanto mais você usa, mais personalizado fica.',
        target: '#tour-step-chat-exemplo',
        placement: 'top',
        order: 3
      }
    ]
  }
};
