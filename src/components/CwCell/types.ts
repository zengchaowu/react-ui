import type { MouseEvent, MouseEventHandler, ReactNode } from 'react'
import type { CwIconEmbed } from '../CwIcon/types'
import type { CwDividerTexts } from '../CwDivider/types'

export interface CwCellTexts {
  /** 内嵌 {@link CwDivider} */
  dividerTexts?: Partial<CwDividerTexts>
}

/**
 * 外观变体：
 * - `default`：通用列表行
 * - `compact-row`：设置页紧凑行（卡片组内）
 * - `fullWidth`：通栏列表行（略矮于 default）
 * - `hero`：顶区资料行（更大内边距）
 * - `inset-group`：组内嵌底 + 内缩分割线
 * - `sheet`：底部 Sheet 列表行
 * - `compact`：下载行等更矮行
 * - `form`：标签左 / 值右的表单行
 */
export type CwCellAppearance =
  | 'default'
  | 'compact-row'
  | 'fullWidth'
  | 'hero'
  | 'inset-group'
  | 'sheet'
  | 'compact'
  | 'form'

export interface CwCellProps {
  title?: string
  subtitle?: string
  showArrow?: boolean
  showUnderline?: boolean
  /**
   * 下划线对齐方式
   * - 'full': 整个宽度
   * - 'indent': 与标题左对齐
   */
  underlineAlign?: 'full' | 'indent'
  clickable?: boolean
  /** `rightSlot`：`cell` 与整行垂直居中；`title` 与标题同行 */
  rightPlacement?: 'cell' | 'title'
  /** 场景外观；布局用原生 class */
  appearance?: CwCellAppearance
  texts?: Partial<CwCellTexts>
  /** Vue `#content` 插槽 */
  contentSlot?: ReactNode
  /** Vue `#title` 插槽 */
  titleSlot?: ReactNode
  /** Vue `#title-right` 插槽 */
  titleRightSlot?: ReactNode
  /** Vue `#right` 插槽 */
  rightSlot?: ReactNode
  /** Vue `#subtitle` 插槽 */
  subtitleSlot?: ReactNode
  /** Vue `click` 事件 */
  onClick?: MouseEventHandler<HTMLDivElement>
}

/** 内部结构 class 槽位 */
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
  onClick?: (event: MouseEvent<HTMLDivElement>) => void
}

/**
 * 组外观（同时默认注入同名 `cellAppearance`）：
 * - `default`：仅裁剪 + 隐藏末行分割线
 * - `settings`：圆角卡片 + 左右边距
 * - `fullWidth`：通栏底色块
 * - `conversationManage`：会话设置底色块
 * - `sheet`：Sheet 内圆角列表
 */
export type CwCellGroupAppearance =
  | 'default'
  | 'compact-row'
  | 'fullWidth'
  | 'inset-group'
  | 'sheet'

export interface CwCellGroupProps {
  /** 场景外观；布局用原生 class */
  appearance?: CwCellGroupAppearance
  /**
   * 注入子 Cell 的外观；默认与 `appearance` 同名（`default` 组不注入）
   * 可用 `form` 等仅存在于 Cell 的变体
   */
  cellAppearance?: CwCellAppearance
  cellTexts?: Partial<CwCellTexts>
  underlineAlign?: 'full' | 'indent'
}

/** 内部结构类 */
export interface CwCellGroupStyles {
  root: string
}

export interface CwCellGroupEmits {
  // CwCellGroup本身不发出事件
}
