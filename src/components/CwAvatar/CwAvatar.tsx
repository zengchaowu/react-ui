import { useEffect, useState } from 'react'
import { resolveCwBoxSizeStyle } from '@zengchaowu/ui-shared/functions/ui/cwRemSize'
import type { CwAvatarAppearance, CwAvatarProps } from './types'
import {
  appearanceRootClass,
  appearanceShapeExtraClass,
  avatarBase,
  ringLightElevationRootClass,
} from './styles'
import { defaultTexts } from './texts'

export function CwAvatar({
  src,
  fallbackSrc,
  text,
  shape = 'circle',
  size = avatarBase.defaultSize,
  appearance = 'default',
  elevation,
  texts,
  badge,
  className,
  style,
  ...rest
}: CwAvatarProps) {
  const resolvedAppearance: CwAvatarAppearance = appearance || 'default'

  const mergedTexts = { ...defaultTexts, ...(texts ?? {}) }

  const fallbackTrimmed = String(fallbackSrc ?? '').trim()

  const userSrcTrimmed =
    src != null && String(src).trim() !== '' ? String(src).trim() : ''

  const [primaryLoadFailed, setPrimaryLoadFailed] = useState(false)

  useEffect(() => {
    setPrimaryLoadFailed(false)
  }, [userSrcTrimmed])

  useEffect(() => {
    if (import.meta.env?.DEV && !fallbackTrimmed) {
      console.warn('[CwAvatar] fallback-src 为必填有效的占位图 URL，不能为空')
    }
  }, [fallbackTrimmed])

  const displayedSrc =
    userSrcTrimmed && !primaryLoadFailed ? userSrcTrimmed : fallbackTrimmed

  function handleImageError() {
    if (userSrcTrimmed) {
      setPrimaryLoadFailed(true)
    }
  }

  const imageAlt = text?.trim() || mergedTexts.defaultAlt

  const shapeBase = shape === 'square' ? avatarBase.square : avatarBase.circle
  const shapeExtra =
    appearanceShapeExtraClass[resolvedAppearance]?.[shape] || ''
  const shapeClass = [shapeBase, shapeExtra].filter(Boolean).join(' ')

  const appearanceRoot =
    resolvedAppearance === 'ring-light' && elevation === 'strong'
      ? ringLightElevationRootClass.strong
      : appearanceRootClass[resolvedAppearance] || ''

  const sizeStyle = resolveCwBoxSizeStyle(
    { size },
    avatarBase.defaultSize,
  )

  return (
    <div
      {...rest}
      className={[
        'relative inline-block shrink-0 overflow-visible',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ ...sizeStyle, ...style }}
    >
      <div
        className={[
          'relative box-border h-full min-h-0 min-w-0 w-full overflow-hidden',
          avatarBase.root,
          shapeClass,
          appearanceRoot,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {displayedSrc ? (
          <div className={avatarBase.imageContainer}>
            <div
              className={[
                'relative flex items-center justify-center overflow-hidden w-full h-full',
                avatarBase.imgRootClass,
              ].join(' ')}
            >
              <img
                src={displayedSrc}
                alt={imageAlt}
                loading="eager"
                decoding="async"
                draggable={false}
                onError={handleImageError}
              />
            </div>
          </div>
        ) : null}
      </div>
      {badge != null ? (
        <div className="pointer-events-auto absolute bottom-0 right-0">
          {badge}
        </div>
      ) : null}
    </div>
  )
}

export default CwAvatar
