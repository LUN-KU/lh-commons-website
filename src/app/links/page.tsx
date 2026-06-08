const links = [
  {
    title: 'Instagram',
    description: '追蹤最新活動資訊與日常',
    url: 'https://www.instagram.com/l.h_commons',
    emoji: '📸',
  },
  {
    title: '加入領航里 LINE 官方帳號',
    description: '活動報名、問題詢問',
    url: '#',
    emoji: '💬',
  },
  {
    title: '活動總覽',
    description: '查看本月所有活動',
    url: '/events',
    emoji: '📅',
  },
]

export default function LinksPage() {
  return (
    <div className="max-w-xl mx-auto px-6 py-16">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-warm-800 mb-2">領航里</h1>
        <p className="text-warm-500">所有重要連結都在這裡</p>
      </div>

      <div className="space-y-4">
        {links.map(link => (
          <a
            key={link.title}
            href={link.url}
            target={link.url.startsWith('http') ? '_blank' : '_self'}
            rel="noopener noreferrer"
            className="flex items-center gap-4 bg-white border border-warm-200 rounded-2xl px-6 py-4 hover:border-warm-400 hover:shadow-sm transition-all group"
          >
            <span className="text-2xl">{link.emoji}</span>
            <div className="flex-1">
              <p className="font-bold text-warm-800 group-hover:text-warm-600 transition-colors">{link.title}</p>
              <p className="text-sm text-warm-400">{link.description}</p>
            </div>
            <span className="text-warm-300 group-hover:text-warm-500 transition-colors">→</span>
          </a>
        ))}
      </div>

      <p className="text-center text-sm text-warm-400 mt-10">
        成為領航里的一分子，一起探索、成長、連結！
      </p>
    </div>
  )
}
