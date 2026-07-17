import type { SelectionStrategy, StrategySettings } from '../types/strategy'
import type { Student } from '../types/student'
import type { Participation } from '../types/history'

import { randomStrategy } from './random'
import { weightedStrategy } from './weighted'
import { fairStrategy } from './fair'
import { noRepeatStrategy } from './no-repeat'
import { forgottenStrategy } from './forgotten'
import { shyStrategy } from './shy'
import { braveStrategy } from './brave'
import { adaptiveRouletteStrategy } from './adaptive-roulette'
import { chainStrategy } from './chain'
import { byGroupStrategy } from './by-group'
import { hotBallStrategy } from './hot-ball'
import { surpriseStrategy } from './surprise'
import { customMixStrategy } from './custom-mix'
import { tournamentStrategy } from './tournament'
import { smartQueueStrategy } from './smart-queue'
import { balancedTeamsStrategy } from './balanced-teams'
import { captainStrategy } from './captain'
import { examModeStrategy } from './exam-mode'

const strategyMap = new Map<string, SelectionStrategy>()

const allStrategies: SelectionStrategy[] = [
  randomStrategy,
  weightedStrategy,
  fairStrategy,
  noRepeatStrategy,
  forgottenStrategy,
  shyStrategy,
  braveStrategy,
  adaptiveRouletteStrategy,
  chainStrategy,
  byGroupStrategy,
  hotBallStrategy,
  surpriseStrategy,
  customMixStrategy,
  tournamentStrategy,
  smartQueueStrategy,
  balancedTeamsStrategy,
  captainStrategy,
  examModeStrategy,
]

for (const s of allStrategies) {
  strategyMap.set(s.id, s)
}

export function getStrategy(id: string): SelectionStrategy | undefined {
  return strategyMap.get(id)
}

export function getAllStrategies(): SelectionStrategy[] {
  return allStrategies
}

export function getStrategiesByCategory(category: SelectionStrategy['category']): SelectionStrategy[] {
  return allStrategies.filter(s => s.category === category)
}

export function executeStrategy(
  id: string,
  students: Student[],
  history: Participation[],
  settings?: StrategySettings,
) {
  const strategy = strategyMap.get(id)
  if (!strategy) {
    return randomStrategy.select(students, history, settings)
  }
  return strategy.select(students, history, settings)
}
