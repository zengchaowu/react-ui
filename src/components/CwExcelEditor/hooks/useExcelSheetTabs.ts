import type { MutableRefObject, RefObject } from 'react'
import { showCwContextMenu } from '../../CwContextMenu'
import type { CwContextMenuItem } from '../../CwContextMenu'
import {
  appendSheet,
  deleteSheetAt,
  duplicateSheetAt,
  insertSheetAt,
  renameSheetAt,
} from '@zengchaowu/ui-shared/components/CwExcelEditor/functions/sheetEdits'
import type { CwExcelEditorTexts, CwExcelWorkbook } from '@zengchaowu/ui-shared/components/CwExcelEditor/types'

/**
 * 工作表标签域：右键菜单、增删/复制工作表、标签重命名。
 */
export function useExcelSheetTabs(opts: {
  rootRef: RefObject<HTMLDivElement | null>
  texts: CwExcelEditorTexts
  previewing: boolean
  workbookRef: MutableRefObject<CwExcelWorkbook>
  publish: (next: CwExcelWorkbook, record?: boolean) => void
  selectSheet: (index: number) => void
  renamingSheetRef: MutableRefObject<number | null>
  renameDraftRef: MutableRefObject<string>
  renameCancelledRef: MutableRefObject<boolean>
  setRenamingSheet: (value: number | null) => void
  setRenameDraft: (value: string) => void
  closeContextMenuRef: MutableRefObject<(() => void) | null>
  afterRender: (callback: () => void) => void
}) {
  const { rootRef, workbookRef, renamingSheetRef, renameDraftRef, renameCancelledRef } = opts

  function openSheetMenu(event: MouseEvent, index: number) {
    opts.selectSheet(index)
    const readOnly = opts.previewing
    const onlySheet = workbookRef.current.sheets.length <= 1
    const items: CwContextMenuItem[] = [
      { key: 'insert-sheet', label: opts.texts.insertSheet, disabled: readOnly },
      {
        key: 'delete-sheet',
        label: opts.texts.deleteSheet,
        danger: true,
        disabled: readOnly || onlySheet,
      },
      { key: 'rename-sheet', label: opts.texts.renameSheet, disabled: readOnly },
      { key: 'duplicate-sheet', label: opts.texts.duplicateSheet, disabled: readOnly },
    ]
    opts.closeContextMenuRef.current?.()
    const handle = showCwContextMenu({
      x: event.clientX,
      y: event.clientY,
      appearance: 'plain',
      items,
      onSelect: (key) => runSheetAction(key, index),
      onClose: () => {
        if (opts.closeContextMenuRef.current === handle.close) {
          opts.closeContextMenuRef.current = null
        }
      },
    })
    opts.closeContextMenuRef.current = handle.close
  }

  function runSheetAction(key: string, index: number) {
    if (opts.previewing) return
    if (key === 'insert-sheet') insertSheet(index)
    else if (key === 'delete-sheet') deleteSheet(index)
    else if (key === 'rename-sheet') startRename(index)
    else if (key === 'duplicate-sheet') duplicateSheet(index)
  }

  function insertSheet(at: number) {
    const created = insertSheetAt(workbookRef.current, at)
    opts.publish(created.workbook)
    opts.selectSheet(created.index)
  }

  function deleteSheet(index: number) {
    const created = deleteSheetAt(workbookRef.current, index)
    if (!created) return
    opts.publish(created.workbook)
    opts.selectSheet(created.index)
  }

  function duplicateSheet(index: number) {
    const created = duplicateSheetAt(workbookRef.current, index)
    if (!created) return
    opts.publish(created.workbook)
    opts.selectSheet(created.index)
  }

  function startRename(index: number) {
    if (opts.previewing || !workbookRef.current.sheets[index]) return
    renameCancelledRef.current = false
    opts.setRenamingSheet(index)
    opts.setRenameDraft(workbookRef.current.sheets[index]!.name)
    opts.afterRender(() => {
      const input = rootRef.current?.querySelector('[data-excel-rename]')
      if (!(input instanceof HTMLInputElement)) return
      input.focus()
      input.select()
    })
  }

  function cancelRename() {
    renameCancelledRef.current = true
    opts.setRenamingSheet(null)
  }

  function commitRename() {
    const index = renamingSheetRef.current
    if (renameCancelledRef.current || index == null) {
      renameCancelledRef.current = false
      return
    }
    opts.setRenamingSheet(null)
    const next = renameSheetAt(workbookRef.current, index, renameDraftRef.current)
    if (!next) return
    opts.publish(next)
  }

  function addSheet() {
    const created = appendSheet(workbookRef.current)
    opts.publish(created.workbook)
    opts.selectSheet(created.index)
  }

  return { openSheetMenu, startRename, cancelRename, commitRename, addSheet }
}
