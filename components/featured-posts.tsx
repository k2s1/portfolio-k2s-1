'use client'

import { Tweet, TweetSkeleton } from 'react-tweet'

const POSTS = [
  {
    id: '2071981082594210054',
    label: 'nvidia — free api',
    url: 'https://x.com/k2sbhai/status/2071981082594210054',
  },
  {
    id: '1951554251722785128',
    label: 'seismic',
    url: 'https://x.com/k2sbhai/status/1951554251722785128',
  },
  {
    id: '2001659139869806974',
    label: 'zama',
    url: 'https://x.com/k2sbhai/status/2001659139869806974',
  },
]

function PostFallbackCard({ label, url }: { label: string; url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="post-fallback-card"
    >
      <p className="post-fb-handle">
        <span className="post-fb-prompt">{'>'}</span> @k2sbhai
      </p>
      <p className="post-fb-label">{label}</p>
      <p className="post-fb-cta">[ view post on x → ]</p>
    </a>
  )
}

export default function FeaturedPosts() {
  return (
    <div className="posts-grid">
      {POSTS.map((post) => (
        <div key={post.id} className="post-cell fade-row" data-theme="dark">
          <Tweet
            id={post.id}
            apiUrl={`/api/tweet/${post.id}`}
            fallback={<TweetSkeleton />}
            components={{
              TweetNotFound: () => (
                <PostFallbackCard label={post.label} url={post.url} />
              ),
            }}
            onError={(error) => {
              console.error('[featured-posts] tweet load error:', error)
              return error
            }}
          />
        </div>
      ))}
    </div>
  )
}
