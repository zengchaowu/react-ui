import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type {
  ClipboardEvent as ReactClipboardEvent,
  FocusEvent as ReactFocusEvent,
  FormEvent as ReactFormEvent,
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
  RefObject,
  UIEvent as ReactUIEvent,
} from 'react'
import type { CwDivHandle } from '../../CwDiv/CwDiv'
import { resolveCwDivViewport } from '../../CwDiv/resolveCwDivViewport'
import { defaultTexts } from '../texts'
import type {
  CwPdfDocument,
  CwPdfEditorEmits,
  CwPdfEditorProps,
  CwPdfNote,
  CwPdfRotation,
  CwPdfTextRun,
} from '../types'
import {
  blankPage,
  clonePdfDocument,
  createBlankPdfDocument,
  createId,
  openPdfDocument,
  pdfDocumentToArrayBuffer,
  readPageRuns,
  readPdfSource,
  samePdfDocument,
  type CwPdfViewport,
} from '../functions/pdfDocument'
import {
  buildPageSlots,
  pageIndexAtScroll,
  totalStackHeight,
  visiblePageSlots,
} from '../functions/pdfPageLayout'
import {
  filterVisibleRuns,
  noteBoxStyle,
  noteFontPx,
  runEditorInheritedStyle,
  runOverlayStyle,
} from '../functions/pdfOverlayStyle'
import {
  isRunEditorTarget,
  mountRunEditorContent,
  pastePlainTextIntoEditor,
  queryRunEditor,
  selectAllInRunEditor,
  syncRunEditorDom,
} from '../functions/pdfRunEditorDom'
import { usePdfEditorCanvasPaint } from './usePdfEditorCanvasPaint'

/** Vue nextTick 的等价：等本轮 state 落地、DOM 画完再执行。 */
function afterRender(callback: () => void) {
  setTimeout(callback, 0)
}

/**
 * useState + 同步镜像 ref。Vue 的 ref 写入后立刻能读到新值；
 * React setState 之后同一事件里读 state 还是旧的，镜像 ref 用来复刻 `.value` 语义。
 */
function useMirroredState<T>(initial: T | (() => T)) {
  const [state, setState] = useState(initial)
  const ref = useRef(state)
  const set = useCallback((value: T | ((prev: T) => T)) => {
    const next = typeof value === 'function' ? (value as (prev: T) => T)(ref.current) : value
    ref.current = next
    setState(next)
  }, [])
  return [state, set, ref] as const
}

export interface UseCwPdfEditorOptions {
  props: CwPdfEditorProps & CwPdfEditorEmits
  stageRef: RefObject<CwDivHandle | null>
  rootRef: RefObject<HTMLElement | null>
}

export function useCwPdfEditor(options: UseCwPdfEditorOptions) {
  // 每次渲染镜像最新 options，长生命周期闭包（异步加载、document 监听）也能读到最新 props。
  const optionsRef = useRef(options)
  optionsRef.current = options
  const { modelValue, src } = options.props

  const texts = useMemo(
    () => ({ ...defaultTexts, ...options.props.texts }),
    [options.props.texts],
  )
  const previewing = options.props.mode === 'preview' || Boolean(options.props.readonly)

  const [pdf, setPdf, pdfRef] = useMirroredState<CwPdfDocument>(() =>
    options.props.modelValue
      ? clonePdfDocument(options.props.modelValue)
      : createBlankPdfDocument(),
  )
  const [loading, setLoading] = useState(
    options.props.src != null && options.props.modelValue == null,
  )
  const [error, setError] = useState('')
  const [selected, setSelected, selectedRef] = useMirroredState(0)
  const [zoom, setZoom, zoomRef] = useMirroredState(1)
  const [stageWidth, setStageWidth, stageWidthRef] = useMirroredState(800)
  const [scrollTop, setScrollTop] = useMirroredState(0)
  const [stageHeight, setStageHeight, stageHeightRef] = useMirroredState(600)
  const [aspects, setAspects, aspectsRef] = useMirroredState<Record<string, number>>({})
  const [pageViews, setPageViews, pageViewsRef] = useMirroredState<Record<string, CwPdfViewport>>(
    {},
  )
  const [editingRunId, setEditingRunId, editingRunIdRef] = useMirroredState('')

  const sourceBytesRef = useRef(new Uint8Array())
  const openingRunIdRef = useRef('')

  function stageViewport() {
    return resolveCwDivViewport(optionsRef.current.stageRef.current)
  }

  const pageWidth = Math.max(160, (stageWidth - 32) * zoom)
  const layouts = useMemo(
    () => buildPageSlots(pdf.pages, pageWidth, aspects),
    [pdf, pageWidth, aspects],
  )
  const totalHeight = totalStackHeight(layouts)
  const visibleSlots = visiblePageSlots(layouts, scrollTop, stageHeight)
  const viewingPage = pageIndexAtScroll(layouts, scrollTop, stageHeight)

  const pageLabel = useMemo(() => {
    const total = pdf.pages.length
    const current = total ? Math.min(viewingPage, total - 1) + 1 : 0
    return texts.pageText.replace('{current}', String(current)).replace('{total}', String(total))
  }, [texts, pdf.pages.length, viewingPage])

  // 派生布局同步进 ref，canvas 绘制闭包始终读最新值。
  const layoutsRef = useRef(layouts)
  layoutsRef.current = layouts
  const pageWidthRef = useRef(pageWidth)
  pageWidthRef.current = pageWidth

  const canvas = usePdfEditorCanvasPaint({
    getPdf: () => pdfRef.current,
    getLayouts: () => layoutsRef.current,
    getPageWidth: () => pageWidthRef.current,
    getPageViews: () => pageViewsRef.current,
    setPageViews,
    getAspects: () => aspectsRef.current,
    setAspects,
    stageViewport,
  })

  function publish() {
    const next = clonePdfDocument(pdfRef.current)
    // Vue 靠响应式原地改触发重渲染；React 必须换新引用。
    setPdf(next)
    optionsRef.current.props.onModelValueChange?.(next)
    optionsRef.current.props.onChange?.(next)
  }

  function patch(change: (pages: CwPdfDocument['pages']) => void) {
    const next = clonePdfDocument(pdfRef.current)
    change(next.pages)
    setPdf(next)
    setSelected(Math.min(selectedRef.current, Math.max(next.pages.length - 1, 0)))
    publish()
  }

  function zoomBy(factor: number) {
    setZoom(Math.min(3, Math.max(0.4, zoomRef.current * factor)))
  }

  function rotateSelected() {
    patch((pages) => {
      const page = pages[selectedRef.current]
      if (!page) return
      page.rotation = ((page.rotation + 90) % 360) as CwPdfRotation
    })
  }

  function duplicateSelected() {
    patch((pages) => {
      const page = pages[selectedRef.current]
      if (!page) return
      pages.splice(selectedRef.current + 1, 0, {
        ...page,
        notes: page.notes.map((note) => ({ ...note, id: createId('note') })),
        runs: (page.runs ?? []).map((run) => ({
          ...run,
          id: createId('run'),
          transform: [...run.transform] as CwPdfTextRun['transform'],
        })),
      })
      setSelected(selectedRef.current + 1)
    })
  }

  function addBlankAfter() {
    patch((pages) => {
      pages.splice(selectedRef.current + 1, 0, blankPage())
      setSelected(selectedRef.current + 1)
    })
  }

  function deleteSelected() {
    if (pdfRef.current.pages.length < 2) return
    patch((pages) => {
      pages.splice(selectedRef.current, 1)
    })
  }

  function moveSelected(delta: number) {
    const target = selectedRef.current + delta
    if (target < 0 || target >= pdfRef.current.pages.length) return
    patch((pages) => {
      const [page] = pages.splice(selectedRef.current, 1)
      if (!page) return
      pages.splice(target, 0, page)
      setSelected(target)
    })
  }

  function addNote() {
    patch((pages) => {
      const page = pages[selectedRef.current]
      if (!page) return
      page.notes.push({
        id: createId('note'),
        x: 0.12,
        y: 0.12 + page.notes.length * 0.08,
        w: 0.46,
        h: 0.1,
        text: '',
        fontSize: 16,
      })
    })
  }

  function findPageIndexByRunId(runId: string) {
    return pdfRef.current.pages.findIndex((page) => page.runs?.some((run) => run.id === runId))
  }

  function flushRunEditor(runId: string) {
    const pageIndex = findPageIndexByRunId(runId)
    if (pageIndex < 0) return pageIndex
    const editor = queryRunEditor(stageViewport(), runId)
    const run = pdfRef.current.pages[pageIndex]?.runs.find((item) => item.id === runId)
    if (!editor || !run) return pageIndex
    const value = syncRunEditorDom(editor)
    if (value && run.decodeFailed) run.decodeFailed = false
    if (run.text !== value) {
      run.text = value
      publish()
    }
    return pageIndex
  }

  function visibleRuns(pageIndex: number) {
    return filterVisibleRuns(pdf.pages[pageIndex]?.runs ?? [], previewing)
  }

  function runStyle(pageIndex: number, run: CwPdfTextRun, pageHeight: number) {
    const page = pdf.pages[pageIndex]
    const viewport = page ? pageViews[`${page.sourceIndex}:${page.rotation}`] : undefined
    if (!viewport) return { display: 'none' }
    return runOverlayStyle(run, viewport, pageHeight)
  }

  function noteStyle(note: CwPdfNote, pageHeight: number) {
    return noteBoxStyle(note, pageHeight)
  }

  function focusEditingInput(runId: string) {
    const editor = queryRunEditor(stageViewport(), runId)
    if (!editor || editor.ownerDocument.activeElement === editor) return
    editor.focus()
    selectAllInRunEditor(editor)
  }

  function onRunMouseDown(event: ReactMouseEvent) {
    if (previewing) return
    if (isRunEditorTarget(event.target)) return
    event.preventDefault()
  }

  function onRunPointerDown(pageIndex: number, run: CwPdfTextRun, event: ReactPointerEvent) {
    setSelected(pageIndex)
    if (previewing) return
    if (isRunEditorTarget(event.target)) return
    event.preventDefault()
    const runId = run.id
    const previousId = editingRunIdRef.current
    const finishOpen = () => {
      canvas.paintEditBackdrop(pageIndex, runId)
      focusEditingInput(runId)
      requestAnimationFrame(() => {
        if (openingRunIdRef.current === runId) openingRunIdRef.current = ''
      })
    }
    if (previousId && previousId !== runId) {
      const previousPage = flushRunEditor(previousId)
      openingRunIdRef.current = runId
      setEditingRunId(runId)
      const pages = previousPage === pageIndex ? [pageIndex] : [previousPage, pageIndex]
      for (const index of pages) canvas.invalidatePageCanvas(index)
      void canvas.repaintPages(pages, finishOpen)
      return
    }
    openingRunIdRef.current = runId
    setEditingRunId(runId)
    afterRender(finishOpen)
  }

  function onRunBlur(pageIndex: number, runId: string, event: ReactFocusEvent) {
    if (openingRunIdRef.current === runId && event.relatedTarget === optionsRef.current.rootRef.current) {
      requestAnimationFrame(() => {
        if (editingRunIdRef.current === runId) focusEditingInput(runId)
      })
      return
    }
    if (editingRunIdRef.current !== runId) return
    flushRunEditor(runId)
    setEditingRunId('')
    canvas.repaintPage(pageIndex)
  }

  function onRunKeydown(event: ReactKeyboardEvent) {
    event.stopPropagation()
    if (event.key !== 'Enter') return
    event.preventDefault()
    if (event.target instanceof HTMLElement) event.target.blur()
  }

  function onRunPaste(event: ReactClipboardEvent) {
    pastePlainTextIntoEditor(event.nativeEvent)
  }

  function onRunInput(pageIndex: number, runId: string, event: ReactFormEvent) {
    const editor = event.target
    if (!(editor instanceof HTMLElement)) return
    const value = syncRunEditorDom(editor)
    const run = pdfRef.current.pages[pageIndex]?.runs.find((item) => item.id === runId)
    if (!run || run.text === value) return
    if (run.decodeFailed && value) run.decodeFailed = false
    run.text = value
    publish()
  }

  function onNoteInput(pageIndex: number, noteId: string, value: string) {
    const page = pdfRef.current.pages[pageIndex]
    const note = page?.notes.find((item) => item.id === noteId)
    if (!note || note.text === value) return
    note.text = value
    publish()
  }

  function onNotePointerDown(pageIndex: number, note: CwPdfNote, event: ReactPointerEvent) {
    if (previewing) return
    if ((event.target as HTMLElement).tagName === 'TEXTAREA') return
    const pageEl = (event.currentTarget as HTMLElement).parentElement
    if (!pageEl) return
    const rect = pageEl.getBoundingClientRect()
    const origin = { x: note.x, y: note.y, clientX: event.clientX, clientY: event.clientY }
    const move = (ev: PointerEvent) => {
      note.x = Math.min(1 - note.w, Math.max(0, origin.x + (ev.clientX - origin.clientX) / rect.width))
      note.y = Math.min(1 - note.h, Math.max(0, origin.y + (ev.clientY - origin.clientY) / rect.height))
      // Vue 靠响应式原地改；React 换根引用触发重渲染（pages 不动，拖动期间不克隆）。
      setPdf({ pages: pdfRef.current.pages })
    }
    const up = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      publish()
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    setSelected(pageIndex)
  }

  function onKeydown(event: ReactKeyboardEvent) {
    if (previewing) return
    if (event.key !== 'Delete' && event.key !== 'Backspace') return
    const target = event.target as HTMLElement
    if (target.tagName === 'TEXTAREA' || target.tagName === 'INPUT') return
    event.preventDefault()
    deleteSelected()
  }

  function onScroll(event: ReactUIEvent<HTMLDivElement>) {
    const stage = event.target instanceof HTMLElement ? event.target : stageViewport()
    if (!stage) return
    setScrollTop(stage.scrollTop)
    if (editingRunIdRef.current) return
    const index = pageIndexAtScroll(layoutsRef.current, stage.scrollTop, stageHeightRef.current)
    if (selectedRef.current !== index) setSelected(index)
  }

  async function loadSource(source: NonNullable<CwPdfEditorProps['src']>) {
    setLoading(true)
    setError('')
    canvas.cancelPaint()
    try {
      const bytes = await readPdfSource(source)
      sourceBytesRef.current = bytes.slice()
      await canvas.destroyPdfDoc()
      const doc = await openPdfDocument(sourceBytesRef.current)
      canvas.setPdfDoc(doc)
      const count = doc.numPages
      const nextAspects: Record<string, number> = {}
      const extracted: CwPdfTextRun[][] = []
      for (let index = 1; index <= count; index += 1) {
        const page = await doc.getPage(index)
        const viewport = page.getViewport({ scale: 1 })
        nextAspects[`${index - 1}:0`] = Math.round((viewport.width / viewport.height) * 1000) / 1000
        extracted.push(await readPageRuns(page as Parameters<typeof readPageRuns>[0]))
      }
      setAspects(nextAspects)
      canvas.bumpPaintEpoch()
      if (!optionsRef.current.props.modelValue) {
        setPdf({
          pages: extracted.map((runs, sourceIndex) => ({
            sourceIndex,
            rotation: 0 as CwPdfRotation,
            notes: [],
            runs,
          })),
        })
        setSelected(0)
      } else {
        setPdf({
          pages: pdfRef.current.pages.map((page) => {
            if (page.runs.length > 0 || page.sourceIndex < 0) return page
            const runs = extracted[page.sourceIndex]
            return runs ? { ...page, runs } : page
          }),
        })
      }
      await canvas.capturePageViews()
    } catch {
      canvas.bumpPaintEpoch()
      setError({ ...defaultTexts, ...optionsRef.current.props.texts }.loadError)
      setPdf({ pages: [] })
    } finally {
      setLoading(false)
      void canvas.paintVisible()
    }
  }

  // watch(() => props.src, ..., { immediate: true })
  useEffect(() => {
    if (src == null) return
    void loadSource(src)
    // loadSource 全走 ref/optionsRef，只随 src 重新加载
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src])

  // watch(() => props.modelValue, ...)（无 immediate，跳首跑）
  const firstModelEffect = useRef(true)
  useEffect(() => {
    if (firstModelEffect.current) {
      firstModelEffect.current = false
      return
    }
    const value = optionsRef.current.props.modelValue
    if (!value || samePdfDocument(value, pdfRef.current)) return
    setPdf(clonePdfDocument(value))
    setSelected(Math.min(selectedRef.current, Math.max(value.pages.length - 1, 0)))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modelValue])

  // watch(visibleSlots 页码串, ...)（跳首跑）
  const visibleKey = visibleSlots.map((slot) => slot.index).join(',')
  const firstVisibleEffect = useRef(true)
  useEffect(() => {
    if (firstVisibleEffect.current) {
      firstVisibleEffect.current = false
      return
    }
    void canvas.paintVisible()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleKey])

  // watch(pageWidth, ...)（跳首跑）
  const firstWidthEffect = useRef(true)
  useEffect(() => {
    if (firstWidthEffect.current) {
      firstWidthEffect.current = false
      return
    }
    void canvas.paintVisible()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageWidth])

  // watch(页面 sourceIndex:rotation 串, ...)（跳首跑）
  const rotationKey = pdf.pages.map((page) => `${page.sourceIndex}:${page.rotation}`).join('|')
  const firstRotationEffect = useRef(true)
  useEffect(() => {
    if (firstRotationEffect.current) {
      firstRotationEffect.current = false
      return
    }
    void canvas.capturePageViews()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rotationKey])

  // onMounted / onBeforeUnmount
  useEffect(() => {
    const stage = stageViewport()
    let resizeObserver: ResizeObserver | null = null
    if (stage) {
      setStageWidth(stage.clientWidth || stageWidthRef.current)
      setStageHeight(stage.clientHeight || stageHeightRef.current)
      resizeObserver = new ResizeObserver(() => {
        setStageWidth(stage.clientWidth || stageWidthRef.current)
        setStageHeight(stage.clientHeight || stageHeightRef.current)
      })
      resizeObserver.observe(stage)
      void canvas.paintVisible()
    }
    return () => {
      canvas.cancelPaint()
      resizeObserver?.disconnect()
      void canvas.destroyPdfDoc()
    }
    // 只挂一次；内部全走 ref/optionsRef
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function toArrayBuffer() {
    return pdfDocumentToArrayBuffer(sourceBytesRef.current, pdfRef.current)
  }

  return {
    texts,
    previewing,
    pdf,
    loading,
    error,
    selected,
    setSelected,
    editingRunId,
    pageWidth,
    totalHeight,
    visibleSlots,
    pageLabel,
    zoomBy,
    rotateSelected,
    duplicateSelected,
    addBlankAfter,
    deleteSelected,
    moveSelected,
    addNote,
    runEditorStyle: () => runEditorInheritedStyle,
    mountRunEditor: mountRunEditorContent,
    visibleRuns,
    runStyle,
    noteStyle,
    noteFontPx,
    onRunMouseDown,
    onRunPointerDown,
    onRunBlur,
    onRunKeydown,
    onRunPaste,
    onRunInput,
    onNoteInput,
    onNotePointerDown,
    onKeydown,
    onScroll,
    toArrayBuffer,
  }
}
