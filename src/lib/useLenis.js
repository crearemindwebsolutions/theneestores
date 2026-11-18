import { useEffect } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function useLenis() {
  useEffect(() => {
    // Detect mobile or touch device
    const isTouchOrMobile =
      typeof window !== 'undefined' &&
      (window.innerWidth <= 860 ||
        'ontouchstart' in window ||
        (navigator.maxTouchPoints && navigator.maxTouchPoints > 0) ||
        window.matchMedia('(pointer: coarse)').matches)

    if (isTouchOrMobile) {
      // Touch devices have built-in hardware-accelerated momentum scrolling.
      // Running Lenis on mobile touch devices intercepts touch dragging, causing
      // severe scroll stutter, rubber-banding, and input latency.
      gsap.ticker.lagSmoothing(500, 33)
      return
    }

    const lenis = new Lenis({
      lerp: 0.08,
      smoothWheel: true,
      syncTouch: false,
    })
    window.__lenis = lenis

    lenis.on('scroll', ScrollTrigger.update)

    const tickerCallback = (time) => {
      lenis.raf(time * 1000)
    }

    gsap.ticker.add(tickerCallback)
    gsap.ticker.lagSmoothing(0)

    return () => {
      lenis.destroy()
      window.__lenis = null
      gsap.ticker.remove(tickerCallback)
      gsap.ticker.lagSmoothing(500, 33)
    }
  }, [])
}
