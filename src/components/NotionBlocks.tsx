import type { NotionBlock } from '@/lib/notion'

function richText(arr: any[]): string {
  if (!arr) return ''
  return arr.map((t: any) => t.plain_text).join('')
}

function RichText({ arr }: { arr: any[] }) {
  if (!arr) return null
  return (
    <>
      {arr.map((t: any, i: number) => {
        const parts = (t.plain_text as string).split('\n')
        let node: React.ReactNode = (
          <>
            {parts.map((part, pi) => (
              <span key={pi}>
                {part}
                {pi < parts.length - 1 && <br />}
              </span>
            ))}
          </>
        )
        if (t.annotations?.bold) node = <strong key={i} className="font-semibold">{node}</strong>
        if (t.annotations?.italic) node = <em key={i}>{node}</em>
        if (t.annotations?.code) node = <code key={i} className="bg-brand-50 text-brand-700 px-1.5 py-0.5 rounded text-sm font-mono">{node}</code>
        if (t.href) node = <a key={i} href={t.href} target="_blank" rel="noopener noreferrer" className="text-brand-500 underline underline-offset-2 hover:text-brand-700 break-all">{node}</a>
        return <span key={i}>{node}</span>
      })}
    </>
  )
}

// 偵測是否以 emoji 開頭（作為區塊標題行）
function startsWithEmoji(text: string): boolean {
  const cp = text.trim().codePointAt(0)
  if (!cp) return false
  return (
    (cp >= 0x2600 && cp <= 0x27BF) ||  // ☀ ⚠ ⭐ 等符號
    (cp >= 0x1F000 && cp <= 0x1FFFF)   // 🎯 🏅 💰 📍 🔥 等全部 emoji
  )
}

function youtubeEmbedUrl(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{11})/)
  return match ? `https://www.youtube.com/embed/${match[1]}` : null
}

export default function NotionBlocks({ blocks, dark = false }: { blocks: NotionBlock[]; dark?: boolean }) {
  const c = dark ? {
    text: 'text-white font-bold leading-relaxed text-lg',
    heading1: 'text-xl font-black text-white pb-2 border-b border-white/20',
    heading2: 'text-base font-bold text-white/90 flex items-center gap-2',
    heading2bar: 'w-1 h-4 bg-white/40 rounded-full inline-block flex-none',
    heading3: 'text-sm font-bold text-white/70 uppercase tracking-wide',
    card: 'bg-white/10 border border-white/15 rounded-2xl px-5 py-4',
    cardText: 'text-white/80 leading-relaxed text-[15px]',
    li: 'flex gap-2.5 text-white/75 leading-relaxed',
    dot: 'flex-none mt-2 w-1.5 h-1.5 rounded-full bg-white/40 inline-block',
    numBadge: 'flex-none w-6 h-6 rounded-full bg-white/20 text-white/80 text-xs font-bold flex items-center justify-center mt-0.5',
    quote: 'border-l-4 border-white/30 pl-4 py-1 text-white/60 italic text-sm',
    callout: 'flex gap-3 bg-white/10 border border-white/15 rounded-2xl px-5 py-4',
    calloutText: 'text-white/80 leading-relaxed text-sm',
    divider: 'border-white/15',
  } : {
    text: 'text-brand-700 leading-relaxed text-[15px]',
    heading1: 'text-xl font-black text-brand-900 pb-2 border-b border-brand-100',
    heading2: 'text-base font-bold text-brand-800 flex items-center gap-2',
    heading2bar: 'w-1 h-4 bg-brand-400 rounded-full inline-block flex-none',
    heading3: 'text-sm font-bold text-brand-600 uppercase tracking-wide',
    card: 'bg-brand-50 border border-brand-100 rounded-2xl px-5 py-4',
    cardText: 'text-brand-800 leading-relaxed text-[15px]',
    li: 'flex gap-2.5 text-brand-700 leading-relaxed',
    dot: 'flex-none mt-2 w-1.5 h-1.5 rounded-full bg-brand-300 inline-block',
    numBadge: 'flex-none w-6 h-6 rounded-full bg-brand-100 text-brand-600 text-xs font-bold flex items-center justify-center mt-0.5',
    quote: 'border-l-4 border-brand-300 pl-4 py-1 text-brand-500 italic text-sm',
    callout: 'flex gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4',
    calloutText: 'text-amber-800 leading-relaxed text-sm',
    divider: 'border-brand-100',
  }

  const elements: React.ReactNode[] = []
  let bulletBuffer: NotionBlock[] = []
  let numberedBuffer: NotionBlock[] = []

  function flushBullets() {
    if (!bulletBuffer.length) return
    elements.push(
      <ul key={`ul-${elements.length}`} className="space-y-2 pl-2">
        {bulletBuffer.map(b => (
          <li key={b.id} className={c.li}>
            <span className={c.dot} />
            <span><RichText arr={b.bulleted_list_item?.rich_text} /></span>
          </li>
        ))}
      </ul>
    )
    bulletBuffer = []
  }

  function flushNumbered() {
    if (!numberedBuffer.length) return
    elements.push(
      <ol key={`ol-${elements.length}`} className="space-y-2 pl-2">
        {numberedBuffer.map((b, idx) => (
          <li key={b.id} className={c.li}>
            <span className={c.numBadge}>{idx + 1}</span>
            <span><RichText arr={b.numbered_list_item?.rich_text} /></span>
          </li>
        ))}
      </ol>
    )
    numberedBuffer = []
  }

  for (const block of blocks) {
    if (block.type !== 'bulleted_list_item') flushBullets()
    if (block.type !== 'numbered_list_item') flushNumbered()

    switch (block.type) {
      case 'paragraph': {
        const text = richText(block.paragraph?.rich_text)
        if (!text.trim()) {
          elements.push(<div key={block.id} className="h-2" />)
          break
        }

        if (startsWithEmoji(text)) {
          elements.push(
            <div key={block.id} className={c.card}>
              <p className={c.cardText}><RichText arr={block.paragraph?.rich_text} /></p>
            </div>
          )
        } else {
          elements.push(
            <p key={block.id} className={c.text}>
              <RichText arr={block.paragraph?.rich_text} />
            </p>
          )
        }
        break
      }

      case 'heading_1':
        elements.push(
          <div key={block.id} className="pt-2">
            <h2 className={c.heading1}><RichText arr={block.heading_1?.rich_text} /></h2>
          </div>
        )
        break

      case 'heading_2':
        elements.push(
          <div key={block.id} className="pt-1">
            <h3 className={c.heading2}>
              <span className={c.heading2bar} />
              <RichText arr={block.heading_2?.rich_text} />
            </h3>
          </div>
        )
        break

      case 'heading_3':
        elements.push(
          <h4 key={block.id} className={c.heading3}><RichText arr={block.heading_3?.rich_text} /></h4>
        )
        break

      case 'bulleted_list_item':
        bulletBuffer.push(block)
        break

      case 'numbered_list_item':
        numberedBuffer.push(block)
        break

      case 'quote':
        elements.push(
          <blockquote key={block.id} className={c.quote}>
            <RichText arr={block.quote?.rich_text} />
          </blockquote>
        )
        break

      case 'callout':
        elements.push(
          <div key={block.id} className={c.callout}>
            <span className="text-xl flex-none">{block.callout?.icon?.emoji ?? 'ℹ️'}</span>
            <p className={c.calloutText}><RichText arr={block.callout?.rich_text} /></p>
          </div>
        )
        break

      case 'divider':
        elements.push(<hr key={block.id} className={c.divider} />)
        break

      case 'image': {
        const url = block.image?.type === 'external'
          ? block.image.external.url
          : block.image?.file?.url
        const caption = richText(block.image?.caption)
        if (url) {
          elements.push(
            <figure key={block.id}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={caption || '活動圖片'} className="w-full rounded-2xl object-cover" />
              {caption && <figcaption className="text-center text-sm text-brand-400 mt-2">{caption}</figcaption>}
            </figure>
          )
        }
        break
      }

      case 'video': {
        const url = block.video?.type === 'external'
          ? block.video.external.url
          : block.video?.file?.url
        if (url) {
          const embedUrl = youtubeEmbedUrl(url)
          if (embedUrl) {
            elements.push(
              <div key={block.id} className="relative w-full rounded-2xl overflow-hidden" style={{ paddingBottom: '56.25%' }}>
                <iframe
                  src={embedUrl}
                  className="absolute inset-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title="活動影片"
                />
              </div>
            )
          } else {
            elements.push(<video key={block.id} src={url} controls className="w-full rounded-2xl" />)
          }
        }
        break
      }

      default:
        break
    }
  }

  flushBullets()
  flushNumbered()

  return <div className="space-y-4">{elements}</div>
}
