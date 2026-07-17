<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const { tm } = useI18n()

const mechanics = computed(() => tm('mechanics.list') as {
  id: string; icon: string; name: string; desc: string; popular?: boolean
}[])
</script>

<template>
  <div class="space-y-6">
    <div class="text-center">
      <h2 class="text-2xl font-bold font-outfit">{{ $t('mechanics.title') }}</h2>
      <p class="text-slate-500 dark:text-slate-400">{{ $t('mechanics.subtitle') }}</p>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      <button
        v-for="m in mechanics"
        :key="m.id"
        @click="router.push(`/mechanics/${m.id}`)"
        class="group relative p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 text-left cursor-pointer min-h-[140px]"
        :class="{ 'ring-2 ring-indigo-400 dark:ring-indigo-500': m.popular }"
      >
        <div v-if="m.popular" class="absolute -top-2 -right-2 bg-indigo-600 text-white text-xs px-2 py-0.5 rounded-full font-medium shadow-sm">
          {{ $t('mechanics.popular') }}
        </div>
        <div class="text-4xl mb-3">{{ m.icon }}</div>
        <h3 class="font-semibold text-slate-800 dark:text-slate-100 text-lg">{{ m.name }}</h3>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{{ m.desc }}</p>
      </button>
    </div>
  </div>
</template>
