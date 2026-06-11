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
    return <div className="rounded-2xl bg-white/10 aspect-[4/3]" />
  }

  return (
    <div>
      <div className="rounded-2xl overflow-hidden aspect-[4/3]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={images[idx]} alt="" className="w-full h-full object-cover transition-opacity duration-500" />
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
