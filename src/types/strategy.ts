import type { Student } from './student'
import type { Participation } from './history'

export interface StrategySettings {
  [key: string]: unknown
}

export interface StrategyResult {
  selected: Student[]
  type: 'single' | 'queue' | 'teams' | 'captain' | 'none'
  label?: string
  eliminated?: Student[]
  teams?: Student[][]
  captain?: Student
  queue?: Student[]
}

export interface SelectionStrategy {
  id: string
  name: string
  description: string
  longDescription: string
  icon: string
  category: 'random' | 'fairness' | 'gamification' | 'teams' | 'queue' | 'adaptive'
  select(
    students: Student[],
    history: Participation[],
    settings?: StrategySettings,
  ): StrategyResult
}
