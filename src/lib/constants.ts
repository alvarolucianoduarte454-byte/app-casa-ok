// Constantes do sistema Casa OK

export const CORES_CASA_OK = {
  VERDE_AGUA: '#00A39A',
  VERDE_AGUA_HOVER: '#008A82',
  BRANCO: '#FFFFFF',
  CINZA_ESCURO: '#222222',
  CINZA_CLARO: '#F5F5F5'
} as const

export const PLANOS_CASA_OK = [
  {
    id: '1',
    nome: 'Essencial',
    descricao: 'Para quem quer manter o imóvel sempre em ordem, com suporte rápido para pequenos reparos e manutenção preventiva básica.',
    preco: 199.00,
    visitas: '2 visitas mensais',
    link_pagamento: 'https://pag.ae/819uAsiG6',
    servicos_inclusos: [
      'Troca de resistência de chuveiro',
      'Troca de sifão ou reparo de torneira',
      'Desobstrução leve de pia ou ralo',
      'Ajuste de portas e fechaduras',
      'Troca de tomadas, interruptores ou lâmpadas',
      'Reaperto de descargas (válvula Hydra ou caixa acoplada)',
      'Reparo de rejunte em pequenos trechos',
      'Aplicação de silicone em box ou pia',
      'Vistoria simples do imóvel (infiltrações, vazamentos, calhas e telhas)'
    ],
    servicos_orcamento: [
      'Pintura, elétrica complexa, hidráulica estrutural, telhado, gesso, ar-condicionado, jardinagem e limpeza pós-obra.'
    ],
    limite_chamados: 2,
    ativo: true
  },
  {
    id: '2',
    nome: 'Completo',
    descricao: 'Ideal para quem busca mais tranquilidade e quer resolver tanto reparos simples quanto melhorias estéticas e funcionais.',
    preco: 299.00,
    visitas: '3 visitas mensais',
    link_pagamento: 'https://pag.ae/819uDLNEo',
    servicos_inclusos: [
      'Todos os serviços do Plano Essencial',
      'Retoque de pintura em pequenas áreas',
      'Reparo em tomadas e fiação leve',
      'Substituição de chuveiro, torneira ou válvula de descarga',
      'Troca de ralos, sifões e registros',
      'Ajuste de calhas e rufos',
      'Reparo de rejunte e silicone em áreas molhadas',
      'Revisão de telhas e calhas após chuva forte',
      'Instalação de suportes, prateleiras e pequenos acessórios'
    ],
    servicos_orcamento: [
      'Ar-condicionado, jardinagem, limpeza pós-obra, gesso, reformas amplas e marcenaria.'
    ],
    limite_chamados: 3,
    ativo: true
  },
  {
    id: '3',
    nome: 'Super Premium',
    descricao: 'Para quem quer cobertura total, com prioridade máxima de atendimento e acompanhamento técnico especializado.',
    preco: 399.00,
    visitas: '4 chamados mensais',
    link_pagamento: 'https://pag.ae/819uLgcsS',
    servicos_inclusos: [
      'Todos os serviços do Plano Completo',
      'Troca de luminárias ou instalação de spots',
      'Reparo de drywall ou forro de PVC',
      'Inspeção de telhado e vedação',
      'Manutenção de portas, janelas e fechaduras',
      'Reparo ou substituição de válvula de descarga',
      'Atendimento emergencial (vazamentos, curtos, infiltrações leves)'
    ],
    servicos_orcamento: [
      'Qualquer serviço fora da lista acima ou além dos 4 chamados mensais.'
    ],
    limite_chamados: 4,
    ativo: true
  }
] as const

export const TIPOS_SERVICO = [
  { id: 'eletrica', nome: 'Elétrica', categoria: 'Manutenção', icone: '⚡' },
  { id: 'hidraulica', nome: 'Hidráulica', categoria: 'Manutenção', icone: '🔧' },
  { id: 'pintura', nome: 'Pintura', categoria: 'Reforma', icone: '🎨' },
  { id: 'marcenaria', nome: 'Marcenaria', categoria: 'Móveis', icone: '🪚' },
  { id: 'limpeza', nome: 'Limpeza', categoria: 'Serviços', icone: '🧽' },
  { id: 'jardinagem', nome: 'Jardinagem', categoria: 'Área Externa', icone: '🌱' },
  { id: 'ar_condicionado', nome: 'Ar Condicionado', categoria: 'Climatização', icone: '❄️' },
  { id: 'outros', nome: 'Outros', categoria: 'Diversos', icone: '🔨' }
] as const

export const STATUS_CHAMADO = {
  NOVO: 'novo',
  APROVADO: 'aprovado',
  EM_ANDAMENTO: 'em_andamento',
  CONCLUIDO: 'concluido',
  CANCELADO: 'cancelado'
} as const

export const PRIORIDADES = {
  NORMAL: 'normal',
  URGENTE: 'urgente'
} as const

export const TIPOS_PERFIL = {
  CLIENTE: 'cliente',
  TECNICO: 'tecnico',
  IMOBILIARIA: 'imobiliaria',
  ADMIN: 'admin'
} as const

export const TIPOS_IMOVEL = {
  APARTAMENTO: 'apartamento',
  CASA: 'casa',
  COMERCIAL: 'comercial',
  TEMPORADA: 'temporada'
} as const

export const GATEWAYS_PAGAMENTO = {
  MERCADO_PAGO: 'mercado_pago',
  PAGSEGURO: 'pagseguro'
} as const

export const STATUS_ASSINATURA = {
  ATIVA: 'ativa',
  CANCELADA: 'cancelada',
  SUSPENSA: 'suspensa',
  PENDENTE: 'pendente'
} as const

export const LIMITES_SISTEMA = {
  MAX_FOTOS_CHAMADO: 5,
  MAX_TAMANHO_FOTO: 5 * 1024 * 1024, // 5MB
  FORMATOS_FOTO_ACEITOS: ['image/jpeg', 'image/png', 'image/webp'],
  MAX_CARACTERES_DESCRICAO: 1000,
  MIN_CARACTERES_DESCRICAO: 10
} as const

export const MENSAGENS_SISTEMA = {
  CHAMADO_RECEBIDO: 'Seu chamado foi recebido e está sendo analisado pela nossa equipe.',
  CHAMADO_APROVADO: 'Seu chamado foi aprovado! Estamos procurando o melhor técnico para atendê-lo.',
  TECNICO_DESIGNADO: 'Um técnico foi designado para seu chamado e entrará em contato em breve.',
  SERVICO_INICIADO: 'O técnico chegou ao local e iniciou o atendimento.',
  SERVICO_CONCLUIDO: 'Seu chamado foi concluído! Por favor, avalie o serviço prestado.',
  PAGAMENTO_APROVADO: 'Pagamento aprovado com sucesso. Obrigado por escolher a Casa OK!',
  PAGAMENTO_PENDENTE: 'Seu pagamento está sendo processado. Você receberá uma confirmação em breve.'
} as const

export const CONFIGURACOES_PWA = {
  NOME_APP: 'Casa OK',
  NOME_COMPLETO: 'Casa OK - Manutenção Residencial',
  DESCRICAO: 'Assinatura prática e inteligente para manutenção de imóveis residenciais e de temporada',
  TEMA_COR: CORES_CASA_OK.VERDE_AGUA,
  COR_FUNDO: CORES_CASA_OK.BRANCO,
  ORIENTACAO: 'portrait-primary',
  DISPLAY: 'standalone'
} as const

export const CONTATOS_CASA_OK = {
  TELEFONE: '(11) 99999-9999',
  EMAIL: 'contato@casaok.com.br',
  WHATSAPP: '5511999999999',
  SITE: 'https://www.casaok.com.br',
  ENDERECO: 'São Paulo, SP - Brasil'
} as const

export const HORARIOS_ATENDIMENTO = {
  SEGUNDA_SEXTA: '08:00 - 18:00',
  SABADO: '08:00 - 12:00',
  DOMINGO: 'Emergências apenas',
  FERIADOS: 'Emergências apenas'
} as const

export const TEMPO_RESPOSTA = {
  CHAMADO_NORMAL: '24 horas',
  CHAMADO_URGENTE: '4 horas',
  CHAT_SUPORTE: '2 horas',
  EMAIL_SUPORTE: '24 horas'
} as const

// Validações
export const VALIDACOES = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  TELEFONE: /^\(\d{2}\)\s\d{4,5}-\d{4}$/,
  CNPJ: /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/,
  CEP: /^\d{5}-\d{3}$/
} as const

// URLs de API (para desenvolvimento)
export const API_ENDPOINTS = {
  BASE_URL: process.env.NODE_ENV === 'production' 
    ? 'https://api.casaok.com.br' 
    : 'http://localhost:3001',
  
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh'
  },
  
  CHAMADOS: {
    LIST: '/chamados',
    CREATE: '/chamados',
    UPDATE: '/chamados/:id',
    DELETE: '/chamados/:id',
    UPLOAD_FOTO: '/chamados/:id/fotos'
  },
  
  USUARIOS: {
    PROFILE: '/usuarios/profile',
    UPDATE: '/usuarios/profile',
    LIST: '/usuarios'
  },
  
  IMOVEIS: {
    LIST: '/imoveis',
    CREATE: '/imoveis',
    UPDATE: '/imoveis/:id',
    DELETE: '/imoveis/:id'
  },
  
  PLANOS: {
    LIST: '/planos',
    SUBSCRIBE: '/planos/:id/subscribe'
  },
  
  PAGAMENTOS: {
    CREATE: '/pagamentos',
    WEBHOOK: '/pagamentos/webhook',
    STATUS: '/pagamentos/:id/status'
  }
} as const