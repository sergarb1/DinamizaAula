<script setup lang="ts">
</script>

<template>
  <footer class="border-t border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm mt-auto">
    <div class="max-w-6xl mx-auto px-4 py-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-slate-500 dark:text-slate-400">
        <div>
          <h4 class="font-semibold text-slate-700 dark:text-slate-300 mb-2">{{ $t('footer.privacy') }}</h4>
          <ul class="space-y-1">
            <li v-for="(bullet, i) in $tm('footer.bullets')" :key="i">{{ bullet }}</li>
          </ul>
        </div>
        <div>
          <h4 class="font-semibold text-slate-700 dark:text-slate-300 mb-2">{{ $t('footer.info') }}</h4>
          <ul class="space-y-1">
            <li>{{ $t('footer.version') }}</li>
            <li>{{ $t('footer.license') }}</li>
            <li>{{ $t('footer.importExport') }}</li>
          </ul>
        </div>
        <div>
          <h4 class="font-semibold text-slate-700 dark:text-slate-300 mb-2">{{ $t('footer.links') }}</h4>
          <ul class="space-y-1">
            <li>
              <a href="https://github.com/sergarb1/dinamiza-aula" target="_blank" rel="noopener" class="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors no-underline">
                {{ $t('footer.github') }}
              </a>
            </li>
            <li>
              <a href="https://mejoratudocencia.es" target="_blank" rel="noopener" class="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors no-underline">
                {{ $t('footer.project') }}
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div class="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 text-center text-xs text-slate-400">
        {{ $t('footer.subtitle') }}
      </div>
    </div>
  </footer>
</template>
