import type { CwIconEmbed } from '../CwIcon/types'
import type { CwDividerTexts } from '../CwDivider/types'
export interface CwCellTexts {
  /** 内嵌 {@link CwDivider} */
  dividerTexts?: Partial<CwDividerTexts>
}

/**
 * 外观变体：
 * - `default`：通用列表行
 * - `settings`：设置页紧凑行（卡片组内）
 * - `fullWidth`：通栏列表行（略矮于 default）
 * - `profile`：我的页顶区资料行（更大内边距）
 * - `conversationManage`：会话设置（对端气泡底 + 列表分割线）
 * - `sheet`：底部 Sheet 列表行
 * - `compact`：下载行等更矮行
 * - `form`：标签左 / 值右的表单行
 */
export type CwCellAppearance =
  | 'default'
  | 'settings'
  | 'fullWidth'
  | 'profile'
  | 'conversationManage'
  | 'sheet'
  | 'compact'
  | 'form'

export interface CwCellProps {
  title?: string
  subtitle?: string
  showArrow?: boolean
  showUnderline?: boolean
  underlineAlign?: 'full' | 'indent'
  clickable?: boolean
  rightPlacement?: 'cell' | 'title'
  appearance?: CwCellAppearance
  texts?: Partial<CwCellTexts>
}

export interface CwCellStyles {
  root: string
  clickable: string
  content: string
  titleRow: string
  titleMain: string
  titleRightSlot: string
  title: string
  subtitle: string
  rightSlot: string
  arrowIconStyles?: CwIconEmbed
  /** 内嵌 {@link CwDivider} 根节点 class（定位 + 线条） */
  dividerRoot?: string
}

export interface CwCellEmits {
  (e: 'click', event: MouseEvent): void
}

export type CwCellGroupAppearance =
  | 'default'
  | 'settings'
  | 'fullWidth'
  | 'conversationManage'
  | 'sheet'

export interface CwCellGroupProps {
  appearance?: CwCellGroupAppearance
  cellAppearance?: CwCellAppearance
  cellTexts?: Partial<CwCellTexts>
  underlineAlign?: 'full' | 'indent'
}

export interface CwCellGroupStyles {
  root: string
}

export interface CwCellGroupEmits {}
