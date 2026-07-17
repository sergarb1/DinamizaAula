import type { SelectionStrategy } from '../types/strategy'

export const noRepeatStrategy: SelectionStrategy = {
  id: 'no-repeat',
  name: 'Nunca repetido',
  description: 'Nunca selecciona al mismo alumno dos veces seguidas',
  longDescription: 'Garantiza que nunca se repite el mismo alumno en dos selecciones consecutivas. Si solo hay un alumno activo, se selecciona ese.',
  icon: '🚫',
  category: 'fairness',
  select(students, history) {
    const lastId = history.length > 0 ? history[history.length - 1].studentId : null
    const candidates = lastId ? students.filter(s => s.id !== lastId) : students
    const pool = candidates.length > 0 ? candidates : students
    const pick = pool[Math.floor(Math.random() * pool.length)]
    return { selected: [pick], type: 'single' }
  },
}
