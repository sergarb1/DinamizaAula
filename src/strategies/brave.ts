import type { SelectionStrategy } from '../types/strategy'
import { getAllStats, pickRandomIndex } from './utils'

export const braveStrategy: SelectionStrategy = {
  id: 'brave',
  name: 'El valiente',
  description: 'Favorece a quienes más participan. Ideal para debates',
  longDescription: 'Justo lo contrario que "El tímido". Favorece a los alumnos que más intervienen. Útil para debates rápidos o cuando quieres mantener un ritmo ágil en clase.',
  icon: '🦁',
  category: 'random',
  select(students, history) {
    const stats = getAllStats(history, students)
    const weights = students.map(s => {
      const st = stats.get(s.id)!
      return st.totalParticipations + 1
    })
    const idx = pickRandomIndex(weights)
    return { selected: [students[idx]], type: 'single' }
  },
}
