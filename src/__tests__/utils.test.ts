import { describe, it, expect } from 'vitest'
import { getAllStats, pickRandomIndex, shuffleArray } from '../strategies/utils'
import type { Student } from '../types/student'
import type { Participation } from '../types/history'

function makeStudent(id: string, name: string): Student {
  return { id, name, surname: '', color: '#6366f1', group: '', active: true }
}

function makeParticipation(studentId: string, daysAgo = 0): Participation {
  return {
    studentId,
    timestamp: Date.now() - daysAgo * 86400000,
    strategy: 'random',
    mechanic: 'roulette',
  }
}

describe('pickRandomIndex', () => {
  it('returns a valid index', () => {
    const weights = [1, 1, 1]
    for (let i = 0; i < 50; i++) {
      const idx = pickRandomIndex(weights)
      expect(idx).toBeGreaterThanOrEqual(0)
      expect(idx).toBeLessThan(weights.length)
    }
  })

  it('prefers higher weights', () => {
    const weights = [0.1, 0.1, 100]
    let heavyCount = 0
    const trials = 500
    for (let i = 0; i < trials; i++) {
      if (pickRandomIndex(weights) === 2) heavyCount++
    }
    expect(heavyCount).toBeGreaterThan(trials * 0.8)
  })

  it('handles single element', () => {
    expect(pickRandomIndex([5])).toBe(0)
  })

  it('returns NaN-adjacent index on empty array', () => {
    const idx = pickRandomIndex([])
    expect([0, NaN]).toContain(idx)
  })
})

describe('shuffleArray', () => {
  it('returns all elements', () => {
    const arr = [1, 2, 3, 4, 5]
    const result = shuffleArray([...arr])
    expect(result.sort()).toEqual(arr)
  })

  it('does not mutate original', () => {
    const arr = [1, 2, 3]
    const copy = [...arr]
    shuffleArray(arr)
    expect(arr).toEqual(copy)
  })

  it('returns array of same length', () => {
    expect(shuffleArray([1, 2, 3])).toHaveLength(3)
  })
})

describe('getAllStats', () => {
  const students = [makeStudent('a', 'Alice'), makeStudent('b', 'Bob'), makeStudent('c', 'Carol')]

  it('returns stats for all students', () => {
    const stats = getAllStats([], students)
    expect(stats.size).toBe(3)
    for (const s of students) {
      expect(stats.get(s.id)?.totalParticipations).toBe(0)
      expect(stats.get(s.id)?.lastParticipation).toBeNull()
    }
  })

  it('counts participations correctly', () => {
    const history = [
      makeParticipation('a', 1),
      makeParticipation('a', 2),
      makeParticipation('b', 3),
    ]
    const stats = getAllStats(history, students)
    expect(stats.get('a')?.totalParticipations).toBe(2)
    expect(stats.get('b')?.totalParticipations).toBe(1)
    expect(stats.get('c')?.totalParticipations).toBe(0)
  })

  it('tracks last participation', () => {
    const recent = makeParticipation('a', 0)
    const old = makeParticipation('a', 10)
    const stats = getAllStats([old, recent], students)
    const aStats = stats.get('a')!
    expect(aStats.lastParticipation).toBe(recent.timestamp)
  })
})
