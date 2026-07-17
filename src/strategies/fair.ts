import type { SelectionStrategy } from '../types/strategy'
import { getAllStats } from './utils'

export const fairStrategy: SelectionStrategy = {
  id: 'fair',
  name: 'Justicia total',
  description: 'Intenta que todos tengan el mismo número de participaciones',
  longDescription: 'Ordena a los alumnos por número de participaciones. Elige aleatoriamente entre los que menos han participado. Ideal para evaluaciones orales donde todos deben intervenir por igual.',
  icon: '🎯',
  category: 'fairness',
  select(students, history) {
    const stats = getAllStats(history, students)
    const sorted = [...students].sort((a, b) => {
      const sa = stats.get(a.id)!.totalParticipations
      const sb = stats.get(b.id)!.totalParticipations
      return sa - sb
    })
    const minCount = stats.get(sorted[0].id)!.totalParticipations
    const candidates = sorted.filter(s => stats.get(s.id)!.totalParticipations === minCount)
    const pick = candidates[Math.floor(Math.random() * candidates.length)]
    return { selected: [pick], type: 'single' }
  },
}
