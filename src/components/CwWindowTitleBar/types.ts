import type {
  PointerEvent as ReactPointerEvent,
  ReactNode,
} from 'react'
import type { WindowTitleBarMode, CwWindowTitleBarAppearance, CwWindowTitleBarBackground, CwWindowTitleBarTitleSize, CwWindowTitleBarTexts } from '@zengchaowu/ui-shared/components/CwWindowTitleBar/types'

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
