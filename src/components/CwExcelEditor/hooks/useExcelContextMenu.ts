import type { MouseEvent as ReactMouseEvent, MutableRefObject, RefObject } from 'react'
import { showCwContextMenu } from '../../CwContextMenu'
import type { CwContextMenuItem } from '../../CwContextMenu'
import { mergeCovering } from '../functions/workbook'
import type { CwExcelEditorTexts, CwExcelWorkbook } from '../types'
import type { CellPosition } from './useExcelGridLayout'

type CommitMove = 'stay' | 'down' | 'up' | 'left' | 'right'

/**
 * 单元格右键菜单域：命中单元格、菜单项与行/列结构操作分发。
 */
export function useExcelContextMenu(opts: {
  rootRef: RefObject<HTMLDivElement | null>
  texts: CwExcelEditorTexts
  previewing: boolean
  selectionRef: MutableRefObject<CellPosition | null>
  anchor: (index?: number) => CellPosition
  getActiveSheet: () => CwExcelWorkbook['sheets'][number] | undefined
  canUndo: () => boolean
  canRedo: () => boolean
  undo: () => void
  redo: () => void
  copyCell: (row: number, col: number) => Promise<void>
  commitAt: (row: number, col: number, text: string, move: CommitMove) => void
  pasteFromClipboard: () => Promise<void>
  placeSelection: (row: number, col: number, reveal?: boolean) => void
  insertRow: (at: number) => void
  deleteRow: (at: number) => void
  insertColumn: (at: number) => void
  deleteColumn: (at: number) => void
  closeContextMenuRef: MutableRefObject<(() => void) | null>
  openSheetMenu: (event: MouseEvent, index: number) => void
}) {
  const { rootRef, selectionRef } = opts

  function hitCell(event: { target: EventTarget | null }) {
    const target = event.target
    if (!(target instanceof Element)) return null
    const cell = target.closest('[data-excel-row]')
    if (!(cell instanceof HTMLElement)) return null
    const row = Number(cell.dataset.excelRow)
    const col = Number(cell.dataset.excelCol)
    if (!Number.isFinite(row) || !Number.isFinite(col)) return null
    return { row, col }
  }

  function onContextMenu(event: ReactMouseEvent<HTMLDivElement>) {
    const target = event.target
    if (!(target instanceof Element) || !rootRef.current?.contains(target)) return
    const sheetTab = target.closest('[data-excel-sheet]')
    if (sheetTab instanceof HTMLElement) {
      event.preventDefault()
      const index = Number(sheetTab.dataset.excelSheet)
      if (Number.isFinite(index)) opts.openSheetMenu(event.nativeEvent, index)
      return
    }
    if (target.closest('input, textarea, button, a')) return
    event.preventDefault()
    const hit = hitCell(event)
    const fallback = selectionRef.current ?? opts.anchor()
    const row = hit && hit.row >= 0 ? hit.row : fallback.row
    const col = hit && hit.col >= 0 ? hit.col : fallback.col
    opts.placeSelection(row, col)
    const readOnly = opts.previewing
    const items: CwContextMenuItem[] = [
      { key: 'undo', label: opts.texts.undo, shortcut: 'Ctrl+Z', disabled: readOnly || !opts.canUndo() },
      {
        key: 'redo',
        label: opts.texts.redo,
        shortcut: 'Ctrl+Y',
        disabled: readOnly || !opts.canRedo(),
        dividerAfter: true,
      },
      { key: 'cut', label: opts.texts.cut, shortcut: 'Ctrl+X', disabled: readOnly },
      { key: 'copy', label: opts.texts.copy, shortcut: 'Ctrl+C' },
      {
        key: 'paste',
        label: opts.texts.paste,
        shortcut: 'Ctrl+V',
        disabled: readOnly,
        dividerAfter: true,
      },
      { key: 'insert-row-above', label: opts.texts.insertRowAbove, disabled: readOnly },
      { key: 'insert-row-below', label: opts.texts.insertRowBelow, disabled: readOnly },
      { key: 'insert-col-left', label: opts.texts.insertColLeft, disabled: readOnly },
      {
        key: 'insert-col-right',
        label: opts.texts.insertColRight,
        disabled: readOnly,
        dividerAfter: true,
      },
      { key: 'clear', label: opts.texts.clear, shortcut: 'Delete', disabled: readOnly },
      { key: 'delete-row', label: opts.texts.deleteRow, danger: true, disabled: readOnly },
      { key: 'delete-col', label: opts.texts.deleteColumn, danger: true, disabled: readOnly },
    ]
    opts.closeContextMenuRef.current?.()
    const handle = showCwContextMenu({
      x: event.clientX,
      y: event.clientY,
      appearance: 'plain',
      items,
      onSelect: (key) => runContextAction(key, row, col),
      onClose: () => {
        if (opts.closeContextMenuRef.current === handle.close) {
          opts.closeContextMenuRef.current = null
        }
      },
    })
    opts.closeContextMenuRef.current = handle.close
  }

  function runContextAction(key: string, row: number, col: number) {
    if (key === 'undo') {
      opts.undo()
      return
    }
    if (key === 'redo') {
      opts.redo()
      return
    }
    if (key === 'copy') {
      void opts.copyCell(row, col)
      return
    }
    if (opts.previewing) return
    if (key === 'cut') {
      void opts.copyCell(row, col).then(() => opts.commitAt(row, col, '', 'stay'))
      return
    }
    if (key === 'paste') {
      void opts.pasteFromClipboard()
      return
    }
    if (key === 'clear') {
      opts.commitAt(row, col, '', 'stay')
      return
    }
    const span = mergeCovering(opts.getActiveSheet()?.merges ?? [], row, col)
    if (key === 'insert-row-above') opts.insertRow(row)
    else if (key === 'insert-row-below') opts.insertRow(row + (span?.rowspan ?? 1))
    else if (key === 'insert-col-left') opts.insertColumn(col)
    else if (key === 'insert-col-right') opts.insertColumn(col + (span?.colspan ?? 1))
    else if (key === 'delete-row') opts.deleteRow(row)
    else if (key === 'delete-col') opts.deleteColumn(col)
  }

  return { onContextMenu }
}
