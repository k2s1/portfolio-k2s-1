import { NextResponse } from 'next/server'

// Returns the EmailJS public configuration at runtime.
// This avoids relying on NEXT_PUBLIC_* build-time inlining, so the form
// works as long as the env vars exist on the server (any deployment).
// These are EmailJS *public* client-side identifiers (always visible in the
// browser by design), so they are safe to keep as defaults. Env vars, when
// present, still take priority.
const DEFAULT_SERVICE_ID = 'service_m43odbp'
const DEFAULT_TEMPLATE_ID = 'template_bin7jm7'
const DEFAULT_PUBLIC_KEY = 'nzFZHAm13JZJGJ1Tf'

// trim() guards against stray whitespace/newlines pasted into env vars,
// which silently breaks EmailJS with invalid IDs.
const clean = (v: string | undefined) => (v ? v.trim() : '')

export async function GET() {
  const serviceId =
    clean(process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID) ||
    clean(process.env.EMAILJS_SERVICE_ID) ||
    DEFAULT_SERVICE_ID
  const templateId =
    clean(process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID) ||
    clean(process.env.EMAILJS_TEMPLATE_ID) ||
    DEFAULT_TEMPLATE_ID
  const publicKey =
    clean(process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY) ||
    clean(process.env.EMAILJS_PUBLIC_KEY) ||
    DEFAULT_PUBLIC_KEY

  const configured = Boolean(serviceId && templateId && publicKey)

  return NextResponse.json(
    { configured, serviceId, templateId, publicKey },
    { headers: { 'Cache-Control': 'no-store' } },
  )
}
