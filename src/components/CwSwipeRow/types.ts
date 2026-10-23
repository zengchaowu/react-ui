import type { MouseEvent as ReactMouseEvent, ReactNode } from 'react'

/** 左滑操作项语义底色（内部默认类名，业务勿覆盖） */
export type CwSwipeRowActionTone = 'default' | 'primary' | 'muted' | 'warning' | 'danger'

/** 左滑露出的操作项（列表行），`tone` / `buttonClass` 由应用配置 */
export interface CwSwipeRowAction {
  key: string
  label: string
  danger?: boolean
  tone?: CwSwipeRowActionTone
  buttonClass?: string
}

export interface CwSwipeRowStyles {
  swipeOuter: string
  swipeTrack: string
  swipeActionsBar: string
  swipeActionsBarRevealed: string
  swipeSlideLayer: string
  swipeActionBtn: string
  swipeActionToneDefault: string
  swipeActionTonePrimary: string
  swipeActionToneMuted: string
  swipeActionToneWarning: string
  swipeActionToneDanger: string
  /** 与 `showBodyInsetDivider` 配合；左 inset 由业务约定（如跳过头像列） */
  rowDividerInset: string
}

export type CwSwipeRowContentClass =
  | string
  | Record<string, boolean>
  | Array<string | Record<string, boolean>>

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
