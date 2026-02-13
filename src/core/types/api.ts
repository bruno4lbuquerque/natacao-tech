export interface NivelDTO {
  uuid: string
  nome: string
  corTouca: string
}

export interface HabilidadeDTO {
  uuid: string
  descricao: string
  categoria: string
}

export interface ProfessorDTO {
  uuid: string
  nome: string
  email: string
  nomeAcademia: string
}

export interface DashboardDTO {
  totalTurmas: number
  totalAlunos: number
  turmasDeHoje: TurmaDTO[]
  todasMinhasTurmas: TurmaDTO[]
}

export interface TurmaDTO {
  uuid: string
  nome: string
  horario: string
  diasSemana: string[]
  nomeProfessor?: string
  nivelAlvo?: {
    uuid: string
    nome: string
    corTouca: string
  }
  quantidadeAlunos?: number
}

export interface CadastroTurmaDTO {
  nome: string
  horario: string
  diasSemana: string[]
  nivelAlvoId: string
  academiaId: string
}

export interface AlunoDTO {
  uuid: string
  nome: string
  responsavel?: string
  telefone?: string
  nivelAtual: string
  corTouca: string
  nomeTurma: string
  nomeAcademia: string
  ativo: boolean
}

export interface AvaliacaoRequestDTO {
  alunoId: string
  habilidadesAprovadasIds: string[]
  observacao: string
  promoverManual: boolean
}

export interface HistoricoAvaliacaoDTO {
  uuid: string
  dataAvaliacao: string
  pontuacaoTotal: number
  promovido: boolean
  observacoes: string
  nivel: string
  habilidadesAprovadas: HabilidadeDTO[]
}
