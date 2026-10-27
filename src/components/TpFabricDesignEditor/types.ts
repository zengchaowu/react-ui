import type { Canvas, FabricObject } from 'fabric'
import type { ReactNode } from 'react'
import type { TpFabricDesignEditorProps } from '@zengchaowu/ui-shared/components/TpFabricDesignEditor/types'

export * from '@zengchaowu/ui-shared/components/TpFabricDesignEditor/types'

/**
 * React 版组件 Props：Vue `defineEmits` → `onXxx` 回调；具名插槽 → `xxxSlot`。
 */
export interface TpFabricDesignEditorComponentProps
  extends TpFabricDesignEditorProps {
  /** 等价 Vue 具名插槽 `shell-header` */
  shellHeaderSlot?: ReactNode
  /** 等价 Vue 具名插槽 `tool-rail-leading` */
  toolRailLeadingSlot?: ReactNode
  /** 等价 Vue 具名插槽 `inspector-icon-meta` */
  inspectorIconMetaSlot?: ReactNode
  /** 等价 Vue `ready` */
  onReady?: (canvas: Canvas) => void
  /** 等价 Vue `error` */
  onError?: (error: Error) => void
  /** 等价 Vue `design-ai-applied` */
  onDesignAiApplied?: () => void
  /** 等价 Vue `export-svg` */
  onExportSvg?: (svg: string) => void
  /** 等价 Vue `export-svg-selection` */
  onExportSvgSelection?: (svg: string) => void
  /** 等价 Vue `object-added` */
  onObjectAdded?: (object: FabricObject) => void
  /** 等价 Vue `object-removed` */
  onObjectRemoved?: (object: FabricObject) => void
  /** 等价 Vue `object-modified` */
  onObjectModified?: (object: FabricObject) => void
}
