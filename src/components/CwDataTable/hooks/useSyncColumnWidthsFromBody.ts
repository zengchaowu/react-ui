import { useCallback, useEffect, useRef } from 'react'
import type { MutableRefObject, RefObject } from 'react'
import type { CwDataTableColumn, CwDataTableRow } from '../types'
import {
  columnKeysSignature,
  getAllBodyDataRows,
  getFirstBodyDataRow,
  getHeaderRow,
  isElasticFillColumn,
  layoutBoundedFitColumns,
  syncFitContentColumnWidths,
  syncFlexColumnWidthsFromBodyRow,
} from '../functions'

export interface UseSyncColumnWidthsFromBodyOptions {
  enabled: boolean
  bodyEl: HTMLElement | null
  bodyElRef: RefObject<HTMLElement | null>
  headerRef: RefObject<HTMLDivElement | null>
  visibleColumns: CwDataTableColumn[]
  visibleColumnsRef: MutableRefObject<CwDataTableColumn[]>
  columnWidthsRef: MutableRefObject<Record<string, number>>
  setColumnWidths: (next: Record<string, number>) => void
  /** 与 props.modelValue 同源，用于判断是否有行、并在替换整表数据时重新同步 */
  modelValue: CwDataTableRow[]
  loading: boolean
  /** 拖拽改列宽期间跳过测量，避免把用户拖到的宽度覆盖回去 */
  isResizingRef: RefObject<boolean>
  expandFillColumns: boolean
  /** Markdown 表：列基线有上限，放得下时铺满，放不下时横向滚动 */
  stretchFitColumnsToContainer: boolean
  onAfterSync?: () => void
}

/**
 * 布局完成后从表体第一行测量列宽并写入 columnWidths，使表头与表体共用像素宽。
 * 在挂载、数据/列变化、表体尺寸变化时调度执行。
 */
export function useSyncColumnWidthsFromBody(options: UseSyncColumnWidthsFromBodyOptions) {
  const { enabled, bodyEl, bodyElRef, visibleColumnsRef, columnWidthsRef, setColumnWidths } =
    options

  const syncRafRef = useRef(0)
  const bodySyncObserverRef = useRef<ResizeObserver | null>(null)
  const firstRowObserverRef = useRef<ResizeObserver | null>(null)
  const optionsRef = useRef(options)
  optionsRef.current = options

  const attachFirstRowResizeObserver = useCallback(() => {
    firstRowObserverRef.current?.disconnect()
    firstRowObserverRef.current = null
    if (!enabled || typeof ResizeObserver === 'undefined') return
    const body = bodyElRef.current
    if (!body) return
    const row = getFirstBodyDataRow(body)
    if (!row) return
    const observer = new ResizeObserver(() => scheduleWidthSyncRef.current())
    observer.observe(row)
    firstRowObserverRef.current = observer
  }, [bodyElRef, enabled])

  const runSyncColumnWidths = useCallback(() => {
    if (!enabled || options.loading || options.modelValue.length === 0) return
    if (options.isResizingRef.current) return
    const body = bodyElRef.current
    if (!body) return
    const bodyRows = getAllBodyDataRows(body)
    const firstRow = bodyRows[0]
    if (!firstRow) return

    const headerRow = getHeaderRow(options.headerRef.current)
    const widths = { ...columnWidthsRef.current }

    const fitWrote = options.stretchFitColumnsToContainer
      ? layoutBoundedFitColumns(
          headerRow,
          bodyRows,
          visibleColumnsRef.current,
          widths,
          body.clientWidth,
        )
      : syncFitContentColumnWidths(
          headerRow,
          bodyRows,
          visibleColumnsRef.current,
          widths,
          body,
        )

    const syncFlex = () => {
      const flexWrote = syncFlexColumnWidthsFromBodyRow(
        firstRow,
        visibleColumnsRef.current,
        widths,
        {
          onlyWhenColumnHasNoWidth: true,
          expandFillColumns: options.expandFillColumns,
          headerRow,
          bodyRoot: body,
        },
      )
      const wrote = fitWrote || flexWrote
      if (wrote) setColumnWidths(widths)
      attachFirstRowResizeObserver()
      if (wrote) optionsRef.current.onAfterSync?.()
    }

    if (fitWrote) {
      requestAnimationFrame(syncFlex)
    } else {
      syncFlex()
    }
  }, [
    enabled,
    options.loading,
    options.modelValue.length,
    options.stretchFitColumnsToContainer,
    options.isResizingRef,
    options.headerRef,
    options.expandFillColumns,
    bodyElRef,
    columnWidthsRef,
    visibleColumnsRef,
    setColumnWidths,
    attachFirstRowResizeObserver,
  ])

  const scheduleWidthSync = useCallback(() => {
    if (syncRafRef.current) cancelAnimationFrame(syncRafRef.current)
    syncRafRef.current = requestAnimationFrame(() => {
      syncRafRef.current = 0
      runSyncColumnWidths()
    })
  }, [runSyncColumnWidths])

  const scheduleWidthSyncRef = useRef(scheduleWidthSync)
  scheduleWidthSyncRef.current = scheduleWidthSync

  const prevColumnSignatureRef = useRef(columnKeysSignature(options.visibleColumns))
  useEffect(() => {
    const signature = columnKeysSignature(options.visibleColumns)
    if (signature !== prevColumnSignatureRef.current) {
      prevColumnSignatureRef.current = signature
      setColumnWidths({})
    }
    scheduleWidthSync()
  }, [options.visibleColumns, enabled, options.loading, setColumnWidths, scheduleWidthSync])

  const prevModelHeadRef = useRef(options.modelValue[0])
  const prevModelTailRef = useRef(options.modelValue[options.modelValue.length - 1])
  const prevModelLengthRef = useRef(options.modelValue.length)
  useEffect(() => {
    const head = options.modelValue[0]
    const tail = options.modelValue[options.modelValue.length - 1]
    if (
      head === prevModelHeadRef.current &&
      tail === prevModelTailRef.current &&
      options.modelValue.length === prevModelLengthRef.current
    ) {
      return
    }
    prevModelHeadRef.current = head
    prevModelTailRef.current = tail
    prevModelLengthRef.current = options.modelValue.length
    scheduleWidthSync()
  }, [options.modelValue, scheduleWidthSync])

  const prevExpandFillRef = useRef(options.expandFillColumns)
  useEffect(() => {
    if (prevExpandFillRef.current !== options.expandFillColumns) {
      prevExpandFillRef.current = options.expandFillColumns
      if (options.expandFillColumns) {
        const widths = { ...columnWidthsRef.current }
        let changed = false
        for (const col of visibleColumnsRef.current) {
          if (isElasticFillColumn(col) && col.key in widths) {
            delete widths[col.key]
            changed = true
          }
        }
        if (changed) setColumnWidths(widths)
      }
    }
    scheduleWidthSync()
  }, [options.expandFillColumns, setColumnWidths, scheduleWidthSync, visibleColumnsRef, columnWidthsRef])

  useEffect(() => {
    const el = bodyEl
    if (!el || typeof ResizeObserver === 'undefined') return
    bodySyncObserverRef.current?.disconnect()
    const observer = new ResizeObserver(() => scheduleWidthSyncRef.current())
    observer.observe(el)
    bodySyncObserverRef.current = observer
    requestAnimationFrame(attachFirstRowResizeObserver)
    return () => {
      observer.disconnect()
      if (bodySyncObserverRef.current === observer) bodySyncObserverRef.current = null
    }
  }, [bodyEl, attachFirstRowResizeObserver])

  useEffect(() => {
    scheduleWidthSync()
  }, [scheduleWidthSync])

  useEffect(() => {
    return () => {
      if (syncRafRef.current) cancelAnimationFrame(syncRafRef.current)
      bodySyncObserverRef.current?.disconnect()
      bodySyncObserverRef.current = null
      firstRowObserverRef.current?.disconnect()
      firstRowObserverRef.current = null
    }
  }, [])

  return { syncColumnWidthsFromBody: runSyncColumnWidths }
}
