<script setup lang="ts">
import { computed } from 'vue'
import { useGamificationStore } from '../../stores/gamification'
import { useStudentStore } from '../../stores/students'

const gamification = useGamificationStore()
const studentStore = useStudentStore()

const levelInfo = computed(() => {
  const xp = gamification.totalXPAll
  const studentCount = studentStore.activeStudents.length
  const avg = studentCount > 0 ? (gamification.totalStarsAll / studentCount).toFixed(1) : '0'
  return { ...gamification.getLevel(xp), xp, avgStars: avg, totalStars: gamification.totalStarsAll }
})

const recentBadges = computed(() => {
  const allBadgeIds = new Set<string>()
  const data = gamification.data as Record<string, { badges: string[] }>
  for (const g of Object.values(data)) {
    for (const b of g.badges) allBadgeIds.add(b)
  }
  return gamification.badges.filter(b => allBadgeIds.has(b.id)).slice(0, 4)
})
</script>

<template>
  <div v-if="gamification.enabled" class="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 shadow-sm">
    <div class="flex items-center justify-between mb-3">
      <div class="flex items-center gap-2">
        <span class="text-xl">🏆</span>
        <span class="text-sm font-semibold text-amber-800 dark:text-amber-200">{{ $t('gamification.gamification') }}</span>
      </div>
      <span class="text-xs px-2 py-0.5 rounded-full bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200 font-medium">
        {{ $t('gamification.level', { level: levelInfo.level, title: levelInfo.title }) }}
      </span>
    </div>

    <div class="grid grid-cols-3 gap-3 mb-3">
      <div class="text-center">
        <p class="text-lg font-bold font-outfit text-amber-700 dark:text-amber-300">{{ levelInfo.totalStars }}</p>
        <p class="text-xs text-amber-600 dark:text-amber-400">{{ $t('gamification.stars') }}</p>
      </div>
      <div class="text-center">
        <p class="text-lg font-bold font-outfit text-amber-700 dark:text-amber-300">{{ levelInfo.xp }} XP</p>
        <p class="text-xs text-amber-600 dark:text-amber-400">{{ $t('gamification.xp') }}</p>
      </div>
      <div class="text-center">
        <p class="text-lg font-bold font-outfit text-amber-700 dark:text-amber-300">{{ levelInfo.avgStars }}</p>
        <p class="text-xs text-amber-600 dark:text-amber-400">{{ $t('gamification.avgStars') }}</p>
      </div>
    </div>

    <div class="w-full h-2 rounded-full bg-amber-200 dark:bg-amber-800 overflow-hidden">
      <div class="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-600 transition-all duration-500" :style="{ width: levelInfo.progress + '%' }" />
    </div>

    <div v-if="recentBadges.length > 0" class="flex gap-1 mt-3">
      <div v-for="b in recentBadges" :key="b.id" class="px-2 py-0.5 rounded-lg bg-amber-100 dark:bg-amber-800/50 text-xs flex items-center gap-1" :title="b.description">
        <span>{{ b.icon }}</span>
        <span class="text-amber-800 dark:text-amber-200">{{ b.name }}</span>
      </div>
    </div>
  </div>
</template>
