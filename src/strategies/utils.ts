import type { Student } from '../types/student'
import type { Participation, StudentStats } from '../types/history'

export function getStats(history: Participation[], studentId: string): StudentStats {
  const entries = history.filter(p => p.studentId === studentId)
  return {
    totalParticipations: entries.length,
    lastParticipation: entries.length > 0 ? entries[entries.length - 1].timestamp : null,
    consecutiveParticipations: countConsecutive(entries),
    timesAvoided: 0,
  }
}

export function getAllStats(history: Participation[], students: Student[]): Map<string, StudentStats> {
  const map = new Map<string, StudentStats>()
  for (const s of students) {
    map.set(s.id, getStats(history, s.id))
  }
  return map
}

function countConsecutive(entries: Participation[]): number {
  if (entries.length === 0) return 0
  let count = 1
  for (let i = entries.length - 1; i > 0; i--) {
    if (entries[i].timestamp - entries[i - 1].timestamp < 120000) {
      count++
    } else {
      break
    }
  }
  return count
}

export function pickRandomIndex(weights: number[]): number {
  const total = weights.reduce((a, b) => a + b, 0)
  if (total <= 0) return Math.floor(Math.random() * weights.length)
  let r = Math.random() * total
  for (let i = 0; i < weights.length; i++) {
    r -= weights[i]
    if (r <= 0) return i
  }
  return weights.length - 1
}

export function getTextColor(hex: string): '#ffffff' | '#1e293b' {
  const c = hex.replace('#', '')
  const r = parseInt(c.substring(0, 2), 16)
  const g = parseInt(c.substring(2, 4), 16)
  const b = parseInt(c.substring(4, 6), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.55 ? '#1e293b' : '#ffffff'
}

export function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}
