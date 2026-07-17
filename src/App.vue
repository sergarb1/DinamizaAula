<script setup lang="ts">
import { watch } from 'vue'
import { useI18n } from 'vue-i18n'
import AppHeader from './components/layout/AppHeader.vue'
import AppFooter from './components/layout/AppFooter.vue'
import InstallPrompt from './components/shared/InstallPrompt.vue'

const { locale } = useI18n()
watch(locale, (val) => { document.documentElement.lang = val === 'en' ? 'en' : 'es' }, { immediate: true })
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <a href="#main-content" class="skip-link">{{ $t('app.skipLink') }}</a>
    <AppHeader />
    <main id="main-content" class="flex-1 w-full max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
      <router-view />
    </main>
    <AppFooter />
    <InstallPrompt />
  </div>
</template>
