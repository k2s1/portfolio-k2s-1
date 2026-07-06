'use client'

import useSWR from 'swr'

interface VisitData {
  visitorNumber: number
  total: number
  isNew: boolean
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

function formatNum(n: number) {
  return n.toLocaleString('en-US')
}

export function VisitorCounter() {
  const { data, error } = useSWR<VisitData>('/api/visit', fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  })

  if (error || (data && 'error' in data)) return null

  return (
    <div className="visitor-counter" aria-live="polite">
      <span className="vc-prompt">$</span>
      {data ? (
        <>
          <span className="vc-line">
            you are visitor <span className="vc-num">#{formatNum(data.visitorNumber)}</span>
          </span>
          <span className="vc-sep">·</span>
          <span className="vc-line">
            <span className="vc-num">{formatNum(data.total)}</span> lifetime visitors
          </span>
        </>
      ) : (
        <span className="vc-line vc-loading">
          counting visitors<span className="blink-cursor">_</span>
        </span>
      )}
    </div>
  )
}
