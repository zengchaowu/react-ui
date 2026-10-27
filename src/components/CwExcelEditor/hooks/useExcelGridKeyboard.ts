import type { MutableRefObject } from 'react'
import { stepFromMerge } from '../functions/workbook'
import type { CwExcelWorkbook } from '../types'
import type { CellPosition } from './useExcelGridLayout'

type CommitMove = 'stay' | 'down' | 'up' | 'left' | 'right'

/**
 * 表格键盘域：方向键/Enter/Tab 移动、F2 编辑、Delete 清空、直接输入进入编辑。
 */
export function useExcelGridKeyboard(opts: {
  previewing: boolean
  selectionRef: MutableRefObject<CellPosition | null>
  editingRef: MutableRefObject<boolean>
  draftRef: MutableRefObject<string>
  anchor: (index?: number) => CellPosition
  getActiveSheet: () => CwExcelWorkbook['sheets'][number] | undefined
  setSelection: (value: CellPosition) => void
  setDraftValue: (value: string) => void
  setDraft: (value: string) => void
  placeSelection: (row: number, col: number, reveal?: boolean) => void
  editCell: (row: number, col: number, initial?: string, focus?: 'cell' | 'formula') => void
  commitAt: (row: number, col: number, text: string, move: CommitMove) => void
  undo: () => void
  redo: () => void
  focusActiveEditor: () => void
  afterRender: (callback: () => void) => void
}) {
  const { selectionRef, editingRef, draftRef } = opts

  function onGridKeydown(event: KeyboardEvent) {
    if ((event.ctrlKey || event.metaKey) && !event.altKey) {
      const key = event.key.toLowerCase()
      if (key === 'z') {
        event.preventDefault()
        if (event.shiftKey) opts.redo()
        else opts.undo()
        return
      }
      if (key === 'y') {
        event.preventDefault()
        opts.redo()
        return
      }
    }
    const current = selectionRef.current ?? opts.anchor()
    if (!selectionRef.current) opts.setSelection(current)
    const go = (row: number, col: number) => {
      event.preventDefault()
      if (editingRef.current) {
        opts.afterRender(opts.focusActiveEditor)
        return
      }
      opts.placeSelection(row, col, true)
    }
    const merges = opts.getActiveSheet()?.merges ?? []
    if (event.key === 'ArrowDown') {
      const next = stepFromMerge(merges, current.row, current.col, 'down')
      return go(next.row, next.col)
    }
    if (event.key === 'ArrowUp') {
      const next = stepFromMerge(merges, current.row, current.col, 'up')
      return go(next.row, next.col)
    }
    if (event.key === 'ArrowRight') {
      const next = stepFromMerge(merges, current.row, current.col, 'right')
      return go(next.row, next.col)
    }
    if (event.key === 'ArrowLeft') {
      const next = stepFromMerge(merges, current.row, current.col, 'left')
      return go(next.row, next.col)
    }
    if (event.key === 'Enter') {
      const next = stepFromMerge(merges, current.row, current.col, event.shiftKey ? 'up' : 'down')
      return go(next.row, next.col)
    }
    if (event.key === 'Tab') {
      const next = stepFromMerge(merges, current.row, current.col, event.shiftKey ? 'left' : 'right')
      return go(next.row, next.col)
    }
    if (event.key === 'F2') {
      event.preventDefault()
      if (editingRef.current) {
        opts.afterRender(opts.focusActiveEditor)
        return
      }
      opts.editCell(current.row, current.col)
      return
    }
    if (event.key === 'Delete' || event.key === 'Backspace') {
      event.preventDefault()
      if (opts.previewing) return
      if (editingRef.current) {
        opts.setDraftValue(event.key === 'Backspace' ? draftRef.current.slice(0, -1) : '')
        opts.afterRender(opts.focusActiveEditor)
        return
      }
      opts.commitAt(current.row, current.col, '', 'stay')
      return
    }
    if (
      event.key.length === 1 &&
      !event.ctrlKey &&
      !event.metaKey &&
      !event.altKey &&
      !event.isComposing
    ) {
      event.preventDefault()
      if (editingRef.current) {
        // 输入框还没接住焦点时，数字会一格一格被替换。接在草稿后面。
        opts.setDraft(draftRef.current + event.key)
        opts.afterRender(opts.focusActiveEditor)
        return
      }
      opts.editCell(current.row, current.col, event.key)
    }
  }

  return { onGridKeydown }
}
