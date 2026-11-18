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
    if (!ref.current) return

    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768
    const list =
      typeof groups === 'string' ? [{ selector: groups, ...sharedOptions }] : groups

    const ctx = gsap.context(() => {
      list.forEach((g) => {
        const targets = ref.current.querySelectorAll(g.selector)
        if (!targets.length) return

        // On mobile, clamp horizontal x to 0 and gentle vertical y to avoid any horizontal viewport overflow
        const xVal = isMobile ? 0 : (g.x ?? 0)
        const yVal = isMobile ? Math.min(g.y ?? 20, 20) : (g.y ?? 40)

        gsap.from(targets, {
          opacity: 0,
          y: yVal,
          x: xVal,
          rotateX: isMobile ? 0 : (g.rotateX ?? 0),
          rotateY: isMobile ? 0 : (g.rotateY ?? 0),
          scale: isMobile ? 1 : (g.scale ?? 1),
          transformPerspective: g.perspective ?? 1000,
          transformOrigin: g.transformOrigin ?? 'center center',
          duration: isMobile ? 0.4 : (g.duration ?? 0.75),
          ease: g.ease ?? 'power3.out',
          stagger: isMobile ? 0.03 : (g.stagger ?? 0.08),
          scrollTrigger: {
            trigger: ref.current,
            start: g.start ?? (isMobile ? 'top 95%' : 'top 85%'),
            once: true,
          },
        })
      })
    }, ref)

    const refreshTimer = setTimeout(() => {
      ScrollTrigger.refresh()
    }, 100)

    return () => {
      clearTimeout(refreshTimer)
      ctx.revert()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return ref
}
