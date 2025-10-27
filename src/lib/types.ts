// Tipos de dados para o sistema Casa OK

export interface User {
  id: string
  nome: string
  email: string
  telefone: string
  senha?: string
  tipo_perfil: 'cliente' | 'tecnico' | 'imobiliaria' | 'admin'
  created_at?: string
  updated_at?: string
}

export interface Imobiliaria {
  id: string
  nome: string
  cnpj: string
  logo?: string
  contato: string
  email: string
  telefone: string
  endereco?: string
  created_at?: string
}

export interface ClienteImobiliaria {
  id: string
  cliente_id: string
  imobiliaria_id: string
  data_indicacao: string
  observacoes?: string
}

export interface Imovel {
  id: string
  cliente_id: string
  endereco: string
  tipo: 'apartamento' | 'casa' | 'comercial' | 'temporada'
  observacoes?: string
  ativo: boolean
  created_at?: string
}

export interface Plano {
  id: string
  nome: string
  descricao: string
  preco: number
  servicos_inclusos: string[]
  limite_chamados?: number
  ativo: boolean
  created_at?: string
}

export interface Assinatura {
  id: string
  cliente_id: string
  imovel_id: string
  plano_id: string
  gateway: 'mercado_pago' | 'pagseguro'
  status: 'ativa' | 'cancelada' | 'suspensa' | 'pendente'
  data_inicio: string
  data_fim?: string
  valor_mensal: number
  created_at?: string
}

export interface Chamado {
  id: string
  cliente_id: string
  tecnico_id?: string
  imovel_id: string
  tipo_servico: string
  descricao: string
  prioridade: 'normal' | 'urgente'
  status: 'novo' | 'aprovado' | 'em_andamento' | 'concluido' | 'cancelado'
  data_abertura: string
  data_aprovacao?: string
  data_inicio?: string
  data_conclusao?: string
  valor_orcamento?: number
  observacoes_tecnico?: string
  avaliacao?: number
  comentario_avaliacao?: string
  created_at?: string
}

export interface Foto {
  id: string
  chamado_id: string
  url: string
  tipo: 'antes' | 'durante' | 'depois' | 'problema'
  descricao?: string
  uploaded_by: string
  created_at?: string
}

export interface Mensagem {
  id: string
  chamado_id: string
  autor_id: string
  autor_tipo: 'cliente' | 'tecnico' | 'admin'
  texto: string
  tipo: 'texto' | 'sistema' | 'foto'
  data_envio: string
  lida: boolean
}

export interface ServicoTipo {
  id: string
  nome: string
  categoria: 'eletrica' | 'hidraulica' | 'pintura' | 'marcenaria' | 'limpeza' | 'jardinagem' | 'outros'
  descricao: string
  preco_base?: number
  tempo_estimado?: number
  ativo: boolean
}

export interface Tecnico {
  id: string
  user_id: string
  especialidades: string[]
  avaliacao_media: number
  total_servicos: number
  ativo: boolean
  localizacao?: {
    latitude: number
    longitude: number
  }
}

export interface Relatorio {
  periodo: {
    inicio: string
    fim: string
  }
  chamados_total: number
  chamados_por_status: Record<string, number>
  chamados_por_tipo: Record<string, number>
  tempo_medio_atendimento: number
  receita_total: number
  clientes_ativos: number
  satisfacao_media: number
}

// Tipos para formulários
export interface LoginForm {
  email: string
  senha: string
}

export interface ChamadoForm {
  imovel_id: string
  tipo_servico: string
  descricao: string
  prioridade: 'normal' | 'urgente'
  fotos?: File[]
}

export interface ImovelForm {
  endereco: string
  tipo: 'apartamento' | 'casa' | 'comercial' | 'temporada'
  observacoes?: string
}

// Tipos para API responses
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// Tipos para notificações
export interface Notificacao {
  id: string
  user_id: string
  titulo: string
  mensagem: string
  tipo: 'info' | 'success' | 'warning' | 'error'
  lida: boolean
  data_criacao: string
  data_leitura?: string
}

// Tipos para dashboard
export interface DashboardStats {
  chamados_ativos: number
  chamados_concluidos: number
  clientes_ativos: number
  receita_mensal: number
  satisfacao_media: number
  tempo_medio_atendimento: number
}

export interface ChatMessage {
  id: string
  autor: string
  autor_tipo: 'cliente' | 'tecnico' | 'admin'
  mensagem: string
  timestamp: string
  tipo: 'texto' | 'foto' | 'sistema'
}