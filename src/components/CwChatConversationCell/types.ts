import type {
  CwSwipeRowProps,
  CwSwipeRowAction,
  CwSwipeRowActionTone,
} from '../CwSwipeRow/types'

export type CwChatConversationSwipeTone = CwSwipeRowActionTone

export type CwChatConversationSwipeAction = CwSwipeRowAction

export interface CwChatConversationCellStyles {
  root: string
  rootSelected: string
  rootUnselected: string
  /** flex：避免内层 inline-flex（角标 root）参与行盒基线对齐，在头像下产生空白条 */
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

export interface CwChatConversationCellProps extends Omit<CwSwipeRowProps, 'styles'> {
  name: string
  /** 头像 URL；空字符串或未传时仅用 `fallback-src` 占位图 */
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
  /** 会话行布局类名（不含左滑手势内部结构；底部分割线见 `rowDividerInset`） */
  styles?: Partial<CwChatConversationCellStyles>
  texts?: Partial<CwChatConversationCellTexts>
}

export interface CwChatConversationCellEmits {
  (e: 'click', event: MouseEvent): void
  (e: 'swipe-action', key: string): void
  (e: 'swipe-open-change', key: string | null): void
}
