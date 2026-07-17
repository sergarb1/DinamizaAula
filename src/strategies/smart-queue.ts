import type { SelectionStrategy } from '../types/strategy'
import { getAllStats } from './utils'

export const smartQueueStrategy: SelectionStrategy = {
  id: 'smart-queue',
  name: 'Cola inteligente 🧠',
  description: 'Genera una cola equilibrando participaciones, grupos e historial',
  longDescription: 'Crea una cola de participación que tiene en cuenta: quién ha participado menos, que los grupos estén repartidos y que nadie se repita cerca. La cola se regenera automáticamente al finalizar.',
  icon: '🧠',
  category: 'queue',
  select(students, history) {
    const stats = getAllStats(history, students)
    const sorted = [...students].sort((a, b) => {
      const sa = stats.get(a.id)!.totalParticipations
      const sb = stats.get(b.id)!.totalParticipations
      if (sa !== sb) return sa - sb
      const la = stats.get(a.id)!.lastParticipation ?? 0
      const lb = stats.get(b.id)!.lastParticipation ?? 0
      return la - lb
    })
    const picked = sorted.slice(0, Math.min(students.length, sorted.length))
    return {
      selected: [picked[0]],
      type: 'queue',
      queue: picked,
      label: `Cola de ${picked.length} alumnos`,
    }
  },
}
