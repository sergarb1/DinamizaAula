import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Participation, StudentStats } from '../types/history'

const STORAGE_KEY = 'dinamiza-aula:history'

export const useHistoryStore = defineStore('history', () => {
  const participations = ref<Participation[]>([])

  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) {
    try { participations.value = JSON.parse(stored) } catch { /* ignore */ }
  }

  function persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(participations.value))
  }

  function record(studentId: string, strategy: string, mechanic: string) {
    participations.value.push({
      studentId,
      timestamp: Date.now(),
      strategy,
      mechanic,
    })
    persist()
  }

  function getStats(studentId: string): StudentStats {
    const studentEntries = participations.value.filter(p => p.studentId === studentId)
    const totalParticipations = studentEntries.length

    let lastParticipation: number | null = null
    let consecutiveParticipations = 0

    if (studentEntries.length > 0) {
      lastParticipation = studentEntries[studentEntries.length - 1].timestamp
      for (let i = studentEntries.length - 1; i >= 0; i--) {
        if (i === studentEntries.length - 1 || studentEntries[i].timestamp > studentEntries[i + 1].timestamp - 60000) {
          consecutiveParticipations++
        } else {
          break
        }
      }
    }

    return {
      totalParticipations,
      lastParticipation,
      consecutiveParticipations,
      timesAvoided: 0,
    }
  }

  const totalParticipations = computed(() => participations.value.length)

  function clearHistory() {
    participations.value = []
    persist()
  }

  return {
    participations,
    totalParticipations,
    record,
    getStats,
    clearHistory,
  }
})
