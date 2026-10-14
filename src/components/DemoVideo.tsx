import { useState } from 'react'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'

function PlayIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M8 5v14l11-7z" />
    </svg>
  )
}

// Landing page's looping app demo, inside the phone mockup (Home.tsx). Muted
// autoplay by default — but a `prefers-reduced-motion: reduce` visitor gets
// the poster frame and an explicit play button instead of anything moving
// on its own; clicking it is a real user gesture, so the video that then
// mounts is still allowed to autoplay (it's muted either way) even under
// that same media query.
export function DemoVideo({ src, poster, alt }: { src: string; poster: string; alt: string }) {
  const reduceMotion = usePrefersReducedMotion()
  const [playRequested, setPlayRequested] = useState(false)

  if (reduceMotion && !playRequested) {
    return (
      <div className="relative h-full w-full">
        <img src={poster} alt={alt} className="h-full w-full object-cover object-top" />
        <button
          type="button"
          onClick={() => setPlayRequested(true)}
          aria-label={alt}
          className="absolute inset-0 flex items-center justify-center bg-black/20 transition-colors hover:bg-black/30"
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 text-[#FF7A00] shadow-lg">
            <PlayIcon className="h-6 w-6 translate-x-0.5" />
          </span>
        </button>
      </div>
    )
  }

  return (
    <video
      className="h-full w-full object-cover object-top"
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      poster={poster}
      aria-label={alt}
    >
      <source src={src} type="video/mp4" />
    </video>
  )
}
