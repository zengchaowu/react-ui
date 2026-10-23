import { useEffect, useMemo, useRef, useState } from 'react'
import type {
  CSSProperties,
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
  TouchEvent as ReactTouchEvent,
} from 'react'
import type { CwSliderProps } from './types'
import { sliderBase } from './styles'
import { useBrowserFocusVisible } from '../../hooks/useBrowserFocusVisible'

function clamp(v: number, a: number, b: number) {
  return Math.min(b, Math.max(a, v))
}

function snapToStep(v: number, min: number, step: number) {
  if (step <= 0) return v
  const snapped = Math.round((v - min) / step) * step + min
  return Number(snapped.toFixed(6))
}

export function CwSlider({
  value = 0,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  readonly = false,
  size = 'medium',
  texts: _texts,
  className,
  onChange,
  ...rest
}: CwSliderProps) {
  const styles = sliderBase

  const sizeClass = {
    small: styles.sizeSmall,
    medium: styles.sizeMedium,
    large: styles.sizeLarge,
  }[size || 'medium']

  const {
    isFocusVisible,
    handleFocus: handleFocusVisibleFocus,
    handleBlur: handleFocusVisibleBlur,
  } = useBrowserFocusVisible()

  const tabIndex = disabled ? undefined : 0
  const trackRef = useRef<HTMLDivElement | null>(null)
  const [dragging, setDragging] = useState(false)

  const clampedValue = useMemo(() => {
    const v = Number(value ?? 0)
    return Math.min(max, Math.max(min, v))
  }, [value, min, max])

  const percent = useMemo(() => {
    const span = max - min
    if (span <= 0) return 0
    return ((clampedValue - min) / span) * 100
  }, [clampedValue, min, max])

  const fillStyle: CSSProperties = { width: `${percent}%` }
  const thumbStyle: CSSProperties = { left: `${percent}%` }

  function handleFocus() {
    if (disabled) return
    handleFocusVisibleFocus()
  }

  function handleBlur() {
    handleFocusVisibleBlur()
  }

  function commit(next: number) {
    if (disabled || readonly) return
    onChange?.(snapToStep(clamp(next, min, max), min, step))
  }

  function handleKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (disabled) return
    if (readonly) {
      event.preventDefault()
      return
    }

    let delta = 0
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowUp':
        delta = step
        break
      case 'ArrowLeft':
      case 'ArrowDown':
        delta = -step
        break
      case 'Home':
        event.preventDefault()
        commit(min)
        return
      case 'End':
        event.preventDefault()
        commit(max)
        return
      case 'PageUp':
        delta = step * 10
        break
      case 'PageDown':
        delta = -step * 10
        break
      default:
        return
    }
    event.preventDefault()
    commit(clampedValue + delta)
  }

  function ratioFromPointer(clientX: number): number {
    const track = trackRef.current
    if (!track) return 0
    const rect = track.getBoundingClientRect()
    if (rect.width <= 0) return 0
    return (clientX - rect.left) / rect.width
  }

  function clientXFromEvent(
    event: ReactMouseEvent<HTMLDivElement> | ReactTouchEvent<HTMLDivElement>,
  ): number {
    if ('touches' in event) {
      return event.touches[0]?.clientX ?? 0
    }
    return event.clientX
  }

  function handleTrackClick(event: ReactMouseEvent<HTMLDivElement>) {
    if (disabled || readonly) return
    commit(min + ratioFromPointer(event.clientX) * (max - min))
  }

  function startDrag(
    event: ReactMouseEvent<HTMLDivElement> | ReactTouchEvent<HTMLDivElement>,
  ) {
    if (disabled || readonly) return
    setDragging(true)
    commit(min + ratioFromPointer(clientXFromEvent(event)) * (max - min))
  }

  useEffect(() => {
    if (!dragging) return

    const moveListener = (event: MouseEvent | TouchEvent) => {
      const clientX =
        'touches' in event ? (event.touches[0]?.clientX ?? 0) : event.clientX
      commit(min + ratioFromPointer(clientX) * (max - min))
    }

    const upListener = () => {
      setDragging(false)
    }

    window.addEventListener('mousemove', moveListener)
    window.addEventListener('mouseup', upListener)
    window.addEventListener('touchmove', moveListener, { passive: false })
    window.addEventListener('touchend', upListener)

    return () => {
      window.removeEventListener('mousemove', moveListener)
      window.removeEventListener('mouseup', upListener)
      window.removeEventListener('touchmove', moveListener)
      window.removeEventListener('touchend', upListener)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dragging, min, max, step, disabled, readonly])

  const thumbSizeClass =
    size === 'small' ? 'w-3 h-3' : size === 'large' ? 'w-5 h-5' : 'w-4 h-4'

  return (
    <div
      {...rest}
      className={[
        styles.root,
        disabled
          ? styles.rootDisabled
          : readonly
            ? styles.rootReadonly
            : styles.rootNormal,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div
        ref={trackRef}
        className={[
          styles.track,
          sizeClass,
          disabled
            ? styles.trackDisabled
            : readonly
              ? styles.trackReadonly
              : styles.trackNormal,
          isFocusVisible && !disabled ? styles.trackFocused : '',
        ]
          .filter(Boolean)
          .join(' ')}
        role="slider"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={clampedValue}
        aria-disabled={disabled}
        aria-readonly={readonly}
        tabIndex={tabIndex}
        onClick={handleTrackClick}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
      >
        <div
          className={[
            styles.fill,
            sizeClass,
            disabled
              ? styles.fillDisabled
              : readonly
                ? styles.fillReadonly
                : styles.fillNormal,
          ]
            .filter(Boolean)
            .join(' ')}
          style={fillStyle}
        />

        <div
          className={[
            styles.thumb,
            thumbSizeClass,
            disabled
              ? styles.thumbDisabled
              : readonly
                ? styles.thumbReadonly
                : styles.thumbNormal,
          ]
            .filter(Boolean)
            .join(' ')}
          style={thumbStyle}
          onMouseDown={(event) => {
            event.preventDefault()
            startDrag(event)
          }}
          onTouchStart={startDrag}
        />
      </div>
    </div>
  )
}

export default CwSlider
