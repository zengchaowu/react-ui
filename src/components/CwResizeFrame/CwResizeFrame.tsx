import {
  useRef,
  type CSSProperties,
  type HTMLAttributes,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react'
import type { CwResizeFrameProps } from './types'
import { resizeFrameBase } from '@zengchaowu/ui-shared/components/CwResizeFrame/styles'
import { defaultCwResizeFrameTexts } from '@zengchaowu/ui-shared/components/CwResizeFrame/texts'

export interface CwResizeFrameComponentProps
  extends CwResizeFrameProps,
    Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'className'> {
  className?: string
  children?: ReactNode
}

type DragAxis = 'e' | 's' | 'se'

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, Math.round(value)))
}

/**
 * 拖拽中把根节点钉在按下时的屏幕坐标。
 * 外层若居中（如 Storybook layout:centered），宽高变化会以中心缩放，
 * 右/下/角手柄相对指针只移动一半，体感「不跟手」；角拖宽高同时变时更明显。
 */
function freezeRootScreenPosition(root: HTMLElement): () => void {
  const rect = root.getBoundingClientRect()
  const prev = {
    position: root.style.position,
    left: root.style.left,
    top: root.style.top,
    stacking: root.style.zIndex,
    margin: root.style.margin,
  }
  root.style.position = 'fixed'
  root.style.left = `${rect.left}px`
  root.style.top = `${rect.top}px`
  root.style.zIndex = 'var(--z-index-float)'
  root.style.margin = '0'
  return () => {
    root.style.position = prev.position
    root.style.left = prev.left
    root.style.top = prev.top
    root.style.zIndex = prev.stacking
    root.style.margin = prev.margin
  }
}

export function CwResizeFrame({
  width,
  height,
  minWidth = 200,
  maxWidth = 1920,
  minHeight = 200,
  maxHeight = 1600,
  resizeWidth = true,
  resizeHeight = true,
  disabled = false,
  showSize = false,
  texts: textsProp,
  onWidthChange,
  onHeightChange,
  onResize,
  children,
  className,
  ...rest
}: CwResizeFrameComponentProps) {
  const rootRef = useRef<HTMLDivElement | null>(null)

  const texts = { ...defaultCwResizeFrameTexts, ...(textsProp ?? {}) }

  const frameBodyStyle: CSSProperties = {
    width: `${clamp(width, minWidth, maxWidth)}px`,
    height: `${clamp(height, minHeight, maxHeight)}px`,
  }

  const sizeLabelText = texts.sizeLabel
    .replace('{width}', String(Math.round(width)))
    .replace('{height}', String(Math.round(height)))

  function emitSize(nextWidth: number, nextHeight: number) {
    const w = clamp(nextWidth, minWidth, maxWidth)
    const h = clamp(nextHeight, minHeight, maxHeight)
    onWidthChange?.(w)
    onHeightChange?.(h)
    onResize?.({ width: w, height: h })
  }

  function onHandlePointerDown(
    event: ReactPointerEvent<HTMLDivElement>,
    axis: DragAxis,
  ) {
    if (disabled) return
    event.preventDefault()
    event.stopPropagation()

    const target = event.currentTarget
    target.setPointerCapture?.(event.pointerId)

    const startX = event.clientX
    const startY = event.clientY
    const startW = width
    const startH = height
    const root = rootRef.current
    const unfreeze = root ? freezeRootScreenPosition(root) : () => {}

    const cursor =
      axis === 'e' ? 'ew-resize' : axis === 's' ? 'ns-resize' : 'nwse-resize'
    const prevCursor = document.body.style.cursor
    const prevUserSelect = document.body.style.userSelect
    document.body.style.cursor = cursor
    document.body.style.userSelect = 'none'

    const onPointerMove = (ev: PointerEvent) => {
      let nextW = startW
      let nextH = startH
      if (axis === 'e' || axis === 'se') {
        nextW = startW + (ev.clientX - startX)
      }
      if (axis === 's' || axis === 'se') {
        nextH = startH + (ev.clientY - startY)
      }
      emitSize(nextW, nextH)
    }

    const onPointerUp = (ev: PointerEvent) => {
      target.releasePointerCapture?.(ev.pointerId)
      document.body.style.cursor = prevCursor
      document.body.style.userSelect = prevUserSelect
      unfreeze()
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
      window.removeEventListener('pointercancel', onPointerUp)
    }

    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
    window.addEventListener('pointercancel', onPointerUp)
  }

  return (
    <div
      {...rest}
      ref={rootRef}
      className={[resizeFrameBase.root, className].filter(Boolean).join(' ')}
    >
      {showSize ? (
        <span className={resizeFrameBase.sizeLabel}>{sizeLabelText}</span>
      ) : null}

      <div
        className={[
          resizeFrameBase.chrome,
          resizeWidth && !disabled ? resizeFrameBase.chromeResizeWidth : '',
          resizeHeight && !disabled ? resizeFrameBase.chromeResizeHeight : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <div className={resizeFrameBase.frameBody} style={frameBodyStyle}>
          <div className={resizeFrameBase.content}>{children}</div>
        </div>

        {resizeWidth && !disabled ? (
          <div
            className={[resizeFrameBase.handleBase, resizeFrameBase.handleEast]
              .filter(Boolean)
              .join(' ')}
            role="separator"
            aria-orientation="vertical"
            aria-label={texts.handleEastAriaLabel}
            onPointerDown={(event) => onHandlePointerDown(event, 'e')}
          >
            <span className={resizeFrameBase.gripVertical} aria-hidden="true" />
          </div>
        ) : null}

        {resizeHeight && !disabled ? (
          <div
            className={[resizeFrameBase.handleBase, resizeFrameBase.handleSouth]
              .filter(Boolean)
              .join(' ')}
            role="separator"
            aria-orientation="horizontal"
            aria-label={texts.handleSouthAriaLabel}
            onPointerDown={(event) => onHandlePointerDown(event, 's')}
          >
            <span className={resizeFrameBase.gripHorizontal} aria-hidden="true" />
          </div>
        ) : null}

        {resizeWidth && resizeHeight && !disabled ? (
          <div
            className={[
              resizeFrameBase.handleBase,
              resizeFrameBase.handleSouthEast,
            ]
              .filter(Boolean)
              .join(' ')}
            role="separator"
            aria-label={texts.handleSouthEastAriaLabel}
            onPointerDown={(event) => onHandlePointerDown(event, 'se')}
          >
            <svg
              className={resizeFrameBase.gripCorner}
              viewBox="0 0 12 12"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M5 12L12 5M8 12L12 8M11 12L12 11"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default CwResizeFrame
