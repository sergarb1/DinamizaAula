<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { ref, computed, markRaw, nextTick, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStudentStore } from '../stores/students'
import { useHistoryStore } from '../stores/history'
import { useSettingsStore } from '../stores/settings'
import { getAllStrategies, executeStrategy } from '../strategies/registry'
import { getTextColor, shuffleArray } from '../strategies/utils'
import type { StrategyResult } from '../types/strategy'
import type { Student } from '../types/student'

import RouletteWheel from '../components/mechanics/RouletteWheel.vue'
import QuickPick from '../components/mechanics/QuickPick.vue'
import CardDeck from '../components/mechanics/CardDeck.vue'
import ConfettiEffect from '../components/shared/ConfettiEffect.vue'
import CelebrationPopup from '../components/shared/CelebrationPopup.vue'
import ChallengeManager from '../components/shared/ChallengeManager.vue'
import SelectionTimer from '../components/settings/SelectionTimer.vue'
import { useGamificationStore } from '../stores/gamification'
import { useChallengeStore } from '../stores/challenges'
import { playWinSound } from '../utils/sounds'

const { t } = useI18n()

const route = useRoute()
const router = useRouter()
const studentStore = useStudentStore()
const historyStore = useHistoryStore()
const settingsStore = useSettingsStore()
const gamificationStore = useGamificationStore()
const challengeStore = useChallengeStore()

const mechanicId = route.params.id as string
const strategies = getAllStrategies()

interface MechanicConfig {
  component?: any
  defaultStrategy?: string
  hideStrategySelector?: boolean
}

const mechanicConfig: Record<string, MechanicConfig> = {
  roulette:          { component: markRaw(RouletteWheel), defaultStrategy: 'adaptive-roulette', hideStrategySelector: true },
  'quick-pick':      { component: markRaw(QuickPick), defaultStrategy: 'random', hideStrategySelector: true },
  cards:             { component: markRaw(CardDeck), defaultStrategy: 'random', hideStrategySelector: true },
  queue:             { defaultStrategy: 'smart-queue', hideStrategySelector: true },
  teams:             { defaultStrategy: 'balanced-teams', hideStrategySelector: true },
  challenge:         { defaultStrategy: 'hot-ball', hideStrategySelector: true },
}

const mechanicTitle = computed(() => {
  const key = mechanicId.replace(/-([a-z])/g, (_, c) => c.toUpperCase())
  return t('mechanicDetail.names.' + key) || t('mechanicDetail.fallbackTitle')
})

function strategyLocaleKey(id: string): string {
  return id.replace(/-([a-z])/g, (_, c) => c.toUpperCase())
}

const config = computed(() => mechanicConfig[mechanicId])
const isCustom = computed(() => !!config.value?.component)
const selectedStrategy = ref(config.value?.defaultStrategy || strategies[0].id)
const result = ref<StrategyResult | null>(null)
const animating = ref(false)
const showConfetti = ref(false)
const showStrategySelector = ref(false)
const celebrationStudent = ref<Student | null>(null)
const currentChallenge = ref('')
const showChallengesManager = ref(false)
const timerRunning = ref(false)
const timerDuration = ref(10)
const activeQueue = ref<Student[] | null>(null)
const queueCursor = ref(0)
const teamSize = ref(3)
const generatedTeams = ref<Student[][] | null>(null)

const currentStrategy = computed(() => strategies.find(s => s.id === selectedStrategy.value)!)

const activeCount = computed(() => studentStore.activeStudents.length)
const mechanicHistory = computed(() => historyStore.participations.filter(p => p.mechanic === mechanicId))

function showCelebration(s: Student) {
  celebrationStudent.value = s
}

function onCelebrationDismiss() {
  celebrationStudent.value = null
}

function onMechanicSelect(student: Student) {
  historyStore.record(student.id, selectedStrategy.value, mechanicId)
  gamificationStore.recordParticipation(student.id)
  result.value = { selected: [student], type: 'single' }
  timerRunning.value = false
  if (settingsStore.soundEnabled) playWinSound()
  if (settingsStore.confettiEnabled) {
    showConfetti.value = true
    setTimeout(() => { showConfetti.value = false }, 3000)
  }
  showCelebration(student)
}

function onMechanicStart() {
  result.value = null
  celebrationStudent.value = null
}

function onMechanicEnd() {
}

function execute() {
  const available = studentStore.activeStudents
  if (available.length === 0) return

  if (isCustom.value) return

  animating.value = true
  result.value = null
  celebrationStudent.value = null
  currentChallenge.value = ''

  setTimeout(() => {
    let strategyResult: StrategyResult

    if (mechanicId === 'queue') {
      const queue = shuffleArray([...available])
      strategyResult = {
        selected: [queue[0]],
        type: 'queue',
        queue,
        label: `${t('mechanicDetail.queueLength', { n: queue.length })}`,
      }
    } else {
      strategyResult = executeStrategy(selectedStrategy.value, available, mechanicHistory.value)
    }

    result.value = strategyResult
    if (strategyResult.type === 'queue' && strategyResult.queue && strategyResult.queue.length > 0) {
      activeQueue.value = strategyResult.queue
      queueCursor.value = 0
    } else {
      activeQueue.value = null
    }
    if (strategyResult.selected.length > 0) {
      if (mechanicId === 'challenge') {
        currentChallenge.value = challengeStore.random()
      } else {
        currentChallenge.value = ''
      }
      for (const student of strategyResult.selected) {
        historyStore.record(student.id, selectedStrategy.value, mechanicId)
        gamificationStore.recordParticipation(student.id)
        showCelebration(student)
      }
    }
    if (settingsStore.soundEnabled && strategyResult.selected.length > 0) playWinSound()
    if (settingsStore.confettiEnabled && strategyResult.selected.length > 0) {
      showConfetti.value = true
      setTimeout(() => { showConfetti.value = false }, 3000)
    }
    animating.value = false
    if (timerRunning.value) {
      timerRunning.value = false
      nextTick(() => { timerRunning.value = true })
    }
  }, 500)
}

function advanceQueue() {
  if (!activeQueue.value) return
  const nextIdx = queueCursor.value + 1
  if (nextIdx >= activeQueue.value.length) {
    activeQueue.value = null
    result.value = { selected: [], type: 'none', label: t('mechanicDetail.queueFinished') }
    return
  }
  queueCursor.value = nextIdx
  const student = activeQueue.value[nextIdx]
  historyStore.record(student.id, selectedStrategy.value, mechanicId)
  gamificationStore.recordParticipation(student.id)
  result.value = { selected: [student], type: 'single', queue: activeQueue.value }
  if (settingsStore.soundEnabled) playWinSound()
  if (settingsStore.confettiEnabled) {
    showConfetti.value = true
    setTimeout(() => { showConfetti.value = false }, 3000)
  }
  showCelebration(student)
  timerRunning.value = false
  nextTick(() => { timerRunning.value = true })
}

function onTimerComplete() {
  if (animating.value) return
  if (activeQueue.value && (queueCursor.value >= 0 || !result.value?.selected?.length)) {
    advanceQueue()
  } else {
    execute()
  }
}

function handleAction() {
  if (activeQueue.value) {
    advanceQueue()
  } else if (mechanicId === 'teams') {
    pickTeam()
  } else {
    execute()
  }
}

function generateQueueForDisplay() {
  const available = studentStore.activeStudents
  if (available.length === 0) return
  const strategyResult = executeStrategy(selectedStrategy.value, available, mechanicHistory.value)
  if (strategyResult.type === 'queue' && strategyResult.queue && strategyResult.queue.length > 0) {
    result.value = null
    activeQueue.value = null
    nextTick(() => {
      activeQueue.value = strategyResult.queue!
      queueCursor.value = -1
      result.value = { ...strategyResult, selected: [], queue: strategyResult.queue! }
    })
  }
}

function generateTeamsForDisplay() {
  const available = studentStore.activeStudents
  if (available.length === 0) return
  const shuffled = shuffleArray([...available])
  const teams: Student[][] = []
  for (let i = 0; i < shuffled.length; i += teamSize.value) {
    teams.push(shuffled.slice(i, i + teamSize.value))
  }
  generatedTeams.value = teams
  result.value = {
    selected: [],
    type: 'teams',
    teams,
    label: `${teams.length} ${t('mechanicDetail.teamsLabel', { n: teamSize.value })}`,
  }
}

function pickTeam() {
  if (!generatedTeams.value || generatedTeams.value.length === 0) {
    generateTeamsForDisplay()
    if (!generatedTeams.value || generatedTeams.value.length === 0) return
  }
  const teams = generatedTeams.value
  const teamIndex = Math.floor(Math.random() * teams.length)
  const team = teams[teamIndex]
  result.value = { selected: team, type: 'teams', teams }
  for (const student of team) {
    historyStore.record(student.id, selectedStrategy.value, mechanicId)
    gamificationStore.recordParticipation(student.id)
  }
  showCelebration(team[0])
  if (settingsStore.soundEnabled) playWinSound()
  if (settingsStore.confettiEnabled) {
    showConfetti.value = true
    setTimeout(() => { showConfetti.value = false }, 3000)
  }
}

onMounted(() => {
  if (mechanicId === 'queue' && activeCount.value > 0) {
    generateQueueForDisplay()
  }
  if (mechanicId === 'teams' && activeCount.value > 0) {
    generateTeamsForDisplay()
  }
})

watch(teamSize, () => {
  if (mechanicId === 'teams' && activeCount.value > 0) {
    result.value = null
    generatedTeams.value = null
    generateTeamsForDisplay()
  }
})
</script>

<template>
  <div class="space-y-6">
    <ConfettiEffect :active="showConfetti" />
    <CelebrationPopup :student="celebrationStudent" @dismiss="onCelebrationDismiss" />
    <ChallengeManager v-if="showChallengesManager" @close="showChallengesManager = false" />
    <div aria-live="polite" aria-atomic="true" class="sr-only">{{ result ? $t('mechanicDetail.selected', { names: result.selected.map(s => s.name + ' ' + s.surname).join(', ') }) : '' }}</div>

    <button @click="router.push('/mechanics')" class="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-indigo-600 dark:hover:text-indigo-400 shadow-sm transition-all no-underline cursor-pointer">
      {{ $t('mechanicDetail.back') }}
    </button>

    <div class="text-center">
      <h2 class="text-2xl font-bold font-outfit">{{ mechanicTitle }}</h2>
      <p v-if="currentStrategy && isCustom" class="text-xs text-slate-400 mt-1">{{ $t('strategies.' + strategyLocaleKey(currentStrategy.id) + '.desc') }}</p>
    </div>

    <div class="max-w-2xl mx-auto space-y-4">

      <!-- Controls bar -->
      <div v-if="!isCustom" class="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
        <div class="flex flex-wrap items-center gap-4 justify-center">
          <label class="flex items-center gap-2 text-xs text-slate-500 cursor-pointer select-none">
            <span>⏱️</span>
            <div
              @click="timerRunning = !timerRunning"
              class="relative w-8 h-4 rounded-full transition-colors cursor-pointer"
              :class="timerRunning ? 'bg-indigo-500' : 'bg-slate-300 dark:bg-slate-600'"
            >
              <div
                class="absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white shadow-sm transition-transform"
                :class="timerRunning ? 'translate-x-4' : 'translate-x-0'"
              />
            </div>
            <span>{{ $t('mechanicDetail.auto') }}</span>
          </label>

          <label v-if="!timerRunning" class="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
            <span>⏱️</span>
            <input
              v-model.number="timerDuration"
              type="number"
              min="3"
              max="400"
              class="w-14 px-2 py-1 text-xs bg-transparent border border-slate-200 dark:border-slate-600 rounded-lg outline-none text-center cursor-pointer [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <span>{{ $t('mechanicDetail.seconds') }}</span>
            <div class="flex gap-1">
              <button
                v-for="p in [10, 20, 30, 60, 120, 180, 300, 400]"
                :key="p"
                @click="timerDuration = p"
                class="px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-600 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors cursor-pointer"
                :class="timerDuration === p ? 'bg-indigo-100 dark:bg-indigo-900/40 border-indigo-400' : 'bg-transparent'"
              >
                {{ p >= 60 ? `${Math.floor(p / 60)}m` : `${p}s` }}
              </button>
            </div>
          </label>

          <label v-if="timerRunning" class="flex items-center gap-2 text-xs text-slate-500">
            <SelectionTimer
              :running="timerRunning"
              :duration="timerDuration"
              @complete="onTimerComplete"
            />
          </label>

          <label v-if="mechanicId === 'teams'" class="flex items-center gap-2 text-xs text-slate-500">
            <span>👥</span>
            <span>{{ $t('mechanicDetail.teamSize') }}</span>
            <div class="flex items-center gap-1">
              <button
                @click="teamSize = Math.max(2, teamSize - 1)"
                class="w-6 h-6 rounded-md border border-slate-200 dark:border-slate-600 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors cursor-pointer flex items-center justify-center"
              >−</button>
              <span class="w-6 text-center font-medium tabular-nums">{{ teamSize }}</span>
              <button
                @click="teamSize = Math.min(8, teamSize + 1)"
                class="w-6 h-6 rounded-md border border-slate-200 dark:border-slate-600 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors cursor-pointer flex items-center justify-center"
              >+</button>
            </div>
          </label>

        </div>
      </div>

      <div class="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm text-center min-h-[300px] flex flex-col items-center justify-center">

        <!-- Custom mechanic component -->
        <template v-if="isCustom && config?.component">
          <component
            :is="config.component"
            :students="studentStore.activeStudents"
            :strategy-id="selectedStrategy"
            :history="historyStore.participations"
            @select="onMechanicSelect"
            @start="onMechanicStart"
            @end="onMechanicEnd"
          />
        </template>

        <!-- Generic strategy-based UI -->
        <template v-else>
          <Transition name="fade" mode="out-in">
            <div v-if="animating" key="animating" class="text-6xl mb-4 animate-bounce">🎲</div>

            <div v-else-if="result" key="result" class="w-full space-y-4">
              <Transition name="slide-up" mode="out-in">
                <div v-if="result.type === 'teams' && result.teams" key="teams" class="space-y-4">
                  <p class="text-sm text-indigo-600 dark:text-indigo-400 font-medium">{{ result.label }}</p>
                  <div v-for="(team, ti) in result.teams" :key="ti" class="p-4 rounded-xl transition-all" :class="result.selected.length > 0 && result.selected.every(s => team.some(t => t.id === s.id)) ? 'bg-indigo-100 dark:bg-indigo-900/40 ring-2 ring-indigo-400' : 'bg-slate-50 dark:bg-slate-700/50'">
                    <p class="text-xs font-semibold mb-2" :class="result.selected.length > 0 && result.selected.every(s => team.some(t => t.id === s.id)) ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-500'">
                      {{ $t('mechanicDetail.team', { n: ti + 1 }) }}
                      <span v-if="result.selected.length > 0 && result.selected.every(s => team.some(t => t.id === s.id))" class="ml-1">🎯</span>
                    </p>
                    <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      <div v-for="s in team" :key="s.id" class="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium truncate" :style="{ backgroundColor: s.color || '#6366f1', color: getTextColor(s.color || '#6366f1') }">
                        {{ s.name }} {{ s.surname }}
                      </div>
                    </div>
                  </div>
                </div>

                <div v-else-if="(result.type === 'queue' || result.type === 'single') && result.queue" key="queue" class="space-y-3">
                  <p class="text-sm text-indigo-600 dark:text-indigo-400 font-medium">{{ result.label }}</p>
                  <div class="space-y-1 max-w-sm mx-auto">
                    <div v-for="(s, qi) in result.queue" :key="s.id" class="flex items-center gap-3 px-4 py-2 rounded-xl text-left" :class="qi === queueCursor ? 'bg-indigo-100 dark:bg-indigo-900/40 ring-2 ring-indigo-400' : 'bg-slate-50 dark:bg-slate-700/30'">
                      <span class="w-6 h-6 rounded-full bg-slate-300 dark:bg-slate-600 text-xs flex items-center justify-center font-bold text-slate-700 dark:text-slate-300 shrink-0">{{ qi + 1 }}</span>
                      <span class="font-medium truncate" :class="qi === queueCursor ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-300'">{{ s.name }} {{ s.surname }}</span>
                    </div>
                  </div>
                </div>

                <div v-else-if="result.type === 'captain' && result.captain" key="captain" class="space-y-4">
                  <div class="text-4xl mb-2">👑</div>
                  <div class="inline-flex items-center justify-center w-20 h-20 rounded-2xl text-3xl font-bold shadow-lg" :style="{ backgroundColor: result.captain.color || '#6366f1', color: getTextColor(result.captain.color || '#6366f1') }">
                    {{ result.captain.name.charAt(0) }}
                  </div>
                  <p class="text-2xl font-bold font-outfit text-amber-600 dark:text-amber-400">{{ $t('mechanicDetail.captainLabel', { name: result.captain.name + ' ' + result.captain.surname }) }}</p>
                  <div v-if="result.teams" class="space-y-3">
                    <div v-for="(team, ti) in result.teams" :key="ti" class="p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50">
                      <p class="text-xs font-semibold text-slate-500 mb-2">{{ $t('mechanicDetail.team', { n: ti + 1 }) }}</p>
                      <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        <div v-for="s in team" :key="s.id" class="px-3 py-1.5 rounded-lg text-sm font-medium truncate" :style="{ backgroundColor: s.color || '#6366f1', color: getTextColor(s.color || '#6366f1') }">
                          {{ s.name }} {{ s.surname }}
                        </div>
                        <div v-if="currentStrategy" class="text-center text-xs text-slate-400 mt-2 col-span-full">
                          <span class="text-sm mr-1">{{ currentStrategy.icon }}</span>
                          {{ $t('strategies.' + strategyLocaleKey(currentStrategy.id) + '.name') }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div v-else-if="result.selected.length > 0" key="selected" class="space-y-2">
                  <div v-if="result.label" class="text-sm text-indigo-600 dark:text-indigo-400 font-medium">{{ result.label }}</div>
                  <div v-if="mechanicId === 'challenge' && currentChallenge" class="px-4 py-3 mx-auto max-w-md rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-sm">
                    <p class="font-semibold mb-1">🔥 {{ $t('mechanicDetail.challenge') }}</p>
                    <p>{{ currentChallenge }}</p>
                  </div>
                  <div v-if="mechanicId === 'challenge' && !result.selected.length" class="text-center">
                    <button @click="showChallengesManager = true" class="text-xs text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer">
                      {{ $t('mechanicDetail.manageChallenges') }}
                    </button>
                  </div>
                  <div v-for="s in result.selected" :key="s.id">
                    <div class="inline-flex items-center justify-center w-20 h-20 rounded-2xl text-3xl font-bold shadow-lg" :style="{ backgroundColor: s.color || '#6366f1', color: getTextColor(s.color || '#6366f1') }">
                      {{ s.name.charAt(0) }}
                    </div>
                    <p class="text-2xl font-bold font-outfit text-slate-800 dark:text-slate-100 mt-2">{{ s.name }} {{ s.surname }}</p>
                    <p v-if="s.group" class="text-sm text-slate-400">{{ s.group }}</p>
                  </div>
                  <p v-if="result.eliminated && result.eliminated.length > 0" class="text-xs text-red-500 mt-2">
                    {{ $t('mechanicDetail.eliminated', { names: result.eliminated.map(s => s.name).join(', ') }) }}
                  </p>
                </div>

                <div v-else key="empty" class="text-slate-400">
                  <p class="text-lg">{{ result.label || $t('mechanicDetail.noResult') }}</p>
                </div>
              </Transition>
            </div>

            <div v-else key="idle" class="text-slate-400 space-y-2 py-8">
              <div class="text-6xl mb-2">{{ currentStrategy.icon }}</div>
              <p class="text-sm max-w-md mx-auto">{{ $t('strategies.' + strategyLocaleKey(currentStrategy.id) + '.desc') }}</p>
              <button v-if="mechanicId === 'challenge'" @click="showChallengesManager = true" class="mt-2 text-xs text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer">
                {{ $t('mechanicDetail.manageChallenges') }}
              </button>
            </div>
          </Transition>

          <button
            v-if="activeCount > 0 && !animating"
            @click="handleAction"
            class="mt-6 px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 disabled:opacity-50 text-white font-medium shadow-md hover:shadow-lg transition-all cursor-pointer disabled:cursor-not-allowed"
          >
            {{ mechanicId === 'teams' && generatedTeams ? $t('mechanicDetail.pickTeam') : activeQueue ? $t('mechanicDetail.next') : $t('mechanicDetail.select') }}
          </button>

          <button
            v-if="mechanicId === 'teams' && generatedTeams && !animating"
            @click="generateTeamsForDisplay"
            class="mt-3 px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 text-sm transition-all cursor-pointer"
          >
            {{ $t('mechanicDetail.regenerateTeams') }}
          </button>

          <button
            v-if="mechanicId === 'queue' && !animating"
            @click="generateQueueForDisplay"
            class="mt-3 px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 text-sm transition-all cursor-pointer"
          >
            {{ $t('mechanicDetail.reshuffleQueue') }}
          </button>

          <div v-else-if="activeCount === 0" class="mt-4 text-sm text-amber-600 dark:text-amber-400">
            {{ $t('mechanicDetail.noActive') }}
          </div>
        </template>

        <div v-if="activeCount < 2 && isCustom" class="mt-4 text-sm text-amber-600 dark:text-amber-400">
          {{ $t('mechanicDetail.needTwo') }}
        </div>
      </div>

      <div v-if="!isCustom && !config?.hideStrategySelector" class="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
        <button
          @click="showStrategySelector = !showStrategySelector"
          class="flex items-center justify-between w-full text-left cursor-pointer"
        >
          <div>
            <p class="text-sm font-medium text-slate-600 dark:text-slate-400">{{ $t('mechanicDetail.currentStrategy') }}</p>
            <p class="font-semibold text-slate-800 dark:text-slate-100">{{ currentStrategy.icon }} {{ $t('strategies.' + strategyLocaleKey(currentStrategy.id) + '.name') }}</p>
          </div>
          <svg class="w-5 h-5 text-slate-400 transition-transform" :class="{ 'rotate-180': showStrategySelector }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <div v-if="showStrategySelector" class="mt-4 space-y-1 max-h-80 overflow-y-auto">
          <button
            v-for="s in strategies"
            :key="s.id"
            @click="selectedStrategy = s.id; showStrategySelector = false"
            class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors cursor-pointer"
            :class="selectedStrategy === s.id
              ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300'
              : 'hover:bg-slate-100 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300'"
          >
            <span class="text-xl">{{ s.icon }}</span>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium truncate">{{ $t('strategies.' + strategyLocaleKey(s.id) + '.name') }}</p>
              <p class="text-xs text-slate-500 truncate">{{ $t('strategies.' + strategyLocaleKey(s.id) + '.desc') }}</p>
            </div>
            <span class="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 capitalize">{{ s.category }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.slide-up-enter-active {
  transition: all 0.3s ease-out;
}
.slide-up-leave-active {
  transition: all 0.2s ease-in;
}
.slide-up-enter-from {
  opacity: 0;
  transform: translateY(20px);
}
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
