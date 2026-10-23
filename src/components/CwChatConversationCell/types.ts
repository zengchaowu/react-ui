import type { MouseEvent, ReactNode } from 'react'
import type { CwSwipeRowProps } from '../CwSwipeRow/types'

export type CwChatConversationSwipeTone =
  | 'default'
  | 'primary'
  | 'muted'
  | 'warning'
  | 'danger'

export interface CwChatConversationSwipeAction {
  key: string
  label: string
  danger?: boolean
  tone?: CwChatConversationSwipeTone
  buttonClass?: string
}

export interface CwChatConversationCellStyles {
  root: string
  rootSelected: string
  rootUnselected: string
  /** flex：避免内层 inline-flex（角标根）参与行盒基线对齐，在头像下产生空白条 */
  avatarWrap: string
  redDot: string
  body: string
  rowTop: string
  nameRow: string
  name: string
  time: string
  rowBottom: string
  description: string
  /** 传给内层 `CwSwipeRow` 的 `bodyInsetDividerClass` */
  rowDividerInset: string
}

export interface CwChatConversationCellTexts {
  /** 无名称时头像占位字符 */
  avatarFallbackSymbol: string
}

export interface CwChatConversationCellProps
  extends Omit<CwSwipeRowProps, 'styles'> {
  name: string
  /** 头像 URL；空字符串或未传时仅用 `fallbackSrc` 占位图 */
  avatar?: string
  /** 必传：无头像或主图加载失败时的占位图 URL（应用侧默认头像资源） */
  avatarFallbackSrc: string
  description: string
  time: string
  /** 未读数量（>0 显示数字角标）；未传时沿用 showRedDot 逻辑 */
  unreadCount?: number
  /** 数字角标最大值（超出显示 `${max}+`） */
  unreadMax?: number
  showRedDot?: boolean
  /** 当前选中会话（微信式浅灰底） */
  selected?: boolean
  texts?: Partial<CwChatConversationCellTexts>

  /** CwSwipeRow 左滑配置（与 Vue `CwSwipeRowProps` 对齐） */
  swipeActions?: CwChatConversationSwipeAction[]
  swipeDirectionThresholdPx?: number
  swipeOpenThresholdMinPx?: number
  swipeOpenThresholdRatio?: number
  swipeRowKey?: string
  swipePeerOpenKey?: string | null
  showBodyInsetDivider?: boolean

  /** 等价 Vue 具名插槽 `name` */
  nameSlot?: ReactNode
  /** 等价 Vue 具名插槽 `description` */
  descriptionSlot?: ReactNode

  /** 等价 Vue `@click` */
  onClick?: (event: MouseEvent<HTMLElement>) => void
  /** 等价 Vue `@swipe-action` */
  onSwipeAction?: (key: string) => void
  /** 等价 Vue `@swipe-open-change` */
  onSwipeOpenChange?: (key: string | null) => void
}


/** Vue 事件签名兼容导出（React 侧以同名 onXxx 回调使用） */
export interface CwChatConversationCellEmits {
  (e: 'click', event: MouseEvent): void
  (e: 'swipe-action', key: string): void
  (e: 'swipe-open-change', key: string | null): void
}
