import { getCollabBlocks } from '@/lib/notion'
import NotionBlocks from '@/components/NotionBlocks'

export const revalidate = 60

export default async function CollabPage() {
  const blocks = await getCollabBlocks()

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <p className="text-white/40 text-xs tracking-[0.2em] uppercase mb-4">Collaboration</p>
      <h1 className="text-4xl font-black text-white mb-4">合作專區</h1>
      <div className="w-14 h-0.5 bg-white/30 mb-10" />

      {blocks.length > 0 ? (
        <div className="bg-white rounded-3xl px-6 py-7 shadow-sm">
          <NotionBlocks blocks={blocks} />
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-white/55 text-sm leading-relaxed max-w-md mx-auto mb-10">
            歡迎品牌、場地、講師與領航里合作，一起為里民帶來更豐富的活動體驗。
          </p>
          <a
            href="https://www.instagram.com/l.h_commons"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-white text-brand-800 font-bold px-8 py-3.5 rounded-full hover:bg-brand-100 transition-colors shadow-lg"
          >
            私訊洽詢 @l.h_commons
          </a>
        </div>
      )}
    </div>
  )
}
