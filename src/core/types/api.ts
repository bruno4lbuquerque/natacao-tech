export interface NivelDTO {
  uuid: string
  nome: string
  corTouca?: string | null
}

export interface TurmaDTO {
  uuid: string
  nome: string
  horario: string
  diasSemana: string[]
  nomeProfessor?: string | null
  nivelAlvo?: { uuid: string; nome: string; corTouca?: string | null } | null
  quantidadeAlunos?: number
}

export interface CadastroTurmaDTO {
  nome: string
  horario: string
  diasSemana: string[]
  nivelAlvoId: string | null
  academiaId: string
}

export interface HabilidadeDTO {
  uuid: string
  descricao: string
  categoria: string
  ativo: boolean
}

export interface AlunoDTO {
  uuid: string
  nome: string
  nivelAtual?: string | null
  corTouca?: string | null
  nomeTurma?: string | null
  nomeAcademia?: string | null
  ativo?: boolean
  nomeResponsavel?: string | null
  telefoneResponsavel?: string | null
}

export interface DashboardDTO {
  totalTurmas: number
  totalAlunos: number
  turmasDeHoje: TurmaDTO[]
  todasMinhasTurmas: TurmaDTO[]
}

export interface HistoricoAvaliacaoDTO {
  uuid: string
  dataAvaliacao: string
  nivel: string
  pontuacaoTotal?: number
  promovido: boolean
  observacoes?: string | null
  habilidadesAprovadas?: string[] | null
}
