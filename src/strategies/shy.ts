import type { SelectionStrategy } from '../types/strategy'
import { getAllStats, pickRandomIndex } from './utils'

export const shyStrategy: SelectionStrategy = {
  id: 'shy',
  name: 'El tímido',
  description: 'Los alumnos con menos participaciones tienen mucha más probabilidad',
  longDescription: 'Favorece fuertemente a los alumnos que menos han participado. Los que ya han intervenido mucho ven reducida drásticamente su probabilidad. Ideal para fomentar la participación de los más callados.',
  icon: '🙈',
  category: 'fairness',
  select(students, history) {
    const stats = getAllStats(history, students)
    const weights = students.map(s => {
      const st = stats.get(s.id)!
      return 1 / (Math.pow(st.totalParticipations + 1, 2))
    })
    const idx = pickRandomIndex(weights)
    return { selected: [students[idx]], type: 'single' }
  },
}
