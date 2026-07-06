import { getTweet } from 'react-tweet/api'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ tweet: string }> },
) {
  const { tweet: tweetId } = await params

  if (!/^\d+$/.test(tweetId)) {
    return Response.json({ error: 'invalid tweet id' }, { status: 400 })
  }

  try {
    const tweet = await getTweet(tweetId)
    return Response.json(
      { data: tweet ?? null },
      {
        status: tweet ? 200 : 404,
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        },
      },
    )
  } catch (error) {
    console.error('[tweet] fetch error:', error)
    return Response.json({ data: null }, { status: 404 })
  }
}
