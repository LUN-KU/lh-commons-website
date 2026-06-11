'use client'
import { useState, useEffect } from 'react'

export default function PhotoCarousel({ images }: { images: string[] }) {
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    if (images.length < 2) return
    const t = setInterval(() => setIdx(i => (i + 1) % images.length), 3000)
    return () => clearInterval(t)
  }, [images.length])

  if (!images.length) {
    return (
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-white/10 aspect-[4/3]" />
        <div className="rounded-2xl bg-white/10 aspect-[4/3]" />
      </div>
    )
  }

  const show = (offset: number) => images[(idx + offset) % images.length]

  return (
    <div>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl overflow-hidden aspect-[4/3]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={show(0)} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="rounded-2xl overflow-hidden aspect-[4/3]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={show(1)} alt="" className="w-full h-full object-cover" />
        </div>
      </div>
      <div className="flex justify-center gap-1.5 mt-4">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            className={`h-1.5 rounded-full transition-all ${
              i === idx ? 'w-5 bg-white' : 'w-1.5 bg-white/30'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
