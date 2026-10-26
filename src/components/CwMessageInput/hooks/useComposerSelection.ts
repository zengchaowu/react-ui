import { useCallback, useRef, type RefObject } from 'react'
import type { Editor } from '@tiptap/core'

/**
 * 光标记忆（点击表情/工具栏导致失焦后插入仍落在原光标处）+ 输入区光标滚动定位
 * （等价 Vue `useComposerSelection`）
 */
export function useComposerSelection(options: {
  getEditor: () => Editor | null
  fieldRef: RefObject<HTMLElement | null>
}) {
  const { getEditor, fieldRef } = options

  /** 点击表情/工具栏导致失焦后，插入仍应落在原光标处 */
  const lastComposerSelectionRef = useRef<{ from: number; to: number } | null>(null)

  const rememberComposerSelection = useCallback((ed: Editor) => {
    const { from, to } = ed.state.selection
    lastComposerSelectionRef.current = { from, to }
  }, [])

  const restoreComposerSelectionBeforeInsert = useCallback((ed: Editor) => {
    const saved = lastComposerSelectionRef.current
    if (!saved) return
    ed.commands.setTextSelection(saved)
  }, [])

  /** Shift+Enter 换行、粘贴大段文本后，将光标滚入 field 可视区域底部 */
  const scrollFieldCaretIntoView = useCallback((): void => {
    requestAnimationFrame(() => {
      const ed = getEditor()
      const field = fieldRef.current
      if (!ed?.view || !field) return
      const pos = ed.state.selection.head
      try {
        const coords = ed.view.coordsAtPos(pos)
        const fieldRect = field.getBoundingClientRect()
        const margin = 6
        if (coords.bottom > fieldRect.bottom - margin) {
          field.scrollTop =
            field.scrollTop + coords.bottom - fieldRect.bottom + margin
        }
        if (coords.top < fieldRect.top + margin) {
          field.scrollTop =
            field.scrollTop - (fieldRect.top + margin - coords.top)
        }
      } catch {
        if (pos >= ed.state.doc.content.size - 2) {
          field.scrollTop = field.scrollHeight
        }
      }
    })
  }, [fieldRef, getEditor])

  return {
    lastComposerSelectionRef,
    rememberComposerSelection,
    restoreComposerSelectionBeforeInsert,
    scrollFieldCaretIntoView,
  }
}
