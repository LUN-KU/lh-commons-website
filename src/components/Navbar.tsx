import Link from 'next/link'
import Image from 'next/image'

export default function Navbar() {
  return (
    <nav className="bg-cream border-b border-warm-100 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="領航里" width={40} height={40} className="rounded-full" />
          <span className="text-xl font-bold text-warm-700 tracking-wide">領航里</span>
        </Link>
        <div className="flex gap-6 text-sm font-medium text-warm-600">
          <Link href="/events" className="hover:text-warm-800 transition-colors">活動</Link>
          <Link href="/about" className="hover:text-warm-800 transition-colors">關於我們</Link>
          <Link href="/links" className="hover:text-warm-800 transition-colors">服務連結</Link>
        </div>
      </div>
    </nav>
  )
}
