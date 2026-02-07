import type { Metadata } from 'next'
import { LanguageProvider } from './LanguageContext'
import LanguageSwitcher from './LanguageSwitcher'
import './globals.css'

export const metadata: Metadata = {
  title: 'Qosmos - The On-Chain Bank for the Unbanked',
  description: 'Global Web3 Financial Infrastructure for Everyone. Redefining inclusive finance with blockchain technology and AI.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <LanguageProvider>
          <nav className="navbar">
            <div className="nav-container">
              <a href="#" className="nav-logo">
                <img src="/logo.png" alt="Qosmos Logo" />
              </a>
              <div className="nav-right">
                <LanguageSwitcher />
              </div>
            </div>
          </nav>
          {children}
        </LanguageProvider>
      </body>
    </html>
  )
}
