import type { SelectionStrategy } from '../types/strategy'
import { getAllStats } from './utils'

export const forgottenStrategy: SelectionStrategy = {
  id: 'forgotten',
  name: 'Los olvidados',
  description: 'Siempre sale quien más tiempo lleva sin participar',
  longDescription: 'Ordena a los alumnos por tiempo desde su última intervención. Siempre selecciona al que más tiempo lleva sin participar. Perfecto para asegurarse de que nadie queda olvidado.',
  icon: '⏰',
  category: 'fairness',
  select(students, history) {
    const stats = getAllStats(history, students)
    const sorted = [...students].sort((a, b) => {
      const la = stats.get(a.id)!.lastParticipation ?? 0
      const lb = stats.get(b.id)!.lastParticipation ?? 0
      return la - lb
    })
    const neverParticipated = sorted.filter(s => stats.get(s.id)!.totalParticipations === 0)
    const pool = neverParticipated.length > 0 ? neverParticipated : sorted
    const pick = pool[0]
    return { selected: [pick], type: 'single' }
  },
}
