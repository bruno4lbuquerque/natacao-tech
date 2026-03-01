export const formatDays = (
  days: string[] | string | null | undefined
): string[] => {
  if (!days) return []

  const daysArray: string[] = Array.isArray(days)
    ? days
    : String(days)
        .split(',')
        .map((d) => d.trim())

  if (daysArray.length === 0) return []

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

  return [...daysArray]
    .sort((a, b) => order.indexOf(a) - order.indexOf(b))
    .map((d) => map[d] ?? d)
}

export const formatTime = (
  time: string | number[] | null | undefined
): string => {
  if (!time) return '--:--'
  if (Array.isArray(time)) {
    const h = String(time[0]).padStart(2, '0')
    const m = String(time[1] || 0).padStart(2, '0')
    return `${h}:${m}`
  }
  if (typeof time === 'string') {
    return time.substring(0, 5)
  }
  return '--:--'
}
