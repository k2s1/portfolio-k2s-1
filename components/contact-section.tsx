'use client'

import { useRef, useState } from 'react'
import emailjs from '@emailjs/browser'
import useSWR from 'swr'

const EMAIL = 'k2sbhai22@gmail.com'

type EmailConfig = {
  configured: boolean
  serviceId: string
  templateId: string
  publicKey: string
}

const fetcher = (url: string) => fetch(url).then((r) => r.json() as Promise<EmailConfig>)

type Status = 'idle' | 'sending' | 'success' | 'error'

type FieldErrors = {
  name?: string
  email?: string
  message?: string
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export default function ContactSection() {
  const [status, setStatus] = useState<Status>('idle')
  const [errors, setErrors] = useState<FieldErrors>({})
  const [values, setValues] = useState({ name: '', email: '', message: '' })
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // load emailjs config at runtime from the server (never relies on build-time env inlining)
  const { data: config } = useSWR<EmailConfig>('/api/contact-config', fetcher, {
    revalidateOnFocus: false,
  })

  const validate = (): boolean => {
    const next: FieldErrors = {}
    if (!values.name.trim()) next.name = 'name is required'
    if (!values.email.trim()) next.email = 'email is required'
    else if (!EMAIL_RE.test(values.email.trim())) next.email = 'enter a valid email'
    if (!values.message.trim()) next.message = 'message is required'
    else if (values.message.trim().length < 10) next.message = 'message must be at least 10 characters'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target
    setValues((v) => ({ ...v, [name]: value }))
    if (errors[name as keyof FieldErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (status === 'sending') return
    if (!validate()) return

    setStatus('sending')
    try {
      // fetch fresh config if SWR hasn't resolved yet
      const cfg = config ?? (await fetcher('/api/contact-config'))
      if (!cfg?.configured) {
        throw new Error('email service not configured')
      }

      // template params match the EmailJS "Contact Us" + "Auto-Reply" templates:
      // {{name}}, {{email}}, {{title}}, {{message}}, {{time}}
      await emailjs.send(
        cfg.serviceId,
        cfg.templateId,
        {
          name: values.name.trim(),
          email: values.email.trim(),
          title: `portfolio inquiry from ${values.name.trim()}`,
          message: values.message.trim(),
          time: new Date().toLocaleString('en-US', {
            dateStyle: 'medium',
            timeStyle: 'short',
          }),
        },
        { publicKey: cfg.publicKey },
      )
      setStatus('success')
      setValues({ name: '', email: '', message: '' })
    } catch (error) {
      console.error('[contact] emailjs error:', error)
      setStatus('error')
    }
    if (noticeTimer.current) clearTimeout(noticeTimer.current)
    noticeTimer.current = setTimeout(() => setStatus('idle'), 6000)
  }

  return (
    <div className="contact-wrap">
      {/* channels */}
      <div className="contact-block fade-row">
        <p className="contact-row">
          <span className="ct-prompt">{'>'}</span>
          <a href="https://x.com/k2sbhai" target="_blank" rel="noopener noreferrer" className="clink">
            x
          </a>
          <span className="sep">/</span>
          <a href="https://t.me/k2sbhai" target="_blank" rel="noopener noreferrer" className="clink">
            telegram
          </a>
          <span className="sep">/</span>
          <a href="https://github.com/k2s1" target="_blank" rel="noopener noreferrer" className="clink">
            github
          </a>
          <span className="sep">/</span>
          <a href={`mailto:${EMAIL}`} className="clink">
            email
          </a>
        </p>
      </div>

      {/* form */}
      <form className="contact-form fade-row" onSubmit={handleSubmit} noValidate>
        <p className="cf-header">
          <span className="ct-prompt">{'>'}</span> send a direct message
          <span className="blink-cursor">_</span>
        </p>

        <div className="cf-grid">
          <div className="cf-field">
            <label htmlFor="cf-name" className="cf-label">
              name <span className="cf-req">*</span>
            </label>
            <input
              id="cf-name"
              name="name"
              type="text"
              className={`cf-input${errors.name ? ' cf-invalid' : ''}`}
              placeholder="your name"
              value={values.name}
              onChange={handleChange}
              disabled={status === 'sending'}
              autoComplete="name"
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? 'cf-name-err' : undefined}
            />
            {errors.name && (
              <p id="cf-name-err" className="cf-error" role="alert">
                {'!'} {errors.name}
              </p>
            )}
          </div>

          <div className="cf-field">
            <label htmlFor="cf-email" className="cf-label">
              email <span className="cf-req">*</span>
            </label>
            <input
              id="cf-email"
              name="email"
              type="email"
              className={`cf-input${errors.email ? ' cf-invalid' : ''}`}
              placeholder="you@example.com"
              value={values.email}
              onChange={handleChange}
              disabled={status === 'sending'}
              autoComplete="email"
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? 'cf-email-err' : undefined}
            />
            {errors.email && (
              <p id="cf-email-err" className="cf-error" role="alert">
                {'!'} {errors.email}
              </p>
            )}
          </div>
        </div>

        <div className="cf-field">
          <label htmlFor="cf-message" className="cf-label">
            message <span className="cf-req">*</span>
          </label>
          <textarea
            id="cf-message"
            name="message"
            rows={5}
            className={`cf-input cf-textarea${errors.message ? ' cf-invalid' : ''}`}
            placeholder="tell me about your project, community, or collaboration idea…"
            value={values.message}
            onChange={handleChange}
            disabled={status === 'sending'}
            aria-invalid={Boolean(errors.message)}
            aria-describedby={errors.message ? 'cf-message-err' : undefined}
          />
          {errors.message && (
            <p id="cf-message-err" className="cf-error" role="alert">
              {'!'} {errors.message}
            </p>
          )}
        </div>

        <div className="cf-footer">
          <button type="submit" className="cf-submit" disabled={status === 'sending'}>
            {status === 'sending' ? (
              <span className="cf-sending">
                [ sending<span className="cf-dots" /> ]
              </span>
            ) : (
              '[ send message ]'
            )}
          </button>
          <a href={`mailto:${EMAIL}`} className="cf-direct">
            or email directly: {EMAIL}
          </a>
        </div>

        <div aria-live="polite">
          {status === 'success' && (
            <p className="cf-notice cf-notice-ok">
              {'>'} message sent — i&apos;ll get back to you fast.
            </p>
          )}
          {status === 'error' && (
            <p className="cf-notice cf-notice-err">
              {'>'} failed to send. try again or email {EMAIL} directly.
            </p>
          )}
        </div>
      </form>

      <p className="contact-note fade-row">
        available for community operations, moderation roles, and web3 project
        collaborations. reach out directly — i respond fast.
      </p>
    </div>
  )
}
