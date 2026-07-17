<script setup lang="ts">
import { ref } from 'vue'
import { useChallengeStore } from '../../stores/challenges'

const store = useChallengeStore()

const emit = defineEmits<{ (e: 'close'): void }>()

const newChallengeText = ref('')
const editingIndex = ref<number | null>(null)
const editingText = ref('')
const importText = ref('')
const showImport = ref(false)
const importError = ref('')
const exportCopied = ref(false)

function add() {
  if (!newChallengeText.value.trim()) return
  store.add(newChallengeText.value)
  newChallengeText.value = ''
}

function startEdit(index: number) {
  editingIndex.value = index
  editingText.value = store.challenges[index]
}

function saveEdit() {
  if (editingIndex.value === null) return
  if (!editingText.value.trim()) return
  store.update(editingIndex.value, editingText.value)
  editingIndex.value = null
  editingText.value = ''
}

function cancelEdit() {
  editingIndex.value = null
  editingText.value = ''
}

function remove(index: number) {
  store.remove(index)
  if (editingIndex.value === index) cancelEdit()
}

function doImport() {
  importError.value = ''
  if (!importText.value.trim()) return
  if (store.importJson(importText.value)) {
    showImport.value = false
    importText.value = ''
  } else {
    importError.value = 'Invalid JSON format. Expected an array of strings.'
  }
}

function copyExport() {
  navigator.clipboard.writeText(store.exportJson()).then(() => {
    exportCopied.value = true
    setTimeout(() => { exportCopied.value = false }, 2000)
  })
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('close')
}
</script>

<template>
  <div
    role="dialog"
    aria-modal="true"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
    @click.self="emit('close')"
    @keydown="handleKeydown"
  >
    <div class="w-full max-w-lg max-h-[85vh] flex flex-col rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xl">
      <div class="sticky top-0 bg-white dark:bg-slate-800 p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between z-10 shrink-0">
        <h3 class="text-lg font-bold font-outfit">🔥 {{ $t('mechanicDetail.manageChallenges') }}</h3>
        <button @click="emit('close')" class="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer text-slate-400">✕</button>
      </div>

      <div class="p-4 space-y-4 overflow-y-auto flex-1">
        <p class="text-xs text-slate-500">{{ store.challenges.length }} retos</p>

        <div class="flex gap-2">
          <input
            v-model="newChallengeText"
            @keydown.enter="add"
            placeholder="Añadir nuevo reto..."
            maxlength="200"
            class="flex-1 px-3 py-2 text-sm bg-transparent border border-slate-200 dark:border-slate-600 rounded-xl outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <button
            @click="add"
            :disabled="!newChallengeText.trim()"
            class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white text-sm font-medium transition-all cursor-pointer disabled:cursor-not-allowed shrink-0"
          >
            Añadir
          </button>
        </div>

        <div class="space-y-1.5">
          <div
            v-for="(ch, i) in store.challenges"
            :key="i"
            class="group flex items-start gap-2 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
          >
            <template v-if="editingIndex === i">
              <input
                v-model="editingText"
                @keydown.enter="saveEdit"
                @keydown.escape="cancelEdit"
                maxlength="200"
                class="flex-1 px-2 py-1 text-sm bg-transparent border border-indigo-400 rounded-lg outline-none"
                ref="editInput"
              />
              <button @click="saveEdit" class="p-1.5 rounded-lg text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors cursor-pointer">✓</button>
              <button @click="cancelEdit" class="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer">✕</button>
            </template>
            <template v-else>
              <span class="text-xs text-slate-400 mt-1 w-5 shrink-0">{{ i + 1 }}.</span>
              <p class="flex-1 text-sm text-slate-700 dark:text-slate-300 leading-relaxed min-w-0">{{ ch }}</p>
              <div class="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <button @click="startEdit(i)" class="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors cursor-pointer" title="Editar">✏️</button>
                <button @click="remove(i)" class="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer" title="Eliminar">🗑️</button>
              </div>
            </template>
          </div>
        </div>

        <div v-if="store.challenges.length === 0" class="text-center py-8 text-slate-400">
          <p class="text-sm">No hay retos personalizados.</p>
          <button @click="store.resetToDefaults()" class="mt-2 text-sm text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer">
            Cargar retos de ejemplo
          </button>
        </div>
      </div>

      <div class="sticky bottom-0 bg-white dark:bg-slate-800 p-4 border-t border-slate-200 dark:border-slate-700 flex flex-wrap gap-2 justify-between items-center shrink-0">
        <div class="flex gap-2">
          <button @click="store.resetToDefaults()" class="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-xs text-slate-600 dark:text-slate-300 transition-colors cursor-pointer">
            ↺ Restaurar ejemplo
          </button>
          <button @click="showImport = !showImport; importError = ''" class="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-xs text-slate-600 dark:text-slate-300 transition-colors cursor-pointer">
            📥 Importar
          </button>
        </div>
        <button @click="copyExport" class="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-xs text-slate-600 dark:text-slate-300 transition-colors cursor-pointer">
          {{ exportCopied ? '✓ Copiado' : '📤 Exportar' }}
        </button>
      </div>

      <div v-if="showImport" class="border-t border-slate-200 dark:border-slate-700 p-4 space-y-2 shrink-0">
        <p class="text-xs text-slate-500">Pega un array JSON de strings:</p>
        <textarea
          v-model="importText"
          rows="3"
          class="w-full px-3 py-2 text-xs font-mono bg-transparent border border-slate-200 dark:border-slate-600 rounded-xl outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
          placeholder='["Reto 1", "Reto 2", ...]'
        ></textarea>
        <p v-if="importError" class="text-xs text-red-500">{{ importError }}</p>
        <button @click="doImport" :disabled="!importText.trim()" class="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white text-xs font-medium transition-all cursor-pointer disabled:cursor-not-allowed">
          Importar
        </button>
      </div>
    </div>
  </div>
</template>
