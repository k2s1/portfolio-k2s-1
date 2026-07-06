'use client'

import { useEffect, useState } from 'react'

const FEEDBACK = [
  {
    img: '/seismicteamfeedback.png',
    name: 'seismic team feedback',
    role: 'community leader',
  },
  {
    img: '/zamateamfeedback.png',
    name: 'zama team feedback',
    role: 'volunteer moderator',
  },
]

export function FeedbackGallery() {
  const [lightbox, setLightbox] = useState<string | null>(null)

  useEffect(() => {
    if (!lightbox) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(null)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [lightbox])

  const active = FEEDBACK.find((f) => f.img === lightbox)

  return (
    <>
      <div className="feedback-grid">
        {FEEDBACK.map((f) => (
          <figure key={f.img} className="feedback-card fade-row">
            <button
              type="button"
              className="feedback-img-btn"
              onClick={() => setLightbox(f.img)}
              aria-label={`view ${f.name} full size`}
            >
              <img
                src={f.img || '/placeholder.svg'}
                alt={f.name}
                className="feedback-img"
                loading="lazy"
              />
              <span className="feedback-zoom-hint">[ click to expand ]</span>
            </button>
            <figcaption className="feedback-caption">
              <span className="feedback-name">{'>'} {f.name}</span>
              <span className="feedback-role">{f.role}</span>
            </figcaption>
          </figure>
        ))}
      </div>

      {/* lightbox */}
      <div
        className={`lightbox-overlay${lightbox ? ' open' : ''}`}
        onClick={(e) => {
          if (e.target === e.currentTarget) setLightbox(null)
        }}
        role="dialog"
        aria-modal="true"
        aria-hidden={!lightbox}
      >
        <button
          type="button"
          className="lightbox-close"
          onClick={() => setLightbox(null)}
        >
          [ x close ]
        </button>
        {active && (
          <img
            src={active.img || '/placeholder.svg'}
            alt={active.name}
            className="lightbox-img"
          />
        )}
      </div>
    </>
  )
}
