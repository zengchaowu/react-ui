import type { ReactNode, RefObject } from 'react'
import type {
  CwDynamicDialogConfig as CwDynamicDialogConfigBase,
  CwDynamicDialogTexts,
} from '@zengchaowu/ui-shared/components/CwDynamicDialog/types'

export interface CwDynamicDialogProps {
  texts?: Partial<CwDynamicDialogTexts>
  className?: string
  onClose?: (id: string) => void
}

export interface CwDynamicDialogEmits {
  close: (id: string) => void
}

export interface CwDynamicDialogInnerProps {
  id: string
  /** 命令式 API 传入；与 children 二选一 */
  component?: ReactNode
  config: CwDynamicDialogConfig
  visible: boolean
  texts?: Partial<CwDynamicDialogTexts>
  onClose?: (id: string) => void
  children?: ReactNode
  className?: string
}

export interface CwDynamicDialogInnerEmits {
  close: (id: string) => void
}

export interface DynamicDialogInstance {
  id: string
  component: ReactNode
  config: CwDynamicDialogConfig
  visible: boolean
}

export interface CwDynamicDialogMethods {
  show: (component: ReactNode, config?: CwDynamicDialogConfig) => string
  hideAll: () => void
  hide: (id: string) => void
}

export type CwDynamicDialogHandle = CwDynamicDialogMethods

export interface CwDynamicDialogInnerHandle {
  overlayRootRef: RefObject<HTMLDivElement | null>
}

export interface CwDynamicDialogLayerProps {
  visible?: boolean
  config?: CwDynamicDialogConfig
  texts?: Partial<CwDynamicDialogTexts>
  layerId?: string
  appendToBody?: boolean
  appendParent?: () => HTMLElement | null
  onClose?: () => void
  onVisibleChange?: (value: boolean) => void
  children?: ReactNode
  className?: string
}

/** 动态弹窗配置：共享字段见 `CwDynamicDialogConfigBase`，此处补充框架专属的 `header` / `dragHandleRef` */
export interface CwDynamicDialogConfig extends CwDynamicDialogConfigBase {
  /** 标题栏内容 */
  header?: ReactNode
  /**
   * 自定义拖拽把手（须绑定到可拖动区域的 DOM）。
   * 不传且存在 header 时使用内置标题栏；无 header 时退回整块 content。
   */
  dragHandleRef?: RefObject<HTMLElement | null>
}
