'use client'

import emailjs from '@emailjs/browser'
import { useState } from 'react'

const EMAIL = 'k2sbhai22@gmail.com'

const SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID
const TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID
const PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY

type Status = 'idle' | 'sending' | 'success' | 'error'

interface FieldErrors {
  name?: string
  email?: string
  message?: string
}

export function ContactForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [errors, setErrors] = useState<FieldErrors>({})

  const validate = (): boolean => {
    const next: FieldErrors = {}
    if (!name.trim() || name.trim().length < 2) {
      next.name = 'name must be at least 2 characters'
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      next.email = 'enter a valid email address'
    }
    if (!message.trim() || message.trim().length < 10) {
      next.message = 'message must be at least 10 characters'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const emailJsConfigured = Boolean(SERVICE_ID && TEMPLATE_ID && PUBLIC_KEY)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (status === 'sending') return
    if (!validate()) return

    if (!emailJsConfigured) {
      // graceful fallback — open the visitor's mail client pre-filled
      const subject = encodeURIComponent(`portfolio inquiry from ${name.trim()}`)
      const body = encodeURIComponent(`${message.trim()}\n\n— ${name.trim()} (${email.trim()})`)
      window.location.href = `mailto:${EMAIL}?subject=${subject}&body=${body}`
      return
    }

    setStatus('sending')
    try {
      await emailjs.send(
        SERVICE_ID!,
        TEMPLATE_ID!,
        {
          from_name: name.trim(),
          from_email: email.trim(),
          reply_to: email.trim(),
          message: message.trim(),
          to_email: EMAIL,
        },
        { publicKey: PUBLIC_KEY! },
      )
      setStatus('success')
      setName('')
      setEmail('')
      setMessage('')
      setErrors({})
      setTimeout(() => setStatus('idle'), 6000)
    } catch (err) {
      console.error('[contact] emailjs error:', err)
      setStatus('error')
      setTimeout(() => setStatus('idle'), 6000)
    }
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit} noValidate>
      <div className="cf-grid">
        <div className="cf-field">
          <label htmlFor="cf-name" className="cf-label">
            <span className="cf-label-prompt">{'>'}</span> name
          </label>
          <input
            id="cf-name"
            type="text"
            className={`cf-input${errors.name ? ' cf-invalid' : ''}`}
            placeholder="your name_"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              if (errors.name) setErrors((p) => ({ ...p, name: undefined }))
            }}
            disabled={status === 'sending'}
            autoComplete="name"
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? 'cf-name-err' : undefined}
          />
          {errors.name && (
            <p id="cf-name-err" className="cf-error" role="alert">
              ! {errors.name}
            </p>
          )}
        </div>

        <div className="cf-field">
          <label htmlFor="cf-email" className="cf-label">
            <span className="cf-label-prompt">{'>'}</span> email
          </label>
          <input
            id="cf-email"
            type="email"
            className={`cf-input${errors.email ? ' cf-invalid' : ''}`}
            placeholder="you@domain.com_"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (errors.email) setErrors((p) => ({ ...p, email: undefined }))
            }}
            disabled={status === 'sending'}
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'cf-email-err' : undefined}
          />
          {errors.email && (
            <p id="cf-email-err" className="cf-error" role="alert">
              ! {errors.email}
            </p>
          )}
        </div>
      </div>

      <div className="cf-field">
        <label htmlFor="cf-message" className="cf-label">
          <span className="cf-label-prompt">{'>'}</span> message
        </label>
        <textarea
          id="cf-message"
          className={`cf-input cf-textarea${errors.message ? ' cf-invalid' : ''}`}
          placeholder="tell me about your project_"
          rows={5}
          value={message}
          onChange={(e) => {
            setMessage(e.target.value)
            if (errors.message) setErrors((p) => ({ ...p, message: undefined }))
          }}
          disabled={status === 'sending'}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? 'cf-message-err' : undefined}
        />
        {errors.message && (
          <p id="cf-message-err" className="cf-error" role="alert">
            ! {errors.message}
          </p>
        )}
      </div>

      <div className="cf-actions">
        <button type="submit" className="cf-submit" disabled={status === 'sending'}>
          {status === 'sending' ? (
            <span className="cf-sending">
              transmitting<span className="cf-dots" aria-hidden="true" />
            </span>
          ) : (
            '[ send message ]'
          )}
        </button>
        <a href={`mailto:${EMAIL}`} className="cf-direct">
          or email directly → {EMAIL}
        </a>
      </div>

      <div aria-live="polite" className="cf-status-wrap">
        {status === 'success' && (
          <p className="cf-status cf-status-ok">
            ✓ message transmitted successfully — i&apos;ll get back to you fast.
          </p>
        )}
        {status === 'error' && (
          <p className="cf-status cf-status-err">
            ✕ transmission failed — try again or email {EMAIL} directly.
          </p>
        )}
      </div>
    </form>
  )
}
