import type {
  PointerEvent as ReactPointerEvent,
  ReactNode,
} from 'react'

/**
 * 窗口顶栏组件（支持 macOS / Windows 风格）
 */
export type WindowTitleBarMode = 'mac' | 'windows'

export type CwWindowTitleBarAppearance = 'default' | 'fixed-height' | 'flex-fill'

/** 顶栏背景：container 默认；secondarycontainer 与侧栏/左侧工作区一致 */
export type CwWindowTitleBarBackground = 'container' | 'secondarycontainer'

/** 居中标题字号：md 为 14px；sm 为 caption（12px） */
export type CwWindowTitleBarTitleSize = 'md' | 'sm'

export interface CwWindowTitleBarTexts {
  /** macOS 关闭按钮无障碍标签 */
  closeMacLabel: string
  /** macOS 最小化按钮无障碍标签 */
  minimizeMacLabel: string
  /** macOS 最大化按钮无障碍标签 */
  maximizeMacLabel: string
  /** Windows 关闭按钮无障碍标签 */
  closeWinLabel: string
  /** Windows 最小化按钮无障碍标签 */
  minimizeWinLabel: string
  /** Windows 最大化按钮无障碍标签 */
  maximizeWinLabel: string
  /** Windows 还原按钮无障碍标签（已最大化时） */
  restoreWinLabel: string
}

export interface CwWindowTitleBarProps {
  /** 操作系统风格：mac | windows */
  mode?: WindowTitleBarMode
  /** 窗口标题文字 */
  title?: string
  /** 是否显示标题文字 */
  showTitle?: boolean
  /** 是否可关闭 */
  closable?: boolean
  /** 是否可最小化 */
  minimizable?: boolean
  /** 是否可最大化 */
  maximizable?: boolean
  /** 窗口是否已最大化（影响 Windows 的图标显示与拖拽 cursor） */
  maximized?: boolean
  /** 官方外观 */
  appearance?: CwWindowTitleBarAppearance
  /** 顶栏背景色 token */
  background?: CwWindowTitleBarBackground
  /** 居中标题字号 */
  titleSize?: CwWindowTitleBarTitleSize
  /** 自定义文案 */
  texts?: Partial<CwWindowTitleBarTexts>
  /** Vue `#start` 插槽 */
  startSlot?: ReactNode
  /** Vue `#end` 插槽 */
  endSlot?: ReactNode
  /** 点击关闭（Vue `close`） */
  onClose?: () => void
  /** 点击最小化（Vue `minimize`） */
  onMinimize?: () => void
  /** 点击最大化（Vue `maximize`） */
  onMaximize?: () => void
  /** 双击拖拽区（Vue `doubleclick`） */
  onDoubleClick?: () => void
  /** 拖拽区按下（Vue `dragPointerdown`） */
  onDragPointerDown?: (event: ReactPointerEvent<HTMLDivElement>) => void
}

export interface CwWindowTitleBarEmits {
  onClose?: () => void
  onMinimize?: () => void
  onMaximize?: () => void
  onDoubleClick?: () => void
  onDragPointerDown?: (event: ReactPointerEvent<HTMLDivElement>) => void
}
