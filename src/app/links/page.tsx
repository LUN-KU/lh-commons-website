import { getSiteLinks } from '@/lib/notion'

export const revalidate = 60

export default async function LinksPage() {
  const links = await getSiteLinks()

  return (
    <div className="max-w-xl mx-auto px-6 py-16">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-brand-700 mb-2">領航里</h1>
        <p className="text-brand-400">所有重要連結都在這裡</p>
      </div>

      <div className="space-y-4">
        {links.map(link => (
          <a
            key={link.title}
            href={link.url}
            target={link.url.startsWith('http') ? '_blank' : '_self'}
            rel="noopener noreferrer"
            className="flex items-center gap-4 bg-white border border-brand-100 rounded-2xl px-6 py-4 hover:border-brand-300 hover:shadow-sm transition-all group"
          >
            <span className="text-2xl">{link.emoji}</span>
            <div className="flex-1">
              <p className="font-bold text-brand-700 group-hover:text-brand-900 transition-colors">{link.title}</p>
              <p className="text-sm text-brand-400">{link.description}</p>
            </div>
            <span className="text-brand-300 group-hover:text-brand-500 transition-colors">→</span>
          </a>
        ))}
      </div>

      <p className="text-center text-sm text-brand-300 mt-10">
        成為領航里的一分子，一起探索、成長、連結！
      </p>
    </div>
  )
}
