export default function Footer() {
  return (
    <footer className="bg-brand-800 text-brand-100 py-10 mt-16">
      <div className="max-w-5xl mx-auto px-6 text-center">
        <div className="flex justify-center mb-3">
          <span className="flex-none w-24 h-24 rounded-full overflow-hidden bg-white flex items-center justify-center p-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="領航里" className="w-full h-full object-contain" />
          </span>
        </div>
        <p className="text-lg font-bold mb-1">領航里里民活動</p>
        <p className="text-sm text-brand-300 mb-4">深度交流 × 輕鬆社交 × 打造理想生活圈</p>
        <div className="flex justify-center gap-6 text-sm text-brand-300">
          <a href="https://www.instagram.com/l.h_commons" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
            Instagram @l.h_commons
          </a>
        </div>
        <p className="mt-6 text-xs text-brand-500">© 2026 領航里. All rights reserved.</p>
      </div>
    </footer>
  )
}
