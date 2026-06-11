'use client'
import { useState, useEffect, useRef } from 'react'

export default function PhotoCarousel({ images }: { images: string[] }) {
  const [idx, setIdx] = useState(0)
  const [loaded, setLoaded] = useState<boolean[]>([])
  const [visible, setVisible] = useState(true)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // 預載全部圖片
  useEffect(() => {
    if (!images.length) return
    const status = new Array(images.length).fill(false)
    images.forEach((src, i) => {
      const img = new Image()
      img.onload = () => {
        status[i] = true
        setLoaded([...status])
      }
      img.onerror = () => {
        status[i] = true // 失敗也標記完成，避免卡住
        setLoaded([...status])
      }
      img.src = src
    })
  }, [images])

  // 6 秒自動換，淡出 → 換圖 → 淡入
  useEffect(() => {
    if (images.length < 2) return
    timerRef.current = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setIdx(i => (i + 1) % images.length)
        setVisible(true)
      }, 400)
    }, 6000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [images.length])

  const goTo = (i: number) => {
    if (timerRef.current) clearInterval(timerRef.current)
    setVisible(false)
    setTimeout(() => {
      setIdx(i)
      setVisible(true)
      timerRef.current = setInterval(() => {
        setVisible(false)
        setTimeout(() => {
          setIdx(prev => (prev + 1) % images.length)
          setVisible(true)
        }, 400)
      }, 6000)
    }, 400)
  }

  if (!images.length) {
    return <div className="rounded-2xl bg-white/10 aspect-[4/3]" />
  }

  const isReady = loaded[idx]

  return (
    <div>
      <div className="rounded-2xl overflow-hidden aspect-[4/3] bg-white/10 relative">
        {isReady ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={idx}
            src={images[idx]}
            alt=""
            className="w-full h-full object-cover"
            style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.4s ease' }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-white/30 border-t-white/70 rounded-full animate-spin" />
          </div>
        )}
      </div>
      <div className="flex justify-center gap-1.5 mt-4">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`h-1.5 rounded-full transition-all ${
              i === idx ? 'w-5 bg-white' : 'w-1.5 bg-white/30'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
