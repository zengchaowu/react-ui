import { useEffect, useRef } from 'react'
import type {
  HTMLAttributes,
  MouseEvent as ReactMouseEvent,
  TouchEvent as ReactTouchEvent,
} from 'react'
import type { CwImagePreviewProps, CwImagePreviewTexts } from './types'
import { imagePreviewBase } from './styles'
import { defaultTexts } from './texts'
import { CwImageFit } from '../CwImageFit'
import { useImagePreviewInteraction } from './hooks'
import { isImagePreviewScaledForPan } from './functions'

export interface CwImagePreviewComponentProps
  extends CwImagePreviewProps,
    Omit<HTMLAttributes<HTMLDivElement>, 'onLoad' | 'onError' | 'children'> {
  className?: string
}

export function CwImagePreview({
  src,
  alt = '',
  disabled = false,
  readonly = false,
  minScale = 0.2,
  maxScale = 30,
  initialScale = 1,
  initialRotation = 0,
  enableDoubleClickZoom = true,
  enableDoubleClickReset = true,
  enableWheelZoom = true,
  enableDrag = true,
  allowDragWhenNotScaled = false,
  enablePinchZoom = true,
  enablePinchRotate = true,
  delegatesTouchPanToParent = false,
  active,
  texts: textsProp,
  onLoad,
  onError,
  onUpdateScale,
  onUpdateRotation,
  onUpdateOffset,
  className,
  ...rest
}: CwImagePreviewComponentProps) {
  const texts: CwImagePreviewTexts = {
    ...defaultTexts,
    ...(textsProp ?? {}),
  }

  const props: CwImagePreviewProps = {
    src,
    alt,
    disabled,
    readonly,
    minScale,
    maxScale,
    initialScale,
    initialRotation,
    enableDoubleClickZoom,
    enableDoubleClickReset,
    enableWheelZoom,
    enableDrag,
    allowDragWhenNotScaled,
    enablePinchZoom,
    enablePinchRotate,
    delegatesTouchPanToParent,
    active,
    texts,
    onLoad,
    onError,
    onUpdateScale,
    onUpdateRotation,
    onUpdateOffset,
  }

  const interaction = useImagePreviewInteraction(props, {
    onLoad,
    onError,
    onUpdateScale,
    onUpdateRotation,
    onUpdateOffset,
  })

  const isScaledForPan = isImagePreviewScaledForPan(interaction.scale, props)

  const ownsTouchGestures = (event?: { touches: { length: number } }) => {
    if (!delegatesTouchPanToParent) return true
    if (isScaledForPan) return true
    if (event && event.touches.length >= 2 && enablePinchZoom !== false) {
      return true
    }
    return false
  }

  const rootClass =
    delegatesTouchPanToParent && !isScaledForPan
      ? imagePreviewBase.rootPanDelegated || imagePreviewBase.root
      : imagePreviewBase.root

  function onPointerDown(event: ReactMouseEvent<HTMLDivElement>) {
    if (!ownsTouchGestures() && !isScaledForPan) return
    interaction.handlePointerDown(event)
  }

  function onPointerMove(event: ReactMouseEvent<HTMLDivElement>) {
    if (!ownsTouchGestures() && !isScaledForPan) return
    interaction.handlePointerMove(event)
  }

  function onPointerUp() {
    if (!ownsTouchGestures() && !isScaledForPan) return
    interaction.handlePointerUp()
  }

  function onTouchStart(event: ReactTouchEvent<HTMLDivElement>) {
    if (!ownsTouchGestures(event)) return
    interaction.handleTouchStart(event)
  }

  function onTouchMove(event: ReactTouchEvent<HTMLDivElement>) {
    if (!ownsTouchGestures(event)) return
    interaction.handleTouchMove(event)
  }

  function onTouchEnd(event: ReactTouchEvent<HTMLDivElement>) {
    // touchend 必须始终送达 hook，否则 touchMode 残留；双指缩放后还会误触发 dblclick
    interaction.handleTouchEnd(event)
  }

  /** 滚轮缩放需 preventDefault；须用非 passive 原生监听 */
  const viewportRef = useRef<HTMLDivElement | null>(null)
  const wheelHandlerRef = useRef(interaction.handleWheel)
  wheelHandlerRef.current = interaction.handleWheel

  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return
    const listener = (event: WheelEvent) => {
      wheelHandlerRef.current(event)
    }
    viewport.addEventListener('wheel', listener, { passive: false })
    return () => {
      viewport.removeEventListener('wheel', listener)
    }
  }, [])

  return (
    <div
      {...rest}
      className={[
        rootClass,
        disabled
          ? imagePreviewBase.rootDisabled
          : readonly
            ? imagePreviewBase.rootReadonly
            : imagePreviewBase.rootNormal,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      data-cw-image-preview-scaled={isScaledForPan ? 'true' : undefined}
      role="img"
      aria-disabled={disabled ? 'true' : 'false'}
      aria-readonly={readonly ? 'true' : 'false'}
      aria-label={texts.alt}
      onKeyDown={interaction.handleKeyDown}
    >
      <div
        ref={viewportRef}
        className={[
          imagePreviewBase.viewport,
          interaction.focused && !disabled
            ? imagePreviewBase.viewportFocused || ''
            : '',
        ]
          .filter(Boolean)
          .join(' ')}
        tabIndex={interaction.tabindex}
        onFocus={interaction.handleFocus}
        onBlur={interaction.handleBlur}
        onMouseDown={onPointerDown}
        onMouseMove={onPointerMove}
        onMouseUp={onPointerUp}
        onMouseLeave={onPointerUp}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onTouchCancel={onTouchEnd}
        onClick={interaction.handleClick}
        onDoubleClick={interaction.handleDoubleClick}
      >
        <CwImageFit
          src={src}
          alt={alt || texts.alt}
          disabled={disabled}
          readonly={readonly}
          imageTransform={interaction.imageTransform}
          texts={{ alt: texts.alt }}
          onLoad={interaction.handleLoad}
          onError={interaction.handleError}
        />
      </div>
    </div>
  )
}

export default CwImagePreview
