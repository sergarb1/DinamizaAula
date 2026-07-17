<script setup lang="ts">
import { computed } from 'vue'

interface BarItem {
  label: string
  value: number
  color: string
}

const props = defineProps<{
  items: BarItem[]
  max?: number
}>()

const barMax = computed(() => props.max ?? Math.max(...props.items.map(i => i.value), 1))

const barHeight = 600
const barWidth = 48
const gapWidth = 12
const svgWidth = computed(() => props.items.length * (barWidth + gapWidth) + 40)
</script>

<template>
  <div class="w-full overflow-x-auto">
    <svg :width="svgWidth" :height="barHeight + 60" class="min-w-[300px]">
      <line x1="30" :y1="barHeight" :x2="svgWidth - 10" :y2="barHeight" stroke="#cbd5e1" stroke-width="2" />

      <g v-for="(item, i) in items" :key="i">
        <rect
          :x="30 + i * (barWidth + gapWidth)"
          :y="barHeight - (item.value / barMax) * (barHeight - 20)"
          :width="barWidth"
          :height="(item.value / barMax) * (barHeight - 20)"
          :fill="item.color"
          rx="6"
          class="transition-all duration-500 hover:opacity-80"
        >
          <title>{{ item.label }}: {{ item.value }}</title>
        </rect>

        <text
          :x="30 + i * (barWidth + gapWidth) + barWidth / 2"
          :y="barHeight + 16"
          text-anchor="middle"
          class="fill-slate-500 dark:fill-slate-400"
          font-size="11"
        >
          {{ item.label.length > 6 ? item.label.substring(0, 6) + '…' : item.label }}
        </text>

        <text
          v-if="item.value > 0"
          :x="30 + i * (barWidth + gapWidth) + barWidth / 2"
          :y="barHeight - (item.value / barMax) * (barHeight - 20) - 6"
          text-anchor="middle"
          class="fill-slate-700 dark:fill-slate-300 font-semibold"
          font-size="12"
        >
          {{ item.value }}
        </text>
      </g>
    </svg>
  </div>
</template>
