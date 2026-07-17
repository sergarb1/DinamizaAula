import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Student, StudentData } from '../types/student'
import { exampleData } from '../utils/examples'
import { useChallengeStore } from './challenges'

const STORAGE_KEY = 'dinamiza-aula:students'

export const useStudentStore = defineStore('students', () => {
  const students = ref<Student[]>([])

  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) {
    try {
      const parsed = JSON.parse(stored)
      if (Array.isArray(parsed) && parsed.length > 0) {
        students.value = parsed
      }
    } catch { /* ignore */ }
  }

  function persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(students.value))
  }

  const activeStudents = computed(() => students.value.filter(s => s.active))

  const courseLabel = computed(() => {
    const groups = new Set(students.value.map(s => s.group).filter(Boolean))
    return groups.size === 1 ? [...groups][0] : ''
  })

  function addStudent(student: Omit<Student, 'id'>) {
    students.value.push({ ...student, id: crypto.randomUUID() })
    persist()
  }

  function updateStudent(id: string, data: Partial<Student>) {
    const idx = students.value.findIndex(s => s.id === id)
    if (idx !== -1) {
      Object.assign(students.value[idx], data)
      persist()
    }
  }

  function removeStudent(id: string) {
    students.value = students.value.filter(s => s.id !== id)
    persist()
  }

  function importData(data: StudentData) {
    students.value = data.students.map(s => ({ ...s, id: s.id || crypto.randomUUID() }))
    if (data.challenges) {
      const challengeStore = useChallengeStore()
      challengeStore.challenges.splice(0, challengeStore.challenges.length, ...data.challenges)
    }
    persist()
  }

  function exportData(): StudentData {
    const challengeStore = useChallengeStore()
    return {
      course: courseLabel.value,
      students: JSON.parse(JSON.stringify(students.value)),
      challenges: [...challengeStore.challenges],
    }
  }

  function loadExample(index: number) {
    if (index >= 0 && index < exampleData.length) {
      students.value = exampleData[index].students.map(s => ({
        ...s,
        id: crypto.randomUUID(),
      }))
      persist()
    }
  }

  function clearAll() {
    students.value = []
    persist()
  }

  return {
    students,
    activeStudents,
    courseLabel,
    addStudent,
    updateStudent,
    removeStudent,
    importData,
    exportData,
    loadExample,
    clearAll,
    examples: exampleData,
  }
})
