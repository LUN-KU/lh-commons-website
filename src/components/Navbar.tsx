import Link from 'next/link'
import Image from 'next/image'

export default function Navbar() {
  return (
    <nav className="bg-white/70 backdrop-blur-lg border-b border-brand-50 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/logo.png" alt="領航里" width={36} height={36} />
          <span className="text-lg font-bold text-brand-700 tracking-widest">領航里</span>
        </Link>
        <div className="flex gap-6 text-sm font-medium text-brand-400">
          <Link href="/events" className="hover:text-brand-700 transition-colors">活動</Link>
          <Link href="/about" className="hover:text-brand-700 transition-colors">關於我們</Link>
          <Link href="/links" className="hover:text-brand-700 transition-colors">服務連結</Link>
        </div>
      </div>
    </nav>
  )
}
