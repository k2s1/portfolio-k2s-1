'use client'

import useSWRImmutable from 'swr/immutable'

type VisitorData = {
  visitorNumber: number
  total: number
  returning: boolean
}

const registerVisit = async (url: string): Promise<VisitorData> => {
  const res = await fetch(url, { method: 'POST' })
  if (!res.ok) throw new Error('failed to register visit')
  return res.json()
}

const fmt = (n: number) => n.toLocaleString('en-US')

export default function VisitorCounter({ variant = 'inline' }: { variant?: 'inline' | 'block' }) {
  const { data, error, isLoading } = useSWRImmutable<VisitorData>('/api/visitors', registerVisit, {
    shouldRetryOnError: false,
  })

  if (error) return null

  if (variant === 'block') {
    return (
      <div className="visitor-block fade-row" aria-live="polite">
        <div className="visitor-line">
          <span className="vc-label">{'>'} you are visitor</span>
          <span className="vc-num">{isLoading || !data ? '#———' : `#${fmt(data.visitorNumber)}`}</span>
        </div>
        <div className="visitor-line">
          <span className="vc-label">{'>'} total lifetime visitors</span>
          <span className="vc-num">{isLoading || !data ? '———' : fmt(data.total)}</span>
        </div>
      </div>
    )
  }

  return (
    <p className="visitor-inline" aria-live="polite">
      <span className="vc-bracket">[</span>
      {isLoading || !data ? (
        <span className="vc-loading">counting…</span>
      ) : (
        <>
          visitor <span className="vc-num">#{fmt(data.visitorNumber)}</span>
          <span className="vc-sep">·</span>
          <span className="vc-total">{fmt(data.total)} total</span>
        </>
      )}
      <span className="vc-bracket">]</span>
    </p>
  )
}
