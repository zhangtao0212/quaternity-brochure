'use client'

import { useLanguage } from './LanguageContext'

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage()

  const toggleDropdown = () => {
    const dropdown = document.querySelector('.lang-dropdown')
    if (dropdown) {
      dropdown.classList.toggle('hidden')
    }
  }

  const selectLanguage = (lang: 'en' | 'zh') => {
    setLanguage(lang)
    const dropdown = document.querySelector('.lang-dropdown')
    if (dropdown) {
      dropdown.classList.add('hidden')
    }
  }

  return (
    <div className="language-switcher">
      <button 
        className="lang-button"
        onClick={toggleDropdown}
        type="button"
      >
        <span className="lang-icon">🌐</span>
        <span className="lang-label">{language.toUpperCase()}</span>
        <svg className="lang-arrow" width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      
      <div className="lang-dropdown hidden">
        <button 
          className={`lang-option ${language === 'en' ? 'active' : ''}`}
          onClick={() => selectLanguage('en')}
          type="button"
        >
          <span className="lang-flag">🇺🇸</span>
          <span>English</span>
        </button>
        <button 
          className={`lang-option ${language === 'zh' ? 'active' : ''}`}
          onClick={() => selectLanguage('zh')}
          type="button"
        >
          <span className="lang-flag">🇨🇳</span>
          <span>中文</span>
        </button>
      </div>
    </div>
  )
}
