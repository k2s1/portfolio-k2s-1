'use client'

import { useEffect, useState } from 'react'

const FEEDBACK = [
  {
    img: '/seismicteamfeedback.png',
    name: 'seismic team feedback',
    tag: 'community leader',
  },
  {
    img: '/zamateamfeedback.png',
    name: 'zama team feedback',
    tag: 'volunteer moderator',
  },
]

export default function FeedbackGallery() {
  const [lightbox, setLightbox] = useState<string | null>(null)

  useEffect(() => {
    if (!lightbox) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(null)
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [lightbox])

  const active = FEEDBACK.find((f) => f.img === lightbox)

  return (
    <>
      <div className="fb-grid">
        {FEEDBACK.map((f) => (
          <button
            key={f.img}
            type="button"
            className="fb-card fade-row"
            onClick={() => setLightbox(f.img)}
            aria-label={`view ${f.name} full size`}
          >
            <div className="fb-img-wrap">
              <img src={f.img || '/placeholder.svg'} alt={f.name} className="fb-img" loading="lazy" />
              <span className="fb-zoom-hint">[ click to expand ]</span>
            </div>
            <div className="fb-meta">
              <p className="fb-name">
                <span className="fb-prompt">{'>'}</span> {f.name}
              </p>
              <p className="fb-tag">{f.tag}</p>
            </div>
          </button>
        ))}
      </div>

      {/* lightbox */}
      <div
        className={`fb-lightbox${lightbox ? ' open' : ''}`}
        onClick={(e) => {
          if (e.target === e.currentTarget) setLightbox(null)
        }}
        role="dialog"
        aria-modal="true"
        aria-hidden={!lightbox}
      >
        <button
          type="button"
          className="fb-lightbox-close"
          onClick={() => setLightbox(null)}
          aria-label="close"
        >
          [ x ]
        </button>
        {active && (
          <figure className="fb-lightbox-inner">
            <img src={active.img || '/placeholder.svg'} alt={active.name} className="fb-lightbox-img" />
            <figcaption className="fb-lightbox-caption">
              {'>'} {active.name} — {active.tag}
            </figcaption>
          </figure>
        )}
      </div>
    </>
  )
}
