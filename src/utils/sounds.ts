const audioCtx = typeof AudioContext !== 'undefined' ? new AudioContext() : null

export function playTickSound() {
  if (!audioCtx) return
  const osc = audioCtx.createOscillator()
  const gain = audioCtx.createGain()
  osc.connect(gain)
  gain.connect(audioCtx.destination)
  osc.frequency.value = 800 + Math.random() * 400
  osc.type = 'sine'
  gain.gain.setValueAtTime(0.08, audioCtx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05)
  osc.start()
  osc.stop(audioCtx.currentTime + 0.05)
}

export function playWinSound() {
  if (!audioCtx) return
  const notes = [523, 659, 784]
  notes.forEach((freq, i) => {
    const osc = audioCtx.createOscillator()
    const gain = audioCtx.createGain()
    osc.connect(gain)
    gain.connect(audioCtx.destination)
    osc.frequency.value = freq
    osc.type = 'sine'
    const t = audioCtx.currentTime + i * 0.12
    gain.gain.setValueAtTime(0.1, t)
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3)
    osc.start(t)
    osc.stop(t + 0.3)
  })
}
