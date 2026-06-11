'use client'
import { useState, useEffect, useRef, useCallback } from 'react'

export default function PhotoCarousel() {
  const [images, setImages] = useState<string[]>([])
  const [idx, setIdx] = useState(0)
  const [animated, setAnimated] = useState(true)
  const [fetching, setFetching] = useState(true)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const lockRef = useRef(false)

  const fetchImages = useCallback(async () => {
    try {
      const res = await fetch('/api/activity-photos', { cache: 'no-store' })
      const data = await res.json()
      if (data.photos?.length) setImages(data.photos)
    } catch {}
    finally { setFetching(false) }
  }, [])

  useEffect(() => { fetchImages() }, [fetchImages])

  const advance = useCallback((images: string[]) => {
    if (lockRef.current) return
    lockRef.current = true
    setIdx(prev => {
      const next = (prev + 1) % images.length
      if (next === 0) {
        // 循環回頭：先不動畫跳回 0，再打開動畫
        setAnimated(false)
        requestAnimationFrame(() => requestAnimationFrame(() => setAnimated(true)))
      } else {
        setAnimated(true)
      }
      return next
    })
    setTimeout(() => { lockRef.current = false }, 450)
  }, [])

  const resetTimer = useCallback((images: string[]) => {
    if (timerRef.current) clearInterval(timerRef.current)
    if (images.length < 2) return
    timerRef.current = setInterval(() => {
      fetchImages()
      advance(images)
    }, 6000)
  }, [fetchImages, advance])

  useEffect(() => {
    if (!images.length) return
    resetTimer(images)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [images, resetTimer])

  const goTo = (i: number) => {
    if (lockRef.current) return
    setAnimated(true)
    setIdx(i)
    resetTimer(images)
  }

  if (fetching) return (
    <div className="rounded-2xl bg-white/10 aspect-[4/3] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-white/30 border-t-white/70 rounded-full animate-spin" />
    </div>
  )

  if (!images.length) return <div className="rounded-2xl bg-white/10 aspect-[4/3]" />

  const n = images.length
  // 軌道整體往左移，每格 = 1 個 container 寬
  const trackX = -(idx / n) * 100

  return (
    <div>
      <div className="rounded-2xl overflow-hidden aspect-[4/3] bg-white/10">
        {/* 整條軌道一起滑，不分開控制各圖 */}
        <div
          className="flex h-full"
          style={{
            width: `${n * 100}%`,
            transform: `translateX(${trackX}%)`,
            transition: animated ? 'transform 0.4s ease-in-out' : 'none',
          }}
        >
          {images.map((src, i) => (
            <div key={i} style={{ width: `${100 / n}%` }} className="flex-shrink-0 h-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt=""
                className="w-full h-full object-cover"
                onError={fetchImages}
              />
            </div>
          ))}
        </div>
      </div>

      {n > 1 && (
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
