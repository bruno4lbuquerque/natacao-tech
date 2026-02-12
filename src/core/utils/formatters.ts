export const formatDays = (days: string[]) => {
  if (!days || days.length === 0) return 'A definir'

  const map: Record<string, string> = {
    SEGUNDA: 'Seg',
    TERCA: 'Ter',
    QUARTA: 'Qua',
    QUINTA: 'Qui',
    SEXTA: 'Sex',
    SABADO: 'Sáb',
    DOMINGO: 'Dom',
  }

  const order = [
    'SEGUNDA',
    'TERCA',
    'QUARTA',
    'QUINTA',
    'SEXTA',
    'SABADO',
    'DOMINGO',
  ]
  const sorted = [...days].sort((a, b) => order.indexOf(a) - order.indexOf(b))

  return sorted.map((d) => map[d] || d)
}
