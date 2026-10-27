import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import type {
  CSSProperties,
  KeyboardEvent as ReactKeyboardEvent,
} from 'react'
import type { CwSegmentOption, CwSegmentProps } from './types'
import { resolveSegmentStyles } from './styles'
import { CwIcon } from '../CwIcon'

const EMPTY_SLIDER_STYLE: CSSProperties = {
  width: '0px',
  height: '0px',
  transform: 'translateX(0px)',
}

export function CwSegment({
  value,
  options,
  disabled = false,
  size = 'medium',
  appearance = 'default',
  texts: _texts,
  className,
  onChange,
  ...rest
}: CwSegmentProps) {
  const styles = useMemo(() => resolveSegmentStyles(appearance), [appearance])

  const rootRef = useRef<HTMLDivElement | null>(null)
  const itemRefs = useRef<Array<HTMLDivElement | null>>([])

  const normalizedOptions = useMemo<CwSegmentOption[]>(() => {
    if (!options?.length) return []
    return options.map((item) =>
      typeof item === 'string' ? { label: item, value: item } : item,
    )
  }, [options])

  const activeIndex = useMemo(
    () => normalizedOptions.findIndex((opt) => opt.value === value),
    [normalizedOptions, value],
  )

  const [sliderStyle, setSliderStyle] = useState<CSSProperties>(EMPTY_SLIDER_STYLE)
  /** 首次布局完成后才启用滑块过渡，避免从 0×0 放大到选中项的入场动画 */
  const [sliderMoveEnabled, setSliderMoveEnabled] = useState(false)

  const updateSlider = useCallback(() => {
    const idx = activeIndex
    const root = rootRef.current
    if (idx < 0 || !root) {
      setSliderStyle(EMPTY_SLIDER_STYLE)
      return
    }
    const el = itemRefs.current[idx]
    if (!el) return
    const rootRect = root.getBoundingClientRect()
    const elRect = el.getBoundingClientRect()
    const left = elRect.left - rootRect.left + root.scrollLeft
    const top = elRect.top - rootRect.top + root.scrollTop
    setSliderStyle({
      width: `${elRect.width}px`,
      height: `${elRect.height}px`,
      transform: `translate(${left}px, ${top}px)`,
    })
  }, [activeIndex])

  useLayoutEffect(() => {
    itemRefs.current.length = normalizedOptions.length
    updateSlider()
  }, [normalizedOptions, updateSlider])

  useEffect(() => {
    const raf = requestAnimationFrame(() => setSliderMoveEnabled(true))
    return () => cancelAnimationFrame(raf)
  }, [])

  useEffect(() => {
    const root = rootRef.current
    if (!root || typeof ResizeObserver === 'undefined') return

    const resizeObserver = new ResizeObserver(() => updateSlider())
    resizeObserver.observe(root)

    return () => resizeObserver.disconnect()
  }, [updateSlider])

  const sizeClass = {
    small: '[font-size:var(--font-size-body)]',
    medium: '[font-size:var(--font-size-body-lg)]',
    large: '[font-size:var(--font-size-body-xl)]',
  }[size ?? 'medium']

  const sizeHeightClass = {
    small: 'py-1',
    medium: 'py-1.5',
    large: 'py-2',
  }[size ?? 'medium']

  const iconSize = {
    small: 0.875,
    medium: 1,
    large: 1.125,
  }[size ?? 'medium']

  const handleSelect = (opt: CwSegmentOption) => {
    if (disabled || opt.disabled) return
    if (value !== opt.value) {
      onChange?.(opt.value)
    }
  }

  return (
    <div
      {...rest}
      ref={rootRef}
      role="tablist"
      className={[
        styles.root,
        sizeClass,
        disabled ? styles.rootDisabled : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      aria-disabled={disabled}
    >
      <div
        className={[
          styles.slider,
          sizeHeightClass,
          sliderMoveEnabled ? styles.sliderMove : '',
        ]
          .filter(Boolean)
          .join(' ')}
        style={sliderStyle}
        aria-hidden="true"
      />
      {normalizedOptions.map((opt, index) => {
        const isActive = value === opt.value
        const isDisabled = disabled || Boolean(opt.disabled)

        const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            handleSelect(opt)
          }
        }

        return (
          <div
            key={opt.value}
            ref={(el) => {
              itemRefs.current[index] = el
            }}
            role="tab"
            tabIndex={isDisabled ? -1 : 0}
            aria-selected={isActive}
            aria-disabled={isDisabled}
            aria-label={!opt.label && opt.title ? opt.title : undefined}
            title={opt.title}
            className={[
              styles.item,
              sizeHeightClass,
              isActive ? styles.itemActive : styles.itemInactive,
              opt.label ? 'px-2' : 'px-1.5',
              isDisabled ? 'pointer-events-none opacity-50' : 'cursor-pointer',
            ]
              .filter(Boolean)
              .join(' ')}
            onClick={() => handleSelect(opt)}
            onKeyDown={handleKeyDown}
          >
            {opt.icon ? (
              <span
                aria-hidden="true"
                className="inline-flex shrink-0 items-center justify-center"
              >
                <CwIcon name={opt.icon} prefix="icon" size={iconSize} />
              </span>
            ) : null}
            {opt.label ? <span>{opt.label}</span> : null}
          </div>
        )
      })}
    </div>
  )
}

export default CwSegment
