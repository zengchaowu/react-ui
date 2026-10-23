import { nextTick, useReactiveRef, useStableBox, type ReactiveRef } from './reactivity'
import { ActiveSelection, Group, type Canvas, type FabricObject } from 'fabric'
import type { CwTreeNode } from '../../CwTree/types'
import {
  activateFabricObjectsFromLayerTree,
  isFabricLayerLocked,
  layerDimensionsLabel,
  layerLabelForFabricObject,
  setFabricLayerDisplayName,
  setFabricLayerLocked,
  setFabricLayerVisible,
} from '../layers/fabricDesignEditorLayerTree.pure'
import { assignDefaultFabricLayerName } from '../layers/fabricLayerNaming.pure'
import { isFabricArtboardGuide } from '../document/fabricArtboard'
import { isFabricEditorPaintClone } from '../appearance/fabricEditorPaintLayers.pure'
import {
  ensureFabricContainerLayoutMeta,
  isFabricContainerFrame,
  isFabricContainerObject,
  stripFabricContainerLegacySizeLabels,
} from '../tools/fabricContainerTool.pure'
import {
  reorderFabricLayerTreeSiblings,
  type LayerTreeReorderPosition,
} from '../layers/fabricLayerTreeReorder.pure'
import { fabricObjectLayerThumbnailUrl } from '../layers/fabricLayerThumbnail.pure'
import { syncGroupsInteractionFromCanvasSelection } from '../layers/fabricGroupPointerPolicy.pure'

function isFabricTransforming(canvas: Canvas): boolean {
  return Boolean(
    (canvas as unknown as { _currentTransform?: unknown })._currentTransform,
  )
}

export function useFabricLayerTree(options: {
  canvasRef: ReactiveRef<Canvas | undefined>
  getShowLayersPanel: () => boolean
  getReadonly: () => boolean
}) {
  const state = useStableBox(() => ({
    layerKeyByFabric: new WeakMap<FabricObject, string>(),
    fabricByLayerKey: new Map<string, FabricObject>(),
    layerKeySeq: 0,
    syncingLayerSelectionFromCanvas: false,
  }))
  const layerKeyByFabric = state.value.layerKeyByFabric
  const fabricByLayerKey = state.value.fabricByLayerKey

  const layerTreeData = useReactiveRef<CwTreeNode[]>([])
  const layerSelectedKeys = useReactiveRef<(string | number)[]>([])

  function ensureLayerKey(o: FabricObject): string {
    let k = layerKeyByFabric.get(o)
    if (!k) {
      k = `ly_${++state.value.layerKeySeq}`
      layerKeyByFabric.set(o, k)
    }
    return k
  }

  /**
   * 画布根对象 + 编组内子对象递归展开（列表顶部为最上层）。
   */
  function fabricObjectToTreeNode(o: FabricObject): CwTreeNode {
    const key = ensureLayerKey(o)
    fabricByLayerKey.set(key, o)
    const sizeLabel = layerDimensionsLabel(o)
    const node: CwTreeNode = {
      key,
      label: layerLabelForFabricObject(o),
      sizeLabel,
      layerVisible: o.visible !== false,
      layerLocked: isFabricLayerLocked(o),
      thumbnailUrl: fabricObjectLayerThumbnailUrl(o),
    }
    if (isFabricContainerObject(o)) {
      node.acceptDropInside = true
    }
    if (o instanceof Group && !(o instanceof ActiveSelection)) {
      const children = o
        .getObjects()
        .slice()
        .reverse()
        .filter((child) => !isFabricContainerFrame(child as FabricObject))
        .map((child) => fabricObjectToTreeNode(child as FabricObject))
      if (children.length > 0) {
        node.children = children
      }
    }
    return node
  }

  function resolveLayerTreeKeyForFabricObject(o: FabricObject): string | undefined {
    const direct = layerKeyByFabric.get(o)
    if (direct) return direct
    let cur: FabricObject | undefined = o
    while (cur) {
      const k = layerKeyByFabric.get(cur)
      if (k) return k
      cur = cur.group as FabricObject | undefined
    }
    return undefined
  }

  function refreshLayers() {
    const canvas = options.canvasRef.value
    if (!canvas || !options.getShowLayersPanel()) {
      fabricByLayerKey.clear()
      layerTreeData.value = []
      return
    }
    if (isFabricTransforming(canvas)) return

    fabricByLayerKey.clear()
    const roots = canvas
      .getObjects()
      .slice()
      .reverse()
      .filter((o) => !isFabricArtboardGuide(o) && !isFabricEditorPaintClone(o))
    for (const root of roots) {
      stripFabricContainerLegacySizeLabels(root)
      ensureFabricContainerLayoutMetaDeep(root)
    }
    layerTreeData.value = roots.map((o) => fabricObjectToTreeNode(o))
    syncLayerTreeSelectionFromCanvas()
  }

  function ensureFabricContainerLayoutMetaDeep(obj: FabricObject) {
    ensureFabricContainerLayoutMeta(obj)
    if (!(obj instanceof Group) || obj instanceof ActiveSelection) return
    for (const child of obj.getObjects() as FabricObject[]) {
      ensureFabricContainerLayoutMetaDeep(child)
    }
  }

  function syncLayerTreeSelectionFromCanvas() {
    const canvas = options.canvasRef.value
    if (!canvas || !options.getShowLayersPanel()) return

    const active = canvas.getActiveObject()
    let keys: (string | number)[] = []
    if (active instanceof ActiveSelection) {
      const seen = new Set<string>()
      for (const obj of active.getObjects()) {
        const k = resolveLayerTreeKeyForFabricObject(obj as FabricObject)
        if (k && !seen.has(k)) {
          seen.add(k)
          keys.push(k)
        }
      }
    } else if (active) {
      const k = resolveLayerTreeKeyForFabricObject(active as FabricObject)
      if (k) keys = [k]
    }

    const cur = layerSelectedKeys.value
    const same =
      keys.length === cur.length &&
      keys.every((k) => cur.includes(k)) &&
      cur.every((k) => keys.includes(k))
    if (same) return

    state.value.syncingLayerSelectionFromCanvas = true
    layerSelectedKeys.value = keys
    nextTick(() => {
      state.value.syncingLayerSelectionFromCanvas = false
    })
  }

  function onLayerTreeSelectedKeysUpdate(keys: (string | number)[]) {
    layerSelectedKeys.value = keys
    if (state.value.syncingLayerSelectionFromCanvas || options.getReadonly()) return

    const canvas = options.canvasRef.value
    if (!canvas) return

    if (keys.length === 0) {
      canvas.discardActiveObject()
      canvas.requestRenderAll()
      return
    }

    const objs = keys
      .map((key) => fabricByLayerKey.get(String(key)))
      .filter((obj): obj is FabricObject => obj != null)
    if (!objs.length) return

    activateFabricObjectsFromLayerTree(canvas, objs)
  }

  function renameLayerByKey(key: string | number, name: string): boolean {
    const canvas = options.canvasRef.value
    if (!canvas || options.getReadonly()) return false

    const obj = fabricByLayerKey.get(String(key))
    if (!obj) return false

    if (!name.trim()) {
      obj.set('name', '')
      assignDefaultFabricLayerName(canvas, obj)
    } else {
      setFabricLayerDisplayName(obj, name)
    }
    canvas.requestRenderAll()
    refreshLayers()
    return true
  }

  function toggleLayerVisibleByKey(key: string | number): boolean {
    const canvas = options.canvasRef.value
    if (!canvas || options.getReadonly()) return false

    const obj = fabricByLayerKey.get(String(key))
    if (!obj) return false

    const nextVisible = obj.visible === false
    setFabricLayerVisible(obj, nextVisible)
    if (!nextVisible) {
      const active = canvas.getActiveObject()
      if (active === obj) {
        canvas.discardActiveObject()
      } else if (active instanceof ActiveSelection) {
        const still = active.getObjects().filter((o) => o !== obj)
        canvas.discardActiveObject()
        if (still.length === 1) {
          canvas.setActiveObject(still[0]!)
        } else if (still.length > 1) {
          const sel = new ActiveSelection(still, { canvas })
          canvas.setActiveObject(sel)
        }
      }
    }
    canvas.requestRenderAll()
    refreshLayers()
    return true
  }

  function toggleLayerLockedByKey(key: string | number): boolean {
    const canvas = options.canvasRef.value
    if (!canvas || options.getReadonly()) return false

    const obj = fabricByLayerKey.get(String(key))
    if (!obj) return false

    setFabricLayerLocked(obj, !isFabricLayerLocked(obj))
    canvas.requestRenderAll()
    refreshLayers()
    return true
  }

  function moveLayerByTreeReorder(payload: {
    dragKey: string | number
    dropKey: string | number
    position: LayerTreeReorderPosition
  }) {
    const canvas = options.canvasRef.value
    if (!canvas || options.getReadonly()) return false

    const dragObj = fabricByLayerKey.get(String(payload.dragKey))
    const dropObj = fabricByLayerKey.get(String(payload.dropKey))
    if (!dragObj || !dropObj) return false

    const ok = reorderFabricLayerTreeSiblings(
      canvas,
      dragObj,
      dropObj,
      payload.position,
    )
    if (ok) {
      syncGroupsInteractionFromCanvasSelection(canvas)
      refreshLayers()
    }
    return ok
  }

  function clearLayerState() {
    fabricByLayerKey.clear()
    layerTreeData.value = []
    layerSelectedKeys.value = []
  }

  return {
    layerTreeData,
    layerSelectedKeys,
    refreshLayers,
    syncLayerTreeSelectionFromCanvas,
    onLayerTreeSelectedKeysUpdate,
    moveLayerByTreeReorder,
    renameLayerByKey,
    toggleLayerVisibleByKey,
    toggleLayerLockedByKey,
    clearLayerState,
  }
}
