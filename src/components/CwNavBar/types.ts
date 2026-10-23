export type CwNavBarSize = 'compact' | 'comfortable'

/** 标题在栏内布局：flow 为三列流式；absolute 为左右操作 + 标题视口居中叠层 */
export type CwNavBarTitleAlign = 'flow' | 'absolute'

/**
 * 外观变体：
 * - `default`：通用顶栏
 * - `chat`：IM / 会话顶栏（标题与图标 primary，栏内更紧）
 * - `shell`：云盘 / 文档等壳层窄顶栏
 */
export type CwNavBarAppearance = 'default' | 'emphasized' | 'full-width'

export interface CwNavBarProps {
  /** 居中标题文案（可用 #title 插槽覆盖） */
  title?: string
  titleAlign?: CwNavBarTitleAlign
  size?: CwNavBarSize
  /** 底部分割线 */
  bordered?: boolean
  /** 场景外观 */
  appearance?: CwNavBarAppearance
  /** 附加到内行的布局 class（如 `px-2`） */
  innerClass?: string
  texts?: Partial<CwNavBarTexts>
}

/** 内部结构 class 槽位 */
export interface CwNavBarStyles {
  root: string
  bordered: string
  inner: string
  innerCompact: string
  innerComfortable: string
  titleOverlay: string
  left: string
  center: string
  right: string
  title: string
  iconButton: string
  textButton: string
}

export interface CwNavBarTexts {
  ariaLabel: string
}
