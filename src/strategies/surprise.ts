import type { SelectionStrategy } from '../types/strategy'
import { randomStrategy } from './random'
import { weightedStrategy } from './weighted'
import { fairStrategy } from './fair'
import { noRepeatStrategy } from './no-repeat'
import { forgottenStrategy } from './forgotten'
import { shyStrategy } from './shy'
import { braveStrategy } from './brave'
import { chainStrategy } from './chain'
import { byGroupStrategy } from './by-group'
import { hotBallStrategy } from './hot-ball'

const surprisePool: SelectionStrategy[] = [
  randomStrategy,
  weightedStrategy,
  fairStrategy,
  noRepeatStrategy,
  forgottenStrategy,
  shyStrategy,
  braveStrategy,
  chainStrategy,
  byGroupStrategy,
  hotBallStrategy,
]

export const surpriseStrategy: SelectionStrategy = {
  id: 'surprise',
  name: 'Efecto sorpresa 🎭',
  description: 'Cada vez usa una estrategia distinta aleatoriamente',
  longDescription: 'Mantén la incertidumbre. Cada vez que pulsas, se selecciona una estrategia al azar entre todas las disponibles. Ni el profesor sabe qué método se usará. Ideal para mantener la atención.',
  icon: '🎭',
  category: 'random',
  select(students, history) {
    const pick = surprisePool[Math.floor(Math.random() * surprisePool.length)]
    const result = pick.select(students, history)
    return {
      ...result,
      label: `Estrategia: ${pick.name}`,
    }
  },
}
