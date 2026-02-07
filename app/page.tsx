'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from './LanguageContext'
import JoinForm from './JoinForm'

// Particle class for background animation
class Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
  canvas: HTMLCanvasElement

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.x = Math.random() * canvas.width
    this.y = Math.random() * canvas.height
    this.vx = (Math.random() - 0.5) * 0.3
    this.vy = (Math.random() - 0.5) * 0.3
    this.size = Math.random() * 1.5 + 0.5
    this.opacity = Math.random() * 0.4 + 0.15
  }

  update() {
    this.x += this.vx
    this.y += this.vy
    
    if (this.x < 0 || this.x > this.canvas.width) this.vx *= -1
    if (this.y < 0 || this.y > this.canvas.height) this.vy *= -1
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(91, 127, 255, ${this.opacity})`
    ctx.fill()
  }
}

function drawConnections(particles: Particle[], ctx: CanvasRenderingContext2D) {
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x
      const dy = particles[i].y - particles[j].y
      const distance = Math.sqrt(dx * dx + dy * dy)
      
      if (distance < 120) {
        const opacity = (1 - distance / 120) * 0.2
        ctx.beginPath()
        ctx.strokeStyle = `rgba(91, 127, 255, ${opacity})`
        ctx.lineWidth = 0.4
        ctx.moveTo(particles[i].x, particles[i].y)
        ctx.lineTo(particles[j].x, particles[j].y)
        ctx.stroke()
      }
    }
  }
}

export default function Home() {
  const { t, language } = useLanguage()
  const [mounted, setMounted] = useState(false)
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    setMounted(true)
    
    const updateSize = () => {
      setCanvasSize({ width: window.innerWidth, height: window.innerHeight })
    }
    
    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [])

  useEffect(() => {
    if (!mounted) return
    
    const canvas = document.getElementById('particles') as HTMLCanvasElement
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    
    const particles: Particle[] = []
    const particleCount = Math.min(40, Math.floor(window.innerWidth / 25))
    
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle(canvas))
    }
    
    let animationId: number
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      particles.forEach(particle => {
        particle.update()
        particle.draw(ctx)
      })
      
      drawConnections(particles, ctx)
      animationId = requestAnimationFrame(animate)
    }
    
    animate()
    
    return () => {
      cancelAnimationFrame(animationId)
    }
  }, [mounted, canvasSize])

  if (!mounted) {
    return <div className="loading">Loading...</div>
  }

  return (
    <main>
      {/* Particle Background */}
      <canvas id="particles" className="particles-canvas" />
      
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-glow" />
        <div className="hero-content">
          <div className="hero-badge">
            <span className="badge-dot" />
            <span>{t('hero.badge')}</span>
          </div>
          
          <h1 className="hero-title">
            {t('hero.title')}<br />
            <span className="hero-gradient">{t('hero.titleHighlight')}</span>
          </h1>
          
          <p className="hero-subtitle">
            {t('hero.subtitle')}
          </p>
          
          <div className="hero-stats">
            <div className="stat-item">
              <div className="stat-value">70%</div>
              <div className="stat-label">{t('hero.stat1')}</div>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <div className="stat-value">5 {language === 'en' ? 'min' : '分钟'}</div>
              <div className="stat-label">{t('hero.stat2')}</div>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <div className="stat-value">50+</div>
              <div className="stat-label">{t('hero.stat3')}</div>
            </div>
          </div>
          
          <div className="hero-cta">
            <a href="#join" className="cta-button primary">
              {t('join.button')}
              <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: 16, height: 16 }}>
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </a>
            <a href="#services" className="cta-button secondary">
              {t('nav.services')}
            </a>
          </div>
        </div>
        
        <div className="scroll-indicator">
          <div className="mouse">
            <div className="wheel" />
          </div>
          <span>{language === 'en' ? 'Scroll' : '向下滚动'}</span>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="section value-section" id="value">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">{t('value.subtitle')}</span>
            <h2 className="section-title">{t('value.title')}</h2>
          </div>
          
          <div className="value-grid">
            <div className="value-card" style={{ animationDelay: '0ms' }}>
              <div className="value-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                </svg>
              </div>
              <h3 className="value-title">{t('value.1.title')}</h3>
              <p className="value-desc">{t('value.1.desc')}</p>
            </div>
            
            <div className="value-card" style={{ animationDelay: '100ms' }}>
              <div className="value-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                  <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="value-title">{t('value.2.title')}</h3>
              <p className="value-desc">{t('value.2.desc')}</p>
            </div>
            
            <div className="value-card" style={{ animationDelay: '200ms' }}>
              <div className="value-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                  <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8zm1-13h-2v6h6v-2h-4zm-2 10h2a6 6 0 0 0-6-6v2a4 4 0 0 1 4 4z" />
                </svg>
              </div>
              <h3 className="value-title">{t('value.3.title')}</h3>
              <p className="value-desc">{t('value.3.desc')}</p>
            </div>
            
            <div className="value-card" style={{ animationDelay: '300ms' }}>
              <div className="value-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <h3 className="value-title">{t('value.4.title')}</h3>
              <p className="value-desc">{t('value.4.desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="section services-section" id="services">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">{t('services.subtitle')}</span>
            <h2 className="section-title">{t('services.title')}</h2>
          </div>
          
          <div className="services-grid">
            {[
              { id: 1, icon: '🧠', title: t('service.1.title'), desc: t('service.1.desc'), features: [t('service.1.f1'), t('service.1.f2'), t('service.1.f3'), t('service.1.f4')] },
              { id: 2, icon: '💳', title: t('service.2.title'), desc: t('service.2.desc'), features: [t('service.2.f1'), t('service.2.f2'), t('service.2.f3'), t('service.2.f4')] },
              { id: 3, icon: '🔐', title: t('service.3.title'), desc: t('service.3.desc'), features: [t('service.3.f1'), t('service.3.f2'), t('service.3.f3'), t('service.3.f4')] },
              { id: 4, icon: '🌐', title: t('service.4.title'), desc: t('service.4.desc'), features: [t('service.4.f1'), t('service.4.f2'), t('service.4.f3'), t('service.4.f4')] },
              { id: 5, icon: '📈', title: t('service.5.title'), desc: t('service.5.desc'), features: [t('service.5.f1'), t('service.5.f2'), t('service.5.f3'), t('service.5.f4')] },
              { id: 6, icon: '🏢', title: t('service.6.title'), desc: t('service.6.desc'), features: [t('service.6.f1'), t('service.6.f2'), t('service.6.f3'), t('service.6.f4')] },
            ].map((service, index) => (
              <div key={service.id} className="service-card" style={{ animationDelay: `${index * 80}ms` }}>
                <div className="service-icon">{service.icon}</div>
                <h3 className="service-title">{service.title}</h3>
                <p className="service-desc">{service.desc}</p>
                <ul className="service-features">
                  {service.features.map((feature, i) => (
                    <li key={i}>
                      <svg viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Market */}
      <section className="section market-section" id="market">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">{t('market.subtitle')}</span>
            <h2 className="section-title">{t('market.title')}</h2>
          </div>
          
          <div className="market-grid">
            <div className="market-card">
              <div className="market-icon">🌏</div>
              <h3 className="market-name">{t('market.sea')}</h3>
              <p className="market-stat">{t('market.sea.countries')}</p>
            </div>
            
            <div className="market-card">
              <div className="market-icon">🌍</div>
              <h3 className="market-name">{t('market.africa')}</h3>
              <p className="market-stat">{t('market.africa.countries')}</p>
            </div>
            
            <div className="market-card">
              <div className="market-icon">🌎</div>
              <h3 className="market-name">{t('market.latam')}</h3>
              <p className="market-stat">{t('market.latam.countries')}</p>
            </div>
            
            <div className="market-card highlight">
              <div className="market-icon">📈</div>
              <h3 className="market-name">{t('market.potential')}</h3>
              <p className="market-stat">1.7B {t('market.potential.stat')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Now */}
      <section className="section why-section" id="whynow">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">{t('whynow.subtitle')}</span>
            <h2 className="section-title">{t('whynow.title')}</h2>
          </div>
          
          <div className="why-grid">
            <div className="why-card">
              <div className="why-number">01</div>
              <h3 className="why-title">{t('whynow.1.title')}</h3>
              <p className="why-desc">{t('whynow.1.desc')}</p>
            </div>
            
            <div className="why-card">
              <div className="why-number">02</div>
              <h3 className="why-title">{t('whynow.2.title')}</h3>
              <p className="why-desc">{t('whynow.2.desc')}</p>
            </div>
            
            <div className="why-card">
              <div className="why-number">03</div>
              <h3 className="why-title">{t('whynow.3.title')}</h3>
              <p className="why-desc">{t('whynow.3.desc')}</p>
            </div>
            
            <div className="why-card">
              <div className="why-number">04</div>
              <h3 className="why-title">{t('whynow.4.title')}</h3>
              <p className="why-desc">{t('whynow.4.desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Join Section */}
      <section className="section join-section" id="join">
        <div className="join-bg" />
        <div className="join-content">
          <h2 className="join-title">{t('join.title')}</h2>
          <p className="join-desc">{t('join.desc')}</p>
          
          <JoinForm />
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-logo">
              <img src="/logo.png" alt="Qosmos Logo" />
            </div>
            <p className="footer-text">
              {t('footer.contact')}: <a href={`mailto:${t('footer.email')}`}>{t('footer.email')}</a>
            </p>
          </div>
        </div>
      </footer>
    </main>
  )
}
