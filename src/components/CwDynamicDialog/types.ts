import type { ReactNode, RefObject } from 'react'

export type CwDynamicDialogVariant = 'modal' | 'fullscreen' | 'toast' | 'hud'

export type CwDynamicDialogToastPosition = 'top' | 'middle' | 'bottom'

/** modal 垂直对齐：center 居中；upper 略靠上（如搜索面板） */
export type CwDynamicDialogModalAlign = 'center' | 'upper'

export interface CwDynamicDialogConfig {
  /** 浮层形态，默认 modal */
  variant?: CwDynamicDialogVariant
  /** toast variant 时的垂直位置 */
  toastPosition?: CwDynamicDialogToastPosition
  /** modal 垂直对齐，默认 center */
  modalAlign?: CwDynamicDialogModalAlign
  /** hud variant 是否显示遮罩，默认 true */
  hudMask?: boolean
  /** hud variant 点击遮罩是否关闭 */
  hudMaskClosable?: boolean
  /** 是否注册 Dismiss 栈；toast/hud 默认 false，其余默认 true */
  dismissStack?: boolean
  /** 关闭淡出时长（ms），默认 300；需与 overlay/backdrop 的 transition 一致 */
  leaveDurationMs?: number
  background?: {
    class?: string
  }
  content?: {
    class?: string
  }
  /** 追加到主内容区 body 壳的 class（与 bodyPadding / bodyScroll 合并） */
  body?: {
    class?: string
  }
  header?: ReactNode
  /**
   * 是否显示右上角关闭钮。
   * 未传时：有 `header` 则显示，无 `header` 则不显示。
   * 设为 `true` 可在无标题栏时仅保留关闭钮（浮于内容区右上）。
   */
  showCloseButton?: boolean
  /** 为 true 时仅移动弹窗，默认在「标题栏 ref」上按下拖动；不传 dragHandleRef 时使用内置 header 区域 */
  draggable?: boolean
  /**
   * 自定义拖拽把手（须绑定到可拖动区域的 DOM）。
   * 不传且存在 header 时使用内置标题栏；无 header 时退回整块 content。
   */
  dragHandleRef?: RefObject<HTMLElement | null>
  closeOnClickOutside?: boolean
  /**
   * 打开后是否自动聚焦内容区内第一个输入控件（input / textarea / contenteditable）并选中其内容。
   * 默认 false；新建、重命名等以输入为主的弹窗建议开启。
   */
  autofocus?: boolean
  safeAreaInsetBottom?: boolean
  /**
   * 是否为主内容区施加默认内边距（水平 px-4；有 header 时 pt-2 pb-4，无 header 时 py-4）。
   * 默认 true；设为 false 时由内容组件自行管理留白。
   */
  bodyPadding?: boolean
  /**
   * 为 false 时 body 使用 plain div + overflow-hidden，不由 CwDiv 承担滚动（适合内部已有滚动区的面板）。
   * 默认 true。
   */
  bodyScroll?: boolean
  /**
   * modal 内容区入场：`default` 透明度+缩放；`fade` 仅透明度（深色全屏内容弹窗可避免白底缩放闪一下）。
   */
  contentTransition?: 'default' | 'fade'
}

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

export interface CwDynamicDialogStyles {
  overlay: string
  /** modal 垂直居中（默认） */
  overlayAlignCenter: string
  /** modal 略靠上 */
  overlayAlignUpper: string
  overlayVisible: string
  overlayHidden: string
  overlayFullscreen: string
  overlayToast: string
  overlayToastTop: string
  overlayToastMiddle: string
  overlayToastBottom: string
  overlayHud: string
  backdrop: string
  backdropDefault: string
  backdropVisible: string
  backdropHidden: string
  backdropHiddenVariant: string
  content: string
  contentFullscreen: string
  contentToast: string
  contentHud: string
  contentHudNoMask: string
  contentVisible: string
  contentHidden: string
  contentDraggable: string
  header: string
  headerDraggable: string
  /** 无 header、仅关闭钮时叠在内容区右上 */
  closeButtonStandalone: string
  closeButton: string
  closeButtonNormal: string
  closeButtonHover: string
  closeButtonFocused: string
  closeIcon: string
  body: string
}

export interface CwDynamicDialogTexts {
  closeText: string
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
