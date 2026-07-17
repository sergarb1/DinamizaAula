<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useStudentStore } from '../stores/students'
import { useGamificationStore } from '../stores/gamification'
import GamificationBar from '../components/shared/GamificationBar.vue'
import AchievementsModal from '../components/shared/AchievementsModal.vue'

const showAchievements = ref(false)
const gamification = useGamificationStore()

const router = useRouter()
const studentStore = useStudentStore()
</script>

<template>
  <div class="space-y-6">
    <div v-if="studentStore.students.length === 0" class="text-center py-16 space-y-6">
      <div class="text-7xl mb-4">🏫</div>
      <h2 class="text-3xl sm:text-4xl font-bold font-outfit text-slate-800 dark:text-slate-100">
        {{ $t('home.title') }}
      </h2>
      <p class="text-slate-500 dark:text-slate-400 text-lg max-w-md mx-auto">
        {{ $t('home.emptyDesc') }}
      </p>
      <div class="flex flex-wrap justify-center gap-3">
        <button
          @click="router.push('/students')"
          class="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-md transition-all cursor-pointer"
        >
          {{ $t('home.addStudents') }}
        </button>
        <button
          @click="studentStore.loadExample(0)"
          class="px-6 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium shadow-sm transition-all cursor-pointer"
        >
          {{ $t('home.loadExample') }}
        </button>
      </div>
      <div class="flex justify-center gap-2 pt-4">
        <button
          v-for="(ex, i) in studentStore.examples"
          :key="i"
          @click="studentStore.loadExample(i)"
          class="px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-sm text-slate-600 dark:text-slate-400 transition-all cursor-pointer"
        >
          {{ ex.course }}
        </button>
      </div>
    </div>

    <template v-else>
    <div class="text-center space-y-2">
      <h2 class="text-3xl sm:text-4xl font-bold font-outfit bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
        {{ $t('home.title') }}
      </h2>
      <p class="text-slate-500 dark:text-slate-400 text-lg">
        {{ $t('home.activeStudents', { count: studentStore.activeStudents.length }) }}
        <span v-if="studentStore.courseLabel"> · {{ studentStore.courseLabel }}</span>
      </p>
    </div>

    <div class="flex justify-center gap-4 pt-4">
      <button
        @click="router.push('/students')"
        class="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-md hover:shadow-lg transition-all cursor-pointer"
      >
        {{ $t('home.manageStudents') }}
      </button>
      <button
        v-if="studentStore.activeStudents.length >= 2"
        @click="router.push('/mechanics')"
        class="px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-medium shadow-md hover:shadow-lg transition-all cursor-pointer"
      >
        {{ $t('home.viewMechanics') }}
      </button>
    </div>

    <GamificationBar />

    <div v-if="gamification.enabled" class="flex justify-center pt-2">
      <button @click="showAchievements = true" class="px-4 py-2 rounded-xl bg-amber-100 dark:bg-amber-900/40 hover:bg-amber-200 dark:hover:bg-amber-900/60 text-amber-700 dark:text-amber-300 text-sm font-medium transition-all cursor-pointer">
        {{ $t('home.viewBadges') }}
      </button>
    </div>

    <AchievementsModal v-if="showAchievements" @close="showAchievements = false" />
    </template>
  </div>
</template>
