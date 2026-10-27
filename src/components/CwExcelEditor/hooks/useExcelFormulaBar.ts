import type { ChangeEvent, FocusEvent, KeyboardEvent, MutableRefObject } from 'react'
import type { CellPosition } from './useExcelGridLayout'

type CommitMove = 'stay' | 'down' | 'up' | 'left' | 'right'

/**
 * 公式栏输入域：聚焦进入编辑、输入同步草稿、Enter/Tab 提交、Esc 取消、失焦提交。
 */
export function useExcelFormulaBar(opts: {
  previewing: boolean
  editingRef: MutableRefObject<boolean>
  selectionRef: MutableRefObject<CellPosition | null>
  draftRef: MutableRefObject<string>
  anchor: (index?: number) => CellPosition
  editCell: (row: number, col: number, initial?: string, focus?: 'cell' | 'formula') => void
  setDraft: (value: string) => void
  commitAt: (row: number, col: number, text: string, move: CommitMove) => void
  cancelEdit: () => void
}) {
  const { editingRef, selectionRef, draftRef } = opts

  function onFormulaFocus() {
    if (opts.previewing || editingRef.current) return
    const current = selectionRef.current ?? opts.anchor()
    opts.editCell(current.row, current.col, undefined, 'formula')
  }

  function onFormulaInput(event: ChangeEvent<HTMLInputElement>) {
    if (opts.previewing) return
    const value = event.target.value
    if (!editingRef.current) {
      const current = selectionRef.current ?? opts.anchor()
      opts.editCell(current.row, current.col, value, 'formula')
      return
    }
    opts.setDraft(value)
  }

  function onFormulaKeydown(event: KeyboardEvent<HTMLInputElement>) {
    if (!editingRef.current) return
    const current = selectionRef.current
    if (!current) return
    if (event.key === 'Enter') {
      event.preventDefault()
      event.stopPropagation()
      opts.commitAt(current.row, current.col, draftRef.current, event.shiftKey ? 'up' : 'down')
    } else if (event.key === 'Tab') {
      event.preventDefault()
      event.stopPropagation()
      opts.commitAt(current.row, current.col, draftRef.current, event.shiftKey ? 'left' : 'right')
    } else if (event.key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      opts.cancelEdit()
    }
  }

  function onFormulaBlur(event: FocusEvent<HTMLInputElement>) {
    if (!editingRef.current) return
    const next = event.relatedTarget
    if (next instanceof Element && next.closest('.cw-excel-input')) return
    const current = selectionRef.current
    if (!current) return
    opts.commitAt(current.row, current.col, draftRef.current, 'stay')
  }

  return { onFormulaFocus, onFormulaInput, onFormulaKeydown, onFormulaBlur }
}
