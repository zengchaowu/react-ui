import { IText, type Canvas } from 'fabric'
import type { TpFabricDesignEditorTool, TpFabricViewportTool } from '../types'

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  if (target.isContentEditable) return true
  const tag = target.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true
  return Boolean(target.closest('input, textarea, select, [contenteditable="true"]'))
}

function hasModKey(e: KeyboardEvent): boolean {
  return e.ctrlKey || e.metaKey
}

function isEditingText(canvas: Canvas | undefined): boolean {
  const active = canvas?.getActiveObject()
  return active instanceof IText && active.isEditing
}

const TOOL_SHORTCUT_KEYS = new Set(['v', 'p', 'b', 't', 'r', 'o', 'h', 'f'])

/**
 * 画布快捷键：选择、剪贴板、编组、工具切换、微移等（跳过输入框与 IText 编辑态）。
 * 须在钢笔工具 keydown（capture）之后注册；钢笔在 capture 阶段 stopPropagation 拦截 Escape。
 */
export function attachFabricEditorKeyboard(options: {
  getReadonly: () => boolean
  getCanvas: () => Canvas | undefined
  deleteSelection: () => void
  canDeleteSelection?: () => boolean
  copySelection?: () => void | Promise<void>
  cutSelection?: () => void | Promise<void>
  pasteClipboard?: () => void | Promise<void>
  /** 系统剪贴板图片（`paste` 事件）；返回 true 表示已处理 */
  pasteClipboardEvent?: (e: ClipboardEvent) => void | Promise<boolean>
  /** 编辑器内部是否有可粘贴图层；有则 Ctrl+V 走内部粘贴并 preventDefault */
  hasEditorClipboardItems?: () => boolean
  selectAll?: () => void
  deselectAll?: () => void
  duplicateSelection?: () => void | Promise<void>
  groupSelection?: () => void
  frameSelection?: () => void
  ungroupSelection?: () => void
  nudgeSelection?: (dx: number, dy: number) => void
  addRectangle?: () => void
  addCircle?: () => void
  setTool?: (tool: TpFabricDesignEditorTool) => void
  setViewportTool?: (tool: TpFabricViewportTool) => void
  setSpacePanHeld?: (held: boolean) => void
  getCurrentTool?: () => TpFabricDesignEditorTool | string
  hasPathEditSession?: () => boolean
}): () => void {
  function onKeyDown(e: KeyboardEvent) {
    if (options.getReadonly()) return
    if (e.defaultPrevented) return
    if (isTypingTarget(e.target)) return

    const canvas = options.getCanvas()
    if (!canvas) return

    if (e.code === 'Space' || e.key === ' ') {
      if (isEditingText(canvas)) return
      if (e.repeat) return
      e.preventDefault()
      options.setSpacePanHeld?.(true)
      return
    }

    const key = e.key.toLowerCase()

    if (hasModKey(e) && key === 'a') {
      if (isEditingText(canvas)) return
      e.preventDefault()
      options.selectAll?.()
      return
    }

    if (hasModKey(e) && key === 'c') {
      if (isEditingText(canvas)) return
      e.preventDefault()
      void options.copySelection?.()
      return
    }

    if (hasModKey(e) && key === 'x') {
      if (isEditingText(canvas)) return
      if (options.canDeleteSelection && !options.canDeleteSelection()) return
      e.preventDefault()
      void options.cutSelection?.()
      return
    }

    if (hasModKey(e) && key === 'v') {
      if (isEditingText(canvas)) return
      if (options.hasEditorClipboardItems?.()) {
        e.preventDefault()
        void options.pasteClipboard?.()
        return
      }
      // 无内部剪贴板：不 preventDefault，让 paste 事件带上系统图片；
      // 同时尝试 Clipboard API（Chromium 截图场景）。
      void options.pasteClipboard?.()
      return
    }

    if (hasModKey(e) && key === 'd') {
      if (isEditingText(canvas)) return
      e.preventDefault()
      void options.duplicateSelection?.()
      return
    }

    if (hasModKey(e) && key === 'g') {
      if (isEditingText(canvas)) return
      e.preventDefault()
      // Ctrl+Alt+G：选区创建为容器（Figma Frame selection）
      if (e.altKey) options.frameSelection?.()
      else if (e.shiftKey) options.ungroupSelection?.()
      else options.groupSelection?.()
      return
    }

    if (e.key === 'Escape') {
      if (isEditingText(canvas)) return
      if (options.hasPathEditSession?.()) return
      if (options.getCurrentTool?.() === 'pen') return
      e.preventDefault()
      options.deselectAll?.()
      return
    }

    if (
      e.key === 'ArrowLeft' ||
      e.key === 'ArrowRight' ||
      e.key === 'ArrowUp' ||
      e.key === 'ArrowDown'
    ) {
      if (isEditingText(canvas)) return
      if (options.hasPathEditSession?.()) return
      const step = e.shiftKey ? 10 : 1
      const dx =
        e.key === 'ArrowLeft' ? -step : e.key === 'ArrowRight' ? step : 0
      const dy = e.key === 'ArrowUp' ? -step : e.key === 'ArrowDown' ? step : 0
      if (!dx && !dy) return
      e.preventDefault()
      options.nudgeSelection?.(dx, dy)
      return
    }

    if (!hasModKey(e) && !e.altKey && TOOL_SHORTCUT_KEYS.has(key)) {
      if (isEditingText(canvas)) return
      if (options.hasPathEditSession?.()) return
      e.preventDefault()
      switch (key) {
        case 'v':
          options.setViewportTool?.('select')
          options.setTool?.('select')
          break
        case 'h':
          options.setViewportTool?.('hand')
          break
        case 'p':
          options.setTool?.('pen')
          break
        case 'b':
          options.setTool?.('draw')
          break
        case 't':
          options.setTool?.('text')
          break
        case 'r':
          options.addRectangle?.()
          break
        case 'o':
          options.addCircle?.()
          break
        case 'f':
          options.setTool?.('frame')
          break
        default:
          break
      }
      return
    }

    if (e.key !== 'Delete' && e.key !== 'Backspace') return
    if (options.canDeleteSelection && !options.canDeleteSelection()) return

    const active = canvas.getActiveObject()
    if (!active) return
    if (active instanceof IText && active.isEditing) return

    e.preventDefault()
    options.deleteSelection()
  }

  function onKeyUp(e: KeyboardEvent) {
    if (e.code !== 'Space' && e.key !== ' ') return
    options.setSpacePanHeld?.(false)
  }

  function onWindowBlur() {
    options.setSpacePanHeld?.(false)
  }

  function onPaste(e: ClipboardEvent) {
    if (options.getReadonly()) return
    if (isTypingTarget(e.target)) return
    const canvas = options.getCanvas()
    if (!canvas) return
    if (isEditingText(canvas)) return
    void options.pasteClipboardEvent?.(e)
  }

  window.addEventListener('keydown', onKeyDown)
  window.addEventListener('keyup', onKeyUp)
  window.addEventListener('blur', onWindowBlur)
  window.addEventListener('paste', onPaste)
  return () => {
    window.removeEventListener('keydown', onKeyDown)
    window.removeEventListener('keyup', onKeyUp)
    window.removeEventListener('blur', onWindowBlur)
    window.removeEventListener('paste', onPaste)
    options.setSpacePanHeld?.(false)
  }
}
