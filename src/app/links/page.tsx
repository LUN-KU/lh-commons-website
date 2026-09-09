import { getSiteLinks } from '@/lib/notion'

export const revalidate = 60

export default async function LinksPage() {
  const links = await getSiteLinks()

  return (
    <div className="max-w-lg mx-auto px-7 sm:px-6 py-20">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-white mb-3">領航里</h1>
        <p className="text-white/70">所有重要連結都在這裡</p>
      </div>

      <div className="space-y-5">
        {links.map(link => (
          <a
            key={link.title}
            href={link.url}
            target={link.url.startsWith('http') ? '_blank' : '_self'}
            rel="noopener noreferrer"
            className="flex items-center gap-5 bg-white border border-brand-100 rounded-3xl px-7 py-5 shadow-[0_2px_12px_rgba(19,37,84,0.08)] hover:shadow-[0_6px_20px_rgba(19,37,84,0.14)] hover:-translate-y-0.5 hover:border-brand-200 transition-all duration-200 group"
          >
            <span className="flex-none w-11 h-11 rounded-2xl bg-brand-50 flex items-center justify-center text-2xl">{link.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-brand-800 group-hover:text-brand-900 transition-colors">{link.title}</p>
              {link.description && <p className="text-sm text-brand-400 mt-0.5">{link.description}</p>}
            </div>
            <span className="flex-none text-brand-300 group-hover:text-brand-500 group-hover:translate-x-0.5 transition-all">→</span>
          </a>
        ))}
      </div>

      <p className="text-center text-sm text-white/55 mt-12">
        成為領航里的一分子，一起探索、成長、連結！
      </p>
    </div>
  )
}
