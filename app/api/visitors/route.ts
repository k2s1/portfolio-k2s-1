import { neon } from '@neondatabase/serverless'
import { cookies } from 'next/headers'

const COOKIE_NAME = 'k2s_visitor_num'
const ONE_YEAR = 60 * 60 * 24 * 365

// Accept whichever connection string the deployment provides.
// The Neon Vercel integration sets DATABASE_URL and/or POSTGRES_URL.
function getConnectionString(): string | undefined {
  return (
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.NEON_DATABASE_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.DATABASE_URL_UNPOOLED ||
    process.env.POSTGRES_URL_NON_POOLING
  )
}

let tableReady = false

export async function POST() {
  try {
    const conn = getConnectionString()
    if (!conn) {
      console.error('[visitors] no database connection string found in env')
      return Response.json({ error: 'database not configured' }, { status: 500 })
    }
    const sql = neon(conn)

    // Auto-create the table on first use so any fresh Neon database works.
    if (!tableReady) {
      await sql`
        CREATE TABLE IF NOT EXISTS visitor_counter (
          id INT PRIMARY KEY,
          total BIGINT NOT NULL DEFAULT 0,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )
      `
      tableReady = true
    }
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
