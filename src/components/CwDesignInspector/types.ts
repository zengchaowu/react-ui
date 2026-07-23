export interface CwDesignInspectorSectionConfig {
  id: string
  label: string
  visible?: boolean
  defaultExpanded?: boolean
}

export interface CwDesignInspectorStyles {
  root: string
  header: string
  headerTitle: string
  body: string
  section: string
  sectionHeader: string
  sectionHeaderActive: string
  sectionLabel: string
  sectionChevron: string
  sectionBody: string
  empty: string
}

export interface CwDesignInspectorTexts {
  title: string
  empty: string
}

export interface CwDesignInspectorProps {
  sections?: CwDesignInspectorSectionConfig[]
  styles?: Partial<CwDesignInspectorStyles>
  texts?: Partial<CwDesignInspectorTexts>
}

export interface CwDesignInspectorEmits {
  'section-toggle': [payload: { id: string; expanded: boolean }]
}
