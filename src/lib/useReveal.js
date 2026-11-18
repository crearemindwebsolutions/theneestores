import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// Accepts either a single selector string (classic 2D fade-up) or an array
// of { selector, ...tween overrides } groups sharing the same section
// trigger, each animated independently - lets a section fade text in one
// way while images tilt in from off-screen another way.
export default function useReveal(groups, sharedOptions = {}) {
  const ref = useRef(null)

  useEffect(() => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768
    const list =
      typeof groups === 'string' ? [{ selector: groups, ...sharedOptions }] : groups

    const ctx = gsap.context(() => {
      list.forEach((g) => {
        const targets = ref.current.querySelectorAll(g.selector)
        if (!targets.length) return

        // On mobile, clamp horizontal x to 0 and gentle vertical y to avoid any horizontal viewport overflow
        const xVal = isMobile ? 0 : (g.x ?? 0)
        const yVal = isMobile ? Math.min(g.y ?? 24, 24) : (g.y ?? 60)

        gsap.from(targets, {
          opacity: 0,
          y: yVal,
          x: xVal,
          rotateX: isMobile ? 0 : (g.rotateX ?? 0),
          rotateY: isMobile ? 0 : (g.rotateY ?? 0),
          scale: isMobile ? 1 : (g.scale ?? 1),
          transformPerspective: g.perspective ?? 1000,
          transformOrigin: g.transformOrigin ?? 'center center',
          duration: isMobile ? 0.45 : (g.duration ?? 0.9),
          ease: g.ease ?? 'power3.out',
          stagger: isMobile ? 0.04 : (g.stagger ?? 0.1),
          scrollTrigger: {
            trigger: ref.current,
            start: g.start ?? (isMobile ? 'top 90%' : 'top 80%'),
          },
        })
      })
    }, ref)

    return () => ctx.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return ref
}
