<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStudentStore } from '../stores/students'
import { useHistoryStore } from '../stores/history'
import BarChart from '../components/stats/BarChart.vue'
import DonutChart from '../components/stats/DonutChart.vue'
import TimelineChart from '../components/stats/TimelineChart.vue'

const { t } = useI18n()

const studentStore = useStudentStore()
const historyStore = useHistoryStore()

const stats = computed(() => {
  const students = studentStore.students
  const active = studentStore.activeStudents
  return {
    total: students.length,
    active: active.length,
    inactive: students.length - active.length,
    participations: historyStore.totalParticipations,
    avg: active.length > 0 ? (historyStore.totalParticipations / active.length).toFixed(1) : '0',
    groups: [...new Set(students.map(s => s.group).filter(Boolean))].length,
  }
})

const barData = computed(() => {
  return studentStore.students.map(s => {
    const participantCount = historyStore.participations.filter(p => p.studentId === s.id).length
    return {
      label: s.name,
      value: participantCount,
      color: s.color || '#6366f1',
    }
  }).sort((a, b) => b.value - a.value)
})

const donutData = computed(() => {
  const groups = new Map<string, number>()
  for (const p of historyStore.participations) {
    const s = studentStore.students.find(st => st.id === p.studentId)
    const group = s?.group || 'Sin grupo'
    groups.set(group, (groups.get(group) || 0) + 1)
  }
  const groupColors: Record<string, string> = {
    'Sin grupo': '#94a3b8',
  }
  const colorPalette = ['#6366f1', '#ec4899', '#14b8a6', '#f97316', '#8b5cf6', '#06b6d4', '#84cc16', '#e11d48']
  let ci = 0
  return [...groups.entries()].map(([label, value]) => ({
    label,
    value,
    color: groupColors[label] || colorPalette[ci++ % colorPalette.length],
  }))
})

const timelineData = computed(() => {
  const days = 14
  const result: { date: string; count: number }[] = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]
    const count = historyStore.participations.filter(p => {
      const pd = new Date(p.timestamp).toISOString().split('T')[0]
      return pd === dateStr
    }).length
    result.push({ date: dateStr, count })
  }
  return result
})

const equityData = computed(() => {
  const active = studentStore.activeStudents
  if (active.length === 0) return { gini: 1, fair: false, maxCount: 0, minCount: 0, avg: '0', stdDev: '0', neverParticipated: 0 }
  const counts = active.map(s => historyStore.participations.filter(p => p.studentId === s.id).length).sort((a, b) => a - b)
  const maxCount = Math.max(...counts, 1)
  const minCount = Math.min(...counts)
  const avg = counts.reduce((s, c) => s + c, 0) / counts.length
  const variance = counts.reduce((s, c) => s + (c - avg) ** 2, 0) / counts.length
  const stdDev = Math.sqrt(variance)
  const gini = avg > 0 ? stdDev / avg : 0

  return {
    gini: gini.toFixed(2),
    fair: gini < 0.5,
    maxCount,
    minCount,
    avg: avg.toFixed(1),
    stdDev: stdDev.toFixed(1),
    neverParticipated: active.filter(s => !historyStore.participations.some(p => p.studentId === s.id)).length,
  }
})

function confirmClearHistory() {
  if (confirm(t('statistics.clearHistoryConfirm'))) {
    historyStore.clearHistory()
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="text-center">
      <h2 class="text-2xl font-bold font-outfit">{{ $t('statistics.title') }}</h2>
    </div>

    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      <div class="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm text-center">
        <div class="text-2xl mb-1">👨‍🎓</div>
        <p class="text-xl font-bold font-outfit text-slate-800 dark:text-slate-100">{{ stats.total }}</p>
        <p class="text-xs text-slate-500">{{ $t('statistics.total') }}</p>
      </div>
      <div class="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm text-center">
        <div class="text-2xl mb-1">✅</div>
        <p class="text-xl font-bold font-outfit text-green-600">{{ stats.active }}</p>
        <p class="text-xs text-slate-500">{{ $t('statistics.active') }}</p>
      </div>
      <div class="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm text-center">
        <div class="text-2xl mb-1">🎯</div>
        <p class="text-xl font-bold font-outfit text-indigo-600">{{ stats.participations }}</p>
        <p class="text-xs text-slate-500">{{ $t('statistics.participations') }}</p>
      </div>
      <div class="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm text-center">
        <div class="text-2xl mb-1">📈</div>
        <p class="text-xl font-bold font-outfit text-violet-600">{{ stats.avg }}</p>
        <p class="text-xs text-slate-500">{{ $t('statistics.avgPerStudent') }}</p>
      </div>
      <div class="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm text-center">
        <div class="text-2xl mb-1">📁</div>
        <p class="text-xl font-bold font-outfit text-slate-800 dark:text-slate-100">{{ stats.groups }}</p>
        <p class="text-xs text-slate-500">{{ $t('statistics.groups') }}</p>
      </div>
      <div class="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm text-center">
        <div class="text-2xl mb-1">⚖️</div>
        <p class="text-xl font-bold font-outfit" :class="equityData.fair ? 'text-green-600' : 'text-amber-600'">{{ equityData.gini }}</p>
        <p class="text-xs text-slate-500">{{ $t('statistics.equityIndex') }}</p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div class="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
        <h3 class="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-4">{{ $t('statistics.barChartTitle') }}</h3>
        <BarChart v-if="barData.length > 0" :items="barData" />
        <p v-else class="text-sm text-slate-400 text-center py-8">{{ $t('statistics.barChartEmpty') }}</p>
      </div>

      <div class="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
        <h3 class="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-4">{{ $t('statistics.donutTitle') }}</h3>
        <DonutChart v-if="donutData.length > 0" :slices="donutData" :size="220" />
        <p v-else class="text-sm text-slate-400 text-center py-8">{{ $t('statistics.donutEmpty') }}</p>
      </div>
    </div>

    <div class="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
      <h3 class="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-4">{{ $t('statistics.timelineTitle') }}</h3>
      <TimelineChart :data="timelineData" />
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div class="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
        <h3 class="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-3">{{ $t('statistics.equitySection') }}</h3>
        <div class="space-y-2 text-sm">
          <div class="flex justify-between">
            <span class="text-slate-500">{{ $t('statistics.giniIndex') }}</span>
            <span class="font-medium" :class="equityData.fair ? 'text-green-600' : 'text-amber-600'">{{ equityData.gini }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-500">{{ $t('statistics.rating') }}</span>
            <span class="font-medium" :class="equityData.fair ? 'text-green-600' : 'text-amber-600'">{{ equityData.fair ? $t('statistics.goodDistribution') : $t('statistics.unequalDistribution') }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-500">{{ $t('statistics.maxParticipations') }}</span>
            <span class="font-medium text-slate-800 dark:text-slate-200">{{ equityData.maxCount }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-500">{{ $t('statistics.minParticipations') }}</span>
            <span class="font-medium text-slate-800 dark:text-slate-200">{{ equityData.minCount }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-500">{{ $t('statistics.neverParticipated') }}</span>
            <span class="font-medium" :class="equityData.neverParticipated > 0 ? 'text-red-600' : 'text-green-600'">{{ equityData.neverParticipated }}</span>
          </div>
        </div>
      </div>

      <div class="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
        <h3 class="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-3">{{ $t('statistics.historyTitle') }}</h3>
        <div v-if="historyStore.participations.length === 0" class="text-sm text-slate-400 text-center py-4">
          {{ $t('statistics.historyEmpty') }}
        </div>
        <div v-else class="space-y-1 max-h-60 overflow-y-auto">
          <div v-for="(p, i) in [...historyStore.participations].reverse().slice(0, 30)" :key="i" class="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-700/30 text-xs">
            <span class="text-slate-400 w-14 shrink-0">{{ new Date(p.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}</span>
            <span class="font-medium text-slate-700 dark:text-slate-300 truncate">{{ studentStore.students.find(s => s.id === p.studentId)?.name || '?' }}</span>
            <span class="text-slate-400 ml-auto truncate">{{ p.strategy }}</span>
          </div>
        </div>
        <button
          v-if="historyStore.participations.length > 0"
          @click="confirmClearHistory()"
          class="mt-3 text-xs text-red-600 hover:text-red-700 transition-colors cursor-pointer"
        >
          {{ $t('statistics.clearHistory') }}
        </button>
      </div>
    </div>
  </div>
</template>
