'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 text-center">
      <div className="text-5xl mb-4">⚠️</div>
      <h2 className="text-2xl font-bold text-white mb-2">頁面載入發生錯誤</h2>
      <p className="text-white/50 mb-6 text-sm">可能是網路不穩或服務暫時中斷，請稍後再試。</p>
      <button
        onClick={reset}
        className="border border-white/30 text-white text-sm px-6 py-2.5 rounded-full hover:bg-white/10 transition-colors"
      >
        重新載入
      </button>
    </div>
  )
}
