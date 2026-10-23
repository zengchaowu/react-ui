import { useReactiveComputed, type ReactiveRef } from './reactivity'
import { defaultTpFabricInspectorSections } from '../config/defaultInspectorSections'

export function useFabricInspectorSections(options: {
  hasIconMetaSlot: () => boolean
  transformSelectionActive: ReactiveRef<boolean>
  layoutSelectionActive: ReactiveRef<boolean>
  appearanceSelectionActive: ReactiveRef<boolean>
}) {
  const inspectorSections = useReactiveComputed(() => {
    const sections = [...defaultTpFabricInspectorSections]
    if (options.hasIconMetaSlot()) {
      sections.unshift({
        id: 'icon-meta',
        label: '图标信息',
        defaultExpanded: true,
      })
    }
    return sections.map((section) => ({
      ...section,
      visible:
        section.id === 'transform'
          ? options.transformSelectionActive.value
          : section.id === 'layout'
            ? options.layoutSelectionActive.value
            : section.id === 'appearance'
              ? options.appearanceSelectionActive.value
              : true,
    }))
  })

  return { inspectorSections }
}
