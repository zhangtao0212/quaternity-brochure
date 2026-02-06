'use client'

import { useState } from 'react'
import { useLanguage } from './LanguageContext'

export default function JoinForm() {
  const { t } = useLanguage()
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setStatus('idle')

    try {
      const response = await fetch('https://formsubmit.co/ajax/contact@qosmos.one', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email,
          _subject: 'Qosmos New Subscriber',
          _captcha: 'false'
        })
      })

      if (response.ok) {
        setStatus('success')
        setMessage(t('join.success'))
        setEmail('')
      } else {
        setStatus('error')
        setMessage(t('join.error'))
      }
    } catch {
      setStatus('error')
      setMessage(t('join.error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="join-form" onSubmit={handleSubmit}>
      <div className="input-wrapper">
        <input
          type="email"
          className="join-input"
          placeholder={t('join.placeholder')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
        />
        <button type="submit" className="join-button" disabled={loading}>
          {loading ? t('join.sending') : t('join.button')}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      {status !== 'idle' && (
        <div className={`join-message ${status}`}>
          {message}
        </div>
      )}
    </form>
  )
}
