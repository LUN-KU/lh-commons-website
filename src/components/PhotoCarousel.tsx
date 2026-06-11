'use client'
import { useState, useEffect, useRef, useCallback } from 'react'

export default function PhotoCarousel() {
  const [images, setImages] = useState<string[]>([])
  const [cur, setCur] = useState(0)       // 目前顯示的圖
  const [next, setNext] = useState<number | null>(null)  // 滑入的圖
  const [dir, setDir] = useState<1 | -1>(1) // 1 = 往左滑, -1 = 往右滑
  const [moving, setMoving] = useState(false)
  const [fetching, setFetching] = useState(true)
  const lockRef = useRef(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchImages = useCallback(async () => {
    try {
      const res = await fetch('/api/activity-photos', { cache: 'no-store' })
      const data = await res.json()
      if (data.photos?.length) setImages(data.photos)
    } catch {}
    finally { setFetching(false) }
  }, [])

  useEffect(() => { fetchImages() }, [fetchImages])

  const slideTo = useCallback((newIdx: number, slideDir: 1 | -1 = 1) => {
    if (lockRef.current) return
    lockRef.current = true
    setDir(slideDir)
    setNext(newIdx)
    // 一個 frame 後啟動 transition
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setMoving(true)
        setTimeout(() => {
          setCur(newIdx)
          setNext(null)
          setMoving(false)
          lockRef.current = false
        }, 450)
      })
    })
  }, [])

  const startTimer = useCallback((len: number) => {
    if (timerRef.current) clearInterval(timerRef.current)
    if (len < 2) return
    timerRef.current = setInterval(() => {
      fetchImages()
      setCur(prev => {
        const n = (prev + 1) % len
        slideTo(n, 1)
        return prev
      })
    }, 6000)
  }, [fetchImages, slideTo])

  useEffect(() => {
    if (!images.length) return
    startTimer(images.length)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [images.length, startTimer])

  const goTo = (i: number) => {
    if (lockRef.current) return
    const d = i > cur ? 1 : -1
    startTimer(images.length)
    slideTo(i, d)
  }

  if (fetching) return (
    <div className="rounded-2xl bg-white/10 aspect-[4/3] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-white/30 border-t-white/70 rounded-full animate-spin" />
    </div>
  )

  if (!images.length) return <div className="rounded-2xl bg-white/10 aspect-[4/3]" />

  // 目前圖：靜止時 0，滑動時往反方向推出
  const curX = moving ? (dir === 1 ? '-100%' : '100%') : '0%'
  // 新圖：滑動前從反方向進場，滑動後到 0
  const nextX = moving ? '0%' : (dir === 1 ? '100%' : '-100%')

  return (
    <div>
      <div className="rounded-2xl overflow-hidden aspect-[4/3] bg-white/10 relative">
        {/* 目前的圖 */}
        <img
          src={images[cur]}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{ transform: `translateX(${curX})`, transition: moving ? 'transform 0.45s ease-in-out' : 'none' }}
          onError={fetchImages}
        />
        {/* 滑入的圖 */}
        {next !== null && (
          <img
            src={images[next]}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            style={{ transform: `translateX(${nextX})`, transition: moving ? 'transform 0.45s ease-in-out' : 'none' }}
            onError={fetchImages}
          />
        )}
      </div>

      {images.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-4">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === (next ?? cur) ? 'w-5 bg-white' : 'w-1.5 bg-white/30'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
