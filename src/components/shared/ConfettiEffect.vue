<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'

const props = defineProps<{
  active: boolean
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  color: string
  size: number
  rotation: number
  rotationSpeed: number
  opacity: number
}

let particles: Particle[] = []
let animFrameId: number | null = null
let w = 0
let h = 0

const colors = ['#6366f1', '#ec4899', '#14b8a6', '#f97316', '#8b5cf6', '#06b6d4', '#84cc16', '#e11d48', '#f59e0b', '#10b981']

function resize() {
  w = window.innerWidth
  h = window.innerHeight
  const canvas = canvasRef.value
  if (!canvas) return
  const dpr = window.devicePixelRatio || 1
  canvas.width = w * dpr
  canvas.height = h * dpr
  canvas.style.width = w + 'px'
  canvas.style.height = h + 'px'
}

function createParticles() {
  particles = []
  for (let i = 0; i < 100; i++) {
    particles.push({
      x: w / 2 + (Math.random() - 0.5) * 120,
      y: h / 2 - 50,
      vx: (Math.random() - 0.5) * 14,
      vy: -Math.random() * 16 - 3,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 6 + Math.random() * 8,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.3,
      opacity: 1,
    })
  }
}

function animateConfetti() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const dpr = window.devicePixelRatio || 1
  ctx.clearRect(0, 0, w * dpr, h * dpr)

  let alive = false
  for (const p of particles) {
    p.x += p.vx
    p.y += p.vy
    p.vy += 0.28
    p.rotation += p.rotationSpeed
    p.opacity -= 0.006

    if (p.opacity > 0) {
      alive = true
      ctx.save()
      ctx.translate(p.x * dpr, p.y * dpr)
      ctx.rotate(p.rotation)
      ctx.globalAlpha = Math.max(0, p.opacity)
      ctx.fillStyle = p.color
      ctx.fillRect(-p.size * dpr / 2, -p.size * dpr / 4, p.size * dpr, p.size * dpr / 2)
      ctx.restore()
    }
  }

  if (alive) {
    animFrameId = requestAnimationFrame(animateConfetti)
  }
}

function startConfetti() {
  resize()
  createParticles()
  animateConfetti()
}

watch(() => props.active, (val) => {
  if (val && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) startConfetti()
})

onMounted(() => {
  window.addEventListener('resize', resize)
})

onUnmounted(() => {
  window.removeEventListener('resize', resize)
  if (animFrameId) cancelAnimationFrame(animFrameId)
})
</script>

<template>
  <canvas
    ref="canvasRef"
    class="fixed inset-0 pointer-events-none z-50"
    :class="{ 'hidden': !active }"
  />
</template>
