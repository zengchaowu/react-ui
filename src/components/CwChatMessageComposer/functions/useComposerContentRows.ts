import { useCallback, useEffect, useState } from 'react'
import type { RefObject } from 'react'
import { COMPOSER_LINE_HEIGHT_REM } from '../../CwAiChatComposer/constants'

export interface UseComposerContentRowsOptions {
  editorShellRef: RefObject<HTMLDivElement | null>
  minRows: number
  maxRows: number
  /** 布局变化（宽度/模式/文本）时重新测量 */
  revision: unknown
}

function readLineHeightPx(proseMirror: HTMLElement): number {
  const parsed = parseFloat(getComputedStyle(proseMirror).lineHeight)
  if (Number.isFinite(parsed) && parsed > 0) return parsed
  const rootFontSize =
    parseFloat(getComputedStyle(document.documentElement).fontSize) || 16
  return COMPOSER_LINE_HEIGHT_REM * rootFontSize
}

function measureContentHeight(proseMirror: HTMLElement): number {
  const lineHeightPx = readLineHeightPx(proseMirror)
  const blocks = proseMirror.children
  if (blocks.length === 0) return lineHeightPx

  let total = 0
  for (let i = 0; i < blocks.length; i++) {
    total += (blocks[i] as HTMLElement).offsetHeight
  }

  return total > 0 ? total : lineHeightPx
}

function rowsFromContentHeight(
  contentHeightPx: number,
  lineHeightPx: number,
  max: number,
): number {
  const ratio = contentHeightPx / lineHeightPx
  const rows = Math.max(1, Math.ceil(ratio - 0.05))
  return Math.min(max, rows)
}

/**
 * React 等价 Vue `useCwAiChatComposerContentRows`（仅本组件所需能力）：
 * 通过 ResizeObserver 测量 `.ProseMirror` 内容高度并换算为行数。
 */
export function useComposerContentRows(
  options: UseComposerContentRowsOptions,
) {
  const { editorShellRef, maxRows, revision } = options
  const [measuredRows, setMeasuredRows] = useState(1)

  const measureContentRows = useCallback(() => {
    const proseMirror = editorShellRef.current?.querySelector(
      '.ProseMirror',
    ) as HTMLElement | null

    if (!proseMirror) {
      setMeasuredRows(1)
      return
    }

    const lineHeightPx = readLineHeightPx(proseMirror)
    const max = Math.max(1, maxRows)
    setMeasuredRows(
      rowsFromContentHeight(
        measureContentHeight(proseMirror),
        lineHeightPx,
        max,
      ),
    )
  }, [editorShellRef, maxRows])

  useEffect(() => {
    measureContentRows()
    const frame = requestAnimationFrame(() => measureContentRows())

    const shell = editorShellRef.current
    const proseMirror = shell?.querySelector(
      '.ProseMirror',
    ) as HTMLElement | null
    if (typeof ResizeObserver === 'undefined') {
      return () => cancelAnimationFrame(frame)
    }
    if (!shell && !proseMirror) {
      return () => cancelAnimationFrame(frame)
    }

    const observer = new ResizeObserver(() => measureContentRows())
    if (shell) observer.observe(shell)
    if (proseMirror) {
      observer.observe(proseMirror)
      for (let i = 0; i < proseMirror.children.length; i++) {
        const child = proseMirror.children[i]
        if (child) observer.observe(child)
      }
    }

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
    }
  }, [measureContentRows, editorShellRef, revision])

  return { measuredRows, measureContentRows }
}
