import type { CwDesignInspectorSectionConfig } from '../../CwDesignInspector/types'

export const defaultTpFabricInspectorSections: CwDesignInspectorSectionConfig[] = [
  { id: 'transform', label: '变换', defaultExpanded: true },
  { id: 'layout', label: '布局', defaultExpanded: true },
  { id: 'appearance', label: '外观', defaultExpanded: true },
]
