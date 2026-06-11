'use client'
import { useState, useEffect, useRef, useCallback } from 'react'

export default function PhotoCarousel() {
  const [images, setImages] = useState<string[]>([])
  const [idx, setIdx] = useState(0)
  const [opacity, setOpacity] = useState(1)
  const [fetching, setFetching] = useState(true)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // 拿最新的 Notion 圖片 URL
  const fetchImages = useCallback(async () => {
    try {
      const res = await fetch('/api/activity-photos', { cache: 'no-store' })
      const data = await res.json()
      if (data.photos?.length) setImages(data.photos)
    } catch {
      // 靜默失敗
    } finally {
      setFetching(false)
    }
  }, [])

  useEffect(() => {
    fetchImages()
  }, [fetchImages])

  // 6 秒自動換圖，換之前重新抓一次 URL 防止過期
  const advance = useCallback(async (newIdx: number) => {
    setOpacity(0)
    // 淡出期間靜默更新 URL
    await fetchImages()
    setTimeout(() => {
      setIdx(newIdx)
      setOpacity(1)
    }, 400)
  }, [fetchImages])

  useEffect(() => {
    if (images.length < 2) return
    timerRef.current = setInterval(() => {
      setIdx(prev => {
        const next = (prev + 1) % images.length
        advance(next)
        return prev // 先不改，等 advance 裡的 setTimeout 改
      })
    }, 6000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [images.length, advance])

  const goTo = async (i: number) => {
    if (timerRef.current) clearInterval(timerRef.current)
    await advance(i)
    // 重新啟動計時
    timerRef.current = setInterval(() => {
      setIdx(prev => {
        const next = (prev + 1) % images.length
        advance(next)
        return prev
      })
    }, 6000)
  }

  if (fetching) {
    return (
      <div className="rounded-2xl bg-white/10 aspect-[4/3] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/30 border-t-white/70 rounded-full animate-spin" />
      </div>
    )
  }

  if (!images.length) {
    return <div className="rounded-2xl bg-white/10 aspect-[4/3]" />
  }

  return (
    <div>
      <div className="rounded-2xl overflow-hidden aspect-[4/3] bg-white/10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={images[idx]}
          alt=""
          className="w-full h-full object-cover"
          style={{ opacity, transition: 'opacity 0.4s ease' }}
          onError={fetchImages} // 破圖時立刻重抓
        />
      </div>
      {images.length > 1 && (
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
      )}
    </div>
  )
}
