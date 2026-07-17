import { describe, it, expect } from 'vitest'
import { getAllStrategies, executeStrategy, getStrategiesByCategory } from '../strategies/registry'
import type { Student } from '../types/student'
import type { Participation } from '../types/history'

function student(id: string, name: string): Student {
  return { id, name, surname: '', color: '#6366f1', group: '', active: true }
}

function participation(studentId: string): Participation {
  return { studentId, timestamp: Date.now(), strategy: 'random', mechanic: 'roulette' }
}

const students = [
  student('1', 'Ana'),
  student('2', 'Luis'),
  student('3', 'Carlos'),
  student('4', 'Marta'),
  student('5', 'Pedro'),
]

describe('registry', () => {
  it('returns 20 strategies', () => {
    expect(getAllStrategies()).toHaveLength(20)
  })

  it('each strategy has required fields', () => {
    for (const s of getAllStrategies()) {
      expect(s.id).toBeTruthy()
      expect(s.name).toBeTruthy()
      expect(s.description).toBeTruthy()
      expect(s.icon).toBeTruthy()
      expect(s.category).toBeTruthy()
      expect(typeof s.select).toBe('function')
    }
  })

  it('categories are valid', () => {
    const valid = ['random', 'fairness', 'adaptive', 'queue', 'teams', 'gamification']
    for (const s of getAllStrategies()) {
      expect(valid).toContain(s.category)
    }
  })

  it('each id is unique', () => {
    const ids = getAllStrategies().map(s => s.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe('getStrategiesByCategory', () => {
  it('returns correct counts', () => {
    expect(getStrategiesByCategory('random')).toHaveLength(4)
    expect(getStrategiesByCategory('fairness')).toHaveLength(7)
    expect(getStrategiesByCategory('adaptive')).toHaveLength(3)
    expect(getStrategiesByCategory('queue')).toHaveLength(3)
    expect(getStrategiesByCategory('teams')).toHaveLength(2)
    expect(getStrategiesByCategory('gamification')).toHaveLength(1)
  })
})

describe('executeStrategy', () => {
  it('returns selected students for random strategies', () => {
    const result = executeStrategy('random', students, [])
    expect(result.selected.length).toBeGreaterThanOrEqual(1)
    for (const s of result.selected) {
      expect(students.map(x => x.id)).toContain(s.id)
    }
  })

  it('returns a team for balanced-teams', () => {
    const result = executeStrategy('balanced-teams', students, [])
    expect(result.type).toBe('teams')
    expect(result.teams).toBeTruthy()
  })

  it('returns a captain for captain strategy', () => {
    const result = executeStrategy('captain', students, [])
    expect(result.type).toBe('captain')
    expect(result.captain).toBeTruthy()
  })

  it('returns queue for smart-queue', () => {
    const result = executeStrategy('smart-queue', students, [])
    expect(result.queue).toBeTruthy()
    expect(result.selected.length).toBeGreaterThanOrEqual(1)
  })

  it('picks least-participated for fair strategy', () => {
    const history = [
      participation('1'), participation('1'), participation('1'),
      participation('2'), participation('2'),
    ]
    const result = executeStrategy('fair', students, history)
    expect(result.selected[0]?.id).not.toBe('1')
  })

  it('does not repeat with no-repeat strategy', () => {
    const history = [participation('1')]
    const result = executeStrategy('no-repeat', students, history)
    expect(result.selected[0]?.id).not.toBe('1')
  })

  it('falls back to random for unknown strategy', () => {
    const result = (executeStrategy as any)('invalid-id', students, [])
    expect(result.selected.length).toBeGreaterThanOrEqual(1)
  })

  it('handles empty student list', () => {
    const result = executeStrategy('random', [], [])
    expect(result.selected).toBeTruthy()
  })

  it('tolerates empty history', () => {
    const result = executeStrategy('weighted', students, [])
    expect(result.selected.length).toBeGreaterThanOrEqual(1)
  })
})
