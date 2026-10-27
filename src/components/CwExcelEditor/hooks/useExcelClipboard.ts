import type { MutableRefObject, RefObject } from 'react'
import { applyClipboardGrid } from '@zengchaowu/ui-shared/components/CwExcelEditor/functions/sheetEdits'
import { cloneWorkbook, excelKeyboardOwner } from '@zengchaowu/ui-shared/components/CwExcelEditor/functions/workbook'
import type { CwExcelWorkbook } from '@zengchaowu/ui-shared/components/CwExcelEditor/types'
import type { CellPosition } from './useExcelGridLayout'

type CommitMove = 'stay' | 'down' | 'up' | 'left' | 'right'

/**
 * 剪贴板域：document copy/cut/paste、单元格复制、文本网格粘贴。
 */
export function useExcelClipboard(opts: {
  rootRef: RefObject<HTMLDivElement | null>
  previewing: boolean
  selectionRef: MutableRefObject<CellPosition | null>
  anchor: (index?: number) => CellPosition
  cellTextAt: (row: number, col: number) => string
  commitAt: (row: number, col: number, text: string, move: CommitMove) => void
  workbookRef: MutableRefObject<CwExcelWorkbook>
  sheetIndexRef: MutableRefObject<number>
  publish: (next: CwExcelWorkbook, record?: boolean) => void
  ensureViewCovers: (row: number, col: number) => void
  placeSelection: (row: number, col: number, reveal?: boolean) => void
}) {
  const { rootRef, selectionRef, workbookRef, sheetIndexRef } = opts

  function clipboardOwns(event: Event) {
    const root = rootRef.current
    if (!root) return false
    const active = document.activeElement
    const inside = !!active && root.contains(active)
    const idle = !active || active === document.body || active === document.documentElement
    if (!inside && !(idle && excelKeyboardOwner.root === root)) return false
    const target = event.target
    return !(
      target instanceof Element && target.closest('input, textarea, select, [contenteditable="true"]')
    )
  }

  function onDocumentCopy(event: ClipboardEvent) {
    if (!clipboardOwns(event)) return
    const current = selectionRef.current ?? opts.anchor()
    event.preventDefault()
    event.clipboardData?.setData('text/plain', opts.cellTextAt(current.row, current.col))
  }

  function onDocumentCut(event: ClipboardEvent) {
    if (!clipboardOwns(event) || opts.previewing) return
    const current = selectionRef.current ?? opts.anchor()
    event.preventDefault()
    event.clipboardData?.setData('text/plain', opts.cellTextAt(current.row, current.col))
    opts.commitAt(current.row, current.col, '', 'stay')
  }

  function onDocumentPaste(event: ClipboardEvent) {
    if (!clipboardOwns(event) || opts.previewing) return
    const text = event.clipboardData?.getData('text/plain') ?? ''
    event.preventDefault()
    pasteGrid(text)
  }

  function pasteGrid(text: string) {
    const origin = selectionRef.current ?? opts.anchor()
    const next = cloneWorkbook(workbookRef.current)
    const sheet = next.sheets[sheetIndexRef.current]
    if (!sheet) return
    const applied = applyClipboardGrid(sheet, origin.row, origin.col, text)
    if (!applied) return
    if (applied.changed) opts.publish(next)
    opts.ensureViewCovers(origin.row + applied.rows - 1, origin.col + applied.cols - 1)
    opts.placeSelection(origin.row, origin.col)
  }

  async function copyCell(row: number, col: number) {
    try {
      await navigator.clipboard.writeText(opts.cellTextAt(row, col))
    } catch {
      // 浏览器拒绝剪贴板时，Ctrl+C 仍走 copy 事件
    }
  }

  async function pasteFromClipboard() {
    try {
      pasteGrid(await navigator.clipboard.readText())
    } catch {
      // 无剪贴板权限时不改表格
    }
  }

  return { onDocumentCopy, onDocumentCut, onDocumentPaste, pasteGrid, copyCell, pasteFromClipboard }
}
