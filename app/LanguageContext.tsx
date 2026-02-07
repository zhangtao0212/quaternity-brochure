'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { translations } from './translations'

type Language = 'en' | 'zh'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('zh')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem('qosmos-lang') as Language
    if (saved && (saved === 'en' || saved === 'zh')) {
      setLanguage(saved)
    } else {
      const browserLang = navigator.language.toLowerCase()
      if (browserLang.includes('zh')) {
        setLanguage('zh')
      }
    }
  }, [])

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang)
    localStorage.setItem('qosmos-lang', lang)
  }

  const t = (key: string): string => {
    const trans = translations[language]
    return trans[key as keyof typeof trans] || translations.en[key as keyof typeof translations.en] || key
  }

  if (!mounted) {
    return (
      <LanguageContext.Provider value={{ language: 'en', setLanguage: () => {}, t: (key) => translations.en[key as keyof typeof translations.en] || key }}>
        {children}
      </LanguageContext.Provider>
    )
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider')
  }
  return context
}
