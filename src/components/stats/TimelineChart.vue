<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()

interface HeatPoint {
  date: string
  count: number
  label?: string
}

const props = defineProps<{
  data: HeatPoint[]
}>()

const maxCount = computed(() => Math.max(...props.data.map(d => d.count), 1))

function getOpacity(count: number): number {
  return 0.15 + (count / maxCount.value) * 0.85
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString(locale.value, { weekday: 'short', day: 'numeric' })
}
</script>

<template>
  <div class="flex flex-wrap gap-1.5 justify-center">
    <div v-for="(point, i) in data" :key="i" class="flex flex-col items-center gap-1">
      <div
        class="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center text-xs font-semibold transition-all"
        :style="{
          backgroundColor: `rgba(99, 102, 241, ${getOpacity(point.count)})`,
          color: point.count > 0 ? '#fff' : undefined,
        }"
        :title="`${point.date}: ${point.count} ${t('statistics.participations').toLowerCase()}`"
      >
        {{ point.count || '' }}
      </div>
      <span class="text-[10px] text-slate-400">{{ formatDate(point.date) }}</span>
    </div>
  </div>
</template>
