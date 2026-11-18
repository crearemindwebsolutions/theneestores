import { useState, useEffect, useRef } from 'react'
import './Skeleton.css'

// Global cache of successfully loaded image URLs to prevent re-shimmering
// or cached image onLoad race conditions across component mounts/routes
const loadedImageCache = new Set()

export const SkeletonBox = ({ width, height, borderRadius, className = '', style = {} }) => (
  <span
    className={`skeleton-box ${className}`}
    style={{
      width: width || '100%',
      height: height || '16px',
      borderRadius: borderRadius || undefined,
      ...style,
    }}
  />
)

export const SkeletonProductCard = () => (
  <div className="skeleton-product-card">
    <div className="skeleton-box skeleton-card-img" />
    <div className="skeleton-card-tags">
      <div className="skeleton-box skeleton-badge" />
      <div className="skeleton-box skeleton-badge" style={{ width: '50px' }} />
    </div>
    <div className="skeleton-box skeleton-card-title" />
    <div className="skeleton-box skeleton-card-tamil" />
    <div className="skeleton-box skeleton-card-desc" />
    <div className="skeleton-box skeleton-card-desc short" />
    <div className="skeleton-card-bottom">
      <div className="skeleton-box skeleton-card-price" />
      <div className="skeleton-box skeleton-card-action" />
    </div>
  </div>
)

export const SkeletonPodiCard = () => (
  <div className="skeleton-podi-card">
    <div className="skeleton-box skeleton-podi-img" />
    <div className="skeleton-box skeleton-badge" style={{ width: '60px', marginBottom: '8px' }} />
    <div className="skeleton-box skeleton-card-title" style={{ width: '80%' }} />
    <div className="skeleton-box skeleton-card-tamil" style={{ width: '55%' }} />
    <div className="skeleton-box skeleton-card-desc" />
    <div className="skeleton-card-bottom" style={{ marginTop: 'auto' }}>
      <div className="skeleton-box skeleton-card-price" />
      <div className="skeleton-box skeleton-card-action" />
    </div>
  </div>
)

export const SkeletonReviewCard = () => (
  <div className="skeleton-review-card">
    <div className="skeleton-review-header">
      <div className="skeleton-box skeleton-circle skeleton-review-avatar" />
      <div className="skeleton-review-user">
        <div className="skeleton-box skeleton-title" style={{ width: '60%', height: '16px' }} />
        <div className="skeleton-box skeleton-text" style={{ width: '40%' }} />
      </div>
    </div>
    <div className="skeleton-box skeleton-review-stars" />
    <div className="skeleton-box skeleton-text" style={{ width: '95%' }} />
    <div className="skeleton-box skeleton-text" style={{ width: '85%' }} />
    <div className="skeleton-box skeleton-text" style={{ width: '60%' }} />
  </div>
)

export const SkeletonHubCard = () => (
  <div className="skeleton-hub-card">
    <div className="skeleton-box skeleton-hub-icon" />
    <div className="skeleton-hub-info">
      <div className="skeleton-box skeleton-hub-title" />
      <div className="skeleton-box skeleton-hub-pill" />
    </div>
  </div>
)

export const SkeletonOrderCard = () => (
  <div className="skeleton-order-card">
    <div className="skeleton-order-header">
      <div className="skeleton-box" style={{ width: '100px', height: '18px' }} />
      <div className="skeleton-box skeleton-badge" style={{ width: '90px' }} />
    </div>
    <div className="skeleton-order-body">
      <div className="skeleton-box skeleton-order-thumb" />
      <div style={{ flex: 1 }}>
        <div className="skeleton-box skeleton-title" style={{ width: '70%', height: '16px' }} />
        <div className="skeleton-box skeleton-text" style={{ width: '40%' }} />
      </div>
    </div>
    <div style={{ display: 'flex', gap: '10px' }}>
      <div className="skeleton-box" style={{ width: '110px', height: '32px', borderRadius: '6px' }} />
      <div className="skeleton-box" style={{ width: '130px', height: '32px', borderRadius: '6px' }} />
    </div>
  </div>
)

export const ImageWithSkeleton = ({
  src,
  alt = '',
  className = '',
  style = {},
  skeletonBorderRadius = '8px',
  ...props
}) => {
  // If this image was already loaded during this session, show immediately without shimmer
  const [isLoaded, setIsLoaded] = useState(() => {
    if (!src) return true
    return loadedImageCache.has(src)
  })
  const [isError, setIsError] = useState(false)
  const imgRef = useRef(null)

  useEffect(() => {
    if (!src) {
      setIsLoaded(true)
      return
    }

    if (loadedImageCache.has(src)) {
      setIsLoaded(true)
      return
    }

    // Check if browser already has image loaded in cache
    if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth > 0) {
      loadedImageCache.add(src)
      setIsLoaded(true)
      return
    }

    // Safety fallback: if network/browser delays synthetic onLoad event,
    // force reveal after 400ms so image is NEVER stuck hidden at opacity: 0
    const fallbackTimer = setTimeout(() => {
      setIsLoaded(true)
    }, 400)

    return () => clearTimeout(fallbackTimer)
  }, [src])

  const handleLoad = () => {
    if (src) loadedImageCache.add(src)
    setIsLoaded(true)
  }

  const handleError = () => {
    setIsError(true)
    setIsLoaded(true)
  }

  return (
    <div className="smart-image-wrap" style={{ borderRadius: skeletonBorderRadius }}>
      {!isLoaded && !isError && (
        <span
          className="skeleton-box smart-image-skeleton"
          style={{ borderRadius: skeletonBorderRadius }}
        />
      )}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        className={`smart-image-elem ${isLoaded ? 'is-loaded' : ''} ${className}`}
        style={style}
        loading="eager"
        decoding="async"
        onLoad={handleLoad}
        onError={handleError}
        {...props}
      />
    </div>
  )
}
