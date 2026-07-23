/**
 * 窗口顶栏组件（支持 macOS / Windows 风格）
 */
export type WindowTitleBarMode = 'mac' | 'windows'

export type CwWindowTitleBarAppearance = 'default' | 'launcher' | 'folder'

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
  /** 自定义文案 */
  texts?: Partial<CwWindowTitleBarTexts>
}

export interface CwWindowTitleBarEmits {
  (e: 'close'): void
  (e: 'minimize'): void
  (e: 'maximize'): void
  (e: 'doubleclick'): void
}
