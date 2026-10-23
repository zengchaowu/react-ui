import { useReactiveRef, type ReactiveRef } from './reactivity'
import type { Canvas } from 'fabric'
import {
  applyFabricContainerLayout,
} from '../layers/fabricContainerLayout.pure'
import {
  readFabricLayoutSelectionSnapshot,
} from '../layers/fabricEditorLayoutSync.pure'
import {
  isFabricContainerObject,
  getFabricContainerClipContent,
  setFabricContainerClipContent,
  setFabricContainerLayout,
  type FabricContainerLayout,
  type FabricContainerLayoutAlign,
  type FabricContainerLayoutJustify,
  type FabricContainerLayoutMode,
} from '../tools/fabricContainerTool.pure'
import type { TpFabricDesignEditorProps } from '../types'

type EmitFn = {
  (e: 'object-modified', obj: import('fabric').FabricObject): void
}

export function useFabricDesignEditorLayout(options: {
  canvasRef: ReactiveRef<Canvas | undefined>
  getProps: () => Pick<TpFabricDesignEditorProps, 'readonly'>
  emit: EmitFn
}) {
  const layoutSelectionActive = useReactiveRef(false)
  const layoutMode = useReactiveRef<FabricContainerLayoutMode>('free')
  const layoutDirection = useReactiveRef<'horizontal' | 'vertical'>('vertical')
  const layoutGap = useReactiveRef(8)
  const layoutPadding = useReactiveRef(8)
  const layoutAlign = useReactiveRef<FabricContainerLayoutAlign>('start')
  const layoutJustify = useReactiveRef<FabricContainerLayoutJustify>('start')
  const layoutColumns = useReactiveRef(2)
  const layoutClipContent = useReactiveRef(false)

  function applySnapshotToState(
    snapshot: ReturnType<typeof readFabricLayoutSelectionSnapshot>,
  ) {
    layoutSelectionActive.value = snapshot.active
    layoutMode.value = snapshot.layout.mode
    layoutDirection.value = snapshot.layout.direction ?? 'vertical'
    layoutGap.value = snapshot.layout.gap ?? 8
    layoutPadding.value = snapshot.layout.padding ?? 8
    layoutAlign.value = snapshot.layout.align ?? 'start'
    layoutJustify.value = snapshot.layout.justify ?? 'start'
    layoutColumns.value = snapshot.layout.columns ?? 2
    layoutClipContent.value = snapshot.clipContent
  }

  function syncLayoutFromSelection() {
    if (options.getProps().readonly) {
      layoutSelectionActive.value = false
      return
    }
    applySnapshotToState(readFabricLayoutSelectionSnapshot(options.canvasRef.value))
  }

  function getSelectedContainer() {
    const canvas = options.canvasRef.value
    if (!canvas || options.getProps().readonly) return null
    const objs = canvas.getActiveObjects()
    if (objs.length !== 1) return null
    const o = objs[0]!
    return isFabricContainerObject(o) ? o : null
  }

  function patchLayout(patch: Partial<FabricContainerLayout>) {
    const container = getSelectedContainer()
    const canvas = options.canvasRef.value
    if (!container || !canvas) return

    const next = setFabricContainerLayout(container, patch)
    applySnapshotToState({
      active: true,
      layout: next,
      clipContent: getFabricContainerClipContent(container),
    })
    applyFabricContainerLayout(container)
    container.setCoords()
    options.emit('object-modified', container)
    canvas.requestRenderAll()
    syncLayoutFromSelection()
  }

  function applyLayoutModeFromUi(value: unknown) {
    if (value !== 'free' && value !== 'stack' && value !== 'grid') return
    patchLayout({ mode: value })
  }

  function applyLayoutDirectionFromUi(value: unknown) {
    if (value !== 'horizontal' && value !== 'vertical') return
    patchLayout({ direction: value })
  }

  function applyLayoutGapFromUi(raw: number | string) {
    const n =
      typeof raw === 'number' ? Math.round(raw) : Math.round(parseFloat(String(raw)))
    if (raw === '' || raw === '-' || !Number.isFinite(n)) return
    patchLayout({ gap: Math.max(0, n) })
  }

  function applyLayoutPaddingFromUi(raw: number | string) {
    const n =
      typeof raw === 'number' ? Math.round(raw) : Math.round(parseFloat(String(raw)))
    if (raw === '' || raw === '-' || !Number.isFinite(n)) return
    patchLayout({ padding: Math.max(0, n) })
  }

  function applyLayoutAlignFromUi(value: unknown) {
    if (value !== 'start' && value !== 'center' && value !== 'end' && value !== 'stretch') {
      return
    }
    patchLayout({ align: value })
  }

  function applyLayoutJustifyFromUi(value: unknown) {
    if (
      value !== 'start' &&
      value !== 'center' &&
      value !== 'end' &&
      value !== 'space-between'
    ) {
      return
    }
    patchLayout({ justify: value })
  }

  function applyLayoutColumnsFromUi(raw: number | string) {
    const n =
      typeof raw === 'number' ? Math.round(raw) : parseInt(String(raw), 10)
    if (raw === '' || raw === '-' || !Number.isFinite(n)) return
    patchLayout({ columns: Math.max(1, n) })
  }

  function applyLayoutClipContentFromUi(checked: boolean) {
    const container = getSelectedContainer()
    const canvas = options.canvasRef.value
    if (!container || !canvas) return
    setFabricContainerClipContent(container, checked)
    layoutClipContent.value = checked
    options.emit('object-modified', container)
    canvas.requestRenderAll()
    syncLayoutFromSelection()
  }

  return {
    layoutSelectionActive,
    layoutMode,
    layoutDirection,
    layoutGap,
    layoutPadding,
    layoutAlign,
    layoutJustify,
    layoutColumns,
    layoutClipContent,
    syncLayoutFromSelection,
    applyLayoutModeFromUi,
    applyLayoutDirectionFromUi,
    applyLayoutGapFromUi,
    applyLayoutPaddingFromUi,
    applyLayoutAlignFromUi,
    applyLayoutJustifyFromUi,
    applyLayoutColumnsFromUi,
    applyLayoutClipContentFromUi,
  }
}
