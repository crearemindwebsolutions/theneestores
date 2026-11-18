import { useEffect, useState } from 'react'
import './Loader.css'

const Loader = () => {
  const [phase, setPhase] = useState('loading')

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const exitTimer = setTimeout(() => setPhase('exiting'), 1300)
    const doneTimer = setTimeout(() => {
      setPhase('done')
      document.body.style.overflow = ''
    }, 2050)
    return () => {
      clearTimeout(exitTimer)
      clearTimeout(doneTimer)
      document.body.style.overflow = ''
    }
  }, [])

  if (phase === 'done') return null

  return (
    <div className={`loader ${phase === 'exiting' ? 'is-exiting' : ''}`}>
      {/* 4-Corner Watercolor Botanical Foliage Watermarks */}
      <div className="loader-botanical-bg" aria-hidden="true">
        <svg viewBox="0 0 1440 900" fill="none" preserveAspectRatio="xMidYMid slice" className="loader-botanical-svg">
          <g opacity="0.45" stroke="#A8B8AA" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
            {/* Top-Left Corner Foliage */}
            <path d="M-30 20 C60 50 140 110 180 190 C200 230 210 280 200 330" />
            <path d="M60 55 C90 25 135 30 160 60 C135 80 95 80 60 55 Z" fill="#D2DDD3" fillOpacity="0.5" />
            <path d="M110 105 C145 85 185 100 200 135 C170 150 130 140 110 105 Z" fill="#D2DDD3" fillOpacity="0.5" />
            <path d="M155 170 C185 160 225 180 230 215 C200 225 165 205 155 170 Z" fill="#D2DDD3" fillOpacity="0.5" />
            <path d="M185 240 C210 235 240 255 240 285 C215 290 190 270 185 240 Z" fill="#D2DDD3" fillOpacity="0.5" />

            {/* Top-Right Corner Foliage */}
            <path d="M1470 20 C1380 50 1300 110 1260 190 C1240 230 1230 280 1240 330" />
            <path d="M1380 55 C1350 25 1305 30 1280 60 C1305 80 1345 80 1380 55 Z" fill="#D2DDD3" fillOpacity="0.5" />
            <path d="M1330 105 C1295 85 1255 100 1240 135 C1270 150 1310 140 1330 105 Z" fill="#D2DDD3" fillOpacity="0.5" />
            <path d="M1285 170 C1255 160 1215 180 1210 215 C1240 225 1275 205 1285 170 Z" fill="#D2DDD3" fillOpacity="0.5" />
            <path d="M1255 240 C1230 235 1200 255 1200 285 C1225 290 1250 270 1255 240 Z" fill="#D2DDD3" fillOpacity="0.5" />

            {/* Bottom-Left Corner Foliage */}
            <path d="M-30 880 C60 850 140 790 180 710 C200 670 210 620 200 570" />
            <path d="M60 845 C90 875 135 870 160 840 C135 820 95 820 60 845 Z" fill="#D2DDD3" fillOpacity="0.5" />
            <path d="M110 795 C145 815 185 800 200 765 C170 750 130 760 110 795 Z" fill="#D2DDD3" fillOpacity="0.5" />
            <path d="M155 730 C185 740 225 720 230 685 C200 675 165 695 155 730 Z" fill="#D2DDD3" fillOpacity="0.5" />
            <path d="M185 660 C210 665 240 645 240 615 C215 610 190 630 185 660 Z" fill="#D2DDD3" fillOpacity="0.5" />

            {/* Bottom-Right Corner Eucalyptus-style Foliage */}
            <path d="M1470 880 C1390 840 1330 760 1300 660 C1285 610 1280 550 1290 490" />
            <circle cx="1370" cy="810" r="14" fill="#D2DDD3" fillOpacity="0.45" />
            <circle cx="1340" cy="760" r="16" fill="#D2DDD3" fillOpacity="0.45" />
            <circle cx="1320" cy="705" r="17" fill="#D2DDD3" fillOpacity="0.45" />
            <circle cx="1300" cy="645" r="15" fill="#D2DDD3" fillOpacity="0.45" />
            <circle cx="1290" cy="585" r="13" fill="#D2DDD3" fillOpacity="0.45" />
            <circle cx="1292" cy="530" r="11" fill="#D2DDD3" fillOpacity="0.45" />
          </g>
        </svg>
      </div>

      <div className="loader-inner">
        <div className="loader-logo">
          <img
            src="/images/custom_thenee/thenee-brand-logo.png"
            alt="THENEE"
            className="loader-logo-img"
          />
          <div className="loader-brand-title">
            <span className="loader-brand-name">THENEE</span>
            <small>Rooted in Nature</small>
          </div>
        </div>
        <div className="loader-bar">
          <div className="loader-bar-fill">
            <span className="loader-bar-dot" aria-hidden="true" />
          </div>
        </div>
        <div className="loader-kicker">CRAFTED BY RURAL WOMEN • TENKASI</div>
      </div>
    </div>
  )
}

export default Loader
