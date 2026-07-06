'use client'

import { useEffect, useRef, useState } from 'react'
import PixelRain from '@/components/pixel-rain'
import IntroScreen from '@/components/intro-screen'
import FeedbackGallery from '@/components/feedback-gallery'
import FeaturedPosts from '@/components/featured-posts'
import ContactSection from '@/components/contact-section'
import VisitorCounter from '@/components/visitor-counter'

/* ────────────────────────────────────────────────
   K2S Bhai — web3 community operator · portfolio
   premium retro-terminal edition
   ──────────────────────────────────────────────── */

const NAV_ITEMS = [
  { s: 1, label: '[ profile ]' },
  { s: 2, label: '[ work ]' },
  { s: 3, label: '[ team feedback ]' },
  { s: 4, label: '[ featured posts ]' },
  { s: 5, label: '[ main skills ]' },
  { s: 6, label: '[ contact me ]' },
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

const SKILLS = [
  { name: 'discord moderation & server ops', level: 10 },
  { name: 'telegram community management', level: 10 },
  { name: 'community growth & engagement', level: 9 },
  { name: 'partnerships & collabs', level: 8 },
  { name: 'web3 ecosystem operations', level: 9 },
]

const TAGLINE = 'builds communities. drives engagement.'

export default function Page() {
  const [entered, setEntered] = useState(false)
  const [activeSec, setActiveSec] = useState(1)
  const [modalKey, setModalKey] = useState<string | null>(null)
  const [typed, setTyped] = useState('')

  const scrollerRef = useRef<HTMLDivElement>(null)

  /* ── typewriter tagline after entering ── */
  useEffect(() => {
    if (!entered) return
    let i = 0
    const t = setInterval(() => {
      i++
      setTyped(TAGLINE.slice(0, i))
      if (i >= TAGLINE.length) clearInterval(t)
    }, 42)
    return () => clearInterval(t)
  }, [entered])

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
      <PixelRain />

      <IntroScreen entered={entered} onEnter={() => setEntered(true)} />

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
          {/* 1 — profile / hero */}
          <section className="sec" id="sec1" data-idx="1">
            <div className="sec-inner">
              <pre className="ascii-header fade-row">{`┌──────────────────────────────────┐
│  PROFILE  //  k2s bhai           │
└──────────────────────────────────┘`}</pre>
              <div className="profile-head fade-row">
                <img src="/k2s.png" alt="k2s bhai avatar" className="profile-av" />
                <div>
                  <h1 className="profile-name">k2s bhai</h1>
                  <p className="profile-tagline" aria-label={TAGLINE}>
                    {typed}
                    <span className="blink-cursor">_</span>
                  </p>
                  <p className="profile-status">
                    <span className="status-dot" />
                    available for hire
                  </p>
                </div>
              </div>
              <p className="hero-bio fade-row text-pretty">
                helping web3 projects grow through community management,
                moderation, partnerships, and strategic execution — turning
                communities into active ecosystems.
              </p>
              <div className="hero-ctas fade-row">
                <button type="button" className="hero-btn hero-btn-primary" onClick={() => scrollToSec(2)}>
                  [ view work ]
                </button>
                <button type="button" className="hero-btn" onClick={() => scrollToSec(6)}>
                  [ contact me ]
                </button>
              </div>
              <VisitorCounter variant="block" />
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
                      <img src={w.img || '/placeholder.svg'} alt={w.title} className="card-img" />
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
              <FeedbackGallery />
            </div>
          </section>

          {/* 4 — featured posts */}
          <section className="sec" id="sec4" data-idx="4">
            <div className="sec-inner">
              <pre className="ascii-header fade-row">{`┌──────────────────────────────────┐
│  FEATURED POSTS  //  on x        │
└──────────────────────────────────┘`}</pre>
              <FeaturedPosts />
            </div>
          </section>

          {/* 5 — main skills */}
          <section className="sec" id="sec5" data-idx="5">
            <div className="sec-inner">
              <pre className="ascii-header fade-row">{`┌──────────────────────────────────┐
│  MAIN SKILLS  //  capabilities   │
└──────────────────────────────────┘`}</pre>
              <ul className="skills-list">
                {SKILLS.map((s) => (
                  <li key={s.name} className="skill-row fade-row">
                    <span className="skill-bar" aria-hidden="true">
                      [{'█'.repeat(s.level)}{'░'.repeat(10 - s.level)}]
                    </span>
                    <span className="skill-name">{s.name}</span>
                  </li>
                ))}
              </ul>
              <p className="skills-note fade-row">
                └── building cultures, not just crowds
              </p>
            </div>
          </section>

          {/* 6 — contact */}
          <section className="sec" id="sec6" data-idx="6">
            <div className="sec-inner">
              <pre className="ascii-header fade-row">{`┌──────────────────────────────────┐
│  CONTACT ME  //  channels        │
└──────────────────────────────────┘`}</pre>
              <ContactSection />
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
