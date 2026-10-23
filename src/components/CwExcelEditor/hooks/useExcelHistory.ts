import { useRef } from 'react'
import type { CwExcelWorkbook } from '../types'
import { carryExcelSource } from '../functions/workbookIo'
import { cloneWorkbook } from '../functions/workbook'

const HISTORY_LIMIT = 100

type HistoryEntry = {
  workbook: CwExcelWorkbook
  sheetIndex: number
  selection: { row: number; col: number } | null
}

export function isHistoryKey(event: KeyboardEvent) {
  if (!(event.ctrlKey || event.metaKey) || event.altKey) return false
  const key = event.key.toLowerCase()
  return key === 'z' || key === 'y'
}

/** Vue nextTick 的等价：等本轮 state 落地、DOM 画完再执行。 */
function afterRender(callback: () => void) {
  setTimeout(callback, 0)
}

export interface UseExcelHistoryOptions {
  getWorkbook: () => CwExcelWorkbook
  setWorkbook: (workbook: CwExcelWorkbook) => void
  getSheetIndex: () => number
  setSheetIndex: (index: number) => void
  getSelection: () => { row: number; col: number } | null
  setSelection: (selection: { row: number; col: number } | null) => void
  getEditing: () => boolean
  setEditing: (editing: boolean) => void
  getTypeover: () => string | null
  setTypeover: (typeover: string | null) => void
  getDraft: () => string
  setDraftValue: (draft: string) => void
  getPreviewing: () => boolean
  emitUpdateModelValue: (workbook: CwExcelWorkbook) => void
  emitUpdateActiveSheet: (index: number) => void
  emitChange: (workbook: CwExcelWorkbook) => void
  anchor: () => { row: number; col: number }
  cancelEdit: () => void
  focusActiveEditor: () => void
  resetColumnWidths: () => void
  refreshGrid: () => void
  scheduleMergeLayoutSync: () => void
  focusGrid: () => void
}

export function useExcelHistory(options: UseExcelHistoryOptions) {
  // 函数体每次渲染都重建（和 Vue 闭包读 ref 一样总能拿到最新值），只有栈本体留在 ref 里。
  const optionsRef = useRef(options)
  optionsRef.current = options
  const storeRef = useRef<{
    undoStack: HistoryEntry[]
    redoStack: HistoryEntry[]
    draftUndo: string[]
    draftRedo: string[]
    modelEcho: { active: boolean }
  } | null>(null)
  if (!storeRef.current) {
    storeRef.current = {
      undoStack: [],
      redoStack: [],
      draftUndo: [],
      draftRedo: [],
      modelEcho: { active: false },
    }
  }
  const store = storeRef.current
  const { undoStack, redoStack, draftUndo, draftRedo, modelEcho } = store

  function resetDraftHistory() {
    draftUndo.length = 0
    draftRedo.length = 0
  }

  function setDraft(next: string) {
    const current = optionsRef.current
    if (next === current.getDraft()) return
    draftUndo.push(current.getDraft())
    if (draftUndo.length > HISTORY_LIMIT) draftUndo.shift()
    draftRedo.length = 0
    current.setDraftValue(next)
  }

  function undoDraft() {
    const current = optionsRef.current
    if (!draftUndo.length) {
      current.cancelEdit()
      return
    }
    draftRedo.push(current.getDraft())
    current.setDraftValue(draftUndo.pop() ?? '')
    afterRender(() => optionsRef.current.focusActiveEditor())
  }

  function redoDraft() {
    const current = optionsRef.current
    if (!draftRedo.length) return
    draftUndo.push(current.getDraft())
    current.setDraftValue(draftRedo.pop() ?? '')
    afterRender(() => optionsRef.current.focusActiveEditor())
  }

  function captureHistory(): HistoryEntry {
    const current = optionsRef.current
    return {
      workbook: cloneWorkbook(current.getWorkbook()),
      sheetIndex: current.getSheetIndex(),
      selection: current.getSelection() ? { ...current.getSelection()! } : null,
    }
  }

  function resetHistory() {
    undoStack.length = 0
    redoStack.length = 0
  }

  function publish(next: CwExcelWorkbook, record = true) {
    const current = optionsRef.current
    if (record) {
      undoStack.push(captureHistory())
      if (undoStack.length > HISTORY_LIMIT) undoStack.shift()
      redoStack.length = 0
    }
    modelEcho.active = true
    carryExcelSource(current.getWorkbook(), next)
    current.setWorkbook(next)
    current.emitUpdateModelValue(next)
    current.emitChange(next)
    afterRender(() => {
      modelEcho.active = false
    })
  }

  function restoreHistory(entry: HistoryEntry) {
    const current = optionsRef.current
    current.setEditing(false)
    current.setTypeover(null)
    current.setDraftValue('')
    resetDraftHistory()
    publish(cloneWorkbook(entry.workbook), false)
    const last = Math.max(0, entry.workbook.sheets.length - 1)
    const sheetIndex = Math.min(Math.max(0, entry.sheetIndex), last)
    current.setSheetIndex(sheetIndex)
    current.setSelection(entry.selection ? { ...entry.selection } : current.anchor())
    current.emitUpdateActiveSheet(sheetIndex)
    current.resetColumnWidths()
    current.refreshGrid()
    current.scheduleMergeLayoutSync()
    current.focusGrid()
  }

  function undo() {
    const current = optionsRef.current
    if (current.getPreviewing()) return
    if (current.getEditing()) {
      current.cancelEdit()
      return
    }
    const entry = undoStack.pop()
    if (!entry) return
    redoStack.push(captureHistory())
    restoreHistory(entry)
  }

  function redo() {
    const current = optionsRef.current
    if (current.getPreviewing() || current.getEditing()) return
    const entry = redoStack.pop()
    if (!entry) return
    undoStack.push(captureHistory())
    if (undoStack.length > HISTORY_LIMIT) undoStack.shift()
    restoreHistory(entry)
  }

  return {
    modelEcho,
    canUndo: () => undoStack.length > 0,
    canRedo: () => redoStack.length > 0,
    resetDraftHistory,
    setDraft,
    undoDraft,
    redoDraft,
    resetHistory,
    publish,
    undo,
    redo,
  }
}
