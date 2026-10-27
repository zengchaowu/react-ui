import type { ReactNode } from 'react'
import type { CwDesignInspectorSectionConfig, CwDesignInspectorTexts } from '@zengchaowu/ui-shared/components/CwDesignInspector/types'

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

/** Vue 事件签名兼容导出（React 侧以同名 onXxx 回调使用） */
export interface CwDesignInspectorEmits {
  'section-toggle': [payload: { id: string; expanded: boolean }]
}
