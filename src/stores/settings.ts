import { defineStore } from 'pinia'
import { ref, watch, computed } from 'vue'
import { useColorMode } from '@vueuse/core'

const STORAGE_KEY = 'dinamiza-aula:settings'

export const useSettingsStore = defineStore('settings', () => {
  const colorMode = useColorMode({
    selector: 'html',
    attribute: 'class',
    initialValue: 'light',
    modes: { dark: 'dark', light: '' },
    storageKey: 'dinamiza-aula:color-mode',
  })
  const isDark = computed(() => colorMode.value === 'dark')
  function toggleDark() { colorMode.value = colorMode.value === 'dark' ? 'light' : 'dark' }

  const soundEnabled = ref(true)
  const confettiEnabled = ref(true)
  const reducedMotion = ref(false)
  const defaultMechanic = ref('roulette')
  const defaultStrategy = ref('weighted')

  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) {
    try {
      const data = JSON.parse(stored)
      soundEnabled.value = data.soundEnabled ?? true
      confettiEnabled.value = data.confettiEnabled ?? true
      reducedMotion.value = data.reducedMotion ?? false
      defaultMechanic.value = data.defaultMechanic ?? 'roulette'
      defaultStrategy.value = data.defaultStrategy ?? 'weighted'
    } catch { /* ignore */ }
  }

  watch(
    [soundEnabled, confettiEnabled, reducedMotion, defaultMechanic, defaultStrategy],
    () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        soundEnabled: soundEnabled.value,
        confettiEnabled: confettiEnabled.value,
        reducedMotion: reducedMotion.value,
        defaultMechanic: defaultMechanic.value,
        defaultStrategy: defaultStrategy.value,
      }))
    },
    { deep: true },
  )

  return {
    isDark,
    toggleDark,
    soundEnabled,
    confettiEnabled,
    reducedMotion,
    defaultMechanic,
    defaultStrategy,
  }
})
