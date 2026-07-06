import { neon } from '@neondatabase/serverless'
import { cookies } from 'next/headers'

const COOKIE_NAME = 'k2s_visitor_num'
const ONE_YEAR = 60 * 60 * 24 * 365

export async function POST() {
  try {
    const sql = neon(process.env.DATABASE_URL as string)
    const cookieStore = await cookies()
    const existing = cookieStore.get(COOKIE_NAME)

    // Returning visitor — do not increment, just report
    if (existing && /^\d+$/.test(existing.value)) {
      const rows = await sql`SELECT total FROM visitor_counter WHERE id = 1`
      const total = Number(rows[0]?.total ?? 0)
      return Response.json({
        visitorNumber: Number(existing.value),
        total: Math.max(total, Number(existing.value)),
        returning: true,
      })
    }

    // New unique visitor — increment atomically
    const rows = await sql`
      INSERT INTO visitor_counter (id, total, updated_at)
      VALUES (1, 1, now())
      ON CONFLICT (id)
      DO UPDATE SET total = visitor_counter.total + 1, updated_at = now()
      RETURNING total
    `
    const total = Number(rows[0].total)

    cookieStore.set(COOKIE_NAME, String(total), {
      maxAge: ONE_YEAR,
      path: '/',
      sameSite: 'lax',
      httpOnly: true,
    })

    return Response.json({ visitorNumber: total, total, returning: false })
  } catch (error) {
    console.error('[visitors] error:', error)
    return Response.json({ error: 'failed to track visitor' }, { status: 500 })
  }
}
