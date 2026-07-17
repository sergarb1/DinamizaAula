import type { SelectionStrategy } from '../types/strategy'
import { getAllStats } from './utils'

export const chainStrategy: SelectionStrategy = {
  id: 'chain',
  name: 'Cadena',
  description: 'El siguiente es quien más tiempo lleva sin participar',
  longDescription: 'Cada selección encadena con la siguiente. Tras seleccionar un alumno, el próximo será el que más tiempo lleve sin participar. Crea una sensación de flujo continuo y justo.',
  icon: '⛓️',
  category: 'queue',
  select(students, history) {
    const stats = getAllStats(history, students)
    const lastId = history.length > 0 ? history[history.length - 1].studentId : null
    const candidates = students.filter(s => s.id !== lastId)
    const sorted = [...candidates].sort((a, b) => {
      const la = stats.get(a.id)!.lastParticipation ?? 0
      const lb = stats.get(b.id)!.lastParticipation ?? 0
      return la - lb
    })
    const pick = sorted.length > 0 ? sorted[0] : students[0]
    return { selected: [pick], type: 'single' }
  },
}
