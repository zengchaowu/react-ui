import type { ComponentType, ReactNode, MutableRefObject, RefObject } from 'react'
export type CwDynamicSheetDirection = 'top' | 'bottom' | 'left' | 'right'

export interface CwDynamicSheetConfig {
  header?: ReactNode
  footer?: ReactNode
  direction?: CwDynamicSheetDirection
  closeOnClickOutside?: boolean
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
}

export interface CwDynamicSheetProps {
  styles?: Partial<CwDynamicSheetInnerStyles>
  texts?: Partial<CwDynamicSheetInnerTexts>
}

export interface CwDynamicSheetEmits {
  close: [id: string]
}

export interface CwDynamicSheetInnerProps {
  id: string
  component: ReactNode
  config: CwDynamicSheetConfig
  visible: boolean
  styles?: Partial<CwDynamicSheetInnerStyles>
  texts?: Partial<CwDynamicSheetInnerTexts>
}

export interface CwDynamicSheetInnerStyles {
  overlay: string
  overlayBottom: string
  overlayTop: string
  overlayLeft: string
  overlayRight: string
  backdrop: string
  backdropDefault: string
  content: string
  contentBottom: string
  contentTop: string
  contentLeft: string
  contentRight: string
  header: string
  closeButton: string
  closeButtonNormal: string
  closeButtonHover: string
  closeButtonFocused: string
  closeIcon: string
  /** 传入时完全覆盖 bodyWithHeader / bodyWithoutHeader（如右侧设置面板 p-0） */
  body?: string
  bodyWithHeader: string
  bodyWithoutHeader: string
  bodyAboveFooter: string
  footer: string
  dragHandleContainer: string
  dragHandle: string
}

export interface CwDynamicSheetInnerTexts {
  closeText: string
}

export interface CwDynamicSheetInnerEmits {
  close: [id: string]
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

