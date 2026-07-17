import type { SelectionStrategy } from '../types/strategy'
import { shuffleArray } from './utils'

export const captainStrategy: SelectionStrategy = {
  id: 'captain',
  name: 'Capitán 👑',
  description: 'Elige un capitán y crea equipos a su alrededor',
  longDescription: 'Primero selecciona un capitán al azar. Después, el capitán va eligiendo compañeros alternando turnos (simulado automáticamente) para formar equipos equilibrados.',
  icon: '👑',
  category: 'teams',
  select(students, _history, settings) {
    const teamSize = (settings?.teamSize as number) ?? 3
    const captainIdx = Math.floor(Math.random() * students.length)
    const captain = students[captainIdx]
    const rest = shuffleArray(students.filter((_, i) => i !== captainIdx))
    const teams: typeof students[] = []
    const captainTeam = [captain, ...rest.slice(0, teamSize - 1)]
    teams.push(captainTeam)
    for (let i = teamSize - 1; i < rest.length; i += teamSize) {
      teams.push(rest.slice(i, i + teamSize))
    }
    return {
      selected: [captain],
      type: 'captain',
      captain,
      teams,
      label: `Capitán: ${captain.name}`,
    }
  },
}
