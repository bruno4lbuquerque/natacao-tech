export interface NivelDTO {
  id: string // ou uuid
  nome: string
  corTouca: string
}

export interface ProfessorDTO {
  uuid: string
  nome: string
  email: string
  nomeAcademia: string
}

export interface TurmaDTO {
  uuid: string
  nome: string
  horario: string
  // O Java manda um Set<String>, o JSON transforma em Array de Strings
  diasSemana: string[]
  nivelAlvo?: {
    uuid: string
    nome: string
    corTouca: string
  }
}

export interface AlunoDTO {
  id: string // Mapeado do UUID do Java
  name: string
  class_code: string
  level: string
  active: boolean
}

export interface DashboardDTO {
  totalTurmas: number
  totalAlunos: number
  turmasDeHoje: TurmaDTO[]
  todasMinhasTurmas: TurmaDTO[]
}
