<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import type { Student } from '../../types/student'

const props = defineProps<{
  student: Student | null
}>()

const emit = defineEmits<{
  (e: 'dismiss'): void
}>()

const visible = ref(false)
const showContent = ref(false)
const continueBtn = ref<HTMLButtonElement | null>(null)

watch(() => props.student, (val) => {
  if (val) {
    visible.value = true
    nextTick(() => {
      showContent.value = true
      continueBtn.value?.focus()
    })
  } else {
    visible.value = false
    showContent.value = false
  }
})

function close() {
  visible.value = false
  showContent.value = false
  emit('dismiss')
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && visible.value) {
    close()
  }
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="visible && student"
      ref="backdrop"
      role="dialog"
      aria-modal="true"
      :aria-label="$t('shared.celebrationAria')"
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
      @click.self="close"
      @keydown="onKeydown"
    >
      <div
        class="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
        :class="showContent ? 'opacity-100' : 'opacity-0'"
      />

      <div
        class="relative flex flex-col items-center gap-4 p-6 sm:p-10 rounded-3xl bg-white dark:bg-slate-800 shadow-2xl border border-slate-200 dark:border-slate-700 transition-all duration-500 w-full max-w-sm sm:max-w-md"
        :class="showContent ? 'scale-100 opacity-100' : 'scale-50 opacity-0'"
      >
        <div class="text-5xl mb-2">🎉</div>

        <div
          class="w-28 h-28 rounded-3xl flex items-center justify-center text-6xl font-bold text-white shadow-xl"
          :style="{ backgroundColor: student.color || '#6366f1' }"
        >
          {{ student.name.charAt(0) }}
        </div>

        <div class="text-center">
          <p class="text-2xl font-extrabold font-outfit text-slate-800 dark:text-slate-100">{{ student.name }} {{ student.surname }}</p>
          <p v-if="student.group" class="text-sm text-slate-400">{{ student.group }}</p>
        </div>

        <button
          ref="continueBtn"
          @click="close"
          class="mt-2 px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-md transition-all cursor-pointer text-sm"
        >
          {{ $t('shared.continue') }}
        </button>
      </div>
    </div>
  </Teleport>
</template>
