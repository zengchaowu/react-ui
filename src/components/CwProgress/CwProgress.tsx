import { useEffect, useMemo, useRef, useState } from 'react'
import type {
  CSSProperties,
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
  TouchEvent as ReactTouchEvent,
} from 'react'
import type { CwProgressProps } from './types'
import {
  defaultCwProgressStyles,
  horizontalCwProgressSizeStyles,
} from '@zengchaowu/ui-shared/components/CwProgress/styles'
import { defaultCwProgressTexts } from '@zengchaowu/ui-shared/components/CwProgress/texts'
import { useBrowserFocusVisible } from '../../hooks/useBrowserFocusVisible'

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function snapToStep(value: number, min: number, step: number): number {
  if (step <= 0) return value
  const snapped = Math.round((value - min) / step) * step + min
  return Number(snapped.toFixed(6))
}

export function CwProgress({
  value = 0,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  readonly = false,
  direction = 'vertical',
  size = 'medium',
  texts: textsProp,
  className,
  onChange,
  ...rest
}: CwProgressProps) {
  const styles = defaultCwProgressStyles

  const texts = {
    ...defaultCwProgressTexts,
    ...(textsProp ?? {}),
  }

  const isVertical = direction === 'vertical'

  const sizeClass = isVertical
    ? styles[
        size === 'small'
          ? 'sizeSmall'
          : size === 'large'
            ? 'sizeLarge'
            : 'sizeMedium'
      ]
    : horizontalCwProgressSizeStyles[size]

  const {
    isFocusVisible,
    handleFocus: handleFocusVisibleFocus,
    handleBlur: handleFocusVisibleBlur,
  } = useBrowserFocusVisible()

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

  const fillClass = [
    styles.fill,
    disabled
      ? styles.fillDisabled
      : readonly
        ? styles.fillReadonly
        : styles.fillNormal,
  ]
    .filter(Boolean)
    .join(' ')

  const fillStyle: CSSProperties = isVertical
    ? {
        left: '0',
        right: '0',
        bottom: '0',
        height: `${percent}%`,
        width: '100%',
      }
    : {
        left: '0',
        top: '0',
        bottom: '0',
        width: `${percent}%`,
        height: '100%',
      }

  function handleFocus() {
    if (disabled) return
    handleFocusVisibleFocus()
  }

  function handleBlur() {
    handleFocusVisibleBlur()
  }

  function commit(nextValue: number) {
    if (disabled || readonly) return
    const next = snapToStep(clamp(nextValue, min, max), min, step)
    onChange?.(next)
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
        if (!isVertical) delta = step
        break
      case 'ArrowLeft':
        if (!isVertical) delta = -step
        break
      case 'ArrowUp':
        if (isVertical) delta = step
        break
      case 'ArrowDown':
        if (isVertical) delta = -step
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

  function ratioFromPointer(clientX: number, clientY: number): number {
    const track = trackRef.current
    if (!track) return 0
    const rect = track.getBoundingClientRect()
    if (isVertical) {
      if (rect.height <= 0) return 0
      return (rect.bottom - clientY) / rect.height
    }
    if (rect.width <= 0) return 0
    return (clientX - rect.left) / rect.width
  }

  function ratioFromEvent(event: ReactMouseEvent | ReactTouchEvent): number {
    if ('touches' in event) {
      return ratioFromPointer(
        event.touches[0]?.clientX ?? 0,
        event.touches[0]?.clientY ?? 0,
      )
    }
    return ratioFromPointer(event.clientX, event.clientY)
  }

  function handleTrackClick(event: ReactMouseEvent<HTMLDivElement>) {
    if (disabled || readonly) return
    const ratio = ratioFromPointer(event.clientX, event.clientY)
    commit(min + ratio * (max - min))
  }

  function handleTrackPointerDown(
    event: ReactMouseEvent<HTMLDivElement> | ReactTouchEvent<HTMLDivElement>,
  ) {
    if (disabled || readonly) return
    setDragging(true)
    const ratio = ratioFromEvent(event)
    commit(min + ratio * (max - min))
  }

  useEffect(() => {
    if (!dragging) return

    const moveListener = (event: MouseEvent | TouchEvent) => {
      const clientX =
        'touches' in event ? (event.touches[0]?.clientX ?? 0) : event.clientX
      const clientY =
        'touches' in event ? (event.touches[0]?.clientY ?? 0) : event.clientY
      const ratio = ratioFromPointer(clientX, clientY)
      commit(min + ratio * (max - min))
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
  }, [dragging, min, max, step, disabled, readonly, isVertical])

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
        aria-label={texts.sliderLabel}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={clampedValue}
        aria-orientation={direction}
        aria-disabled={disabled}
        aria-readonly={readonly}
        tabIndex={disabled ? undefined : 0}
        onClick={handleTrackClick}
        onMouseDown={(event) => {
          event.preventDefault()
          handleTrackPointerDown(event)
        }}
        onTouchStart={handleTrackPointerDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
      >
        <div className={fillClass} style={fillStyle} />
      </div>
    </div>
  )
}

export default CwProgress
