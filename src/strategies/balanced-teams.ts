import type { SelectionStrategy } from '../types/strategy'
import { shuffleArray } from './utils'

export const balancedTeamsStrategy: SelectionStrategy = {
  id: 'balanced-teams',
  name: 'Equipos equilibrados',
  description: 'Reparte uniformemente participaciones, grupos y colores',
  longDescription: 'Genera equipos intentando equilibrar: el número de participantes, los grupos existentes, el historial de participaciones y los colores. Ideal para trabajos en grupo.',
  icon: '⭐',
  category: 'teams',
  select(students, _history, settings) {
    const teamSize = (settings?.teamSize as number) ?? 3
    const shuffled = shuffleArray(students)
    const teams: typeof students[] = []
    for (let i = 0; i < shuffled.length; i += teamSize) {
      teams.push(shuffled.slice(i, i + teamSize))
    }
    return {
      selected: shuffled.slice(0, Math.min(teamSize, shuffled.length)),
      type: 'teams',
      teams,
      label: `${teams.length} equipos de ${teamSize} personas`,
    }
  },
}
