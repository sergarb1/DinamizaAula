<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { Student } from '../../types/student'
import { pickRandomIndex, getAllStats } from '../../strategies/utils'
import { playTickSound } from '../../utils/sounds'

import type { Participation } from '../../types/history'

const props = defineProps<{
  students: Student[]
  strategyId?: string
  history?: Participation[]
}>()

const emit = defineEmits<{
  (e: 'select', student: Student): void
  (e: 'start'): void
  (e: 'end'): void
}>()

const containerRef = ref<HTMLDivElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)

const size = ref(400)
let animFrameId: number | null = null
let resizeObs: ResizeObserver | null = null
let darkObs: MutationObserver | null = null
let angularVelocity = 0
let targetAngle = 0
let decelerating = false
let lastSectorIndex = -1
let spinStartTime = 0
let currentRotation = 0

const spinning = ref(false)
const isDark = ref(false)

const weights = computed(() => {
  if (props.students.length === 0) return []
  const stats = getAllStats(props.history || [], props.students)
  const now = Date.now()
  return props.students.map(s => {
    const st = stats.get(s.id)!
    if (st.totalParticipations === 0) return 10
    const hoursSinceLast = st.lastParticipation ? (now - st.lastParticipation) / 3600000 : 999
    return Math.max(0.3, Math.min(10, hoursSinceLast / 2 + 1 / (st.totalParticipations + 1) * 3))
  })
})

onMounted(() => {
  if (containerRef.value) {
    const w = containerRef.value.clientWidth
    size.value = Math.max(280, Math.min(w, 500))
  }
  resizeObs = new ResizeObserver((entries) => {
    for (const e of entries) {
      const w = e.contentRect.width
      size.value = Math.max(280, Math.min(w, 500))
    }
  })
  if (containerRef.value) resizeObs.observe(containerRef.value)

  const checkDark = () => {
    isDark.value = document.documentElement.classList.contains('dark')
  }
  checkDark()
  darkObs = new MutationObserver(checkDark)
  darkObs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })

  drawWheel(0)
})

const cx = computed(() => size.value / 2)
const cy = computed(() => size.value / 2)
const radius = computed(() => size.value / 2 - 22)

const totalWeight = computed(() => weights.value.reduce((a, b) => a + b, 0))

const sectors = computed(() => {
  const total = totalWeight.value
  let startAngle = 0
  return props.students.map((s, i) => {
    const weight = weights.value[i] || 1
    const angle = (weight / total) * Math.PI * 2
    const sector = {
      student: s,
      weight,
      startAngle,
      endAngle: startAngle + angle,
      color: s.color || '#6366f1',
    }
    startAngle += angle
    return sector
  })
})

function getTextColor(bgColor: string): string {
  const hex = bgColor.replace('#', '')
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.55 ? '#1e293b' : '#ffffff'
}

function drawWheel(rotation: number) {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const dpr = window.devicePixelRatio || 1
  canvas.width = size.value * dpr
  canvas.height = size.value * dpr
  ctx.scale(dpr, dpr)

  ctx.clearRect(0, 0, size.value, size.value)

  const gradient = ctx.createRadialGradient(cx.value, cy.value, 0, cx.value, cy.value, radius.value)
  gradient.addColorStop(0, isDark.value ? '#1e293b' : '#f8fafc')
  gradient.addColorStop(1, isDark.value ? '#0f172a' : '#e2e8f0')
  ctx.fillStyle = gradient
  ctx.beginPath()
  ctx.arc(cx.value, cy.value, radius.value + 6, 0, Math.PI * 2)
  ctx.fill()

  ctx.save()
  ctx.translate(cx.value, cy.value)
  ctx.rotate(rotation)

  for (const sector of sectors.value) {
    const midAngle = sector.startAngle + (sector.endAngle - sector.startAngle) / 2

    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.arc(0, 0, radius.value, sector.startAngle, sector.endAngle)
    ctx.closePath()

    const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, radius.value)
    grad.addColorStop(0, lightenColor(sector.color, 30))
    grad.addColorStop(1, sector.color)
    ctx.fillStyle = grad
    ctx.fill()

    ctx.strokeStyle = 'rgba(255,255,255,0.35)'
    ctx.lineWidth = 1.5
    ctx.stroke()

    const textRadius = radius.value * 0.75
    const tx = Math.cos(midAngle) * textRadius
    const ty = Math.sin(midAngle) * textRadius

    ctx.save()
    ctx.translate(tx, ty)
    ctx.rotate(midAngle + Math.PI / 2)

    const fontSize = Math.max(13, Math.min(22, (sector.endAngle - sector.startAngle) * radius.value * 0.055))
    ctx.fillStyle = getTextColor(sector.color)
    ctx.font = `700 ${fontSize}px Outfit, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    const label = sector.student.name.length > 8 ? sector.student.name.substring(0, 8) + '…' : sector.student.name
    ctx.shadowColor = 'rgba(0,0,0,0.2)'
    ctx.shadowBlur = 2
    ctx.fillText(label, 0, 0)
    ctx.shadowBlur = 0
    ctx.restore()
  }

  ctx.restore()

  ctx.save()
  const grd = ctx.createRadialGradient(cx.value, cy.value, 0, cx.value, cy.value, 22)
  grd.addColorStop(0, '#fff')
  grd.addColorStop(1, isDark.value ? '#334155' : '#cbd5e1')
  ctx.beginPath()
  ctx.arc(cx.value, cy.value, 22, 0, Math.PI * 2)
  ctx.fillStyle = grd
  ctx.fill()
  ctx.strokeStyle = isDark.value ? '#475569' : '#94a3b8'
  ctx.lineWidth = 3
  ctx.stroke()
  ctx.restore()

  const top = cy.value - radius.value - 6
  ctx.save()
  ctx.translate(cx.value, top)
  ctx.fillStyle = '#ef4444'
  ctx.shadowColor = 'rgba(220,38,38,0.6)'
  ctx.shadowBlur = 10

  ctx.beginPath()
  ctx.moveTo(-14, 0)
  ctx.lineTo(14, 0)
  ctx.lineTo(0, 22)
  ctx.closePath()
  ctx.fill()
  ctx.shadowBlur = 0
  ctx.restore()
}

function lightenColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16)
  const r = Math.min(255, (num >> 16) + percent)
  const g = Math.min(255, ((num >> 8) & 0x00ff) + percent)
  const b = Math.min(255, (num & 0x0000ff) + percent)
  return `rgb(${r},${g},${b})`
}

function animate() {
  const elapsed = Date.now() - spinStartTime
  if (!decelerating && angularVelocity > 0) {
    const slowdown = Math.max(0.97, 1 - elapsed / 20000)
    angularVelocity *= slowdown
    if (angularVelocity < 0.02) {
      angularVelocity = 0
      decelerating = true
    }
  }

  currentRotation += angularVelocity

  const currentSector = getSectorAtPointer()
  if (currentSector !== lastSectorIndex && angularVelocity > 0.05) {
    lastSectorIndex = currentSector
    playTickSound()
  }

  if (decelerating) {
    const diff = targetAngle - currentRotation
    if (Math.abs(diff) < 0.003) {
      currentRotation = targetAngle
      drawWheel(currentRotation)

      const winnerIdx = getSectorAtPointer()
      if (winnerIdx >= 0 && winnerIdx < props.students.length) {
        spinning.value = false
        emit('select', props.students[winnerIdx])
        emit('end')
      }
      return
    }
    currentRotation += diff * 0.06
  }

  drawWheel(currentRotation)
  animFrameId = requestAnimationFrame(animate)
}

function getSectorAtPointer(): number {
  const normalized = (((-currentRotation - Math.PI / 2) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)
  for (let i = 0; i < sectors.value.length; i++) {
    const s = sectors.value[i]
    if (normalized >= s.startAngle && normalized < s.endAngle) {
      return i
    }
  }
  return sectors.value.length - 1
}

function spin() {
  if (spinning.value || props.students.length < 2) return
  spinning.value = true
  emit('start')

  const idx = pickRandomIndex(weights.value)
  const sector = sectors.value[idx]
  const sectorCenter = (sector.startAngle + sector.endAngle) / 2
  const randomOffset = (Math.random() - 0.5) * (sector.endAngle - sector.startAngle) * 0.6
  const finalAngle = sectorCenter + randomOffset

  const fullSpins = 6 + Math.floor(Math.random() * 4)
  const currentNorm = ((currentRotation % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)
  let targetNorm = -Math.PI / 2 - finalAngle
  while (targetNorm < 0) targetNorm += Math.PI * 2

  targetAngle = currentRotation + fullSpins * Math.PI * 2 + (targetNorm - currentNorm)
  angularVelocity = 0.35 + Math.random() * 0.12
  decelerating = false
  lastSectorIndex = -1
  spinStartTime = Date.now()
  animate()
}

onUnmounted(() => {
  if (animFrameId) cancelAnimationFrame(animFrameId)
  resizeObs?.disconnect()
  darkObs?.disconnect()
})

defineExpose({ spin })
</script>

<template>
  <div ref="containerRef" class="w-full flex flex-col items-center gap-4">
    <template v-if="students.length < 2">
      <div class="text-sm text-amber-600 dark:text-amber-400 py-8">{{ $t('mechanicComponents.needTwoStudents') }}</div>
    </template>
    <template v-else>
    <canvas
      ref="canvasRef"
      :style="{ width: size + 'px', height: size + 'px' }"
      class="max-w-full h-auto cursor-pointer"
      @click="spin"
    />
    <button
      @click="spin"
      :disabled="spinning"
      class="px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white font-medium shadow-md transition-all cursor-pointer disabled:cursor-not-allowed text-base"
    >
      {{ spinning ? $t('mechanicComponents.spinning') : $t('mechanicComponents.spin') }}
    </button>
    </template>
  </div>
</template>
