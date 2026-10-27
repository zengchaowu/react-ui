import type { MouseEvent as ReactMouseEvent, ReactNode } from 'react'
import type { CwSwipeRowContentClass, CwSwipeRowAction } from '@zengchaowu/ui-shared/components/CwSwipeRow/types'

export interface CwSwipeRowProps {
  /** 主行容器类名（背景、padding、布局等） */
  contentClass?: CwSwipeRowContentClass
  swipeActions?: CwSwipeRowAction[]
  swipeDirectionThresholdPx?: number
  swipeOpenThresholdMinPx?: number
  swipeOpenThresholdRatio?: number
  swipeRowKey?: string
  swipePeerOpenKey?: string | null
  showBodyInsetDivider?: boolean
  /** 与 `showBodyInsetDivider` 配合；未传时使用组件默认内缩分割线类名 */
  bodyInsetDividerClass?: string
  /** 等价 Vue 默认插槽 */
  children?: ReactNode
  /** 等价 Vue `@click` */
  onClick?: (event: ReactMouseEvent<HTMLDivElement>) => void
  /** 等价 Vue `@swipe-action` */
  onSwipeAction?: (key: string) => void
  /** 等价 Vue `@swipe-open-change` */
  onSwipeOpenChange?: (key: string | null) => void
}

export interface CwSwipeRowEmits {
  click: (event: ReactMouseEvent<HTMLDivElement>) => void
  'swipe-action': (key: string) => void
  'swipe-open-change': (key: string | null) => void
}

export interface CwSwipeRowTexts {}
