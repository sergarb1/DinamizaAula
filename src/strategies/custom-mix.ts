import type { SelectionStrategy } from '../types/strategy'
import { getAllStats, pickRandomIndex } from './utils'

export const customMixStrategy: SelectionStrategy = {
  id: 'custom-mix',
  name: 'Mezcla personalizada',
  description: 'Combina pesos con deslizadores: azar, compensación, grupos...',
  longDescription: 'El profesor ajusta manualmente la importancia de cada factor mediante deslizadores. Combina azar puro, compensación por participaciones, equidad de grupos y tiempo sin participar.',
  icon: '🎛️',
  category: 'adaptive',
  select(students, history, settings) {
    const stats = getAllStats(history, students)
    const now = Date.now()
    const wRandom = (settings?.weightRandom as number) ?? 0.25
    const wFairness = (settings?.weightFairness as number) ?? 0.25
    const wForgotten = (settings?.weightForgotten as number) ?? 0.25
    const wGroup = (settings?.weightGroup as number) ?? 0.25

    const weights = students.map(s => {
      const st = stats.get(s.id)!
      const randomW = 1
      const fairnessW = st.totalParticipations === 0 ? 10 : 1 / (st.totalParticipations + 1) * 5
      const hoursSinceLast = st.lastParticipation ? (now - st.lastParticipation) / 3600000 : 999
      const forgottenW = Math.min(10, hoursSinceLast / 2 + 0.5)
      const groupW = s.group ? 1.2 : 0.8
      return (
        randomW * wRandom +
        fairnessW * wFairness +
        forgottenW * wForgotten +
        groupW * wGroup
      )
    })
    const idx = pickRandomIndex(weights)
    return { selected: [students[idx]], type: 'single' }
  },
}
