<script setup lang="ts">
import { ref } from 'vue'
import type { Student } from '../../types/student'
import { getTextColor } from '../../strategies/utils'

const props = defineProps<{
  students: Student[]
  strategyId?: string
}>()

const emit = defineEmits<{
  (e: 'select', student: Student): void
  (e: 'start'): void
  (e: 'end'): void
}>()

const flipped = ref<Set<string>>(new Set())
const flippingId = ref<string | null>(null)

function pickCard(student: Student) {
  if (flippingId.value || flipped.value.has(student.id)) return
  flippingId.value = student.id
  emit('start')
  setTimeout(() => {
    flipped.value.add(student.id)
    flippingId.value = null
    emit('select', student)
    emit('end')
  }, 400)
}

function reshuffle() {
  flipped.value = new Set()
  flippingId.value = null
}
</script>

<template>
  <div class="flex flex-col items-center gap-6 w-full">
    <div v-if="students.length === 0" class="text-sm text-amber-600 dark:text-amber-400 py-8">{{ $t('mechanicComponents.noActiveStudents') }}</div>
    <template v-else>
      <div class="flex flex-wrap justify-center gap-3">
        <div
          v-for="s in students"
          :key="s.id"
          class="w-20 h-28 sm:w-24 sm:h-32 rounded-xl border-2 shadow-md transition-all duration-300 flex items-center justify-center font-bold select-none"
          :class="flipped.has(s.id)
            ? 'border-indigo-400 bg-white dark:bg-slate-700'
            : 'border-slate-300 dark:border-slate-600 bg-gradient-to-br from-indigo-500 to-violet-600 cursor-pointer hover:-translate-y-1 hover:shadow-lg'"
          :style="flipped.has(s.id) ? { backgroundColor: s.color || '#fff', color: getTextColor(s.color || '#fff') } : {}"
          @click="pickCard(s)"
        >
          <span v-if="flipped.has(s.id)" class="text-lg sm:text-xl font-bold truncate px-1">{{ s.name.charAt(0) }}{{ s.surname.charAt(0) }}</span>
          <span v-else class="text-2xl sm:text-3xl text-white/80">?</span>
        </div>
      </div>

      <p class="text-xs text-slate-400">
        {{ flipped.size }}/{{ students.length }}
      </p>

      <button
        v-if="flipped.size === students.length"
        @click="reshuffle"
        class="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-md transition-all cursor-pointer text-sm"
      >
        {{ $t('mechanicComponents.cardsReshuffle') }}
      </button>
    </template>
  </div>
</template>
