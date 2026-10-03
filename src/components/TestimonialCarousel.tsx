import { TESTIMONIALS } from '../lib/testimonials'

function StarIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2.5l2.9 6.2 6.8.7-5.1 4.6 1.5 6.7L12 17.3l-6.1 3.4 1.5-6.7-5.1-4.6 6.8-.7L12 2.5z" />
    </svg>
  )
}

// Rendered twice (track = [...TESTIMONIALS, ...TESTIMONIALS]) so the
// marquee-scroll animation (index.css) can loop seamlessly — same real 5
// reviews in both spots on the page, repeating is expected/fine per the
// task that added this.
export function TestimonialCarousel() {
  const track = [...TESTIMONIALS, ...TESTIMONIALS]

  return (
    // Narrower than the page on purpose — real empty margin left/right at
    // desktop widths, with the fade-cutoff happening at THIS box's edges
    // rather than the viewport's, so the partially-visible edge cards read
    // as "more to scroll" rather than the carousel just stopping. 1150px /
    // 340px cards: wide enough for comfortable reading, still clearly
    // narrower than the page at typical desktop widths.
    <div className="mx-auto max-w-[1150px] px-4 sm:px-6">
      <div className="marquee-fade relative overflow-hidden">
        <div className="marquee-track flex gap-5">
          {track.map((testimonial, i) => (
            <div
              key={`${testimonial.name}-${i}`}
              className="flex w-[340px] shrink-0 flex-col gap-3 rounded-2xl bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04),0_12px_24px_rgba(0,0,0,0.08)]"
            >
              <div className="flex gap-0.5 text-primary" role="img" aria-label={`${testimonial.rating} étoiles sur 5`}>
                {Array.from({ length: testimonial.rating }).map((_, starIndex) => (
                  <StarIcon key={starIndex} className="h-4 w-4" />
                ))}
              </div>
              <p className="text-sm leading-relaxed text-ink">“{testimonial.quote}”</p>
              <p className="text-sm font-semibold text-ink">{testimonial.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
