import type { ReactNode } from 'react'

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

export interface CwDesignInspectorSectionTogglePayload {
  id: string
  expanded: boolean
}

export interface CwDesignInspectorProps {
  sections?: CwDesignInspectorSectionConfig[]
  texts?: Partial<CwDesignInspectorTexts>
  /** 等价 Vue 具名插槽 `header-actions` */
  headerActions?: ReactNode
  /**
   * 等价 Vue 动态具名插槽 `section-{id}`（以 section.id 为 key）；
   * 传函数时以 section 配置为参数渲染。
   */
  sectionSlots?: Record<
    string,
    ReactNode | ((section: CwDesignInspectorSectionConfig) => ReactNode)
  >
  /** 等价 Vue `@section-toggle` */
  onSectionToggle?: (payload: CwDesignInspectorSectionTogglePayload) => void
  /** 额外 class，合并到根节点（Vue 为透传 attrs.class） */
  className?: string
}
