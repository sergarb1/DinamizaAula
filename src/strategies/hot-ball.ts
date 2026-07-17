import type { SelectionStrategy } from '../types/strategy'
import { pickRandomIndex } from './utils'

export const hotBallStrategy: SelectionStrategy = {
  id: 'hot-ball',
  name: 'Bola caliente 🔥',
  description: 'Tendencia a elegir alumnos cercanos al último seleccionado',
  longDescription: 'Crea una sensación de continuidad. Cuando un alumno es seleccionado, los alumnos cercanos en la lista aumentan su probabilidad. Ideal para mantener el foco en una zona del aula.',
  icon: '🔥',
  category: 'random',
  select(students, history) {
    const lastId = history.length > 0 ? history[history.length - 1].studentId : null
    const weights = students.map((_s, i) => {
      if (!lastId) return 1
      const lastIdx = students.findIndex(st => st.id === lastId)
      const dist = Math.abs(i - lastIdx)
      return Math.max(0.2, 1 - dist * 0.15)
    })
    const idx = pickRandomIndex(weights)
    return { selected: [students[idx]], type: 'single' }
  },
}
