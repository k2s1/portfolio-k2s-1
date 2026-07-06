import { NextResponse } from 'next/server'

// Returns the EmailJS public configuration at runtime.
// This avoids relying on NEXT_PUBLIC_* build-time inlining, so the form
// works as long as the env vars exist on the server (any deployment).
export async function GET() {
  const serviceId =
    process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || process.env.EMAILJS_SERVICE_ID || ''
  const templateId =
    process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || process.env.EMAILJS_TEMPLATE_ID || ''
  const publicKey =
    process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || process.env.EMAILJS_PUBLIC_KEY || ''

  const configured = Boolean(serviceId && templateId && publicKey)

  return NextResponse.json(
    { configured, serviceId, templateId, publicKey },
    { headers: { 'Cache-Control': 'no-store' } },
  )
}
