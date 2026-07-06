'use client'

import { useCallback, useEffect, useRef } from 'react'

const SCRAMBLE_CHARS = '!@#$%^&*()_+-=[]{}|;:<>?/~`░▒▓█'
const FINAL_TEXT = 'enter'

export default function IntroScreen({
  entered,
  onEnter,
}: {
  entered: boolean
  onEnter: () => void
}) {
  const burstRef = useRef<HTMLCanvasElement>(null)
  const enterTextRef = useRef<HTMLSpanElement>(null)
  const scrambleRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const enteredRef = useRef(false)

  /* ── ascii fill → fade reveal transition ── */
  const doCharFadeReveal = useCallback(() => {
    const burstC = burstRef.current
    if (!burstC) return
    const bCtx = burstC.getContext('2d')
    if (!bCtx) return

    burstC.width = window.innerWidth
    burstC.height = window.innerHeight
    burstC.classList.add('active')

    const W = burstC.width
    const H = burstC.height
    const CELL = 16
    const FILL_CHARS =
      '!@#$%^&*()_+-=[]{}|;:,.<>?/~`░▒▓█0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
    const duration = 1800
    const startTime = performance.now()
    let frameCount = 0

    const grid: {
      x: number
      y: number
      ch: string
      changeTick: number
      fadeStart: number
      fadeEnd: number
    }[] = []
    for (let gy = 0; gy < H + CELL; gy += CELL) {
      for (let gx = 0; gx < W + CELL; gx += CELL) {
        const fadeStart = 0.1 + Math.random() * 0.55
        const fadeDur = 0.15 + Math.random() * 0.25
        grid.push({
          x: gx,
          y: gy,
          ch: FILL_CHARS[Math.floor(Math.random() * FILL_CHARS.length)],
          changeTick: 1 + Math.floor(Math.random() * 3),
          fadeStart,
          fadeEnd: fadeStart + fadeDur,
        })
      }
    }

    function animReveal(now: number) {
      const elapsed = now - startTime
      const rawP = Math.min(elapsed / duration, 1)
      frameCount++

      bCtx!.clearRect(0, 0, W, H)
      const bgAlpha = rawP < 0.5 ? 1 : 1 - (rawP - 0.5) / 0.5
      bCtx!.fillStyle = 'rgba(0,0,0,' + bgAlpha.toFixed(3) + ')'
      bCtx!.fillRect(0, 0, W, H)

      let anyAlive = false
      for (let i = 0; i < grid.length; i++) {
        const gc = grid[i]
        let alpha: number
        if (rawP < gc.fadeStart) alpha = 0.4
        else if (rawP < gc.fadeEnd)
          alpha = 0.4 * (1 - (rawP - gc.fadeStart) / (gc.fadeEnd - gc.fadeStart))
        else alpha = 0

        if (alpha < 0.01) continue
        anyAlive = true

        if (frameCount % gc.changeTick === 0) {
          gc.ch = FILL_CHARS[Math.floor(Math.random() * FILL_CHARS.length)]
        }

        bCtx!.globalAlpha = alpha
        bCtx!.font = CELL + 'px W95FA, Courier New, monospace'
        bCtx!.fillStyle = '#fff'
        bCtx!.fillText(gc.ch, gc.x, gc.y)
      }
      bCtx!.globalAlpha = 1

      if (anyAlive && rawP < 1) requestAnimationFrame(animReveal)
      else burstC!.classList.remove('active')
    }
    requestAnimationFrame(animReveal)
  }, [])

  const triggerEnter = useCallback(() => {
    if (enteredRef.current) return
    enteredRef.current = true
    onEnter()
    doCharFadeReveal()
  }, [doCharFadeReveal, onEnter])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter') triggerEnter()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [triggerEnter])

  /* ── enter text scramble on hover ── */
  const onEnterHover = () => {
    const el = enterTextRef.current
    if (!el) return
    let frame = 0
    const maxFrames = 12
    if (scrambleRef.current) clearInterval(scrambleRef.current)
    scrambleRef.current = setInterval(() => {
      let result = ''
      for (let i = 0; i < FINAL_TEXT.length; i++) {
        if (frame >= maxFrames - 2 || Math.random() < frame / maxFrames) {
          result += FINAL_TEXT[i]
        } else {
          result += SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)]
        }
      }
      el.textContent = result
      frame++
      if (frame >= maxFrames) {
        if (scrambleRef.current) clearInterval(scrambleRef.current)
        el.textContent = FINAL_TEXT
      }
    }, 50)
  }
  const onEnterLeave = () => {
    if (scrambleRef.current) clearInterval(scrambleRef.current)
    if (enterTextRef.current) enterTextRef.current.textContent = FINAL_TEXT
  }

  return (
    <>
      <div id="intro" className={`intro${entered ? '' : ' active'}`}>
        <div className="enter-wrap">
          <img src="/animation.gif" alt="" className="enter-gif" />
          <button
            type="button"
            className="enter-box"
            onMouseEnter={onEnterHover}
            onMouseLeave={onEnterLeave}
            onClick={triggerEnter}
          >
            <span className="enter-text" ref={enterTextRef}>
              enter
            </span>
          </button>
          <p className="enter-hint">
            press enter to continue<span className="blink-cursor">_</span>
          </p>
        </div>
      </div>
      <canvas id="burstCanvas" ref={burstRef} aria-hidden="true" />
    </>
  )
}
