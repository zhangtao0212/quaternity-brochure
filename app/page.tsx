'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from './LanguageContext'
import JoinForm from './JoinForm'

// Particle class for background animation - updated colors for monnaire-style theme
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
    ctx.fillStyle = `rgba(14, 165, 233, ${this.opacity})` // Using monnaire accent color #0EA5E9
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
        ctx.strokeStyle = `rgba(14, 165, 233, ${opacity})`
        ctx.lineWidth = 0.4
        ctx.moveTo(particles[i].x, particles[i].y)
        ctx.lineTo(particles[j].x, particles[j].y)
        ctx.stroke()
      }
    }
  }
}

export default function Home() {
  const { t } = useLanguage()
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
    <main className="font-sans">
      {/* Particle Background */}
      <canvas id="particles" className="particles-canvas fixed inset-0 pointer-events-none" />
      
      {/* Hero Section - Inspired by monnaire-homepage */}
      <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-primary bg-grid"></div>
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-accent/20 rounded-full filter blur-3xl animate-pulse-slow"></div>
        <div className="absolute -bottom-40 -left-20 w-96 h-96 bg-highlight/20 rounded-full filter blur-3xl animate-pulse-slow delay-700"></div>
        
        <div className="container mx-auto px-4 pt-10 relative z-10">
          <div className="max-w-5xl mx-auto text-center animate-fade-in">
            <h1 className="text-[clamp(2.5rem,6vw,4rem)] font-bold leading-tight mb-8 tracking-tight">
              <span className="text-gradient bg-gradient-to-r from-white via-metal to-white">
                {t('hero.headline')}
              </span>
            </h1>
            
            <p className="text-[clamp(1.2rem,3vw,1.8rem)] text-metal mb-12 leading-relaxed">
              {t('hero.subheadline')}
            </p>
            
            <div className="flex flex-col md:flex-row justify-center gap-6 mb-20">
              <a href="#join" className="px-8 py-4 rounded-full bg-gradient-to-r from-accent to-highlight text-white font-medium text-lg hover:shadow-lg hover:shadow-highlight/20 transition-all hover-scale">
                {t('hero.cta')}
              </a>
            </div>
            
            {/* Scroll indicator */}
            <div className="animate-bounce mt-16">
              <a href="#problem" className="text-metal hover:text-white">
                <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* The Problem Section */}
      <section id="problem" className="py-20 relative bg-secondary">
        <div className="absolute inset-0 bg-grid opacity-20"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-[clamp(1.8rem,4vw,3rem)] font-bold mb-6 text-gradient bg-gradient-to-r from-white to-metal">
              {t('problem.title')}
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Problem Card 1 */}
            <div className="bg-primary/50 p-8 rounded-xl border border-white/10 hover-scale">
              <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1-11v6h2v-6h-2zm0-4v2h2V7h-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4 text-white">{t('problem.bridging.title')}</h3>
              <p className="text-metal">{t('problem.bridging.desc')}</p>
            </div>
            
            {/* Problem Card 2 */}
            <div className="bg-primary/50 p-8 rounded-xl border border-white/10 hover-scale">
              <div className="w-16 h-16 rounded-full bg-highlight/20 flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-highlight" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4 text-white">{t('problem.tradeoffs.title')}</h3>
              <p className="text-metal">{t('problem.tradeoffs.desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Capabilities Section */}
      <section id="capabilities" className="py-20 relative bg-primary">
        <div className="absolute inset-0 bg-tech-grid"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-[clamp(1.8rem,4vw,3rem)] font-bold mb-6 text-gradient bg-gradient-to-r from-white to-metal">
              {t('capabilities.title')}
            </h2>
          </div>
          
          {/* Spend Section */}
          <div className="mb-16">
            <h3 className="text-[clamp(1.5rem,3vw,2rem)] font-bold mb-8 text-center text-white">
              {t('capabilities.spend.title')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((num) => (
                <div key={num} className="bg-secondary/50 p-6 rounded-xl border border-white/10 hover-scale">
                  <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center mb-4">
                    {num === 1 && <span className="text-xl">💳</span>}
                    {num === 2 && <span className="text-xl">🪙</span>}
                    {num === 3 && <span className="text-xl">⚡</span>}
                  </div>
                  <h4 className="text-lg font-bold mb-2 text-white">{t(`capabilities.spend.${num}.title`)}</h4>
                  <p className="text-metal text-sm">{t(`capabilities.spend.${num}.desc`)}</p>
                </div>
              ))}
            </div>
          </div>
          
          {/* Earn Section */}
          <div>
            <h3 className="text-[clamp(1.5rem,3vw,2rem)] font-bold mb-8 text-center text-white">
              {t('capabilities.earn.title')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((num) => (
                <div key={num} className="bg-secondary/50 p-6 rounded-xl border border-white/10 hover-scale">
                  <div className="w-12 h-12 rounded-full bg-highlight/20 flex items-center justify-center mb-4">
                    {num === 1 && <span className="text-xl">📅</span>}
                    {num === 2 && <span className="text-xl">📈</span>}
                    {num === 3 && <span className="text-xl">🎯</span>}
                  </div>
                  <h4 className="text-lg font-bold mb-2 text-white">{t(`capabilities.earn.${num}.title`)}</h4>
                  <p className="text-metal text-sm">{t(`capabilities.earn.${num}.desc`)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Product Principles Section */}
      <section id="principles" className="py-20 relative bg-secondary">
        <div className="absolute inset-0 bg-grid opacity-30"></div>
        <div className="absolute top-40 right-20 w-80 h-80 bg-highlight/10 rounded-full filter blur-3xl"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-[clamp(1.8rem,4vw,3rem)] font-bold mb-6 text-gradient bg-gradient-to-r from-white to-metal">
              {t('principles.title')}
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[1, 2, 3].map((num) => (
              <div key={num} className="bg-primary/50 p-8 rounded-xl border border-white/10 hover-scale">
                <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center mb-4">
                  <div className="text-accent font-bold text-lg">{num.toString().padStart(2, '0')}</div>
                </div>
                <h3 className="text-xl font-bold mb-4 text-white">{t(`principles.${num}.title`)}</h3>
                <p className="text-metal">{t(`principles.${num}.desc`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vision & Community Section */}
      <section id="vision" className="py-20 relative bg-primary">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-[clamp(1.8rem,4vw,3rem)] font-bold mb-6 text-gradient bg-gradient-to-r from-white to-metal">
              {t('vision.title')}
            </h2>
            <p className="text-xl text-metal leading-relaxed mb-8">
              {t('vision.desc')}
            </p>
          </div>
          
          <div className="max-w-md mx-auto">
            <h3 className="text-xl font-bold mb-6 text-center text-white">{t('community.title')}</h3>
            <div className="flex flex-col space-y-4">
              <a href="https://x.com/Qosmospay" target="_blank" rel="noopener noreferrer" 
                 className="flex items-center justify-center space-x-3 px-6 py-4 bg-secondary/50 rounded-xl border border-white/10 hover:bg-secondary/80 transition-all hover-scale">
                <span className="text-xl">𝕏</span>
                <span className="text-white">{t('community.x')}</span>
              </a>
              
              <a href="https://t.me/Qosmospay_official" target="_blank" rel="noopener noreferrer"
                 className="flex items-center justify-center space-x-3 px-6 py-4 bg-secondary/50 rounded-xl border border-white/10 hover:bg-secondary/80 transition-all hover-scale">
                <span className="text-xl">✈</span>
                <span className="text-white">{t('community.telegram')}</span>
              </a>
              
              <a href="https://t.me/QosmosPay" target="_blank" rel="noopener noreferrer"
                 className="flex items-center justify-center space-x-3 px-6 py-4 bg-secondary/50 rounded-xl border border-white/10 hover:bg-secondary/80 transition-all hover-scale">
                <span className="text-xl">📢</span>
                <span className="text-white">{t('community.announcement')}</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Join Section */}
      <section id="join" className="py-20 relative bg-gradient-to-b from-primary to-dark">
        <div className="absolute inset-0 bg-grid opacity-20"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-[clamp(1.8rem,4vw,3rem)] font-bold mb-6 text-white">
              {t('join.title')}
            </h2>
            <p className="text-xl text-metal mb-8">
              {t('join.desc')}
            </p>
            
            <div className="bg-glass p-8 rounded-2xl border border-white/10">
              <JoinForm />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark py-8 border-t border-white/10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <div className="flex items-center space-x-2">
                <img src="/logo.png" alt="Qosmos Logo" className="h-8 w-auto" />
                <span className="text-white font-bold text-lg">Qosmos Pay</span>
              </div>
            </div>
            
            <div className="text-center md:text-right">
              <p className="text-metal">
                {t('footer.contact')}:{' '}
                <a href={`mailto:${t('footer.email')}`} className="text-accent hover:text-accent-light">
                  {t('footer.email')}
                </a>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}