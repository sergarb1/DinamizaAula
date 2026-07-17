import type { SelectionStrategy } from '../types/strategy'
import { getAllStats, pickRandomIndex } from './utils'

export const byGroupStrategy: SelectionStrategy = {
  id: 'by-group',
  name: 'Equilibrio por grupos',
  description: 'Primero elige el grupo, después el alumno dentro del grupo',
  longDescription: 'Distribuye la participación entre grupos de forma equitativa. Primero selecciona el grupo con menos participaciones acumuladas, después elige un alumno dentro de ese grupo. Ideal para clases con grupos de trabajo.',
  icon: '📁',
  category: 'fairness',
  select(students, history) {
    const stats = getAllStats(history, students)
    const groups = new Map<string, typeof students>()
    for (const s of students) {
      const key = s.group || 'default'
      if (!groups.has(key)) groups.set(key, [])
      groups.get(key)!.push(s)
    }
    const groupEntries = [...groups.entries()]
    const groupWeights = groupEntries.map(([_, members]) => {
      const totalPart = members.reduce((sum, m) => sum + (stats.get(m.id)?.totalParticipations ?? 0), 0)
      return Math.max(0.1, 1 / (totalPart + 1))
    })
    const groupIdx = pickRandomIndex(groupWeights)
    const [groupName, members] = groupEntries[groupIdx]
    const member = members[Math.floor(Math.random() * members.length)]
    return { selected: [member], type: 'single', label: `Grupo: ${groupName}` }
  },
}
