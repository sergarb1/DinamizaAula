<script setup lang="ts">
import { computed } from 'vue'
import { useGamificationStore } from '../../stores/gamification'
import { useStudentStore } from '../../stores/students'

const gamification = useGamificationStore()
const studentStore = useStudentStore()

const emit = defineEmits<{ (e: 'close'): void }>()

const badges = computed(() => gamification.badges)
const studentGamifications = computed(() => gamification.data as Record<string, { badges: string[]; totalStars: number; totalXP: number }>)

function isUnlocked(badgeId: string): boolean {
  return Object.values(studentGamifications.value).some(g => g.badges.includes(badgeId))
}

function getUnlockCount(badgeId: string): number {
  return Object.values(studentGamifications.value).filter(g => g.badges.includes(badgeId)).length
}

const topStudents = computed(() => {
  const entries = Object.entries(studentGamifications.value) as [string, { totalStars: number; totalXP: number; badges: string[] }][]
  return entries
    .sort(([, a], [, b]) => b.totalStars - a.totalStars)
    .slice(0, 5)
    .map(([id, g]) => ({
      name: studentStore.students.find(s => s.id === id)?.name || '?',
      stars: g.totalStars,
      xp: g.totalXP,
      badges: g.badges.length,
      level: Math.floor(g.totalXP / 100) + 1,
    }))
})
</script>

<template>
  <div
    role="dialog"
    aria-modal="true"
    :aria-label="$t('shared.achievementsAria')"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
    @click.self="emit('close')"
    @keydown.escape="emit('close')"
  >
    <div class="w-full max-w-lg sm:max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xl">
      <div class="sticky top-0 bg-white dark:bg-slate-800 p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between z-10">
        <h3 class="text-lg font-bold font-outfit">{{ $t('shared.achievementsTitle') }}</h3>
        <button @click="emit('close')" class="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer text-slate-400">✕</button>
      </div>

      <div class="p-4 space-y-6">
        <div>
          <h4 class="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-3">{{ $t('shared.badgesAvailable') }}</h4>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <div v-for="b in badges" :key="b.id" class="p-3 rounded-xl text-center transition-all" :class="isUnlocked(b.id) ? 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800' : 'bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700 opacity-50'">
              <div class="text-2xl mb-1">{{ b.icon }}</div>
              <p class="text-xs font-semibold text-slate-700 dark:text-slate-300">{{ b.name }}</p>
              <p class="text-xs text-slate-500 mt-0.5">{{ b.description }}</p>
              <p v-if="isUnlocked(b.id)" class="text-xs text-amber-600 mt-1 font-medium">{{ getUnlockCount(b.id) }} alumnos</p>
            </div>
          </div>
        </div>

        <div v-if="topStudents.length > 0">
          <h4 class="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-3">{{ $t('shared.ranking') }}</h4>
          <div class="space-y-2">
            <div v-for="(s, i) in topStudents" :key="i" class="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50">
              <span class="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-sm font-bold text-indigo-700 dark:text-indigo-300 shrink-0">{{ i + 1 }}</span>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">{{ s.name }}</p>
                <p class="text-xs text-slate-500">{{ $t('shared.studentRank', { level: s.level, stars: s.stars, badges: s.badges }) }}</p>
              </div>
              <div class="flex items-center gap-1">
                <span v-for="n in Math.min(s.badges, 3)" :key="n" class="text-sm">🏅</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
