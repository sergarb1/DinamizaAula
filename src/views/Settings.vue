<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSettingsStore } from '../stores/settings'
import { useGamificationStore } from '../stores/gamification'

const { locale } = useI18n()

const settings = useSettingsStore()
const gamification = useGamificationStore()
const showClearModal = ref(false)

function confirmClear() {
  const keys = Object.keys(window.localStorage).filter(k => k.startsWith('dinamiza-aula:'))
  keys.forEach(k => window.localStorage.removeItem(k))
  window.location.reload()
}

function onLocaleChange() {
  localStorage.setItem('dinamiza-aula:locale', locale.value)
  document.documentElement.lang = locale.value === 'en' ? 'en' : 'es'
}
</script>

<template>
  <div class="space-y-6 max-w-lg mx-auto">
    <div class="text-center">
      <h2 class="text-2xl font-bold font-outfit">{{ $t('settings.title') }}</h2>
    </div>

    <div class="space-y-4">
      <div class="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
        <h3 class="font-semibold mb-4">{{ $t('settings.appearance') }}</h3>
        <div class="flex items-center justify-between">
          <div>
            <p class="font-medium text-slate-800 dark:text-slate-100">{{ $t('settings.darkMode') }}</p>
            <p class="text-sm text-slate-500">{{ $t('settings.darkModeDesc') }}</p>
          </div>
          <button
            @click="settings.toggleDark()"
            class="relative w-12 h-6 rounded-full transition-colors cursor-pointer"
            :class="settings.isDark ? 'bg-indigo-600' : 'bg-slate-300'"
          >
            <span
              class="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform"
              :class="settings.isDark ? 'translate-x-6' : ''"
            />
          </button>
        </div>
        <div class="flex items-center justify-between mt-4">
          <div>
            <p class="font-medium text-slate-800 dark:text-slate-100">{{ $t('settings.language') }}</p>
            <p class="text-sm text-slate-500">{{ $t('settings.languageDesc') }}</p>
          </div>
          <select
            v-model="locale"
            @change="onLocaleChange"
            class="text-sm bg-transparent border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-1.5 outline-none cursor-pointer"
          >
            <option value="es">{{ $t('settings.spanish') }}</option>
            <option value="en">{{ $t('settings.english') }}</option>
          </select>
        </div>
      </div>

      <div class="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
        <h3 class="font-semibold mb-4">{{ $t('settings.sound') }}</h3>
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium text-slate-800 dark:text-slate-100">{{ $t('settings.soundEnabled') }}</p>
              <p class="text-sm text-slate-500">{{ $t('settings.soundDesc') }}</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" v-model="settings.soundEnabled" class="sr-only peer" />
              <div class="w-11 h-6 bg-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium text-slate-800 dark:text-slate-100">{{ $t('settings.confetti') }}</p>
              <p class="text-sm text-slate-500">{{ $t('settings.confettiDesc') }}</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" v-model="settings.confettiEnabled" class="sr-only peer" />
              <div class="w-11 h-6 bg-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium text-slate-800 dark:text-slate-100">{{ $t('settings.reducedMotion') }}</p>
              <p class="text-sm text-slate-500">{{ $t('settings.reducedMotionDesc') }}</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" v-model="settings.reducedMotion" class="sr-only peer" />
              <div class="w-11 h-6 bg-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
        </div>
      </div>

      <div class="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
        <h3 class="font-semibold mb-4">{{ $t('settings.privacy') }}</h3>
        <div class="space-y-2 text-sm text-slate-600 dark:text-slate-400">
          <p>{{ $t('settings.privacyBrowser') }}</p>
          <p>{{ $t('settings.privacyNoDataLeak') }}</p>
          <p>{{ $t('settings.privacyNoServers') }}</p>
          <p>{{ $t('settings.privacyRGPD') }}</p>
          <p>{{ $t('settings.privacyOpenSource') }}</p>
          <p>{{ $t('settings.privacyLocalStorage') }}</p>
          <p>{{ $t('settings.privacyExport') }}</p>
        </div>
      </div>

      <div class="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
        <h3 class="font-semibold mb-4">{{ $t('settings.gamification') }}</h3>
        <div class="flex items-center justify-between">
          <div>
            <p class="font-medium text-slate-800 dark:text-slate-100">{{ $t('settings.gamificationToggle') }}</p>
            <p class="text-sm text-slate-500">{{ $t('settings.gamificationDesc') }}</p>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" :checked="gamification.enabled" @change="gamification.setEnabled(!gamification.enabled)" class="sr-only peer" />
            <div class="w-11 h-6 bg-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
          </label>
        </div>
        <div v-if="gamification.enabled" class="mt-3 text-xs text-slate-500">
          {{ $t('settings.gamificationInfo') }}
        </div>
      </div>

      <div class="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
        <h3 class="font-semibold mb-4">{{ $t('settings.data') }}</h3>
        <div class="flex flex-wrap gap-2">
          <button
            @click="showClearModal = true"
            class="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-all cursor-pointer"
          >
            {{ $t('settings.clearAll') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Red confirmation modal -->
    <Teleport to="body">
      <div
        v-if="showClearModal"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
        @click.self="showClearModal = false"
      >
        <div
          role="dialog"
          aria-modal="true"
          class="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-800 border-2 border-red-300 dark:border-red-700 shadow-xl p-6 text-center space-y-5"
        >
          <div class="w-16 h-16 mx-auto rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center">
            <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <div>
            <p class="text-lg font-bold text-red-700 dark:text-red-400">{{ $t('settings.clearTitle') }}</p>
            <p class="text-sm text-slate-500 dark:text-slate-400 mt-2">{{ $t('students.clearDataConfirm') }}</p>
          </div>
          <div class="flex gap-3 justify-center">
            <button
              @click="showClearModal = false"
              class="px-5 py-2 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 text-sm font-medium transition-all cursor-pointer"
            >
              {{ $t('settings.cancel') }}
            </button>
            <button
              @click="confirmClear"
              class="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-all cursor-pointer"
            >
              {{ $t('settings.delete') }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
