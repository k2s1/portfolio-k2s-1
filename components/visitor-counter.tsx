'use client'

import useSWRImmutable from 'swr/immutable'

type VisitorData = {
  visitorNumber: number
  total: number
  returning: boolean
}

const registerVisit = async (url: string): Promise<VisitorData> => {
  const res = await fetch(url, { method: 'POST' })
  if (!res.ok) {
    console.log('[v0] visitor api failed with status:', res.status)
    throw new Error('failed to register visit')
  }
  return res.json()
}

const fmt = (n: number) => n.toLocaleString('en-US')

export default function VisitorCounter({ variant = 'inline' }: { variant?: 'inline' | 'block' }) {
  const { data, error, isLoading } = useSWRImmutable<VisitorData>('/api/visitors', registerVisit, {
    shouldRetryOnError: true,
    errorRetryCount: 2,
    errorRetryInterval: 3000,
  })

  if (variant === 'block') {
    return (
      <div className="visitor-block fade-row" aria-live="polite">
        <div className="visitor-line">
          <span className="vc-label">{'>'} you are visitor</span>
          <span className="vc-num">{data ? `#${fmt(data.visitorNumber)}` : error ? '#—' : '#———'}</span>
        </div>
        <div className="visitor-line">
          <span className="vc-label">{'>'} total lifetime visitors</span>
          <span className="vc-num">{data ? fmt(data.total) : error ? '—' : '———'}</span>
        </div>
      </div>
    )
  }

  return (
    <p className="visitor-inline" aria-live="polite">
      <span className="vc-bracket">[</span>
      {data ? (
        <>
          visitor <span className="vc-num">#{fmt(data.visitorNumber)}</span>
          <span className="vc-sep">·</span>
          <span className="vc-total">{fmt(data.total)} total</span>
        </>
      ) : error ? (
        <span className="vc-loading">visitors: —</span>
      ) : (
        <span className="vc-loading">counting…</span>
      )}
      <span className="vc-bracket">]</span>
    </p>
  )
}
