<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

interface DonutSlice {
  label: string
  value: number
  color: string
}

const props = defineProps<{
  slices: DonutSlice[]
  size?: number
}>()

const size = computed(() => props.size ?? 200)
const cx = computed(() => size.value / 2)
const cy = computed(() => size.value / 2)
const radius = computed(() => size.value / 2 - 10)
const innerRadius = computed(() => radius.value * 0.55)
const total = computed(() => props.slices.reduce((s, i) => s + i.value, 0) || 1)

const arcs = computed(() => {
  let startAngle = -Math.PI / 2
  return props.slices.filter(s => s.value > 0).map(s => {
    const angle = (s.value / total.value) * Math.PI * 2
    const endAngle = startAngle + angle
    const x1 = cx.value + radius.value * Math.cos(startAngle)
    const y1 = cy.value + radius.value * Math.sin(startAngle)
    const x2 = cx.value + radius.value * Math.cos(endAngle)
    const y2 = cy.value + radius.value * Math.sin(endAngle)
    const largeArc = angle > Math.PI ? 1 : 0

    const path = `M ${cx.value + innerRadius.value * Math.cos(startAngle)} ${cy.value + innerRadius.value * Math.sin(startAngle)}
      L ${x1} ${y1}
      A ${radius.value} ${radius.value} 0 ${largeArc} 1 ${x2} ${y2}
      L ${cx.value + innerRadius.value * Math.cos(endAngle)} ${cy.value + innerRadius.value * Math.sin(endAngle)}
      A ${innerRadius.value} ${innerRadius.value} 0 ${largeArc} 0 ${cx.value + innerRadius.value * Math.cos(startAngle)} ${cy.value + innerRadius.value * Math.sin(startAngle)}`

    const arc = { path, color: s.color, label: s.label, percent: (s.value / total.value) * 100 }
    startAngle = endAngle
    return arc
  })
})
</script>

<template>
  <div class="flex flex-col items-center gap-4">
    <svg :width="size" :height="size" class="shrink-0">
      <g v-for="(arc, i) in arcs" :key="i">
        <path :d="arc.path" :fill="arc.color" class="transition-all duration-300 hover:opacity-80">
          <title>{{ arc.label }}: {{ arc.percent.toFixed(1) }}%</title>
        </path>
      </g>
      <text :x="cx" :y="cy - 4" text-anchor="middle" class="fill-slate-700 dark:fill-slate-300 font-bold font-outfit" font-size="24">
        {{ total }}
      </text>
      <text :x="cx" :y="cy + 14" text-anchor="middle" class="fill-slate-500 dark:fill-slate-400" font-size="11">
        {{ t('shared.total') }}
      </text>
    </svg>

    <div class="flex flex-wrap gap-3 justify-center">
      <div v-for="(arc, i) in arcs" :key="i" class="flex items-center gap-1.5 text-xs">
        <span class="w-3 h-3 rounded-sm shrink-0" :style="{ backgroundColor: arc.color }" />
        <span class="text-slate-600 dark:text-slate-400">{{ arc.label }}</span>
        <span class="font-medium text-slate-800 dark:text-slate-200">{{ arc.percent.toFixed(1) }}%</span>
      </div>
    </div>
  </div>
</template>
