<script setup lang="ts">
import { ref, computed } from 'vue'
import { useStudentStore } from '../../stores/students'
import { useSettingsStore } from '../../stores/settings'

const logoSrc = computed(() => `${import.meta.env.BASE_URL}logo.png`)

const studentStore = useStudentStore()
const settings = useSettingsStore()
const mobileNavOpen = ref(false)

function toggleMobileNav() {
  mobileNavOpen.value = !mobileNavOpen.value
}

function closeMobileNav() {
  mobileNavOpen.value = false
}

const navItems = [
  { path: '/', key: 'nav.home', icon: '🏠' },
  { path: '/students', key: 'nav.students', icon: '👨‍🎓' },
  { path: '/mechanics', key: 'nav.mechanics', icon: '🎡' },
  { path: '/statistics', key: 'nav.statistics', icon: '📊' },
  { path: '/settings', key: 'nav.settings', icon: '⚙️' },
]
</script>

<template>
  <header class="sticky top-0 z-50 backdrop-blur-md bg-white/70 dark:bg-slate-900/70 border-b border-slate-200 dark:border-slate-700">
    <div class="max-w-6xl mx-auto px-4 py-2 flex items-center justify-between">
      <router-link to="/" class="flex items-center gap-2 no-underline">
        <img :src="logoSrc" alt="Dinamiza Aula" class="h-14 sm:h-16 w-auto rounded-lg" />
      </router-link>

      <nav class="hidden md:flex items-center gap-1">
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="px-3 py-2 rounded-xl text-sm font-medium transition-colors no-underline"
          :class="$route.path === item.path
            ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300'
            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'"
        >
          <span class="mr-1.5">{{ item.icon }}</span>
          {{ $t(item.key) }}
        </router-link>
      </nav>

      <div class="flex items-center gap-2">
        <button
          @click="settings.toggleDark()"
          class="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          :title="$t(settings.isDark ? 'nav.lightMode' : 'nav.darkMode')"
        >
          <span v-if="settings.isDark" class="text-lg">☀️</span>
          <span v-else class="text-lg">🌙</span>
        </button>

        <button
          @click="toggleMobileNav"
          class="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </div>

    <div v-show="mobileNavOpen" class="md:hidden border-t border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md">
      <div class="px-4 py-1.5 flex flex-col gap-0.5">
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors no-underline"
          :class="$route.path === item.path
            ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300'
            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'"
          @click="closeMobileNav"
        >
          <span class="text-base">{{ item.icon }}</span>
          <span>{{ $t(item.key) }}</span>
          <span v-if="item.path === '/students'" class="ml-auto text-xs text-slate-400">
            {{ studentStore.students.length }}
          </span>
        </router-link>
      </div>
    </div>
  </header>
</template>
