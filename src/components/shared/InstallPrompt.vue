<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const logoSrc = computed(() => `${import.meta.env.BASE_URL}logoCuadrado.png`)

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const deferredPrompt = ref<BeforeInstallPromptEvent | null>(null)
const showInstall = ref(false)
const dismissed = ref(false)

onMounted(() => {
  window.addEventListener('beforeinstallprompt', (e: Event) => {
    e.preventDefault()
    if (dismissed.value) return
    deferredPrompt.value = e as BeforeInstallPromptEvent
    showInstall.value = true
  })

  window.addEventListener('appinstalled', () => {
    showInstall.value = false
    deferredPrompt.value = null
  })
})

async function install() {
  if (!deferredPrompt.value) return
  deferredPrompt.value.prompt()
  const result = await deferredPrompt.value.userChoice
  if (result.outcome === 'accepted') {
    showInstall.value = false
  } else {
    dismissed.value = true
  }
  deferredPrompt.value = null
}

function dismiss() {
  showInstall.value = false
  deferredPrompt.value = null
  dismissed.value = true
}
</script>

<template>
  <div
    v-if="showInstall"
    class="fixed bottom-4 left-4 right-4 z-50 max-w-sm mx-auto"
  >
    <div class="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl flex items-center gap-3">
      <img :src="logoSrc" alt="Dinamiza Aula" class="w-10 h-10 rounded-xl shrink-0" />
      <div class="flex-1 min-w-0">
        <p class="text-sm font-semibold text-slate-800 dark:text-slate-100">{{ $t('shared.installTitle') }}</p>
        <p class="text-xs text-slate-500 truncate">{{ $t('shared.installDesc') }}</p>
      </div>
      <button
        @click="install"
        class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium shadow-sm transition-all cursor-pointer shrink-0"
      >
        {{ $t('shared.installBtn') }}
      </button>
      <button
        @click="dismiss"
        class="p-1 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
      >
        ✕
      </button>
    </div>
  </div>
</template>
