import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { MutableRefObject, RefObject } from 'react'
import type { CwDataTableColumn, CwDataTableRow } from '../types'
import type { CwDivHandle } from '../../CwDiv/CwDiv'
import {
  calculateScrollbarWidth,
  columnKeysSignature,
  computeShouldExpandFillColumns,
  getAllBodyDataRows,
  getFirstBodyDataRow,
  getHeaderRow,
  isElasticFillColumn,
  layoutBoundedFitColumns,
  syncFitContentColumnWidths,
  syncFlexColumnWidthsFromBodyRow,
} from '../functions'

export interface UseColumnWidthsOptions {
  bodyEl: HTMLElement | null
  bodyElRef: RefObject<HTMLElement | null>
  cwDivHandleRef: RefObject<CwDivHandle | null>
  headerRef: RefObject<HTMLDivElement | null>
  visibleColumns: CwDataTableColumn[]
  visibleColumnsRef: MutableRefObject<CwDataTableColumn[]>
  displayedRowCount: number
  loading: boolean
  modelValue: CwDataTableRow[]
  syncWidthsFromBody: boolean
  stretchFitColumnsToContainer: boolean
  defaultExpandFillColumns: boolean
  isResizingRef: RefObject<boolean>
  containerHeight: number
}

/** 列宽状态、fill 剩余空间、滚动条宽度与「从表体同步列宽」 */
export function useColumnWidths(options: UseColumnWidthsOptions) {
  const { bodyEl, loading, syncWidthsFromBody, bodyElRef, visibleColumnsRef } = options

  // 列宽管理
  const [columnWidths, setColumnWidthsState] = useState<Record<string, number>>({})
  const columnWidthsRef = useRef(columnWidths)
  columnWidthsRef.current = columnWidths

  const setColumnWidths = useCallback((next: Record<string, number>) => {
    columnWidthsRef.current = next
    setColumnWidthsState(next)
  }, [])

  // fill / 剩余空间
  const [expandFillColumns, setExpandFillColumns] = useState(
    options.defaultExpandFillColumns === true,
  )
  const expandFillColumnsRef = useRef(expandFillColumns)
  expandFillColumnsRef.current = expandFillColumns
  const [layoutContainerWidth, setLayoutContainerWidth] = useState(0)

  const expandFillRafRef = useRef(0)
  const syncRafRef = useRef(0)
  const syncRunRef = useRef<() => void>(() => {})

  const updateScrollbarWidthRef = useRef<() => void>(() => {})

  const updateExpandFillLayout = useCallback(() => {
    const width = bodyElRef.current?.clientWidth ?? 0
    setLayoutContainerWidth((prev) => (Math.abs(prev - width) >= 0.5 ? width : prev))
    const next = computeShouldExpandFillColumns(
      visibleColumnsRef.current,
      columnWidthsRef.current,
      bodyElRef.current,
    )
    setExpandFillColumns((prev) => (next === prev ? prev : next))
    options.cwDivHandleRef.current?.remeasure()
  }, [bodyElRef, options.cwDivHandleRef, visibleColumnsRef])

  const scheduleExpandFillUpdate = useCallback(() => {
    if (expandFillRafRef.current) cancelAnimationFrame(expandFillRafRef.current)
    expandFillRafRef.current = requestAnimationFrame(() => {
      expandFillRafRef.current = 0
      updateExpandFillLayout()
    })
  }, [updateExpandFillLayout])

  const flushExpandFillUpdate = useCallback(() => {
    if (expandFillRafRef.current) {
      cancelAnimationFrame(expandFillRafRef.current)
      expandFillRafRef.current = 0
    }
    updateExpandFillLayout()
  }, [updateExpandFillLayout])

  useLayoutEffect(() => {
    if (!bodyEl) return
    // 首帧前同步量一次表体宽度：剩余空间分摊必须赶在第一次绘制前生效，
    // 否则会先画出未分摊的列宽再跳一次（Vue 版在绘制前就完成了）。
    flushExpandFillUpdate()
    if (typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(() => scheduleExpandFillUpdate())
    observer.observe(bodyEl)
    return () => observer.disconnect()
  }, [bodyEl, flushExpandFillUpdate, scheduleExpandFillUpdate])

  useEffect(() => {
    scheduleExpandFillUpdate()
  }, [options.visibleColumns, columnWidths, scheduleExpandFillUpdate])

  // 滚动条对齐
  const [scrollbarWidth, setScrollbarWidth] = useState(0)
  const updateScrollbarWidth = useCallback(() => {
    setScrollbarWidth(calculateScrollbarWidth(bodyElRef.current))
  }, [bodyElRef])
  updateScrollbarWidthRef.current = updateScrollbarWidth

  useEffect(() => {
    const frame = requestAnimationFrame(updateScrollbarWidth)
    return () => cancelAnimationFrame(frame)
  }, [
    options.containerHeight,
    options.displayedRowCount,
    columnWidths,
    options.visibleColumns.length,
    loading,
    updateScrollbarWidth,
  ])

  useEffect(() => {
    if (!bodyEl || typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(() => {
      requestAnimationFrame(updateScrollbarWidth)
    })
    observer.observe(bodyEl)
    return () => observer.disconnect()
  }, [bodyEl, updateScrollbarWidth])

  // 从表体同步列宽
  const bodySyncObserverRef = useRef<ResizeObserver | null>(null)
  const firstRowObserverRef = useRef<ResizeObserver | null>(null)

  const attachFirstRowResizeObserver = useCallback(() => {
    firstRowObserverRef.current?.disconnect()
    firstRowObserverRef.current = null
    if (!syncWidthsFromBody || typeof ResizeObserver === 'undefined') return
    const body = bodyElRef.current
    if (!body) return
    const row = getFirstBodyDataRow(body)
    if (!row) return
    const observer = new ResizeObserver(() => scheduleWidthSyncRef.current())
    observer.observe(row)
    firstRowObserverRef.current = observer
  }, [bodyElRef, syncWidthsFromBody])

  const runSyncColumnWidths = useCallback(() => {
    if (!syncWidthsFromBody || loading || options.modelValue.length === 0) return
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
          expandFillColumns: expandFillColumnsRef.current,
          headerRow,
          bodyRoot: body,
        },
      )
      const wrote = fitWrote || flexWrote
      if (wrote) setColumnWidths(widths)
      attachFirstRowResizeObserver()
      if (wrote) {
        scheduleExpandFillUpdate()
        updateScrollbarWidthRef.current()
      }
    }

    if (fitWrote) {
      requestAnimationFrame(syncFlex)
    } else {
      syncFlex()
    }
  }, [
    syncWidthsFromBody,
    loading,
    options.modelValue.length,
    options.stretchFitColumnsToContainer,
    options.isResizingRef,
    options.headerRef,
    bodyElRef,
    visibleColumnsRef,
    setColumnWidths,
    attachFirstRowResizeObserver,
    scheduleExpandFillUpdate,
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
  syncRunRef.current = runSyncColumnWidths

  const prevColumnSignatureRef = useRef(columnKeysSignature(options.visibleColumns))
  useEffect(() => {
    const signature = columnKeysSignature(options.visibleColumns)
    if (signature !== prevColumnSignatureRef.current) {
      prevColumnSignatureRef.current = signature
      setColumnWidths({})
    }
    scheduleWidthSync()
  }, [options.visibleColumns, syncWidthsFromBody, loading, setColumnWidths, scheduleWidthSync])

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

  const prevExpandFillRef = useRef(expandFillColumns)
  useEffect(() => {
    if (prevExpandFillRef.current !== expandFillColumns) {
      prevExpandFillRef.current = expandFillColumns
      if (expandFillColumns) {
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
  }, [expandFillColumns, setColumnWidths, scheduleWidthSync, visibleColumnsRef])

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

  const prevExpandFillReminderRef = useRef(expandFillColumns)
  useEffect(() => {
    if (prevExpandFillReminderRef.current === expandFillColumns) return
    prevExpandFillReminderRef.current = expandFillColumns
    requestAnimationFrame(() => {
      options.cwDivHandleRef.current?.remeasure()
      runSyncColumnWidths()
      updateScrollbarWidthRef.current()
    })
  }, [expandFillColumns, options.cwDivHandleRef, runSyncColumnWidths])

  // 固定列重叠
  const [bodyScrollMetrics, setBodyScrollMetrics] = useState({
    scrollWidth: 0,
    clientWidth: 0,
  })

  const measureBodyOverflow = useCallback(() => {
    const el = bodyElRef.current
    setBodyScrollMetrics({
      scrollWidth: el?.scrollWidth ?? 0,
      clientWidth: el?.clientWidth ?? 0,
    })
  }, [bodyElRef])

  useEffect(() => {
    const el = bodyEl
    if (!el) {
      measureBodyOverflow()
      return
    }
    if (typeof ResizeObserver === 'undefined') {
      measureBodyOverflow()
      return
    }
    const observer = new ResizeObserver(() => measureBodyOverflow())
    observer.observe(el)
    const scrollRoot = getAllBodyDataRows(el).length > 0 ? el.firstElementChild : null
    if (scrollRoot instanceof HTMLElement) observer.observe(scrollRoot)
    measureBodyOverflow()
    return () => observer.disconnect()
  }, [bodyEl, measureBodyOverflow])

  useEffect(() => {
    const frame = requestAnimationFrame(measureBodyOverflow)
    return () => cancelAnimationFrame(frame)
  }, [options.visibleColumns, columnWidths, measureBodyOverflow])

  return {
    columnWidths,
    setColumnWidths,
    columnWidthsRef,
    expandFillColumns,
    layoutContainerWidth,
    scrollbarWidth,
    flushExpandFillUpdate,
    runSyncColumnWidths,
    bodyScrollMetrics,
  }
}
