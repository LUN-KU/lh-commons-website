import Link from 'next/link'

export default function AuthErrorPage() {
  return (
    <div className="max-w-md mx-auto px-6 py-24 text-center">
      <p className="text-4xl mb-6">🔒</p>
      <h1 className="text-2xl font-black text-white mb-4">無法登入</h1>
      <p className="text-white/60 text-sm leading-relaxed mb-8">
        你的 Google 帳號尚未加入領航里，或帳號已停用。
        <br />
        請先參加活動成為里民，或聯絡管理員確認帳號狀態。
      </p>
      <a
        href="https://www.instagram.com/l.h_commons"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block border border-white/30 text-white text-sm font-medium px-6 py-2.5 rounded-full hover:bg-white/10 transition-colors mr-3"
      >
        聯絡 @l.h_commons
      </a>
      <Link
        href="/"
        className="inline-block text-white/50 text-sm hover:text-white transition-colors"
      >
        回首頁
      </Link>
    </div>
  )
}
