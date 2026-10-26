import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from 'react'
import CwTooltip from '../CwTooltip/CwTooltip'
import type {
  CwTruncateTextAppearance,
  CwTruncateTextProps,
} from './types'
import { appearanceStyles, truncateTextBase } from './styles'
import { useFilenameTruncateLayout } from './useFilenameTruncateLayout'
import { useMiddleEllipsisLayout } from './useMiddleEllipsisLayout'
import { useTruncateDomOverflow } from './useTruncateDomOverflow'

export function CwTruncateText({
  text,
  placement = 'end',
  maxWidth,
  filenameHeadChars = 2,
  title,
  tag = 'span',
  appearance = 'default',
  texts: _texts,
  className,
  ...rest
}: CwTruncateTextProps) {
  const styles = {
    ...truncateTextBase,
    ...(appearanceStyles[
      (appearance || 'default') as CwTruncateTextAppearance
    ] ?? {}),
  }

  const measureRef = useRef<HTMLElement | null>(null)
  const rootNodeRef = useRef<HTMLElement | null>(null)
  const [rootEl, setRootEl] = useState<HTMLElement | null>(null)

  const handleRootRef = useCallback((el: HTMLElement | null) => {
    // 节点切换（如 tooltip 包裹/解包裹会重建 DOM）时 ref 先生效，
    // 测量必须读 ref，否则会量到已卸载的旧节点（宽高 0）而反复抖动。
    rootNodeRef.current = el
    setRootEl(el)
  }, [])

  const handleMeasureRef = useCallback((el: HTMLElement | null) => {
    measureRef.current = el
  }, [])

  const fullText = (text ?? '').trim()
  const isFilenameMode = placement === 'filename'
  const isMiddleMode = placement === 'middle'
  const isEndMode = placement === 'end'
  const needsWidthMeasure = isFilenameMode || isMiddleMode

  const { layout: filenameLayout } = useFilenameTruncateLayout({
    active: isFilenameMode,
    sourceText: fullText,
    headChars: filenameHeadChars,
    rootEl,
    rootRef: rootNodeRef,
    measureRef,
  })

  const { layout: middleLayout } = useMiddleEllipsisLayout({
    active: isMiddleMode,
    sourceText: fullText,
    rootEl,
    rootRef: rootNodeRef,
    measureRef,
  })

  const { isOverflowing, remeasureOverflow } = useTruncateDomOverflow(rootEl, rootNodeRef)

  const visibleText = (() => {
    if (!fullText) return ''
    if (isFilenameMode) return filenameLayout.text || fullText
    if (isMiddleMode) return middleLayout.text || fullText
    return fullText
  })()

  const useTailRtl =
    isEndMode || (isFilenameMode && filenameLayout.tailRtl)

  /** 与 styles.inner 叠加，避免 appearance 覆盖掉 keep-end 所需的 bidi */
  const keepEndInnerClass = 'inline [unicode-bidi:embed]'

  const isAbbreviated = (() => {
    if (isFilenameMode) {
      return filenameLayout.abbreviated || filenameLayout.tailRtl
    }
    if (isMiddleMode) return middleLayout.abbreviated
    return isOverflowing
  })()

  /** 仅截断（出现 …）时才出 tooltip；`title` 只覆盖提示文案，不强制常显 */
  const tooltip = (() => {
    if (!isAbbreviated) return undefined
    const custom = title?.trim()
    if (custom) return custom
    return fullText || undefined
  })()

  useLayoutEffect(() => {
    remeasureOverflow()
  }, [
    visibleText,
    filenameLayout,
    middleLayout,
    isOverflowing,
    remeasureOverflow,
  ])

  const rootStyle: CSSProperties | undefined = maxWidth?.trim()
    ? { maxWidth: maxWidth.trim() }
    : undefined

  const rootClass = [
    styles.root,
    needsWidthMeasure
      ? 'relative w-full min-w-0 max-w-full whitespace-nowrap'
      : '',
    /** keep-end：rtl 容器 + 左对齐，省略号落在视觉左侧，保留末尾 */
    useTailRtl ? 'text-left' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  if (!visibleText) return null

  const tagContent = (
    <>
      {needsWidthMeasure ? (
        <span
          ref={handleMeasureRef}
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-0 z-[var(--z-index-base)] h-0 select-none overflow-hidden whitespace-nowrap opacity-0"
        />
      ) : null}
      {useTailRtl ? (
        <span
          className={[styles.inner, keepEndInnerClass].filter(Boolean).join(' ')}
          dir="ltr"
        >
          {visibleText}
        </span>
      ) : (
        visibleText
      )}
    </>
  )

  const rootProps = {
    ...rest,
    className: rootClass,
    style: rootStyle,
    dir: useTailRtl ? ('rtl' as const) : undefined,
  }

  const tagElement =
    tag === 'div' ? (
      <div ref={handleRootRef} {...rootProps}>
        {tagContent}
      </div>
    ) : (
      <span ref={handleRootRef} {...rootProps}>
        {tagContent}
      </span>
    )

  if (tooltip) {
    return (
      <CwTooltip
        placement="top"
        appearance="default"
        className="block w-full min-w-0 max-w-full"
        triggerSlot={tagElement}
      >
        {tooltip}
      </CwTooltip>
    )
  }

  return tagElement
}

export default CwTruncateText
