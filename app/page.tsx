'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

/* ────────────────────────────────────────────────
   K2S — web3 operator · portfolio
   design ported from the qurool retro-terminal template
   ──────────────────────────────────────────────── */

const NAV_ITEMS = [
  { s: 1, label: '[ profile ]' },
  { s: 2, label: '[ work ]' },
  { s: 3, label: '[ team feedback ]' },
  { s: 4, label: '[ main skills ]' },
  { s: 5, label: '[ contact me ]' },
]

const WORK = [
  {
    key: 'seismic',
    title: 'seismic',
    img: '/seismic.png',
    lines: ['├─ community leader'],
    details: [
      '├─ community leader position',
      '├─ managing and scaling the community',
      '├─ keeping the ecosystem alive and active',
      '├─ driving engagement and execution',
    ],
  },
  {
    key: 'zama',
    title: 'zama',
    img: '/zama.png',
    lines: ['├─ volunteer moderator'],
    details: [
      '├─ volunteer moderator position',
      '├─ moderating community channels',
      '├─ helping users with questions and issues',
      '├─ keeping discussions healthy and on-topic',
    ],
  },
]

const FEEDBACK = [
  { img: '/seismicteamfeedback.png', name: '> seismic team feedback' },
  { img: '/zamateamfeedback.png', name: '> zama team feedback' },
]

const SKILLS = [
  '├── discord moderation & server ops',
  '├── telegram community management',
  '├── community growth & engagement',
  '├── web3 ecosystem operations',
  '└── building cultures, not just crowds',
]

const SCRAMBLE_CHARS = '!@#$%^&*()_+-=[]{}|;:<>?/~`░▒▓█'
const FINAL_TEXT = 'enter'

export default function Page() {
  const [entered, setEntered] = useState(false)
  const [activeSec, setActiveSec] = useState(1)
  const [modalKey, setModalKey] = useState<string | null>(null)

  const rainRef = useRef<HTMLCanvasElement>(null)
  const burstRef = useRef<HTMLCanvasElement>(null)
  const scrollerRef = useRef<HTMLDivElement>(null)
  const enterTextRef = useRef<HTMLSpanElement>(null)
  const scrambleRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const enteredRef = useRef(false)

  /* ── ascii character rain ── */
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

  /* ── enter trigger ── */
  const triggerEnter = useCallback(() => {
    if (enteredRef.current) return
    enteredRef.current = true
    setEntered(true)
    doCharFadeReveal()
  }, [doCharFadeReveal])

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

  /* ── scroll-driven fade + active nav ── */
  useEffect(() => {
    if (!entered) return
    const scroller = scrollerRef.current
    if (!scroller) return

    function updateFade() {
      const vh = scroller!.clientHeight
      const center = vh * 0.45
      const range = vh * 0.55
      const items = scroller!.querySelectorAll<HTMLElement>('.fade-row')
      for (let i = 0; i < items.length; i++) {
        const el = items[i]
        const r = el.getBoundingClientRect()
        const ey = r.top + r.height / 2
        const dist = Math.abs(ey - center)
        const t = 1 - Math.min(dist / range, 1)
        const fade = 0.08 + t * 0.92
        el.style.setProperty('--fade', fade.toFixed(3))
      }
    }

    function updateActiveNav() {
      const vh = scroller!.clientHeight
      const mid = vh / 2
      let closestIdx = 1
      let closestDist = Infinity
      scroller!.querySelectorAll<HTMLElement>('.sec').forEach((sec) => {
        const r = sec.getBoundingClientRect()
        const secMid = r.top + r.height / 2
        const dist = Math.abs(secMid - mid)
        if (dist < closestDist) {
          closestDist = dist
          closestIdx = Number(sec.dataset.idx)
        }
      })
      setActiveSec(closestIdx)
    }

    let ticking = false
    function onScroll() {
      if (!ticking) {
        ticking = true
        requestAnimationFrame(() => {
          updateFade()
          updateActiveNav()
          ticking = false
        })
      }
    }

    updateFade()
    scroller.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      scroller.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [entered])

  const scrollToSec = (s: number) => {
    const sec = document.getElementById('sec' + s)
    if (sec) sec.scrollIntoView({ behavior: 'smooth' })
  }

  const activeDetail = WORK.find((w) => w.key === modalKey)

  return (
    <main>
      <canvas id="pixelRain" ref={rainRef} aria-hidden="true" />

      {/* ═══ INTRO — ENTER SCREEN ═══ */}
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

      {/* ═══ PORTFOLIO ═══ */}
      <div id="portfolio" className={`portfolio${entered ? ' show' : ''}`}>
        <nav className="sidenav" aria-label="section navigation">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.s}
              type="button"
              className={`nav-link${activeSec === item.s ? ' active' : ''}`}
              onClick={() => scrollToSec(item.s)}
            >
              <span className="nav-label">{item.label}</span>
              <span className="nav-pip">{activeSec === item.s ? '■' : '□'}</span>
            </button>
          ))}
        </nav>

        <div className="scroller" ref={scrollerRef}>
          {/* 1 — profile */}
          <section className="sec" id="sec1" data-idx="1">
            <div className="sec-inner">
              <pre className="ascii-header fade-row">{`┌──────────────────────────────────┐
│  PROFILE  //  k2s                │
└──────────────────────────────────┘`}</pre>
              <div className="profile-head fade-row">
                <img src="/k2s.png" alt="k2s avatar" className="profile-av" />
                <div>
                  <h1 className="profile-name">k2s</h1>
                  <p className="profile-role">web3 operator</p>
                  <p className="profile-status">
                    <span className="status-dot" />
                    available now
                  </p>
                </div>
              </div>
              <ul className="stats">
                <li className="stat-row fade-row">
                  <span className="stat-sep">::</span>
                  <span className="stat-txt">community manager</span>
                </li>
                <li className="stat-row fade-row">
                  <span className="stat-sep">::</span>
                  <span className="stat-txt">discord mod</span>
                </li>
                <li className="stat-row fade-row">
                  <span className="stat-sep">::</span>
                  <span className="stat-txt">telegram ops</span>
                </li>
              </ul>
              <pre className="ascii-footer fade-row">
                ════════════════════════════════════
              </pre>
            </div>
          </section>

          {/* 2 — work */}
          <section className="sec" id="sec2" data-idx="2">
            <div className="sec-inner">
              <pre className="ascii-header fade-row">{`┌──────────────────────────────────┐
│  WORK  //  registry              │
└──────────────────────────────────┘`}</pre>
              <div className="cards-grid">
                {WORK.map((w) => (
                  <div key={w.key} className="card fade-row">
                    <div className="card-img-wrap">
                      <img src={w.img} alt={w.title} className="card-img" />
                    </div>
                    <div className="card-content">
                      <h3 className="card-title">{w.title}</h3>
                      {w.lines.map((line) => (
                        <p key={line} className="card-line">
                          {line}
                        </p>
                      ))}
                      <button
                        type="button"
                        className="card-details-btn"
                        onClick={() => setModalKey(w.key)}
                      >
                        [ all details ]
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* 3 — team feedback */}
          <section className="sec" id="sec3" data-idx="3">
            <div className="sec-inner">
              <pre className="ascii-header fade-row">{`┌──────────────────────────────────┐
│  TEAM FEEDBACK  //  receipts     │
└──────────────────────────────────┘`}</pre>
              <div className="products-grid">
                {FEEDBACK.map((f) => (
                  <div key={f.img} className="product-card fade-row">
                    <div className="product-img-wrap">
                      <img src={f.img} alt={f.name} className="product-img" />
                    </div>
                    <p className="product-name">{f.name}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* 4 — main skills */}
          <section className="sec" id="sec4" data-idx="4">
            <div className="sec-inner">
              <pre className="ascii-header fade-row">{`┌──────────────────────────────────┐
│  MAIN SKILLS  //  capabilities   │
└──────────────────────────────────┘`}</pre>
              <ul className="skills-list">
                {SKILLS.map((s) => (
                  <li key={s} className="skill-row fade-row">
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* 5 — contact */}
          <section className="sec" id="sec5" data-idx="5">
            <div className="sec-inner">
              <pre className="ascii-header fade-row">{`┌──────────────────────────────────┐
│  CONTACT ME  //  channels        │
└──────────────────────────────────┘`}</pre>
              <div className="contact-block fade-row">
                <p className="contact-row">
                  <span className="ct-prompt">{'>'}</span>
                  <a
                    href="https://x.com/k2sbhai"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="clink"
                  >
                    x
                  </a>
                  <span className="sep">/</span>
                  <a
                    href="https://t.me/k2sbhai"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="clink"
                  >
                    telegram
                  </a>
                  <span className="sep">/</span>
                  <a
                    href="https://github.com/k2s1"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="clink"
                  >
                    github
                  </a>
                </p>
              </div>
              <p className="contact-note fade-row">
                available for community operations, moderation roles, and web3
                project collaborations. reach out directly — i respond fast.
              </p>
              <pre className="ascii-footer fade-row">
                ════════════════════════════════════
              </pre>
            </div>
          </section>
        </div>
      </div>

      {/* ═══ DETAIL MODAL ═══ */}
      <div
        className={`modal-overlay${modalKey ? ' open' : ''}`}
        onClick={(e) => {
          if (e.target === e.currentTarget) setModalKey(null)
        }}
        role="dialog"
        aria-modal="true"
        aria-hidden={!modalKey}
      >
        <div className="modal-box">
          <button
            type="button"
            className="modal-close"
            onClick={() => setModalKey(null)}
          >
            [ x ]
          </button>
          {activeDetail && (
            <>
              <pre className="modal-header-art">{`┌────────────────────────────────┐
│  ${activeDetail.title.padEnd(30)}│
└────────────────────────────────┘`}</pre>
              {activeDetail.details.map((d) => (
                <p key={d} className="modal-text">
                  {d}
                </p>
              ))}
            </>
          )}
        </div>
      </div>
    </main>
  )
}
