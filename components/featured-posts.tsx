'use client'

import { useEffect, useRef, useState } from 'react'

const POSTS = [
  {
    id: '2071981082594210054',
    tag: 'nvidia',
    title: 'nvidia — free api',
    desc: 'breakdown of how to access and use the nvidia api for free — a practical guide for builders.',
    url: 'https://x.com/k2sbhai/status/2071981082594210054',
  },
  {
    id: '1951554251722785128',
    tag: 'seismic',
    title: 'seismic',
    desc: 'community leadership at seismic — scaling the ecosystem and driving engagement from the inside.',
    url: 'https://x.com/k2sbhai/status/1951554251722785128',
  },
  {
    id: '2001659139869806974',
    tag: 'zama',
    title: 'zama',
    desc: 'contributing to the zama community — moderation, support, and keeping the fhe conversation alive.',
    url: 'https://x.com/k2sbhai/status/2001659139869806974',
  },
]

declare global {
  interface Window {
    twttr?: {
      widgets: { load: (el?: HTMLElement) => void }
    }
  }
}

export function FeaturedPosts({ visible }: { visible: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [embedsReady, setEmbedsReady] = useState(false)
  const loadedRef = useRef(false)

  /* attempt to hydrate real X embeds; fallback cards stay if it fails */
  useEffect(() => {
    if (!visible || loadedRef.current) return
    loadedRef.current = true

    const existing = document.getElementById('twitter-wjs')
    const hydrate = () => {
      if (window.twttr?.widgets && containerRef.current) {
        window.twttr.widgets.load(containerRef.current)
        setEmbedsReady(true)
      }
    }

    if (existing) {
      hydrate()
      return
    }

    const script = document.createElement('script')
    script.id = 'twitter-wjs'
    script.src = 'https://platform.twitter.com/widgets.js'
    script.async = true
    script.onload = hydrate
    document.body.appendChild(script)
  }, [visible])

  return (
    <div className="posts-grid" ref={containerRef}>
      {POSTS.map((p, i) => (
        <article key={p.id} className="post-card fade-row">
          <div className="post-card-top">
            <span className="post-tag">[ {p.tag} ]</span>
            <span className="post-idx">{String(i + 1).padStart(2, '0')}</span>
          </div>
          <blockquote
            className="twitter-tweet"
            data-theme="dark"
            data-dnt="true"
            data-conversation="none"
          >
            {/* fallback preview card — replaced by the live embed when widgets.js loads */}
            <div className={`post-fallback${embedsReady ? ' post-fallback-min' : ''}`}>
              <h3 className="post-title">{p.title}</h3>
              <p className="post-desc">{p.desc}</p>
            </div>
            <a href={p.url} target="_blank" rel="noopener noreferrer" className="post-link">
              {'>'} view post on x →
            </a>
          </blockquote>
        </article>
      ))}
    </div>
  )
}
