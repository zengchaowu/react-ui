import { useReactiveComputed, useReactiveRef, useStableBox, type ReactiveRef } from './reactivity'
import type { Canvas } from 'fabric'
import { ActiveSelection, Group } from 'fabric'
import { showCwContextMenu } from '../../CwContextMenu/showCwContextMenu'
import type { CwContextMenuItem } from '../../CwContextMenu/types'
import type { TpFabricDesignEditorProps } from '../types'

export function useFabricDesignEditorContextMenu(options: {
  canvasRef: ReactiveRef<Canvas | undefined>
  getProps: () => Pick<TpFabricDesignEditorProps, 'readonly'>
  onSelect: (key: string) => void
}) {
  const menuState = useStableBox(() => ({
    canvasContextMenuHandler: null as ((e: MouseEvent) => void) | null,
    activeContextMenuClose: null as (() => void) | null,
  }))

  const fabricMenuRev = useReactiveRef(0)

  function bumpFabricMenuRev() {
    fabricMenuRev.value++
  }

  const canvasContextMenuItems = useReactiveComputed<CwContextMenuItem[]>(() => {
    void fabricMenuRev.value
    if (options.getProps().readonly) return []
    const canvas = options.canvasRef.value
    if (!canvas) return []

    const active = canvas.getActiveObject()
    const objs = canvas.getActiveObjects()
    const n = objs.length
    const hasSel = n > 0
    const canGroup =
      active instanceof ActiveSelection && active.getObjects().length >= 2
    const canUngroup =
      active instanceof Group && !(active instanceof ActiveSelection)

    const list: CwContextMenuItem[] = []
    if (hasSel) {
      list.push({
        key: 'delete',
        label: n > 1 ? `删除选中（${n} 项）` : '删除选中',
        danger: true,
      })
      list.push({
        key: 'export-selection',
        label: n > 1 ? `导出选中为 SVG（${n} 项）` : '导出选中为 SVG',
      })
      if (canGroup && active instanceof ActiveSelection) {
        const m = active.getObjects().length
        list.push({
          key: 'group',
          label: `分组（${m} 项）`,
        })
      }
      if (hasSel) {
        list.push({
          key: 'frame-selection',
          label: n > 1 ? `创建为容器（${n} 项）` : '创建为容器',
        })
      }
      if (canUngroup) list.push({ key: 'ungroup', label: '取消分组' })
      list.push({ key: 'create-component', label: '创建为组件' })
      const last = list[list.length - 1]
      if (last) {
        list[list.length - 1] = { ...last, dividerAfter: true }
      }
    }
    list.push({ key: 'export-canvas', label: '导出整画布为 SVG' })
    list.push({ key: 'clear', label: '清空画布', danger: true })
    return list
  })

  function bindCanvasContextMenu(canvas: Canvas) {
    unbindCanvasContextMenu()
    menuState.value.canvasContextMenuHandler = (e: MouseEvent) => {
      if (options.getProps().readonly) return
      e.preventDefault()
      e.stopPropagation()
      bumpFabricMenuRev()
      const items = canvasContextMenuItems.value
      if (items.length === 0) return
      menuState.value.activeContextMenuClose?.()
      const { close } = showCwContextMenu({
        x: e.clientX,
        y: e.clientY,
        items,
        onSelect: (key) => options.onSelect(key),
        onClose: () => {
          menuState.value.activeContextMenuClose = null
        },
      })
      menuState.value.activeContextMenuClose = close
    }
    canvas.upperCanvasEl.addEventListener('contextmenu', menuState.value.canvasContextMenuHandler)
  }

  function unbindCanvasContextMenu() {
    menuState.value.activeContextMenuClose?.()
    menuState.value.activeContextMenuClose = null
    const c = options.canvasRef.value
    if (c && menuState.value.canvasContextMenuHandler) {
      c.upperCanvasEl.removeEventListener('contextmenu', menuState.value.canvasContextMenuHandler)
    }
    menuState.value.canvasContextMenuHandler = null
  }

  /** 图层树右键：分组 / 取消分组（从顶部工具栏迁出） */
  function openLayerContextMenu(e: MouseEvent) {
    if (options.getProps().readonly) return
    bumpFabricMenuRev()
    const canvas = options.canvasRef.value
    if (!canvas) return

    const active = canvas.getActiveObject()
    const canGroup =
      active instanceof ActiveSelection && active.getObjects().length >= 2
    const canUngroup =
      active instanceof Group && !(active instanceof ActiveSelection)

    const items: CwContextMenuItem[] = []
    if (canGroup && active instanceof ActiveSelection) {
      items.push({
        key: 'group',
        label: `分组（${active.getObjects().length} 项）`,
      })
    }
    if (canUngroup) {
      items.push({ key: 'ungroup', label: '取消分组' })
    }
    if (items.length === 0) return

    menuState.value.activeContextMenuClose?.()
    const { close } = showCwContextMenu({
      x: e.clientX,
      y: e.clientY,
      items,
      onSelect: (key) => options.onSelect(key),
      onClose: () => {
        menuState.value.activeContextMenuClose = null
      },
    })
    menuState.value.activeContextMenuClose = close
  }

  return {
    fabricMenuRev,
    bumpFabricMenuRev,
    canvasContextMenuItems,
    bindCanvasContextMenu,
    unbindCanvasContextMenu,
    openLayerContextMenu,
  }
}
