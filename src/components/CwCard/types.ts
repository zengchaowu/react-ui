import type { HTMLAttributes, ReactNode } from 'react'

/** 卡片场景外观（表单壳 / 功能网格 / 文档首页区块等） */
export type CwCardAppearance = 'default' | 'form' | 'grid-cards' | 'section' | 'config'

export interface CwCardProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'className'> {
  /** header 是否可折叠 */
  collapsible?: boolean
  /** 折叠模式下默认是否展开 */
  defaultExpanded?: boolean
  /** 是否显示 header 底部分割线 */
  showHeaderDivider?: boolean
  /** 场景外观 */
  appearance?: CwCardAppearance
  /** 自定义文本 */
  texts?: Partial<CwCardTexts>
  /** Vue `#headerLeft` 插槽 */
  headerLeftSlot?: ReactNode
  /** Vue `#headerRight` 插槽 */
  headerRightSlot?: ReactNode
  /** Vue 默认插槽 */
  children?: ReactNode
  className?: string
  /** 展开状态变化（Vue `expand-change`） */
  onExpandChange?: (expanded: boolean) => void
}

/** @internal */
export interface CwCardStyles {
  root: string
  header: string
  headerDivider?: string
  headerClickable?: string
  headerLeft: string
  headerRight: string
  body: string
}

export interface CwCardTexts {
  expandAriaLabel?: (expanded: boolean) => string
}

export interface CwCardEmits {
  onExpandChange?: (expanded: boolean) => void
}
