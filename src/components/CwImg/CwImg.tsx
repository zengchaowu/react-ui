import { useEffect, useMemo, useRef, useState } from 'react'
import type { HTMLAttributes } from 'react'
import type { CwImgProps } from './types'
import { imgBase } from '@zengchaowu/ui-shared/components/CwImg/styles'
import { defaultCwImgTexts } from '@zengchaowu/ui-shared/components/CwImg/texts'
import { CwLoading } from '../CwLoading'
import { CwIcon } from '../CwIcon'

export interface CwImgComponentProps
  extends CwImgProps,
    Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'onError'> {}

export function CwImg({
  src,
  alt = '',
  imgLoading = 'lazy',
  loadWhenVisible = true,
  loadWhenVisibleRootMargin = '200px',
  texts: textsProp,
  onError,
  className,
  ...rest
}: CwImgComponentProps) {
  const texts = useMemo(
    () => ({
      ...defaultCwImgTexts,
      ...(textsProp ?? {}),
    }),
    [textsProp],
  )

  const rootRef = useRef<HTMLDivElement | null>(null)
  const [isInView, setIsInView] = useState(false)

  useEffect(() => {
    if (!loadWhenVisible) {
      setIsInView(true)
      return
    }

    const el = rootRef.current
    if (!el) return

    setIsInView(false)

    if (typeof IntersectionObserver === 'undefined') {
      setIsInView(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      {
        rootMargin: loadWhenVisibleRootMargin,
        threshold: 0,
      },
    )
    observer.observe(el)

    return () => observer.disconnect()
  }, [loadWhenVisible, loadWhenVisibleRootMargin])

  const trimmedSrc = src?.trim()
  const shouldLoad = !loadWhenVisible || isInView
  const resolvedSrc = trimmedSrc && shouldLoad ? trimmedSrc : undefined

  const [loadedSrc, setLoadedSrc] = useState<string | null>(null)
  const [errorSrc, setErrorSrc] = useState<string | null>(null)

  const imageLoaded = resolvedSrc !== undefined && loadedSrc === resolvedSrc
  const imageError = resolvedSrc !== undefined && errorSrc === resolvedSrc

  function handleLoad() {
    setLoadedSrc(resolvedSrc ?? null)
    setErrorSrc(null)
  }

  function handleError() {
    setLoadedSrc(null)
    setErrorSrc(resolvedSrc ?? null)
    onError?.()
  }

  return (
    <div
      ref={rootRef}
      {...rest}
      className={[imgBase.root, className].filter(Boolean).join(' ')}
    >
      {resolvedSrc && !imageError ? (
        <img
          src={resolvedSrc}
          alt={alt}
          draggable="false"
          decoding="async"
          loading={imgLoading}
          className={[imgBase.image, !imageLoaded ? 'opacity-0' : '']
            .filter(Boolean)
            .join(' ')}
          onError={handleError}
          onLoad={handleLoad}
        />
      ) : null}

      {resolvedSrc && !imageLoaded && !imageError ? (
        <div className={imgBase.loadingContainer}>
          <CwLoading type="spinner" size="small" />
        </div>
      ) : null}

      {imageError ? (
        <div
          className={imgBase.errorContainer}
          role="img"
          aria-label={texts.errorAriaLabel}
        >
          <CwIcon
            name="common--status--image-error-line"
            prefix="icon"
            size={imgBase.errorIconStyles?.size ?? 1}
            className={imgBase.errorIconStyles?.class}
            aria-hidden="true"
          />
        </div>
      ) : null}
    </div>
  )
}

export default CwImg
