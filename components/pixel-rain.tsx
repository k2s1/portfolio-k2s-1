'use client'

import { useEffect, useRef } from 'react'

export default function PixelRain() {
  const rainRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const rain = rainRef.current
    if (!rain) return
    const rCtx = rain.getContext('2d')
    if (!rCtx) return

    const CHARSET =
      '!@#$%^&*()_+-=[]{}|;:,.<>?/~`0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz\\\'"'
    const CHAR_COUNT = 350
    let chars: {
      x: number
      y: number
      ch: string
      sz: number
      a: number
      ta: number
      sp: number
      cd: number
      rc: number
    }[] = []
    let raf = 0

    function sizeRain() {
      rain!.width = window.innerWidth
      rain!.height = window.innerHeight
    }
    function seedChars() {
      chars = []
      for (let i = 0; i < CHAR_COUNT; i++) {
        chars.push({
          x: Math.random() * rain!.width,
          y: Math.random() * rain!.height,
          ch: CHARSET[Math.floor(Math.random() * CHARSET.length)],
          sz: 10 + Math.floor(Math.random() * 14),
          a: Math.random(),
          ta: Math.random(),
          sp: 0.01 + Math.random() * 0.03,
          cd: (Math.random() * 60) | 0,
          rc: (Math.random() * 200) | 0,
        })
      }
    }
    function loopRain() {
      rCtx!.clearRect(0, 0, rain!.width, rain!.height)
      for (let i = 0; i < chars.length; i++) {
        const c = chars[i]
        if (Math.abs(c.a - c.ta) < 0.02) {
          if (c.cd > 0) c.cd--
          else {
            c.ta = Math.random()
            c.cd = (Math.random() * 60) | 0
          }
        }
        c.a += (c.ta - c.a) * c.sp
        c.rc--
        if (c.rc <= 0) {
          c.ch = CHARSET[Math.floor(Math.random() * CHARSET.length)]
          c.rc = (80 + Math.random() * 200) | 0
        }
        rCtx!.font = c.sz + 'px W95FA, Courier New, monospace'
        rCtx!.fillStyle = 'rgba(255,255,255,' + c.a.toFixed(3) + ')'
        rCtx!.fillText(c.ch, c.x | 0, c.y | 0)
      }
      raf = requestAnimationFrame(loopRain)
    }
    const onResize = () => {
      sizeRain()
      seedChars()
    }
    sizeRain()
    seedChars()
    loopRain()
    window.addEventListener('resize', onResize)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return <canvas id="pixelRain" ref={rainRef} aria-hidden="true" />
}
