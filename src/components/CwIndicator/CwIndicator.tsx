import {
  Fragment,
  forwardRef,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  type CSSProperties,
} from 'react'
import { designPxToRem } from '@zengchaowu/ui-shared/functions/ui/cwRemSize'
import type { CwIndicatorProps } from './types'
import type { CwIndicatorExposed, CwIndicatorStyles } from '@zengchaowu/ui-shared/components/CwIndicator/types'
import { indicatorBase } from '@zengchaowu/ui-shared/components/CwIndicator/styles'
import { defaultTexts } from '@zengchaowu/ui-shared/components/CwIndicator/texts'

export const CwIndicator = forwardRef<CwIndicatorExposed, CwIndicatorProps>(
  function CwIndicator(
    {
      total,
      value,
      variant = 'dots',
      maxWidth = 320,
      scrollable = 'auto',
      itemSize = 20,
      itemSpacing = 4,
      dotSize = 8,
      dotSpacing = 16,
      activeColor = 'var(--brand-color-6)',
      inactiveColor = 'var(--text-color-placeholder)',
      lineColor: _lineColor = 'var(--brand-color-6)',
      texts: _texts,
      className,
      ...rest
    },
    ref,
  ) {
    const styles: CwIndicatorStyles = indicatorBase

    useImperativeHandle(ref, () => ({}), [])

    const scrollViewportRef = useRef<HTMLDivElement | null>(null)

    const dots = useMemo(
      () => Array.from({ length: total }, (_, index) => index),
      [total],
    )

    const useNumbered = variant === 'numbered'

    const activeIndex = useMemo(() => {
      if (total <= 0) return 0
      const clamped = Math.max(0, Math.min(total - 1, value))
      return Math.round(clamped)
    }, [total, value])

    const scrollContentWidth = useMemo(() => {
      if (total <= 0) return 0
      return total * itemSize + Math.max(0, total - 1) * itemSpacing
    }, [total, itemSize, itemSpacing])

    const useScrollViewport = useMemo(() => {
      if (!useNumbered) return false
      if (scrollable === false) return false
      if (scrollable === true) return true
      return scrollContentWidth > maxWidth
    }, [useNumbered, scrollable, scrollContentWidth, maxWidth])

    const numberedRootStyle: CSSProperties = {
      width: '100%',
      ...(useScrollViewport
        ? { maxWidth: designPxToRem(maxWidth), marginInline: 'auto' }
        : {}),
    }

    const numberedViewportStyle: CSSProperties = {
      gap: designPxToRem(itemSpacing),
      ...(useScrollViewport ? { maxWidth: designPxToRem(maxWidth) } : {}),
    }

    const decimalPart = value % 1
    const lineHeight = dotSize

    function getBaseDotStyle(): CSSProperties {
      return {
        width: designPxToRem(dotSize),
        height: designPxToRem(dotSize),
        backgroundColor: inactiveColor,
      }
    }

    function getSpacerStyle(): CSSProperties {
      return {
        width: designPxToRem(dotSpacing),
      }
    }

    function getNumberChipStyle(index: number): CSSProperties {
      const isActive = index === activeIndex
      return {
        minWidth: designPxToRem(itemSize),
        height: designPxToRem(itemSize),
        paddingInline: designPxToRem(2),
        backgroundColor: isActive ? activeColor : inactiveColor,
      }
    }

    function getHighlightStyle(): CSSProperties {
      const d = decimalPart
      const baseIndex = Math.floor(value)
      const fullLineWidth = dotSize + dotSpacing + dotSize
      const point1Center = baseIndex * (dotSize + dotSpacing)
      const point2Center = (baseIndex + 1) * (dotSize + dotSpacing)

      let width: number
      let left: number

      if (d <= 0.5) {
        const progress = d / 0.5
        width = dotSize + (fullLineWidth - dotSize) * progress
        left = point1Center
      } else {
        const progress = (d - 0.5) / 0.5
        width = dotSize + (fullLineWidth - dotSize) * (1 - progress)
        left = point2Center - width + dotSize
      }

      return {
        position: 'absolute',
        left: designPxToRem(left),
        top: '50%',
        transform: 'translateY(-50%)',
        width: designPxToRem(width),
        height: designPxToRem(lineHeight),
        backgroundColor: activeColor,
        borderRadius: designPxToRem(lineHeight / 2),
      }
    }

    useLayoutEffect(() => {
      if (!useNumbered || !useScrollViewport) return
      const viewport = scrollViewportRef.current
      if (!viewport) return
      const activeEl = viewport.querySelector('[data-indicator-active="true"]')
      activeEl?.scrollIntoView({
        behavior: 'auto',
        inline: 'center',
        block: 'nearest',
      })
    }, [useNumbered, useScrollViewport, activeIndex, total])

    if (useNumbered) {
      return (
        <div
          {...rest}
          className={[styles.numberedRoot, className].filter(Boolean).join(' ')}
          style={numberedRootStyle}
        >
          <div
            ref={scrollViewportRef}
            className={[
              styles.numberedViewport,
              useScrollViewport
                ? styles.numberedViewportScroll
                : styles.numberedViewportStatic,
            ]
              .filter(Boolean)
              .join(' ')}
            style={numberedViewportStyle}
          >
            {dots.map((index) => (
              <div
                key={`numbered-${index}`}
                className={[
                  styles.numberChip,
                  index === activeIndex
                    ? styles.numberChipActive
                    : styles.numberChipInactive,
                ]
                  .filter(Boolean)
                  .join(' ')}
                style={getNumberChipStyle(index)}
                data-indicator-active={
                  index === activeIndex ? 'true' : undefined
                }
                role="presentation"
              >
                {index + 1}
              </div>
            ))}
          </div>
        </div>
      )
    }

    return (
      <div
        {...rest}
        className={[styles.root, className].filter(Boolean).join(' ')}
      >
        <div className={styles.container}>
          {dots.map((index) => (
            <Fragment key={`base-${index}`}>
              <div className={styles.dot} style={getBaseDotStyle()} />
              {index < dots.length - 1 ? (
                <div className={styles.spacer} style={getSpacerStyle()} />
              ) : null}
            </Fragment>
          ))}
          <div className={styles.highlightLine} style={getHighlightStyle()} />
        </div>
      </div>
    )
  },
)

export default CwIndicator
