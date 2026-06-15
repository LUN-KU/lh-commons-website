import Link from 'next/link'

const PLAN1_BENEFITS = [
  { label: '專屬優惠', desc: '里民專屬活動優惠價' },
  { label: '多元發展', desc: '合作活動、老師、店家專屬折扣' },
  { label: '深度交流', desc: '「非資深里民不得參加」的私密線下聚會' },
  { label: '秘密禮物', desc: '不定期驚喜好禮、優惠禮券' },
]

const PLAN2_EXTRAS = [
  { label: '領航特權', desc: '全年活動最優先保留位 + 3 次主題許願權' },
  { label: '理想生活復盤', desc: '1 hr 設計思考，由里長陪你對焦年度目標' },
  { label: '專業財務諮詢', desc: '1 hr 顧問式資產盤點，打造穩健配置' },
]

export default function JoinPlans() {
  return (
    <div className="space-y-6">

      {/* 方案一 */}
      <div className="bg-white/10 border border-white/20 rounded-3xl p-6 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="text-xs font-bold text-white/50 uppercase tracking-widest">方案一</span>
            <h2 className="text-xl font-black text-white mt-0.5">資深里民 1.0</h2>
            <p className="text-sm text-white/60">社交連結型</p>
          </div>
          <div className="text-right shrink-0">
            <span className="text-2xl font-black text-white">$720</span>
            <p className="text-xs text-white/40">/ 年</p>
          </div>
        </div>

        <p className="text-sm text-white/60">適合喜歡參與活動、享受跨領域交流、支持領航里的你。</p>

        <div className="space-y-2">
          {PLAN1_BENEFITS.map(b => (
            <div key={b.label} className="flex gap-2 text-sm">
              <span className="text-amber-300 shrink-0">✦</span>
              <span className="text-white/80"><span className="font-semibold text-white">{b.label}：</span>{b.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 方案二 */}
      <div className="bg-gradient-to-br from-brand-600/30 to-amber-500/20 border border-brand-400/40 rounded-3xl p-6 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="text-xs font-bold text-brand-300 uppercase tracking-widest">方案二</span>
            <h2 className="text-xl font-black text-white mt-0.5">理想領航員 2.0</h2>
            <p className="text-sm text-brand-200/70">專業成長型</p>
          </div>
          <div className="text-right shrink-0">
            <span className="text-2xl font-black text-white">$1,980</span>
            <p className="text-xs text-white/40">/ 年</p>
          </div>
        </div>

        <p className="text-sm text-white/60">適合想在今年對焦目標、釐清財務迷惘、精準成長的你。</p>

        <div className="bg-white/10 rounded-2xl px-4 py-2.5 text-sm text-white/70">
          ✅ 包含資深里民 1.0 全部福利，再加：
        </div>

        <div className="space-y-2">
          {PLAN2_EXTRAS.map(b => (
            <div key={b.label} className="flex gap-2 text-sm">
              <span className="text-brand-300 shrink-0">✦</span>
              <span className="text-white/80"><span className="font-semibold text-white">{b.label}：</span>{b.desc}</span>
            </div>
          ))}
        </div>

        <p className="text-xs text-white/40 pt-1">⚠️ 全年度限額開放（含專業諮詢工時）</p>
      </div>

      {/* 如何加入 */}
      <div className="bg-white rounded-3xl p-6 space-y-4">
        <h3 className="text-brand-800 font-black text-base">如何加入？</h3>
        <p className="text-sm text-gray-500">請直接私訊里長，並告知你想加入的方案！</p>

        <div className="space-y-3">
          <a
            href="https://page.line.me/850frpmp"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 bg-[#06C755] text-white font-bold py-3 px-4 rounded-2xl text-sm hover:bg-[#05b04c] transition-colors"
          >
            <span className="text-lg">💬</span>
            <span>加官方 Line：@850frpmp</span>
          </a>

          <a
            href="https://www.instagram.com/l.h_commons"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 px-4 rounded-2xl text-sm hover:opacity-90 transition-opacity"
          >
            <span className="text-lg">📸</span>
            <span>IG 活動動態：@l.h_commons</span>
          </a>

          <a
            href="https://www.instagram.com/ych65"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 bg-gray-100 text-gray-700 font-bold py-3 px-4 rounded-2xl text-sm hover:bg-gray-200 transition-colors"
          >
            <span className="text-lg">👤</span>
            <span>私訊里長小歆：@ych65</span>
          </a>
        </div>
      </div>

      {/* 重要說明 */}
      <div className="bg-white/5 border border-white/10 rounded-2xl px-5 py-4 space-y-1.5 text-xs text-white/50">
        <p className="font-semibold text-white/70">⚠️ 重要權益須知</p>
        <p>· 會員期限：自繳費後「第一次」參與里民活動起計算一年，權益完整保障。</p>
        <p>· 名額限制：2.0 理想領航員含專業諮詢工時，全年度限額開放。</p>
      </div>

    </div>
  )
}
