import { neon } from '@neondatabase/serverless'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const sql = neon(process.env.DATABASE_URL!)

const VISITOR_COOKIE = 'k2s_visitor_no'
const ONE_YEAR = 60 * 60 * 24 * 365

async function ensureTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS visitor_counter (
      id INTEGER PRIMARY KEY DEFAULT 1,
      total BIGINT NOT NULL DEFAULT 0,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CONSTRAINT single_row CHECK (id = 1)
    )
  `
  await sql`
    INSERT INTO visitor_counter (id, total)
    VALUES (1, 0)
    ON CONFLICT (id) DO NOTHING
  `
}

export async function GET() {
  try {
    await ensureTable()
    const cookieStore = await cookies()
    const existing = cookieStore.get(VISITOR_COOKIE)

    if (existing?.value && /^\d+$/.test(existing.value)) {
      // Returning visitor — just read the current total
      const rows = await sql`SELECT total FROM visitor_counter WHERE id = 1`
      const total = Number(rows[0]?.total ?? 0)
      return NextResponse.json({
        visitorNumber: Number(existing.value),
        total,
        isNew: false,
      })
    }

    // New unique visitor — atomically increment
    const rows = await sql`
      UPDATE visitor_counter
      SET total = total + 1, updated_at = NOW()
      WHERE id = 1
      RETURNING total
    `
    const total = Number(rows[0]?.total ?? 1)

    const res = NextResponse.json({
      visitorNumber: total,
      total,
      isNew: true,
    })
    res.cookies.set(VISITOR_COOKIE, String(total), {
      maxAge: ONE_YEAR,
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
    })
    return res
  } catch (error) {
    console.error('[visit] error:', error)
    return NextResponse.json(
      { error: 'failed to track visit' },
      { status: 500 },
    )
  }
}
