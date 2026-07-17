import type { SelectionStrategy } from '../types/strategy'
import { getAllStats, pickRandomIndex } from './utils'

export const weightedStrategy: SelectionStrategy = {
  id: 'weighted',
  name: 'Aleatorio compensado ⭐',
  description: 'Los alumnos que llevan sin participar tienen más probabilidad',
  longDescription: 'Cada intervención reduce el peso del alumno. Los olvidados aumentan su probabilidad automáticamente. Nunca llega a ser predecible, pero es mucho más justo que el azar puro.',
  icon: '⚖️',
  category: 'fairness',
  select(students, history) {
    const stats = getAllStats(history, students)
    const now = Date.now()
    const weights = students.map(s => {
      const st = stats.get(s.id)!
      if (st.totalParticipations === 0) return 10
      const hoursSinceLast = st.lastParticipation ? (now - st.lastParticipation) / 3600000 : 999
      return Math.max(0.3, Math.min(10, hoursSinceLast / 2 + 1 / (st.totalParticipations + 1) * 3))
    })
    const idx = pickRandomIndex(weights)
    return { selected: [students[idx]], type: 'single' }
  },
}
