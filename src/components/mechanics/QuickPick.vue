<script setup lang="ts">
import { ref } from 'vue'
import type { Student } from '../../types/student'
import { pickRandomIndex } from '../../strategies/utils'

const props = defineProps<{
  students: Student[]
  strategyId?: string
}>()

const emit = defineEmits<{
  (e: 'select', student: Student): void
  (e: 'start'): void
  (e: 'end'): void
}>()

const revealing = ref(false)
const result = ref<Student | null>(null)
const showResult = ref(false)
const nameIndex = ref(0)
const names = ref<string[]>([])

function quickPick() {
  if (revealing.value || props.students.length === 0) return
  revealing.value = true
  result.value = null
  showResult.value = false
  emit('start')

  const idx = pickRandomIndex(props.students.map(() => 1))
  const selected = props.students[idx]

  names.value = props.students.map(s => s.name)

  let tick = 0
  const interval = setInterval(() => {
    nameIndex.value = Math.floor(Math.random() * props.students.length)
    tick++
    if (tick > 15) {
      clearInterval(interval)
      nameIndex.value = idx
      result.value = selected
      setTimeout(() => {
        showResult.value = true
        revealing.value = false
        emit('select', selected)
        emit('end')
      }, 400)
    }
  }, 50)
}

defineExpose({ quickPick })
</script>

<template>
  <div class="flex flex-col items-center gap-6">
    <div v-if="students.length === 0" class="text-sm text-amber-600 dark:text-amber-400 py-8">{{ $t('mechanicComponents.noActiveStudents') }}</div>
    <template v-else>
    <div class="relative w-full max-w-md">
      <div
        class="p-8 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 shadow-lg text-center transition-all duration-75 min-h-[180px] flex items-center justify-center"
        :class="{ 'animate-pulse': revealing }"
      >
        <Transition name="fade">
          <div v-if="!result" :key="nameIndex" class="text-5xl sm:text-6xl font-bold font-outfit text-indigo-600 dark:text-indigo-400">
            {{ revealing ? names[nameIndex] || '?' : '🎲' }}
          </div>
          <div v-else class="space-y-2">
            <div
              class="inline-flex items-center justify-center w-28 h-28 rounded-2xl text-white text-5xl font-bold shadow-lg mx-auto"
              :style="{ backgroundColor: result.color || '#6366f1' }"
            >
              {{ result.name.charAt(0) }}
            </div>
            <p class="text-3xl font-bold font-outfit text-slate-800 dark:text-slate-100">{{ result.name }} {{ result.surname }}</p>
          </div>
        </Transition>
      </div>
      <button
        @click="quickPick"
        :disabled="revealing || students.length === 0"
        class="mt-4 px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 disabled:opacity-50 text-white font-medium shadow-md transition-all cursor-pointer disabled:cursor-not-allowed text-base"
      >
        {{ $t('mechanicComponents.quickPick') }}
      </button>
    </div>
    </template>
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.1s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
