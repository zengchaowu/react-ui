import { useCallback, useEffect, useMemo, useState } from 'react'
import type { CSSProperties, RefObject } from 'react'
import type { CwAiChatComposerLayout } from './types'
import { aiChatComposerBase } from './styles'
import {
  COMPOSER_LINE_HEIGHT_REM,
  countComposerVisualRows,
  NARROW_LAYOUT_MAX_ROWS,
  WIDE_LAYOUT_MIN_ROWS,
} from './constants'
import {
  COMPOSER_ABSOLUTE_HEIGHT_TRANSITION,
  COMPOSER_ABSOLUTE_TRANSITION,
  COMPOSER_CHROME_LAYOUT_TRANSITION,
  COMPOSER_EDITOR_GROW_FROM_BOTTOM_TRANSITION,
  COMPOSER_SHELL_HEIGHT_TRANSITION,
  COMPOSER_WIDE_SHELL_PAD_X_REM,
  COMPOSER_WIDE_SHELL_PAD_Y_REM,
  computeComposerLayoutGeometry,
  toAbsoluteStyle,
  type ComposerToolbarVariant,
} from './layoutGeometry'

export interface ComposerEffectiveRowBounds {
  min: number
  max: number
}

export interface UseCwAiChatComposerLayoutOptions {
  layout: CwAiChatComposerLayout
  value: string
  minRows: number
  maxRows: number
  showAttach: boolean
  showVoice: boolean
  isEditorFocused: boolean
  isVoiceMode: boolean
  editorShellRef: RefObject<HTMLDivElement | null>
  canSend: boolean
  showStop: boolean
  /** 待发附件数；>0 时窄屏不折叠，以便露出发送 */
  pendingAttachmentCount: number
}

export function resolveComposerEffectiveRowBounds(input: {
  layout: CwAiChatComposerLayout
  isVoiceMode: boolean
  isNarrowCollapsed: boolean
  minRows: number
  maxRows: number
}): ComposerEffectiveRowBounds {
  if (input.isVoiceMode || input.isNarrowCollapsed) {
    return { min: 1, max: 1 }
  }
  if (input.layout === 'narrow') {
    return { min: 1, max: NARROW_LAYOUT_MAX_ROWS }
  }
  return {
    min: Math.max(WIDE_LAYOUT_MIN_ROWS, input.minRows),
    max: input.maxRows,
  }
}

export function clampComposerVisualRows(
  newlineRows: number,
  measuredRows: number,
  bounds: ComposerEffectiveRowBounds,
): number {
  const rows = Math.max(newlineRows, measuredRows)
  return Math.min(Math.max(rows, bounds.min), bounds.max)
}

function joinFieldClasses(...parts: Array<string | undefined | false>): string {
  return parts.filter(Boolean).join(' ')
}

function readLineHeightPx(root: HTMLElement): number {
  const parsed = parseFloat(getComputedStyle(root).lineHeight)
  if (Number.isFinite(parsed) && parsed > 0) return parsed
  const rootFontSize =
    parseFloat(getComputedStyle(document.documentElement).fontSize) || 16
  return COMPOSER_LINE_HEIGHT_REM * rootFontSize
}

function measureContentHeight(root: HTMLElement): number {
  const lineHeightPx = readLineHeightPx(root)
  const blocks = root.children
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

export function useCwAiChatComposerLayout(
  options: UseCwAiChatComposerLayoutOptions,
) {
  const {
    layout,
    value,
    minRows,
    maxRows,
    showAttach,
    showVoice,
    isEditorFocused,
    isVoiceMode,
    editorShellRef,
    canSend,
    showStop,
    pendingAttachmentCount,
  } = options

  const isNarrowLayout = layout === 'narrow'
  const isWideLayout = layout === 'wide'
  const hasPendingAttachments = pendingAttachmentCount > 0

  const isNarrowCollapsed =
    isNarrowLayout &&
    !isEditorFocused &&
    !value.trim() &&
    !isVoiceMode &&
    !hasPendingAttachments

  const layoutMode: 'inline' | 'stacked' = isVoiceMode
    ? 'inline'
    : isNarrowCollapsed
      ? 'inline'
      : 'stacked'

  const toolbarVariant: ComposerToolbarVariant = isWideLayout ? 'desktop' : 'im'

  /** desktop：附件独立在左侧；im：附件在右侧 actions 内 */
  const attachInStart = toolbarVariant === 'desktop' && showAttach

  const effectiveRowBounds = resolveComposerEffectiveRowBounds({
    layout,
    isVoiceMode,
    isNarrowCollapsed,
    minRows,
    maxRows,
  })
  const effectiveMinRows = effectiveRowBounds.min
  const effectiveMaxRows = effectiveRowBounds.max

  const [measuredRows, setMeasuredRows] = useState(1)

  const measureContentRows = useCallback(() => {
    const root = editorShellRef.current?.querySelector(
      '.ProseMirror',
    ) as HTMLElement | null
    if (!root) {
      setMeasuredRows(1)
      return
    }
    const lineHeightPx = readLineHeightPx(root)
    const max = Math.max(1, effectiveMaxRows)
    setMeasuredRows(
      rowsFromContentHeight(
        measureContentHeight(root),
        lineHeightPx,
        max,
      ),
    )
  }, [editorShellRef, effectiveMaxRows])

  useEffect(() => {
    measureContentRows()
    const frame = requestAnimationFrame(() => measureContentRows())

    const root = editorShellRef.current?.querySelector(
      '.ProseMirror',
    ) as HTMLElement | null
    if (typeof ResizeObserver === 'undefined' || !root) {
      return () => cancelAnimationFrame(frame)
    }

    const observer = new ResizeObserver(() => measureContentRows())
    observer.observe(root)
    for (let i = 0; i < root.children.length; i++) {
      const child = root.children[i]
      if (child) observer.observe(child)
    }

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
    }
  }, [
    measureContentRows,
    editorShellRef,
    value,
    layoutMode,
    isVoiceMode,
    showAttach,
    showVoice,
    effectiveMaxRows,
    effectiveMinRows,
  ])

  const newlineVisualRows = countComposerVisualRows(value)
  const contentRows = Math.max(newlineVisualRows, measuredRows)

  const visualRows = clampComposerVisualRows(
    newlineVisualRows,
    measuredRows,
    effectiveRowBounds,
  )

  /** 内容超过可视行数上限时需要内部滚动（窄屏触顶后同样适用） */
  const isEditorScrollable = contentRows > effectiveMaxRows

  const editorFieldClass = useMemo(
    () =>
      joinFieldClasses(
        aiChatComposerBase.editorField,
        isNarrowLayout &&
          !isEditorScrollable &&
          aiChatComposerBase.editorFieldNarrow,
        layoutMode === 'inline' &&
          !isNarrowCollapsed &&
          aiChatComposerBase.editorFieldInline,
        isEditorScrollable && aiChatComposerBase.editorFieldScrollable,
      ),
    [
      isNarrowLayout,
      isEditorScrollable,
      layoutMode,
      isNarrowCollapsed,
    ],
  )

  const shellClass = useMemo(
    () =>
      joinFieldClasses(
        aiChatComposerBase.shell,
        isWideLayout
          ? aiChatComposerBase.shellWide
          : aiChatComposerBase.shellNarrow,
      ),
    [isWideLayout],
  )

  /**
   * narrow：有草稿才展开发送；wide：底栏常显发送（空草稿禁用）。
   */
  const showPrimaryAction =
    showStop ||
    (!isVoiceMode && layoutMode === 'stacked' && (isWideLayout || canSend))

  const showSend = showPrimaryAction && !showStop

  const geometry = useMemo(
    () =>
      computeComposerLayoutGeometry({
        mode: layoutMode,
        visualRows,
        showVoice,
        showAttach,
        showSend: showPrimaryAction,
        actionsAutoWidth: true,
        expandEditorToRow: layoutMode === 'inline',
        toolbarVariant,
        shellPadXRem: isWideLayout ? COMPOSER_WIDE_SHELL_PAD_X_REM : undefined,
        shellPadYRem: isWideLayout ? COMPOSER_WIDE_SHELL_PAD_Y_REM : undefined,
      }),
    [
      layoutMode,
      visualRows,
      showVoice,
      showAttach,
      showPrimaryAction,
      isVoiceMode,
      toolbarVariant,
      isWideLayout,
    ],
  )

  const absoluteTransition =
    layoutMode === 'inline'
      ? COMPOSER_ABSOLUTE_HEIGHT_TRANSITION
      : COMPOSER_ABSOLUTE_TRANSITION
  const growFromBottom = layoutMode === 'stacked' && !isVoiceMode
  const editorTransition = growFromBottom
    ? COMPOSER_EDITOR_GROW_FROM_BOTTOM_TRANSITION
    : absoluteTransition
  const chromeTransition = growFromBottom
    ? COMPOSER_CHROME_LAYOUT_TRANSITION
    : absoluteTransition

  const shellLayoutStyle: CSSProperties = {
    height: `${geometry.shellHeightRem}rem`,
    transition: COMPOSER_SHELL_HEIGHT_TRANSITION,
  }
  const editorLayoutStyle: CSSProperties = toAbsoluteStyle(
    geometry.editor,
    editorTransition,
  )
  const voiceLayoutStyle: CSSProperties = geometry.voice
    ? toAbsoluteStyle(geometry.voice, chromeTransition)
    : {}
  const attachLayoutStyle: CSSProperties | null = geometry.attach
    ? toAbsoluteStyle(geometry.attach, chromeTransition)
    : null
  const actionsLayoutStyle: CSSProperties = toAbsoluteStyle(
    geometry.actions,
    chromeTransition,
  )

  return {
    isNarrowLayout,
    isWideLayout,
    isNarrowCollapsed,
    layoutMode,
    toolbarVariant,
    attachInStart,
    effectiveMinRows,
    effectiveMaxRows,
    contentRows,
    visualRows,
    isEditorScrollable,
    editorFieldClass,
    shellClass,
    showPrimaryAction,
    showSend,
    shellLayoutStyle,
    editorLayoutStyle,
    voiceLayoutStyle,
    attachLayoutStyle,
    actionsLayoutStyle,
  }
}
