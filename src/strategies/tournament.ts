import type { SelectionStrategy } from '../types/strategy'

export const tournamentStrategy: SelectionStrategy = {
  id: 'tournament',
  name: 'Modo torneo 🏆',
  description: 'Todos empiezan. Cada respuesta correcta elimina al alumno. Queda uno',
  longDescription: 'Modo competición. Todos los alumnos comienzan activos. Cada vez que un alumno es seleccionado, queda eliminado del torneo. Gana el último que queda. Ideal para repasos competitivos.',
  icon: '🏆',
  category: 'gamification',
  select(students, history) {
    const eliminatedIds = new Set(history.map(p => p.studentId))
    const remaining = students.filter(s => !eliminatedIds.has(s.id))
    if (remaining.length === 0) {
      return { selected: [], type: 'none', label: '¡Todos han participado! El torneo ha terminado.' }
    }
    const pick = remaining[Math.floor(Math.random() * remaining.length)]
    const eliminated = students.filter(s => s.id !== pick.id && eliminatedIds.has(s.id))
    return {
      selected: [pick],
      type: 'single',
      eliminated,
      label: `Quedan ${remaining.length - 1} participantes`,
    }
  },
}
