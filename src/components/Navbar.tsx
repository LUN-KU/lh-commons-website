'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import LoginButton from './LoginButton'

const NAV_LINKS = [
  { href: '/about', label: '關於我們' },
  { href: '/collab', label: '合作專區' },
  { href: '/events', label: '活動行事曆＆報名' },
  { href: '/links', label: '服務連結' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <nav className="bg-brand-800/70 backdrop-blur-lg border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <Image src="/logo.png" alt="領航里" width={40} height={40} className="rounded-full" />
          <span className="text-lg font-bold text-white tracking-widest">領航里</span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-4 text-sm font-medium text-white/80">
          {NAV_LINKS.map(l => (
            <Link key={l.href} href={l.href} className="hover:text-white transition-colors">{l.label}</Link>
          ))}
          <LoginButton />
        </div>

        {/* Mobile: LoginButton + hamburger */}
        <div className="flex md:hidden items-center gap-3">
          <LoginButton />
          <button
            onClick={() => setOpen(o => !o)}
            className="text-white hover:text-white/70 p-1"
            aria-label="選單"
          >
            {open ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="md:hidden border-t border-white/10 bg-brand-800/90 backdrop-blur-lg">
          {NAV_LINKS.map(l => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block px-6 py-4 text-sm font-medium text-white hover:bg-white/10 transition-colors border-b border-white/10"
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}
