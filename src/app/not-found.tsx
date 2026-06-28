import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 text-center">
      <div className="text-6xl font-black text-white/10 mb-4">404</div>
      <h2 className="text-2xl font-bold text-white mb-2">找不到此頁面</h2>
      <p className="text-white/50 mb-6 text-sm">這個頁面不存在，或已被移除。</p>
      <Link
        href="/"
        className="border border-white/30 text-white text-sm px-6 py-2.5 rounded-full hover:bg-white/10 transition-colors"
      >
        回首頁
      </Link>
    </div>
  )
}
