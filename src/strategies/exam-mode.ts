import type { SelectionStrategy } from '../types/strategy'
import { getAllStats } from './utils'

export const examModeStrategy: SelectionStrategy = {
  id: 'exam-mode',
  name: 'Modo examen 📋',
  description: 'Garantiza que todos salgan una vez antes de repetir',
  longDescription: 'Round-robin forzado. La aplicación garantiza que todos los alumnos activos sean seleccionados exactamente una vez antes de que nadie se repita. Ideal para evaluaciones orales.',
  icon: '📋',
  category: 'fairness',
  select(students, history) {
    const stats = getAllStats(history, students)
    const neverParticipated = students.filter(s => stats.get(s.id)!.totalParticipations === 0)
    if (neverParticipated.length > 0) {
      const pick = neverParticipated[Math.floor(Math.random() * neverParticipated.length)]
      return { selected: [pick], type: 'single', label: 'Primera ronda' }
    }
    const sorted = [...students].sort((a, b) => {
      return (stats.get(a.id)!.totalParticipations) - (stats.get(b.id)!.totalParticipations)
    })
    const minCount = stats.get(sorted[0].id)!.totalParticipations
    const candidates = sorted.filter(s => stats.get(s.id)!.totalParticipations === minCount)
    const pick = candidates[Math.floor(Math.random() * candidates.length)]
    return { selected: [pick], type: 'single', label: 'Nueva ronda' }
  },
}
