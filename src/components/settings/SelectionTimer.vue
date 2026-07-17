<script setup lang="ts">
import { ref, watch, onUnmounted, computed } from 'vue'

const props = defineProps<{
  running: boolean
  duration: number
}>()

const emit = defineEmits<{
  (e: 'complete'): void
}>()

const remaining = ref(props.duration)
const intervalId = ref<ReturnType<typeof setInterval> | null>(null)

const progress = computed(() => (remaining.value / props.duration) * 100)

function start() {
  stop()
  remaining.value = props.duration
  intervalId.value = setInterval(() => {
    remaining.value--
    if (remaining.value <= 0) {
      stop()
      emit('complete')
    }
  }, 1000)
}

function stop() {
  if (intervalId.value) {
    clearInterval(intervalId.value)
    intervalId.value = null
  }
}

watch(() => props.running, (val) => {
  if (val) start()
  else stop()
}, { immediate: true })

watch(() => props.duration, () => {
  remaining.value = props.duration
})

onUnmounted(stop)
</script>

<template>
  <div v-if="running" class="flex items-center gap-2 text-sm">
    <svg class="w-4 h-4 shrink-0" :class="remaining <= 5 ? 'text-red-500' : 'text-indigo-500'" viewBox="0 0 20 20" fill="currentColor">
      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
    </svg>
    <span :class="remaining <= 5 ? 'text-red-600 font-bold' : 'text-slate-500'" class="tabular-nums min-w-[2ch]">
      {{ remaining }}s
    </span>
    <div class="flex-1 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden max-w-24">
      <div
        class="h-full rounded-full transition-all duration-1000 linear"
        :class="remaining <= 5 ? 'bg-red-500' : 'bg-indigo-500'"
        :style="{ width: progress + '%' }"
      />
    </div>
  </div>
</template>
