export default function Footer() {
  return (
    <footer className="bg-warm-800 text-warm-100 py-10 mt-16">
      <div className="max-w-5xl mx-auto px-6 text-center">
        <p className="text-lg font-bold mb-1">領航里</p>
        <p className="text-sm text-warm-300 mb-4">深度交流 × 有效社交 × 打造理想生活圈</p>
        <div className="flex justify-center gap-6 text-sm text-warm-300">
          <a href="https://www.instagram.com/l.h_commons" target="_blank" rel="noopener noreferrer" className="hover:text-warm-100 transition-colors">
            Instagram @l.h_commons
          </a>
        </div>
        <p className="mt-6 text-xs text-warm-500">© 2026 領航里. All rights reserved.</p>
      </div>
    </footer>
  )
}
