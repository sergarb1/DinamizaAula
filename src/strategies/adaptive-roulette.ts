import type { SelectionStrategy } from '../types/strategy'
import { getAllStats, pickRandomIndex } from './utils'

export const adaptiveRouletteStrategy: SelectionStrategy = {
  id: 'adaptive-roulette',
  name: 'Ruleta adaptativa ⭐⭐⭐',
  description: 'Los sectores de la ruleta cambian de tamaño según la probabilidad',
  longDescription: 'Visualmente espectacular. La ruleta muestra sectores de tamaño proporcional a la probabilidad de cada alumno. Los olvidados ocupan más espacio. Los que acaban de participar, menos. Una experiencia visual que comunica equidad.',
  icon: '🎡',
  category: 'adaptive',
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
    return {
      selected: [students[idx]],
      type: 'single',
      label: `Probabilidad: ${(weights[idx] / weights.reduce((a, b) => a + b, 0) * 100).toFixed(1)}%`,
    }
  },
}
