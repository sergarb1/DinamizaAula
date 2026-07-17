import type { SelectionStrategy } from '../types/strategy'

export const randomStrategy: SelectionStrategy = {
  id: 'random',
  name: 'Aleatorio puro',
  description: 'Todos tienen exactamente la misma probabilidad',
  longDescription: 'Selección completamente aleatoria. Sin ponderaciones, sin sesgos. Cada alumno activo tiene exactamente las mismas posibilidades de salir.',
  icon: '🎲',
  category: 'random',
  select(students) {
    const pick = students[Math.floor(Math.random() * students.length)]
    return { selected: [pick], type: 'single' }
  },
}
