import { useReactiveComputed } from './reactivity'
import type { CwDesignToolRailItemConfig } from '../../CwDesignToolRail/types'
import { parseFabricContainerPresetKey } from '@zengchaowu/ui-shared/components/TpFabricDesignEditor/tools/fabricContainerPresets.pure'
import { defaultTpFabricToolRailGroups } from '@zengchaowu/ui-shared/components/TpFabricDesignEditor/config/defaultToolRail'
import type { TpFabricDesignEditorImportMode, TpFabricDesignEditorTool } from '../types'

export function useFabricToolRail(options: {
  getHiddenKeys: () => readonly string[] | undefined
  setTool: (tool: TpFabricDesignEditorTool) => void
  setContainerPreset: (presetId: string) => void
  openFilePicker: (mode: TpFabricDesignEditorImportMode) => void
  groupSelection: () => void
  frameSelection: () => void
  ungroupSelection: () => void
  exportSvgToFile: () => void
  exportSelectedSvgToFile: () => void
  deleteSelection: () => void
  clearCanvas: () => void
}) {
  const toolRailGroups = useReactiveComputed(() => {
    const hidden = new Set(options.getHiddenKeys() ?? [])
    if (!hidden.size) return defaultTpFabricToolRailGroups
    return defaultTpFabricToolRailGroups
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => !hidden.has(item.key)),
      }))
      .filter((group) => group.items.length > 0)
  })

  function onToolRailItemClick(item: CwDesignToolRailItemConfig) {
    if (item.disabled) return
    switch (item.key) {
      case 'select':
      case 'pen':
      case 'draw':
      case 'text':
      case 'rect':
      case 'circle':
      case 'triangle':
      case 'frame':
        options.setTool(item.key as TpFabricDesignEditorTool)
        break
      case 'insert-image':
      case 'import-append':
        options.openFilePicker('append')
        break
      case 'group':
        options.groupSelection()
        break
      case 'frame-selection':
        options.frameSelection()
        break
      case 'ungroup':
        options.ungroupSelection()
        break
      case 'import-replace':
        options.openFilePicker('replace')
        break
      case 'export-canvas':
        options.exportSvgToFile()
        break
      case 'export-selection':
        options.exportSelectedSvgToFile()
        break
      case 'delete':
        options.deleteSelection()
        break
      case 'clear':
        options.clearCanvas()
        break
      default: {
        const presetId = parseFabricContainerPresetKey(item.key)
        if (presetId) {
          options.setContainerPreset(presetId)
        }
        break
      }
    }
  }

  return {
    toolRailGroups,
    onToolRailItemClick,
  }
}
