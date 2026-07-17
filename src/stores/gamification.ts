import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useHistoryStore } from './history'

const STORAGE_KEY = 'dinamiza-aula:gamification'

export interface StudentGamification {
  totalStars: number
  currentStreak: number
  maxStreak: number
  totalXP: number
  badges: string[]
}

export interface BadgeDef {
  id: string
  name: string
  description: string
  icon: string
  condition: (stats: { total: number; streak: number; maxStreak: number }) => boolean
}

const badges: BadgeDef[] = [
  { id: 'first', name: 'Primer paso', description: 'Primera participación', icon: '🌱', condition: s => s.total >= 1 },
  { id: 'novato', name: 'Novato', description: '5 participaciones', icon: '⭐', condition: s => s.total >= 5 },
  { id: 'activo', name: 'Activo', description: '10 participaciones', icon: '🌟', condition: s => s.total >= 10 },
  { id: 'veterano', name: 'Veterano', description: '25 participaciones', icon: '💫', condition: s => s.total >= 25 },
  { id: 'leyenda', name: 'Leyenda', description: '50 participaciones', icon: '👑', condition: s => s.total >= 50 },
  { id: 'estrella', name: 'Estrella', description: '100 participaciones', icon: '🏆', condition: s => s.total >= 100 },
  { id: 'streak-3', name: 'En racha', description: 'Racha de 3 consecutivas', icon: '🔥', condition: s => s.maxStreak >= 3 },
  { id: 'streak-5', name: 'Imparable', description: 'Racha de 5 consecutivas', icon: '🔥', condition: s => s.maxStreak >= 5 },
  { id: 'streak-10', name: 'Increíble', description: 'Racha de 10 consecutivas', icon: '💥', condition: s => s.maxStreak >= 10 },
]

export const useGamificationStore = defineStore('gamification', () => {
  const enabled = ref(false)
  const students = ref<Record<string, StudentGamification>>({})

  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) {
    try {
      const data = JSON.parse(stored)
      enabled.value = data.enabled ?? false
      students.value = data.students ?? {}
    } catch { /* ignore */ }
  }

  function persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      enabled: enabled.value,
      students: students.value,
    }))
  }

  function setEnabled(val: boolean) {
    enabled.value = val
    persist()
  }

  function getOrCreate(id: string): StudentGamification {
    if (!students.value[id]) {
      students.value[id] = { totalStars: 0, currentStreak: 0, maxStreak: 0, totalXP: 0, badges: [] }
    }
    return students.value[id]
  }

  function recordParticipation(studentId: string) {
    if (!enabled.value) return
    const g = getOrCreate(studentId)
    g.totalStars++
    g.totalXP += 10
    g.currentStreak++

    const now = new Date()
    const today = now.toDateString()
    const historyStore = useHistoryStore()
    const lastEntry = historyStore.participations
      .filter(p => p.studentId === studentId)
      .slice(-2, -1)[0]

    if (lastEntry) {
      const lastDate = new Date(lastEntry.timestamp).toDateString()
      if (lastDate !== today) {
        const diffDays = Math.round((now.getTime() - lastEntry.timestamp) / 86400000)
        if (diffDays > 1) g.currentStreak = 1
      }
    }

    if (g.currentStreak > g.maxStreak) {
      g.maxStreak = g.currentStreak
    }

    checkBadges(studentId, g)
    persist()
  }

  function checkBadges(_studentId: string, g: StudentGamification) {
    const stats = { total: g.totalStars, streak: g.currentStreak, maxStreak: g.maxStreak }
    for (const badge of badges) {
      if (!g.badges.includes(badge.id) && badge.condition(stats)) {
        g.badges.push(badge.id)
        g.totalXP += 25
      }
    }
  }

  function getStudentGamification(studentId: string): StudentGamification | null {
    return students.value[studentId] || null
  }

  const allBadges = computed(() => badges)

  const totalXPAll = computed(() => Object.values(students.value).reduce((sum, g) => sum + g.totalXP, 0))

  const totalStarsAll = computed(() => Object.values(students.value).reduce((sum, g) => sum + g.totalStars, 0))

  function getLevel(xp: number): { level: number; title: string; progress: number; nextLevelXP: number } {
    const level = Math.floor(xp / 100) + 1
    const currentLevelXP = (level - 1) * 100
    const nextLevelXP = level * 100
    const progress = ((xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100
    const titles = ['Novato', 'Aprendiz', 'Participante', 'Activo', 'Dinamizador', 'Experto', 'Maestro', 'Leyenda']
    const title = titles[Math.min(level - 1, titles.length - 1)] || 'Leyenda'
    return { level, title, progress, nextLevelXP }
  }

  return {
    enabled,
    setEnabled,
    data: students,
    badges: allBadges,
    recordParticipation,
    getStudentGamification,
    totalXPAll,
    totalStarsAll,
    getLevel,
  }
})
