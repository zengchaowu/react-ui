import { useReactiveRef } from './reactivity'
import {
  allocateFabricEditorComponentName,
  createFabricEditorComponentId,
  removeFabricEditorComponent,
  renameFabricEditorComponent,
  type FabricEditorComponent,
} from '@zengchaowu/ui-shared/components/TpFabricDesignEditor/document/fabricEditorPages.pure'

export function useFabricEditorComponents(options: {
  getReadonly: () => boolean
  getSelectionSvgString: () => string
  placeComponentSvg: (svg: string) => Promise<void>
}) {
  const components = useReactiveRef<FabricEditorComponent[]>([])

  function createFromSelection(preferredName?: string): boolean {
    if (options.getReadonly()) return false
    const svg = options.getSelectionSvgString().trim()
    if (!svg) return false
    const name = allocateFabricEditorComponentName(
      components.value,
      preferredName,
    )
    components.value = [
      {
        id: createFabricEditorComponentId(),
        name,
        svg,
      },
      ...components.value,
    ]
    return true
  }

  async function placeComponent(componentId: string) {
    if (options.getReadonly()) return
    const comp = components.value.find((c) => c.id === componentId)
    if (!comp?.svg.trim()) return
    await options.placeComponentSvg(comp.svg)
  }

  function renameComponent(componentId: string, name: string) {
    if (options.getReadonly()) return
    components.value = renameFabricEditorComponent(
      components.value,
      componentId,
      name,
    )
  }

  function deleteComponent(componentId: string) {
    if (options.getReadonly()) return
    components.value = removeFabricEditorComponent(
      components.value,
      componentId,
    )
  }

  return {
    components,
    createFromSelection,
    placeComponent,
    renameComponent,
    deleteComponent,
  }
}
