import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

const DEFAULT_CHALLENGES: string[] = [
  'Resuelve esta ecuación: 3x + 7 = 22',
  '¿Cuál es la capital de Francia y tres datos sobre ella?',
  'Nombra tres verbos irregulares en inglés y conjúgalos',
  'Explica el ciclo del agua con tus palabras',
  '¿Qué significa la fotosíntesis? Exprésalo con tus palabras',
  'Traduce esta frase al inglés: "Me gusta aprender cosas nuevas"',
  '¿Cuál es el resultado de 15 × 8? Explica cómo lo has calculado',
  'Di dos sinónimos y dos antónimos de la palabra "grande"',
  '¿En qué año comenzó la Segunda Guerra Mundial? Explica brevemente',
  'Nombra tres países de Sudamérica y sus capitales',
  'Explica qué es un ecosistema y pon un ejemplo',
  '¿Cuál es tu libro favorito? Cuéntanos de qué trata',
  'Define qué es un sustantivo y pon tres ejemplos',
  '¿Cuánto es 25% de 200? Explica el cálculo',
  'Canta una canción',
  'Haz una pregunta interesante a un compañero',
  'Di algo que hayas aprendido hoy en clase',
  '¿Qué harías si fueras profesor por un día?',
  'Explica con una metáfora qué es la gravedad',
  'Nombra los planetas del sistema solar en orden',
  '¿Qué es un número primo? Di tres ejemplos',
  'Describe tu animal favorito en tres frases',
  'Siéntate recto y respira hondo: explica cómo te sientes',
  'Improvisa un microrrelato que incluya "dragón", "libro" y "secreto"',
]

const STORAGE_KEY = 'dinamiza-aula:challenges'

function load(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch { }
  return [...DEFAULT_CHALLENGES]
}

function save(data: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export const useChallengeStore = defineStore('challenges', () => {
  const challenges = ref<string[]>(load())

  watch(challenges, (val) => save(val), { deep: true })

  function add(text: string) {
    if (!text.trim()) return
    challenges.value.push(text.trim())
  }

  function update(index: number, text: string) {
    if (index < 0 || index >= challenges.value.length) return
    challenges.value[index] = text.trim()
  }

  function remove(index: number) {
    if (index < 0 || index >= challenges.value.length) return
    challenges.value.splice(index, 1)
  }

  function resetToDefaults() {
    challenges.value = [...DEFAULT_CHALLENGES]
  }

  function random(): string {
    if (challenges.value.length === 0) return ''
    return challenges.value[Math.floor(Math.random() * challenges.value.length)]
  }

  function exportJson(): string {
    return JSON.stringify(challenges.value, null, 2)
  }

  function importJson(json: string): boolean {
    try {
      const data = JSON.parse(json)
      if (!Array.isArray(data) || data.length === 0) return false
      challenges.value = data.map(String)
      return true
    } catch { return false }
  }

  return { challenges, add, update, remove, resetToDefaults, random, exportJson, importJson }
})
