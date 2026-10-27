import type { ReactNode } from 'react'
import type { CwDynamicSheetDirection, CwDynamicSheetContentShell, CwDynamicSheetInnerTexts } from '@zengchaowu/ui-shared/components/CwDynamicSheet/types'

export interface CwDynamicSheetConfig {
  header?: ReactNode
  footer?: ReactNode
  direction?: CwDynamicSheetDirection
  closeOnClickOutside?: boolean
  /**
   * 打开后是否自动聚焦内容区内第一个输入控件（input / textarea / contenteditable）并选中其内容。
   * 默认 false；新建、重命名等以输入为主的弹窗建议开启。
   */
  autofocus?: boolean
  /** 是否允许按 Esc 关闭。默认 true；全屏编辑器等易误触场景设为 false。 */
  closeOnEsc?: boolean
  /** 是否启用安全区域适配，支持所有方向。默认所有方向都启用 */
  safeAreaInset?: boolean | {
    top?: boolean
    bottom?: boolean
    left?: boolean
    right?: boolean
  }
  /**
   * 是否为主内容区施加默认内边距（水平 px-4；纵向按 header/footer 场景叠加）。
   * 默认 true；设为 false 时由内容组件自行管理留白。
   */
  bodyPadding?: boolean
  /**
   * 是否允许拖拽跟手关闭。
   * 默认 bottom 方向为 true，其余方向为 false。
   */
  dragToClose?: boolean
  /**
   * 是否显示顶部拖拽指示条。
   * 默认 false；设为 true 且 dragToClose 可用时在 bottom Sheet 顶部展示。
   */
  showDragHandle?: boolean
  /**
   * 是否允许 body 区域滚动。默认 true。
   * 全屏编辑器等场景设为 false，body 使用 flex 填满且 overflow hidden。
   */
  bodyScroll?: boolean
  /** 预设内容区壳（覆盖方向默认 max-h 等） */
  contentShell?: CwDynamicSheetContentShell
  background?: {
    class?: string
  }
  content?: {
    class?: string
  }
  body?: {
    class?: string
  }
  /** 底部栏容器追加 class（config.footer 为 ReactNode 时） */
  footerBar?: {
    class?: string
  }
}

export interface CwDynamicSheetProps {
  texts?: Partial<CwDynamicSheetInnerTexts>
  className?: string
  onClose?: (id: string) => void
}

export interface CwDynamicSheetEmits {
  close: (id: string) => void
}

export interface CwDynamicSheetInnerProps {
  id: string
  component: ReactNode
  config: CwDynamicSheetConfig
  visible: boolean
  texts?: Partial<CwDynamicSheetInnerTexts>
  onClose?: (id: string) => void
  className?: string
}

export interface CwDynamicSheetInnerEmits {
  close: (id: string) => void
}

export interface SheetInstance {
  id: string
  component: ReactNode
  config: CwDynamicSheetConfig
  visible: boolean
}

export interface CwDynamicSheetMethods {
  show: (component: ReactNode, config?: CwDynamicSheetConfig) => string
  hideAll: () => void
  hide: (id: string) => void
}

export type CwDynamicSheetHandle = CwDynamicSheetMethods
