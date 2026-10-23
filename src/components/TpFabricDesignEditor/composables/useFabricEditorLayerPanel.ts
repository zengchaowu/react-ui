import { nextTick, type ReactiveRef } from './reactivity'
import type { Canvas } from 'fabric'
import type { CwTreeNode } from '../../CwTree/types'
import { useFabricLayerTree } from './useFabricLayerTree'
import type { FabricEditorInspectorState } from './useFabricEditorInspectorState'

export function useFabricEditorLayerPanel(options: {
  canvasRef: ReactiveRef<Canvas | undefined>
  getShowLayersPanel: () => boolean
  getReadonly: () => boolean
  inspector: Pick<
    FabricEditorInspectorState,
    'syncInspectorFromSelection'
  >
  openLayerContextMenu?: (e: MouseEvent) => void
}) {
  const {
    layerTreeData,
    layerSelectedKeys,
    refreshLayers,
    syncLayerTreeSelectionFromCanvas,
    onLayerTreeSelectedKeysUpdate: handleLayerTreeSelectedKeysUpdate,
    moveLayerByTreeReorder,
    renameLayerByKey,
    toggleLayerVisibleByKey,
    toggleLayerLockedByKey,
    clearLayerState,
  } = useFabricLayerTree({
    canvasRef: options.canvasRef,
    getShowLayersPanel: options.getShowLayersPanel,
    getReadonly: options.getReadonly,
  })

  function onLayerRename(key: string | number, name: string) {
    renameLayerByKey(key, name)
  }

  function onLayerToggleVisible(key: string | number) {
    toggleLayerVisibleByKey(key)
    options.inspector.syncInspectorFromSelection()
  }

  function onLayerToggleLocked(key: string | number) {
    toggleLayerLockedByKey(key)
    options.inspector.syncInspectorFromSelection()
  }

  function onLayerTreeSelectedKeysUpdate(keys: (string | number)[]) {
    handleLayerTreeSelectedKeysUpdate(keys)
    options.inspector.syncInspectorFromSelection()
  }

  async function onLayerContextMenu(_node: CwTreeNode, event: MouseEvent) {
    if (options.getReadonly()) return
    // 右键可能先触发选中同步，等画布选区更新后再判定分组可用性
    await nextTick()
    options.openLayerContextMenu?.(event)
  }

  return {
    layerTreeData,
    layerSelectedKeys,
    refreshLayers,
    syncLayerTreeSelectionFromCanvas,
    moveLayerByTreeReorder,
    clearLayerState,
    onLayerRename,
    onLayerToggleVisible,
    onLayerToggleLocked,
    onLayerTreeSelectedKeysUpdate,
    onLayerContextMenu,
  }
}
