import Link from 'next/link'
import { getSiteSettings } from '@/lib/notion'

export const revalidate = 60

export default async function AboutPage() {
  const s = await getSiteSettings()

  const activityTypes = ['主題式交流', '密室逃脫', '讀書會', '一日遊', '運動揪團', '手作體驗', '桌遊', '派對', '專業講座']

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold text-brand-700 mb-2">關於領航里</h1>
      <p className="text-brand-400 mb-10">深度交流 × 有效社交 × 打造理想生活圈</p>

      <div className="space-y-8 text-brand-600 leading-relaxed">
        <p className="text-lg">{s.about}</p>

        <div className="bg-white rounded-2xl p-6 border border-brand-100">
          <h2 className="text-xl font-bold text-brand-700 mb-5">我們的數字</h2>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-3xl font-bold text-brand-600">{s.memberCount}</p>
              <p className="text-sm text-brand-400 mt-1">里民人數</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-brand-600">{s.eventsPerMonth}</p>
              <p className="text-sm text-brand-400 mt-1">每月活動場數</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-brand-600">∞</p>
              <p className="text-sm text-brand-400 mt-1">可能的連結</p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold text-brand-700 mb-4">我們舉辦的活動類型</h2>
          <div className="flex flex-wrap gap-2">
            {activityTypes.map(tag => (
              <span key={tag} className="bg-white border border-brand-200 rounded-full px-4 py-1.5 text-sm text-brand-500">
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold text-brand-700 mb-3">加入我們</h2>
          <p className="mb-6">{s.joinUs}</p>
          <a
            href="https://www.instagram.com/l.h_commons"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-brand-700 text-white font-bold px-8 py-3 rounded-full hover:bg-brand-800 transition-colors"
          >
            前往 Instagram @l.h_commons
          </a>
        </div>
      </div>
    </div>
  )
}
