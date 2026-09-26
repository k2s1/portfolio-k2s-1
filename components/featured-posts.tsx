'use client'

import { Tweet, TweetSkeleton } from 'react-tweet'

const POSTS = [
  {
    id: '2102487953302061481',
    label: 'Claude Opus 5.5 vs Fable 5.1 vs GPT-Astra 6',
    url: 'https://x.com/k2sbhai/status/2102487953302061481',
  },
  {
    id: '2103509769512489201',
    label: 'Nvidia',
    url: 'https://x.com/k2sbhai/status/2103509769512489201',
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
