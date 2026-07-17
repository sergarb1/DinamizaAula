<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStudentStore } from '../stores/students'
import type { Student } from '../types/student'

const { t } = useI18n()
const studentStore = useStudentStore()

const showForm = ref(false)
const editingId = ref<string | null>(null)
const form = ref({ name: '', surname: '', color: '#6366f1', group: '', active: true })

function resetForm() {
  form.value = { name: '', surname: '', color: '#6366f1', group: '', active: true }
  editingId.value = null
  submitted.value = false
}

function editStudent(s: Student) {
  form.value = { name: s.name, surname: s.surname, color: s.color, group: s.group, active: s.active }
  editingId.value = s.id
  showForm.value = true
}

const submitted = ref(false)

function save() {
  submitted.value = true
  if (!form.value.name.trim()) return
  if (editingId.value) {
    studentStore.updateStudent(editingId.value, { ...form.value })
  } else {
    studentStore.addStudent({ ...form.value })
  }
  resetForm()
  showForm.value = false
}

function cancel() {
  resetForm()
  showForm.value = false
}

function handleImport(event: Event) {
  const input = event.target as HTMLInputElement
  if (!input.files?.length) return
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target?.result as string)
      studentStore.importData(data)
    } catch { alert(t('students.importError')) }
  }
  reader.readAsText(input.files[0])
  input.value = ''
}

function handleExport() {
  const data = studentStore.exportData()
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${data.course || 'alumnos'}.json`
  a.click()
  URL.revokeObjectURL(url)
}

const showExamples = ref(false)

function confirmDelete(s: Student) {
  if (confirm(t('students.confirmDelete', { name: s.name, surname: s.surname }))) {
    studentStore.removeStudent(s.id)
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold font-outfit">{{ $t('students.title') }}</h2>
        <p class="text-slate-500 dark:text-slate-400 text-sm">
          {{ $t('students.subtitle', { total: studentStore.students.length, active: studentStore.activeStudents.length }) }}
        </p>
      </div>
      <div class="flex gap-2 flex-wrap justify-end">
        <button @click="showForm = true; resetForm()" class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium shadow-sm transition-all cursor-pointer">
          {{ $t('students.add') }}
        </button>
        <button @click="showExamples = !showExamples" class="px-4 py-2 rounded-xl bg-violet-100 dark:bg-violet-900/40 hover:bg-violet-200 dark:hover:bg-violet-900/60 text-sm font-medium shadow-sm transition-all cursor-pointer text-violet-700 dark:text-violet-300">
          {{ $t('students.examples') }}
        </button>
        <label class="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-sm font-medium shadow-sm transition-all cursor-pointer text-slate-700 dark:text-slate-300">
          {{ $t('students.import') }}
          <input type="file" accept=".json" class="hidden" @change="handleImport" />
        </label>
        <button @click="handleExport" class="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-sm font-medium shadow-sm transition-all cursor-pointer text-slate-700 dark:text-slate-300">
          {{ $t('students.export') }}
        </button>
      </div>
    </div>

    <div v-if="showExamples" class="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
      <h3 class="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-3">{{ $t('students.examplesTitle') }}</h3>
      <p class="text-xs text-slate-500 mb-4">{{ $t('students.examplesDesc') }}</p>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="(ex, i) in studentStore.examples"
          :key="i"
          @click="studentStore.loadExample(i); showExamples = false"
          class="px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/50 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 border border-slate-200 dark:border-slate-700 text-left transition-all cursor-pointer"
        >
          <p class="font-medium text-sm text-slate-800 dark:text-slate-100">{{ ex.course }}</p>
          <p class="text-xs text-slate-500">{{ $t('students.studentsCount', { count: ex.students.length }) }}</p>
        </button>
      </div>
    </div>

    <div v-if="showForm" class="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
      <h3 class="text-lg font-semibold mb-4">{{ editingId ? $t('students.editStudent') : $t('students.newStudent') }}</h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1" for="student-name">{{ $t('students.name') }}</label>
          <input
            id="student-name"
            v-model="form.name"
            type="text"
            :placeholder="$t('students.namePlaceholder')"
            maxlength="50"
            :aria-invalid="submitted && !form.name.trim()"
            :aria-describedby="submitted && !form.name.trim() ? 'name-error' : undefined"
            class="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
          />
          <p v-if="submitted && !form.name.trim()" id="name-error" class="text-xs text-red-500 mt-1">{{ $t('students.nameRequired') }}</p>
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">{{ $t('students.surname') }}</label>
          <input v-model="form.surname" type="text" :placeholder="$t('students.surnamePlaceholder')" maxlength="100" class="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none" />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">{{ $t('students.color') }}</label>
          <input v-model="form.color" type="color" class="w-full h-10 rounded-xl border border-slate-300 dark:border-slate-600 cursor-pointer" />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">{{ $t('students.group') }}</label>
          <input v-model="form.group" type="text" :placeholder="$t('students.groupPlaceholder')" maxlength="50" class="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none" />
        </div>
      </div>
      <div class="flex items-center gap-2 mt-4">
        <label class="flex items-center gap-2 cursor-pointer">
          <input v-model="form.active" type="checkbox" class="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
          <span class="text-sm text-slate-600 dark:text-slate-400">{{ $t('students.active') }}</span>
        </label>
      </div>
      <div class="flex gap-2 mt-4">
        <button @click="save" class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-all cursor-pointer">
          {{ editingId ? $t('students.save') : $t('students.addBtn') }}
        </button>
        <button @click="cancel" class="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-sm font-medium transition-all cursor-pointer text-slate-700 dark:text-slate-300">
          {{ $t('students.cancel') }}
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="s in studentStore.students"
        :key="s.id"
        class="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all"
        :class="{ 'opacity-50': !s.active }"
      >
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0"
            :style="{ backgroundColor: s.color || '#6366f1' }"
          >
            {{ s.name.charAt(0).toUpperCase() }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="font-semibold text-slate-800 dark:text-slate-100 truncate">{{ s.name }} {{ s.surname }}</p>
            <p class="text-xs text-slate-500 dark:text-slate-400 truncate">{{ s.group || $t('students.noGroup') }}</p>
          </div>
          <div class="flex gap-1">
            <button @click="editStudent(s)" class="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer text-slate-400 hover:text-indigo-600" :title="$t('students.edit')">
              ✏️
            </button>
            <button @click="confirmDelete(s)" class="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer text-slate-400 hover:text-red-600" :title="$t('students.delete')">
              🗑️
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="studentStore.students.length === 0" class="text-center py-12 space-y-4">
      <div class="text-6xl mb-4">👨‍🎓</div>
      <p class="text-xl font-semibold text-slate-600 dark:text-slate-300">{{ $t('students.emptyTitle') }}</p>
      <p class="text-sm text-slate-400">{{ $t('students.emptyDesc') }}</p>
      <div class="flex flex-wrap justify-center gap-3 pt-2">
        <button
          v-for="(ex, i) in studentStore.examples"
          :key="i"
          @click="studentStore.loadExample(i)"
          class="px-5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-sm font-medium text-slate-700 dark:text-slate-300 shadow-sm transition-all cursor-pointer"
        >
          📋 {{ ex.course }}
        </button>
      </div>
    </div>
  </div>
</template>
