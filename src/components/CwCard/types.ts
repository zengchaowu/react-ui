import type { HTMLAttributes, ReactNode } from 'react'
import type { CwCardAppearance, CwCardTexts } from '@zengchaowu/ui-shared/components/CwCard/types'

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

export interface CwCardEmits {
  onExpandChange?: (expanded: boolean) => void
}
