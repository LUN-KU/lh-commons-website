import Link from 'next/link'
import Image from 'next/image'
import LoginButton from './LoginButton'

export default function Navbar() {
  return (
    <nav className="bg-white/10 backdrop-blur-lg border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/logo.png" alt="領航里" width={36} height={36} />
          <span className="text-lg font-bold text-white tracking-widest">領航里</span>
        </Link>
        <div className="flex items-center gap-4 text-sm font-medium text-white/70">
          <Link href="/about" className="hover:text-white transition-colors hidden md:block">關於我們</Link>
          <Link href="/collab" className="hover:text-white transition-colors hidden md:block">合作專區</Link>
          <Link href="/events" className="hover:text-white transition-colors">活動行事曆＆報名</Link>
          <Link href="/links" className="hover:text-white transition-colors hidden md:block">服務連結</Link>
          <LoginButton />
        </div>
      </div>
    </nav>
  )
}
