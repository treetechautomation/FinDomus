export type DefaultCategoryCatalogItem = {
  name: string;
  keywords: string[];
  group?: string;
  priority?: number;
  confidence?: number;
  ownerScope?: 'PF' | 'PJ' | 'ALL';
  categoryType?: 'income' | 'expense' | 'transfer' | 'investment';
};

export const DEFAULT_CATEGORY_CATALOG: DefaultCategoryCatalogItem[] = [
  // ==========================================
  // PF — MORADIA E CONTAS
  // ==========================================
  {
    name: "Água",
    keywords: ["agua", "cedae", "aguas do rio", "sabesp", "copasa", "sanepar", "embasa", "cagece", "corsan", "saneamento", "dmae", "tarifa agua", "taxa de esgoto"],
    group: "Moradia e contas",
    priority: 5,
    confidence: 0.95,
    ownerScope: "PF",
    categoryType: "expense"
  },
  {
    name: "Energia",
    keywords: ["energia", "luz", "enel", "light", "cemig", "copel", "elektro", "cpfl", "neoenergia", "energisa", "ceee", "equatorial", "coelba", "eletropaulo", "conta de luz", "concessionaria energia"],
    group: "Moradia e contas",
    priority: 5,
    confidence: 0.95,
    ownerScope: "PF",
    categoryType: "expense"
  },
  {
    name: "Internet",
    keywords: ["internet", "banda larga", "claro net", "net virtua", "tim ultra", "vivo fibra", "oi fibra", "link", "provedor", "wi-fi", "wifi", "net combo", "provedor internet"],
    group: "Moradia e contas",
    priority: 5,
    confidence: 0.9,
    ownerScope: "PF",
    categoryType: "expense"
  },
  {
    name: "Telefone",
    keywords: ["telefone", "celular", "vivo", "claro", "tim", "oi", "embratel", "recarga celular", "recarga vivo", "recarga tim", "recarga claro", "tel fixo", "telefonia"],
    group: "Moradia e contas",
    priority: 5,
    confidence: 0.9,
    ownerScope: "PF",
    categoryType: "expense"
  },
  {
    name: "Gás",
    keywords: ["gas", "ultragaz", "supergasbras", "liquigas", "comgas", "botijao", "botijao de gas", "copagaz", "nacional gas", "fogas", "cota gas", "gas canalizado"],
    group: "Moradia e contas",
    priority: 5,
    confidence: 0.9,
    ownerScope: "PF",
    categoryType: "expense"
  },
  {
    name: "Aluguel",
    keywords: ["aluguel", "locacao", "quinto andar", "quintoandar", "imobiliaria", "quitinete", "pensionato", "alugueis", "pagto aluguel", "recibo aluguel"],
    group: "Moradia e contas",
    priority: 5,
    confidence: 0.95,
    ownerScope: "PF",
    categoryType: "expense"
  },
  {
    name: "Condomínio",
    keywords: ["condominio", "taxa condominial", "taxa de condominio", "rateio", "administradora condominio", "boleto condominio", "sindico", "despesa condominio"],
    group: "Moradia e contas",
    priority: 5,
    confidence: 0.95,
    ownerScope: "PF",
    categoryType: "expense"
  },
  {
    name: "IPTU",
    keywords: ["iptu", "prefeitura", "imposto predial", "imposto territorial", "cota iptu", "divida ativa municipal", "guia iptu", "parcela iptu"],
    group: "Moradia e contas",
    priority: 5,
    confidence: 0.95,
    ownerScope: "PF",
    categoryType: "expense"
  },
  {
    name: "Manutenção residencial",
    keywords: ["manutencao residencial", "reforma", "pedreiro", "eletricista", "encanador", "material de construcao", "leroy merlin", "camicado", "tokstok", "tintas", "telha", "cimento", "tijolo", "marcenaria", "gesso", "pintor", "chaveiro", "vidraceiro", "reparo lar"],
    group: "Moradia e contas",
    priority: 4,
    confidence: 0.85,
    ownerScope: "PF",
    categoryType: "expense"
  },
  {
    name: "Móveis e decoração",
    keywords: ["moveis", "decoracao", "tok&stok", "etna", "madesa", "westwing", "cama mesa e banho", "ortobom", "mmartan", "artex", "enxoval", "tapete", "sofa", "armario"],
    group: "Moradia e contas",
    priority: 4,
    confidence: 0.85,
    ownerScope: "PF",
    categoryType: "expense"
  },
  {
    name: "Material de limpeza",
    keywords: ["material de limpeza", "limpeza", "detergente", "desinfetante", "amaciante", "sabao em po", "rodo", "vassoura", "cloro", "agua sanitaria", "alvejante"],
    group: "Moradia e contas",
    priority: 4,
    confidence: 0.8,
    ownerScope: "PF",
    categoryType: "expense"
  },
  {
    name: "Seguro residencial",
    keywords: ["seguro residencial", "porto seguro residencial", "sulamerica residencial", "mapfre residencial", "allianz residencial", "sinistro residencial"],
    group: "Moradia e contas",
    priority: 4,
    confidence: 0.9,
    ownerScope: "PF",
    categoryType: "expense"
  },
  {
    name: "Serviços domésticos",
    keywords: ["diarista", "faxina", "faxineira", "passadeira", "jardineiro", "mensalista domestica", "e-social", "esocial", "babá", "domestica"],
    group: "Moradia e contas",
    priority: 4,
    confidence: 0.85,
    ownerScope: "PF",
    categoryType: "expense"
  },

  // ==========================================
  // PF — ALIMENTAÇÃO
  // ==========================================
  {
    name: "Alimentação",
    keywords: ["alimentacao", "restaurante", "ifood", "aiqfome", "rappi", "ze delivery", "mc donalds", "burguer king", "habibs", "outback", "comida", "jantar", "almoco", "lanche", "snack"],
    group: "Alimentação",
    priority: 4,
    confidence: 0.8,
    ownerScope: "PF",
    categoryType: "expense"
  },
  {
    name: "Supermercado",
    keywords: ["supermercado", "carrefour", "pao de acucar", "extra", "assai", "atacadao", "zona sul", "mambo", "st marche", "prezunic", "mundial", "guanabara", "condor", "angeloni", "zaffari", "pague menos mercado", "asahi", "dia supermercado", "mercado", "mercadinho", "quitanda", "atacado", "varejo", "compras mes", "hipermercado"],
    group: "Alimentação",
    priority: 4,
    confidence: 0.85,
    ownerScope: "PF",
    categoryType: "expense"
  },
  {
    name: "Padaria",
    keywords: ["padaria", "panificadora", "panificacao", "confeitaria", "pao", "bisnaga", "pão de queijo", "broa", "bolo caseiro", "brioche", "padoca", "biscoito"],
    group: "Alimentação",
    priority: 4,
    confidence: 0.8,
    ownerScope: "PF",
    categoryType: "expense"
  },
  {
    name: "Restaurante",
    keywords: ["restaurante", "churrascaria", "pizzaria", "cantina", "sushi", "temakeria", "buffet", "self service", "self-service", "galeteria", "tratoria", "parmegiana", "comida a quilo", "almoço", "jantar", "gourmet", "gastropub", "bistrô"],
    group: "Alimentação",
    priority: 4,
    confidence: 0.85,
    ownerScope: "PF",
    categoryType: "expense"
  },
  {
    name: "Delivery",
    keywords: ["delivery", "entrega", "ifood", "rappi", "aiqfome", "ze delivery", "zedelivery", "james delivery", "uber eats", "delivery center", "entregas"],
    group: "Alimentação",
    priority: 5,
    confidence: 0.9,
    ownerScope: "PF",
    categoryType: "expense"
  },
  {
    name: "Café / Lanches",
    keywords: ["cafe", "cafeteria", "starbucks", "lanche", "salgado", "kopenhagen", "cacau show cafe", "rei do mate", "casa do pão de queijo", "nespresso", "dolce gusto", "cafeteria expressa", "pão na chapa", "misto quente", "torta doce"],
    group: "Alimentação",
    priority: 4,
    confidence: 0.8,
    ownerScope: "PF",
    categoryType: "expense"
  },
  {
    name: "Açougue",
    keywords: ["açougue", "açougue swift", "swift", "boutique da carne, costela", "picanha", "alcatra", "carne moída", "frango", "linguiça", "peixaria", "peixe", "frutos do mar", "cortes nobres"],
    group: "Alimentação",
    priority: 4,
    confidence: 0.85,
    ownerScope: "PF",
    categoryType: "expense"
  },
  {
    name: "Hortifruti",
    keywords: ["hortifruti", "sacolão", "feira livre", "feira", "verdura", "legumes", "frutas", "organicos", "banca de frutas", "obalacobaco", "pomar", "sacolao"],
    group: "Alimentação",
    priority: 4,
    confidence: 0.85,
    ownerScope: "PF",
    categoryType: "expense"
  },
  {
    name: "Bebidas",
    keywords: ["bebidas", "adega", "cervejaria", "empório de bebidas", "chopp", "vinho", "distribuidora de bebidas", "refrigerante", "sucos", "cerveja", "drink", "adegas"],
    group: "Alimentação",
    priority: 4,
    confidence: 0.8,
    ownerScope: "PF",
    categoryType: "expense"
  },

  // ==========================================
  // PF — TRANSPORTE
  // ==========================================
  {
    name: "Uber / 99",
    keywords: ["uber", "99", "indrive", "uber trip", "99app", "uber rides", "corrida uber", "motorista particular", "taxi", "cooperativa taxi", "corrida 99", "app transporte"],
    group: "Transporte",
    priority: 6,
    confidence: 0.95,
    ownerScope: "PF",
    categoryType: "expense"
  },
  {
    name: "Combustível",
    keywords: ["combustivel", "shell", "ipiranga", "petrobras", "posto", "ale", "combustiveis", "gasolina", "etanol", "diesel", "posto de gasolina", "br mania", "shell box", "abastece ai", "premia", "gnv"],
    group: "Transporte",
    priority: 5,
    confidence: 0.9,
    ownerScope: "PF",
    categoryType: "expense"
  },
  {
    name: "Pedágio",
    keywords: ["pedagio", "sem parar", "semparar", "conectcar", "veloe", "taggy", "pedagios", "auto ban", "CCR", "ecovias", "tag pedagio", "rodovia tarifa"],
    group: "Transporte",
    priority: 5,
    confidence: 0.95,
    ownerScope: "PF",
    categoryType: "expense"
  },
  {
    name: "Estacionamento",
    keywords: ["estacionamento", "rotativo", "zona azul", "parebem", "multipark", "valete", "valet", "estacionamento shopping", "estapar", "zona azul digital"],
    group: "Transporte",
    priority: 4,
    confidence: 0.85,
    ownerScope: "PF",
    categoryType: "expense"
  },
  {
    name: "Manutenção veicular",
    keywords: ["manutencao veicular", "oficina", "mecanico", "pecas", "pneu", "autopeças", "retifica", "alinhamento", "balanceamento", "funilaria", "pintura", "freio", "amortecedor", "oleo", "troca de oleo", "lubrificante", "escapamento", "bateria", "auto eletrico"],
    group: "Transporte",
    priority: 4,
    confidence: 0.85,
    ownerScope: "PF",
    categoryType: "expense"
  },
  {
    name: "Seguro veicular",
    keywords: ["seguro veicular", "seguro auto", "porto seguro auto", "azul seguros", "tokio marine auto", "mapfre auto", "hdi seguros", "bradesco auto", "liberty seguros", "apolice auto"],
    group: "Transporte",
    priority: 4,
    confidence: 0.9,
    ownerScope: "PF",
    categoryType: "expense"
  },
  {
    name: "IPVA",
    keywords: ["ipva", "detran ipva", "licenciamento detran", "taxa de licenciamento", "dpvat", "guia ipva", "cota unica ipva"],
    group: "Transporte",
    priority: 5,
    confidence: 0.95,
    ownerScope: "PF",
    categoryType: "expense"
  },
  {
    name: "Multas",
    keywords: ["multas", "multa detran", "multa de transito", "autuacao", "infracao", "policia rodoviaria", "recurso de multa"],
    group: "Transporte",
    priority: 5,
    confidence: 0.95,
    ownerScope: "PF",
    categoryType: "expense"
  },
  {
    name: "Transporte público",
    keywords: ["transporte publico", "metro", "onibus", "trem", "riocard", "bilhete unico", "top card", "sptrans", "passagens de onibus", "embarque metro", "tarifa transporte", "valetransporte"],
    group: "Transporte",
    priority: 4,
    confidence: 0.85,
    ownerScope: "PF",
    categoryType: "expense"
  },
  {
    name: "Lavagem / Estética automotiva",
    keywords: ["lava rapido", "lava-jato", "lavajato", "ducha", "polimento", "cristalizacao", "higienizacao interna", "cera", "pretinho", "ducha rapida", "estetica automotiva"],
    group: "Transporte",
    priority: 4,
    confidence: 0.8,
    ownerScope: "PF",
    categoryType: "expense"
  },
  {
    name: "Aluguel de veículos",
    keywords: ["aluguel de carro", "locadora", "localiza", "hertz", "movida", "foco aluguel", "unidas", "locação veicular", "rent a car"],
    group: "Transporte",
    priority: 4,
    confidence: 0.9,
    ownerScope: "PF",
    categoryType: "expense"
  },

  // ==========================================
  // PF — SAÚDE
  // ==========================================
  {
    name: "Farmácia",
    keywords: ["farmacia", "drogaria", "raia", "drogasil", "pacheco", "venancio", "drogarias", "drogarias pacheco", "drogal", "pague menos", "bifarma", "ultrafarma", "nissei", "panvel", "remedio", "medicamento", "pomada", "analgesico", "termometro", "xarope"],
    group: "Saúde",
    priority: 4,
    confidence: 0.85,
    ownerScope: "PF",
    categoryType: "expense"
  },
  {
    name: "Plano de saúde",
    keywords: ["plano de saude", "amil", "sulamerica", "bradesco saude", "notredame", "unimed", "prevent senior", "golden cross", "alice saude", "hapvida", "clinipam", "samp", "mensalidade saude"],
    group: "Saúde",
    priority: 5,
    confidence: 0.95,
    ownerScope: "PF",
    categoryType: "expense"
  },
  {
    name: "Consultas médicas",
    keywords: ["consulta", "consultas", "medica", "psiquiatra", "pediatra", "cardiologista", "ginecologista", "dermatologista", "oftalmologista", "endocrinologista", "clinico geral", "telemedicina", "dr consulta", "dr.consulta", "receita medica"],
    group: "Saúde",
    priority: 4,
    confidence: 0.85,
    ownerScope: "PF",
    categoryType: "expense"
  },
  {
    name: "Exames",
    keywords: ["exames", "laboratorio", "fleury", "lopsa", "lavoisier", "delboni", "auriemo", "cdb exames", "ultrassonografia", "raio-x", "tomografia", "ressonancia", "laudo medico", "analise clinica"],
    group: "Saúde",
    priority: 4,
    confidence: 0.85,
    ownerScope: "PF",
    categoryType: "expense"
  },
  {
    name: "Odontologia",
    keywords: ["odontologia", "dentista", "odonto", "ortodontia", "aparelho", "amil dental", "odontoprev", "uniodonto", "implante dental", "canal", "obturecao", "consulta dentista"],
    group: "Saúde",
    priority: 4,
    confidence: 0.85,
    ownerScope: "PF",
    categoryType: "expense"
  },
  {
    name: "Psicologia / Terapia",
    keywords: ["psicologia", "terapia", "psicologo", "terapeuta", "crp", "psicanalise", "terapia de casal", "terapia online", "zenklub", "sessoes psicologia"],
    group: "Saúde",
    priority: 4,
    confidence: 0.85,
    ownerScope: "PF",
    categoryType: "expense"
  },
  {
    name: "Fisioterapia",
    keywords: ["fisioterapia", "fisioterapeuta", "pilates", "rpg", "acupuntura", "quiropraxia", "reabilitacao fisica", "sessoes fisioterapia"],
    group: "Saúde",
    priority: 4,
    confidence: 0.8,
    ownerScope: "PF",
    categoryType: "expense"
  },
  {
    name: "Suplementos",
    keywords: ["suplemento", "suplementos", "growth", "max titanium", "integralmedica", "whey", "creatina", "termogenico", "multivitaminico", "loja suplementos"],
    group: "Saúde",
    priority: 4,
    confidence: 0.8,
    ownerScope: "PF",
    categoryType: "expense"
  },
  {
    name: "Ótica",
    keywords: ["otica", "oticas diniz", "carol", "oticas carol", "oculos", "armacao", "lentes de contato", "lente", "exames de vista", "oculos escuros"],
    group: "Saúde",
    priority: 4,
    confidence: 0.85,
    ownerScope: "PF",
    categoryType: "expense"
  },
  {
    name: "Higiene pessoal",
    keywords: ["higiene pessoal", "sabonete", "shampoo", "condicionador", "desodorante", "pasta de dente", "fio dental", "protetor solar", "repelente", "escova dente"],
    group: "Saúde",
    priority: 3,
    confidence: 0.75,
    ownerScope: "PF",
    categoryType: "expense"
  },

  // ==========================================
  // PF — EDUCAÇÃO E CARREIRA
  // ==========================================
  {
    name: "Educação",
    keywords: ["educacao", "cursos", "faculdade", "escola", "livros", "mensalidade", "kiwify", "hotmart", "udemy", "alura", "coursera", "mensalidade escolar", "matricula"],
    group: "Educação e carreira",
    priority: 4,
    confidence: 0.85,
    ownerScope: "PF",
    categoryType: "expense"
  },
  {
    name: "Cursos",
    keywords: ["curso", "cursos", "hotmart", "kiwify", "udemy", "alura", "coursera", "monetizze", "eduzz", "workshop", "bootcamp", "mentoria", "masterclass", "treinamento"],
    group: "Educação e carreira",
    priority: 4,
    confidence: 0.85,
    ownerScope: "PF",
    categoryType: "expense"
  },
  {
    name: "Faculdade / Escola",
    keywords: ["faculdade", "escola", "colegio", "mensalidade escolar", "matricula", "pós-graduação", "pos-graduacao", "mba", "mestrado", "doutorado", "cursinho", "pre-vestibular"],
    group: "Educação e carreira",
    priority: 5,
    confidence: 0.9,
    ownerScope: "PF",
    categoryType: "expense"
  },
  {
    name: "Livros",
    keywords: ["livros", "livro", "saraiva", "cultura", "amazon livros", "livraria", "estante virtual", "e-book", "ebook", "kindle store"],
    group: "Educação e carreira",
    priority: 4,
    confidence: 0.85,
    ownerScope: "PF",
    categoryType: "expense"
  },
  {
    name: "Material escolar",
    keywords: ["material escolar", "papelaria", "caderno", "mochila", "caneta", "lapiseira", "estojo", "giz", "folha de oficio", "papelaria inteligente"],
    group: "Educação e carreira",
    priority: 4,
    confidence: 0.8,
    ownerScope: "PF",
    categoryType: "expense"
  },
  {
    name: "Conselho profissional",
    keywords: ["conselho profissional", "coren", "crea", "oab", "crp", "crm", "cro", "crc", "anuidade conselho", "conselho regional"],
    group: "Educação e carreira",
    priority: 5,
    confidence: 0.95,
    ownerScope: "PF",
    categoryType: "expense"
  },
  {
    name: "Certificações",
    keywords: ["certificacao", "certificacoes", "itil", "aws", "pmp", "scrum", "toefl", "ielts", "cpa-10", "cpa-20", "cea"],
    group: "Educação e carreira",
    priority: 4,
    confidence: 0.85,
    ownerScope: "PF",
    categoryType: "expense"
  },
  {
    name: "Eventos / Congressos",
    keywords: ["evento", "eventos", "congresso", "sympla", "eventbrite", "credenciamento congresso", "seminario", "palestra", "feira de negocios"],
    group: "Educação e carreira",
    priority: 4,
    confidence: 0.85,
    ownerScope: "PF",
    categoryType: "expense"
  },

  // ==========================================
  // PF — LAZER E ESTILO DE VIDA
  // ==========================================
  {
    name: "Lazer",
    keywords: ["lazer", "cinema", "teatro", "viagem", "hospedagem", "hotel", "airbnb", "passagens", "show", "sympla", "ingresso", "diversao", "entretenimento", "passeio"],
    group: "Lazer e estilo de vida",
    priority: 4,
    confidence: 0.8,
    ownerScope: "PF",
    categoryType: "expense"
  },
  {
    name: "Viagem",
    keywords: ["viagem", "viagens", "hospedagem", "turismo", "decolar", "cvc", "123milhas", "passagens", "voo", "pacote turistico", "pousada", "hostel", "agência de turismo"],
    group: "Lazer e estilo de vida",
    priority: 4,
    confidence: 0.85,
    ownerScope: "PF",
    categoryType: "expense"
  },
  {
    name: "Hotel / Hospedagem",
    keywords: ["hotel", "hospedagem", "airbnb", "booking", "booking.com", "pousada", "resort", "motel", "diaria hotel", "reserva quarto"],
    group: "Lazer e estilo de vida",
    priority: 4,
    confidence: 0.85,
    ownerScope: "PF",
    categoryType: "expense"
  },
  {
    name: "Passagens",
    keywords: ["passagem", "passagens", "passagem aerea", "latam", "azul", "gol", "voeazul", "voegol", "voelatam", "decolar passagens", "passagem interestadual"],
    group: "Lazer e estilo de vida",
    priority: 4,
    confidence: 0.85,
    ownerScope: "PF",
    categoryType: "expense"
  },
  {
    name: "Cinema / Teatro",
    keywords: ["cinema", "teatro", "ingresso.com", "kinoplex", "cinemark", "uci", "ingresso cinema", "peca teatro", "bilheteria cinema"],
    group: "Lazer e estilo de vida",
    priority: 4,
    confidence: 0.85,
    ownerScope: "PF",
    categoryType: "expense"
  },
  {
    name: "Restaurantes especiais",
    keywords: ["restaurante especial", "gourmet", "culinaria", "bistrô", "estrela michelin", "fine dining", "jantar romantico", "restaurante luxo"],
    group: "Lazer e estilo de vida",
    priority: 4,
    confidence: 0.8,
    ownerScope: "PF",
    categoryType: "expense"
  },
  {
    name: "Academia",
    keywords: ["academia", "smart fit", "bluefit", "bodytech", "selfit", "gympass", "totalpass", "musculacao", "crossfit", "natacão", "futebol", "quadra"],
    group: "Lazer e estilo de vida",
    priority: 5,
    confidence: 0.9,
    ownerScope: "PF",
    categoryType: "expense"
  },
  {
    name: "Beleza / Estética",
    keywords: ["beleza", "estetica", "salao de beleza", "cabeleireiro", "barbearia", "manicure", "depilacao", "maquiagem", "boticario", "natura", "sephora", "avon", "mary kay", "esteticista", "limpeza de pele"],
    group: "Lazer e estilo de vida",
    priority: 4,
    confidence: 0.85,
    ownerScope: "PF",
    categoryType: "expense"
  },
  {
    name: "Vestuário",
    keywords: ["vestuario", "roupa", "calcado", "zara", "renner", "c&a", "riachuelo", "hering", "nike", "adidas", "shein", "centauro", "tenis", "bota", "bolsa", "joia", "relogio", "óculos de sol", "boutique", "lingerie"],
    group: "Lazer e estilo de vida",
    priority: 4,
    confidence: 0.85,
    ownerScope: "PF",
    categoryType: "expense"
  },
  {
    name: "Pets",
    keywords: ["pet", "pets", "petz", "cobasi", "veterinario", "ração", "banho e tosa", "clinica veterinaria", "coleira", "petlove", "zee.dog", "hotel pet", "adestrador"],
    group: "Lazer e estilo de vida",
    priority: 4,
    confidence: 0.85,
    ownerScope: "PF",
    categoryType: "expense"
  },
  {
    name: "Presentes",
    keywords: ["presente", "presentes", "flores", "chocolate", "cacau show", "floricultura", "cesta de cafe", "embrulho", "cartao presente", "vale presente"],
    group: "Lazer e estilo de vida",
    priority: 4,
    confidence: 0.8,
    ownerScope: "PF",
    categoryType: "expense"
  },
  {
    name: "Doações",
    keywords: ["doacao", "doacoes", "ongs", "greenpeace", "red cross", "medico sem fronteiras", "unicef", "graacc", "instituicao de caridade", "ajuda humanitaria"],
    group: "Lazer e estilo de vida",
    priority: 4,
    confidence: 0.85,
    ownerScope: "PF",
    categoryType: "expense"
  },
  {
    name: "Dízimo",
    keywords: ["dizimo", "oferta", "igreja", "paroquia", "templo", "mesquita", "sinagoga", "centro espirita", "cota religiosa"],
    group: "Lazer e estilo de vida",
    priority: 5,
    confidence: 0.95,
    ownerScope: "PF",
    categoryType: "expense"
  },
  {
    name: "Streaming / Assinaturas",
    keywords: ["netflix", "spotify", "youtube premium", "google play", "canva", "chatgpt premium", "amazon prime", "disney", "disney+", "hbo max", "globoplay", "paramount", "apple tv", "deezer", "crunchyroll", "prime video", "stars+", "telecine"],
    group: "Lazer e estilo de vida",
    priority: 5,
    confidence: 0.95,
    ownerScope: "PF",
    categoryType: "expense"
  },
  {
    name: "Jogos / Games",
    keywords: ["playstation", "xbox", "steam", "nintendo", "game", "games", "epic games", "riot games", "moedas virtuais", "lol", "skins", "pubg", "ps plus", "game pass"],
    group: "Lazer e estilo de vida",
    priority: 4,
    confidence: 0.85,
    ownerScope: "PF",
    categoryType: "expense"
  },
  {
    name: "Tabacaria / Adega",
    keywords: ["tabacaria", "adega", "carvão", "essencia", "narguile", "charuto", "distribuidora de bebidas", "vinhos", "tabaco", "seda", "bebida alcoolica", "chopp express"],
    group: "Lazer e estilo de vida",
    priority: 4,
    confidence: 0.8,
    ownerScope: "PF",
    categoryType: "expense"
  },

  // ==========================================
  // PF — FINANCEIRO E OBRIGAÇÕES
  // ==========================================
  {
    name: "Cartão de Crédito",
    keywords: ["cartao de credito", "fatura", "nubank fatura", "fatura cartao", "fatura btg", "fatura itau", "fatura bradesco", "fatura santander", "pagto fatura", "fatura cartao", "debito fatura"],
    group: "Financeiro",
    priority: 5,
    confidence: 0.95,
    ownerScope: "PF",
    categoryType: "expense"
  },
  {
    name: "Dívidas / Empréstimos",
    keywords: ["divida", "dividas", "emprestimo", "emprestimos", "financiamento", "parcela emprestimo", "renegociacao", "juros divida", "quitacao emprestimo"],
    group: "Financeiro",
    priority: 5,
    confidence: 0.9,
    ownerScope: "PF",
    categoryType: "expense"
  },
  {
    name: "Financiamento",
    keywords: ["financiamento", "financiamento imobiliario", "financiamento veicular", "consórcio", "caixa economica habitação", "parcela imovel", "prestacao habitacao", "carta de credito", "parcela carro"],
    group: "Financeiro",
    priority: 5,
    confidence: 0.9,
    ownerScope: "PF",
    categoryType: "expense"
  },
  {
    name: "Juros / Multas",
    keywords: ["juros", "multa", "juros de mora", "encargos", "juros cheque especial", "encargos financeiros", "multa por atraso", "taxa de atraso"],
    group: "Financeiro",
    priority: 5,
    confidence: 0.9,
    ownerScope: "PF",
    categoryType: "expense"
  },
  {
    name: "Tarifas bancárias",
    keywords: ["tarifa bancaria", "tarifa", "mensalidade conta", "cesta de servicos", "anuidade", "anuidade cartao", "taxa de saque", "taxa pix", "taxa ted", "tarifa extrato"],
    group: "Financeiro",
    priority: 5,
    confidence: 0.9,
    ownerScope: "PF",
    categoryType: "expense"
  },
  {
    name: "Seguros",
    keywords: ["seguro", "seguros", "seguro de vida", "seguro residencial", "seguro de celular", "seguro viagem", "seguro porto seguro", "previdencia privada"],
    group: "Financeiro",
    priority: 5,
    confidence: 0.9,
    ownerScope: "PF",
    categoryType: "expense"
  },
  {
    name: "Transferência entre contas",
    keywords: ["transferencia", "transferencia entre contas", "ted mesma titularidade", "pix mesma titularidade", "transf entre contas", "ted enviado", "doc enviado", "transferencia online", "ted", "doc", "transf"],
    group: "Financeiro",
    priority: 5,
    confidence: 0.95,
    ownerScope: "PF",
    categoryType: "transfer"
  },
  {
    name: "PIX entre pessoas",
    keywords: ["pix enviado", "pix recebido", "pix transferido", "comprovante pix", "transferencia pix", "pix enviado para"],
    group: "Financeiro",
    priority: 5,
    confidence: 0.9,
    ownerScope: "PF",
    categoryType: "expense"
  },
  {
    name: "Carteira digital",
    keywords: ["carteira digital", "recargapay", "picpay", "mercado pago", "pagbank", "ame digital", "recarga bilhete"],
    group: "Financeiro",
    priority: 4,
    confidence: 0.8,
    ownerScope: "PF",
    categoryType: "expense"
  },
  {
    name: "Estorno",
    keywords: ["estorno", "reembolso", "devolucao", "estorno cartao", "reembolso compra", "cancelamento compra"],
    group: "Financeiro",
    priority: 5,
    confidence: 0.95,
    ownerScope: "PF",
    categoryType: "income"
  },
  {
    name: "Ajuste de saldo",
    keywords: ["ajuste de saldo", "ajuste", "correção de saldo"],
    group: "Financeiro",
    priority: 5,
    confidence: 0.95,
    ownerScope: "PF",
    categoryType: "transfer"
  },
  {
    name: "IOF",
    keywords: ["iof", "imposto operacoes financeiras", "iof fatura", "iof cambio"],
    group: "Financeiro",
    priority: 5,
    confidence: 0.95,
    ownerScope: "PF",
    categoryType: "expense"
  },
  {
    name: "Consórcio",
    keywords: ["consorcio", "parcela consorcio", "porto seguro consorcio", "contemplacao", "consorcio embracon"],
    group: "Financeiro",
    priority: 4,
    confidence: 0.9,
    ownerScope: "PF",
    categoryType: "expense"
  },

  // ==========================================
  // PF — RECEITAS
  // ==========================================
  {
    name: "Salário",
    keywords: ["salario", "pagamento salario", "remuneracao", "folha de pagamento", "contracheque", "deposito salario", "folha mensal", "remun"],
    group: "Receitas",
    priority: 5,
    confidence: 0.95,
    ownerScope: "PF",
    categoryType: "income"
  },
  {
    name: "Pró-labore",
    keywords: ["pro-labore", "pro labore", "retirada pro-labore", "retirada socios", "retirada de dividendos pj"],
    group: "Receitas",
    priority: 5,
    confidence: 0.95,
    ownerScope: "PF",
    categoryType: "income"
  },
  {
    name: "Freelance",
    keywords: ["freelance", "freelancer", "freela", "serviço extra", "bico", "pagamento servico", "honorarios"],
    group: "Receitas",
    priority: 4,
    confidence: 0.8,
    ownerScope: "PF",
    categoryType: "income"
  },
  {
    name: "Reembolso",
    keywords: ["reembolso", "reembolso despesa", "reembolso corporativo", "reembolso uber", "reembolso refeicao"],
    group: "Receitas",
    priority: 5,
    confidence: 0.95,
    ownerScope: "PF",
    categoryType: "income"
  },
  {
    name: "Aluguel recebido",
    keywords: ["aluguel recebido", "recebimento aluguel", "locação recebida", "repasse imobiliaria"],
    group: "Receitas",
    priority: 5,
    confidence: 0.95,
    ownerScope: "PF",
    categoryType: "income"
  },
  {
    name: "Presente / Ajuda familiar",
    keywords: ["presente", "ajuda familiar", "mesada", "doacao familiar", "ajuda de custo"],
    group: "Receitas",
    priority: 4,
    confidence: 0.8,
    ownerScope: "PF",
    categoryType: "income"
  },
  {
    name: "Venda de item pessoal",
    keywords: ["venda de item pessoal", "enjoei", "olx", "mercado livre venda", "desapego", "brecho"],
    group: "Receitas",
    priority: 4,
    confidence: 0.8,
    ownerScope: "PF",
    categoryType: "income"
  },
  {
    name: "Recebimentos",
    keywords: ["recebimento", "recebimentos", "receita", "faturamento", "receb"],
    group: "Receitas",
    priority: 4,
    confidence: 0.75,
    ownerScope: "PF",
    categoryType: "income"
  },
  {
    name: "Outros recebimentos",
    keywords: ["outros recebimentos", "rendimentos diversos", "receita eventual", "premio", "sorteio", "cashback"],
    group: "Receitas",
    priority: 3,
    confidence: 0.7,
    ownerScope: "PF",
    categoryType: "income"
  },

  // ==========================================
  // INVESTIMENTOS (PF / PJ)
  // ==========================================
  {
    name: "Aporte investimento",
    keywords: ["aporte", "aporte investimento", "investimento", "aplicacao financeira", "novos aportes", "investir", "compra ativos"],
    group: "Investimentos",
    priority: 5,
    confidence: 0.95,
    ownerScope: "ALL",
    categoryType: "investment"
  },
  {
    name: "Resgate investimento",
    keywords: ["resgate", "resgate investimento", "resgate financeiro", "liquidacao de investimentos", "venda ativos"],
    group: "Investimentos",
    priority: 5,
    confidence: 0.95,
    ownerScope: "ALL",
    categoryType: "investment"
  },
  {
    name: "Dividendos",
    keywords: ["dividendo", "dividendos", "proventos", "rendimento acoes", "dividendos recebidos"],
    group: "Investimentos",
    priority: 5,
    confidence: 0.95,
    ownerScope: "ALL",
    categoryType: "income"
  },
  {
    name: "Juros sobre capital",
    keywords: ["jscp", "juros sobre capital", "juros s/ capital", "provento jscp", "juros s/ capital proprio"],
    group: "Investimentos",
    priority: 5,
    confidence: 0.95,
    ownerScope: "ALL",
    categoryType: "income"
  },
  {
    name: "Rendimento FII",
    keywords: ["rendimento fii", "rendimentos fii", "rendimento fundos imobiliarios", "provento fii"],
    group: "Investimentos",
    priority: 5,
    confidence: 0.95,
    ownerScope: "ALL",
    categoryType: "income"
  },
  {
    name: "Tesouro Direto",
    keywords: ["tesouro", "tesouro direto", "tesouro selic", "tesouro ipca", "b3 tesouro", "aplicacao tesouro"],
    group: "Investimentos",
    priority: 5,
    confidence: 0.95,
    ownerScope: "ALL",
    categoryType: "investment"
  },
  {
    name: "CDB / Renda Fixa",
    keywords: ["cdb", "renda fixa", "lci", "lca", "cri", "cra", "debenture", "aplicacao cdb", "resgate cdb"],
    group: "Investimentos",
    priority: 5,
    confidence: 0.95,
    ownerScope: "ALL",
    categoryType: "investment"
  },
  {
    name: "Ações",
    keywords: ["acoes", "b3", "bolsa de valores", "compra acoes", "venda acoes", "mercado fracionario"],
    group: "Investimentos",
    priority: 5,
    confidence: 0.9,
    ownerScope: "ALL",
    categoryType: "investment"
  },
  {
    name: "Fundos Imobiliários",
    keywords: ["fii", "fiis", "fundos imobiliarios", "cotas fii", "subscricao fii"],
    group: "Investimentos",
    priority: 5,
    confidence: 0.9,
    ownerScope: "ALL",
    categoryType: "investment"
  },
  {
    name: "Cripto",
    keywords: ["cripto", "criptomoedas", "bitcoin", "ethereum", "binance", "compras cripto", "bitcoin enviado", "hash cripto"],
    group: "Investimentos",
    priority: 5,
    confidence: 0.9,
    ownerScope: "ALL",
    categoryType: "investment"
  },
  {
    name: "Corretagem / Custódia",
    keywords: ["corretagem", "custodia", "taxa b3", "taxa corretagem", "taxa de liquidacao"],
    group: "Investimentos",
    priority: 5,
    confidence: 0.95,
    ownerScope: "ALL",
    categoryType: "expense"
  },
  {
    name: "Fundos de Investimento",
    keywords: ["fundos de investimento", "fundo multimercado", "fundo de acoes", "cota fundo"],
    group: "Investimentos",
    priority: 5,
    confidence: 0.9,
    ownerScope: "ALL",
    categoryType: "investment"
  },

  // ==========================================
  // PJ — RECEITAS
  // ==========================================
  {
    name: "Receita de Serviços",
    keywords: ["receita de servicos", "prestacao de servicos", "faturamento servicos", "serviços prestados", "emissao nota fiscal", "nfe emitida", "recebimento nfe", "prestador de servicos"],
    group: "PJ Receitas",
    priority: 5,
    confidence: 0.95,
    ownerScope: "PJ",
    categoryType: "income"
  },
  {
    name: "Receita de Vendas",
    keywords: ["receita de vendas", "vendas", "faturamento vendas", "venda mercadorias", "nfe venda", "nfe emitida venda", "receita mercadorias"],
    group: "PJ Receitas",
    priority: 5,
    confidence: 0.95,
    ownerScope: "PJ",
    categoryType: "income"
  },
  {
    name: "Receita Recorrente",
    keywords: ["receita recorrente", "assinaturas", "mensalidades", "saas recurring", "cobranca recorrente", "mensalidade saas"],
    group: "PJ Receitas",
    priority: 5,
    confidence: 0.95,
    ownerScope: "PJ",
    categoryType: "income"
  },
  {
    name: "Cliente",
    keywords: ["cliente", "clientes", "recebido de cliente", "adiantamento cliente", "deposito cliente", "pix cliente"],
    group: "PJ Receitas",
    priority: 4,
    confidence: 0.8,
    ownerScope: "PJ",
    categoryType: "income"
  },
  {
    name: "Reembolso PJ",
    keywords: ["reembolso pj", "reembolso despesa pj", "ressarcimento cliente", "devolucao fornecedor"],
    group: "PJ Receitas",
    priority: 5,
    confidence: 0.9,
    ownerScope: "PJ",
    categoryType: "income"
  },
  {
    name: "Vendas via Maquininha",
    keywords: ["venda maquininha", "recebimento stone", "recebimento cielo", "pagseguro vendas", "cielo vendas", "credito maquininha"],
    group: "PJ Receitas",
    priority: 5,
    confidence: 0.95,
    ownerScope: "PJ",
    categoryType: "income"
  },

  // ==========================================
  // PJ — DESPESAS
  // ==========================================
  {
    name: "Fornecedor",
    keywords: ["fornecedor", "fornecedores", "pagamento fornecedor", "insumos", "materia prima", "compra de estoque", "frete fornecedor", "boleto fornecedor", "nf fornecedor"],
    group: "PJ Despesas",
    priority: 5,
    confidence: 0.9,
    ownerScope: "PJ",
    categoryType: "expense"
  },
  {
    name: "Software / SaaS",
    keywords: ["software", "saas", "github", "vercel", "aws", "google cloud", "slack", "notion", "figma", "zoom", "canva", "chatgpt", "openai", "microsoft 365", "google workspace", "adobe", "clickup", "jira", "trello", "asana", "hubspot", "rd station", "salesforce", "datadog", "hotjar", "mailerlite", "sendgrid", "mailchimp", "cloudflare", "zoho", "pipedrive"],
    group: "PJ Despesas",
    priority: 5,
    confidence: 0.95,
    ownerScope: "PJ",
    categoryType: "expense"
  },
  {
    name: "Marketing / Tráfego",
    keywords: ["marketing", "trafego", "facebook ads", "google ads", "meta ads", "instagram ads", "agencia marketing", "anuncios", "panfletos", "assessoria de imprensa", "anuncio patrocinado", "gestao de trafego"],
    group: "PJ Despesas",
    priority: 5,
    confidence: 0.9,
    ownerScope: "PJ",
    categoryType: "expense"
  },
  {
    name: "Contabilidade",
    keywords: ["contabilidade", "contador", "contabil", "honorarios contabeis", "assessoria contabil", "escritorio contabil"],
    group: "PJ Despesas",
    priority: 5,
    confidence: 0.95,
    ownerScope: "PJ",
    categoryType: "expense"
  },
  {
    name: "Impostos PJ",
    keywords: ["impostos pj", "mei", "das", "simples nacional", "darf", "gps", "fgts", "inss", "receita federal", "iss", "icms", "pis", "cofins", "irpj", "csll", "declaracao anual", "taxa prefeitura", "taxa alvara", "inss retido", "issqn"],
    group: "PJ Despesas",
    priority: 5,
    confidence: 0.95,
    ownerScope: "PJ",
    categoryType: "expense"
  },
  {
    name: "Taxas bancárias PJ",
    keywords: ["taxas bancarias pj", "tarifa pj", "mensalidade conta pj", "cesta pj", "taxa pix pj", "taxa ted pj", "tarifas btg pj", "tarifas inter pj"],
    group: "PJ Despesas",
    priority: 5,
    confidence: 0.95,
    ownerScope: "PJ",
    categoryType: "expense"
  },
  {
    name: "Maquininha / Gateway",
    keywords: ["maquininha", "gateway", "stone", "pagseguro", "cielo", "getnet", "rede", "asaas", "stripe", "iugu", "mercadopago", "taxa de antecipacao", "taxa gateway", "tarifa gateway"],
    group: "PJ Despesas",
    priority: 5,
    confidence: 0.95,
    ownerScope: "PJ",
    categoryType: "expense"
  },
  {
    name: "Equipamentos / TI",
    keywords: ["equipamentos", "notebook", "computador", "celular corporativo", "ti", "hardware", "impressora", "nobreak", "licenca de software", "suporte ti", "manutencao de ti"],
    group: "PJ Despesas",
    priority: 4,
    confidence: 0.85,
    ownerScope: "PJ",
    categoryType: "expense"
  },
  {
    name: "Infraestrutura / Hosting",
    keywords: ["infraestrutura", "servidores", "provedor", "hosting", "hospedagem site", "cloud hosting", "domain registrars", "registro.br", "godaddy", "locaweb", "hostgator"],
    group: "PJ Despesas",
    priority: 5,
    confidence: 0.9,
    ownerScope: "PJ",
    categoryType: "expense"
  },
  {
    name: "Telefonia e Internet PJ",
    keywords: ["telefonia pj", "claro empresas", "vivo empresas", "tim empresas", "link dedicado", "provedor pj", "telefonia corporativa"],
    group: "PJ Despesas",
    priority: 5,
    confidence: 0.9,
    ownerScope: "PJ",
    categoryType: "expense"
  },
  {
    name: "Prestadores / Terceiros",
    keywords: ["prestador", "prestadores", "freelancer pj", "servico de terceiros", "consultoria externa", "assessoria juridica", "honorarios advocaticios"],
    group: "PJ Despesas",
    priority: 4,
    confidence: 0.8,
    ownerScope: "PJ",
    categoryType: "expense"
  },
  {
    name: "Folha / Colaboradores",
    keywords: ["folha de pagamento", "salarios funcionarios", "decimo terceiro", "ferias", "vale refeicao", "vale transporte", "plano de saude corporativo", "seguro de vida empresarial", "rescisao", "encargos trabalhistas", "vr", "vt", "fgts folha"],
    group: "PJ Despesas",
    priority: 5,
    confidence: 0.95,
    ownerScope: "PJ",
    categoryType: "expense"
  },
  {
    name: "Pró-labore despesa",
    keywords: ["pro-labore", "retirada pro-labore", "retirada socios", "pro labore socio"],
    group: "PJ Despesas",
    priority: 5,
    confidence: 0.95,
    ownerScope: "PJ",
    categoryType: "expense"
  },
  {
    name: "Viagens PJ",
    keywords: ["viagens pj", "hotel corporativo", "passagem aerea pj", "uber corporativo", "taxi corporativo", "hospedagem corporativa", "milhas pj", "reembolso viagem"],
    group: "PJ Despesas",
    priority: 5,
    confidence: 0.9,
    ownerScope: "PJ",
    categoryType: "expense"
  },
  {
    name: "Alimentação PJ",
    keywords: ["alimentacao pj", "refeicao corporativa", "almoço comercial", "cafe corporativo", "copa", "suprimentos copa", "reuniao refeicao"],
    group: "PJ Despesas",
    priority: 4,
    confidence: 0.85,
    ownerScope: "PJ",
    categoryType: "expense"
  },
  {
    name: "Escritório / Aluguel PJ",
    keywords: ["aluguel escritorio", "coworking", "condomínio pj", "iptu pj", "energia escritorio", "agua escritorio", "materiais de escritorio", "papelaria pj", "limpeza escritorio"],
    group: "PJ Despesas",
    priority: 5,
    confidence: 0.9,
    ownerScope: "PJ",
    categoryType: "expense"
  }
];
