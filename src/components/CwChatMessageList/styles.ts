import type { CwChatMessageListStyles } from './types'
import { chatMessageBodyTextClass } from '../CwChatMessageCell/chatMessageTypography'

export const defaultCwChatMessageListStyles: CwChatMessageListStyles = {
  root: 'cw-chat-message-list relative flex h-full min-h-0 w-full min-w-0 flex-1 flex-col',
  scrollRoot: 'min-h-0 min-w-0 flex-1',
  content: '',
  /** 无消息时叠在列表视口上居中（与 loadingOverlay 同定位，无底色） */
  emptyState:
    'pointer-events-none absolute inset-0 flex min-w-0 items-center justify-center',
  emptyHint: `${chatMessageBodyTextClass} text-[var(--text-color-placeholder)]`,
  /** 无 flex gap：行距用每行 `pt`；拖选手势在列上 capture，列级 touch-pan-y */
  messagesColumn: 'flex min-w-0 w-full flex-col touch-pan-y',
  prepend: 'flex min-w-0 w-full shrink-0 justify-center py-2',
  messageRow: 'flex min-w-0 w-full flex-col pt-1.5 first:pt-0',
  /** 多选已开启：整行（含顶部 pt 行距区）可点击切换勾选 */
  messageRowSelectionClickable: 'cursor-pointer',
  /** 多选已开启但不可选：整行不可点选 */
  messageRowSelectionDisabled: 'cursor-default',
  /** 多选时整行 `relative`：承载勾选框、选中底与内层 `pl-9` 的参照 */
  messageRowSelectionHost: 'relative',
  /** 多选选中行：铺满本行的半透明底（pointer-events-none，不挡点击/拖选） */
  messageRowSelectedScrim:
    'pointer-events-none absolute inset-0',
  /** 多选：悬浮在左上角的勾选框（不占文档流，DOM 顺序在消息内容之后） */
  selectionCheckboxAbs:
    'pointer-events-auto absolute left-2 top-2 box-border flex items-center justify-center',
  /**
   * 多选：包裹 `CwChatMessageCell` 的一层（与对左消息一致 `justify-start` + `pl-9` 给勾选框留白）；
   * 气泡 `max-w-full` / `md:max-w-[66.666667%]` 等仍相对本层内容盒计算，不额外包一层改百分比参照的列宽。
   */
  messageRowSelectionInner:
    'relative box-border flex min-w-0 w-full justify-start pl-9',
  /** 多选选中行：语义 scrim（与菜单项 hover 等同系） */
  messageRowSelectedBg: 'bg-[var(--chat-message-row-selected-bg)]',
  messageRowQuoteHighlight:
    'bg-[color-mix(in_srgb,var(--brand-color-6)_12%,transparent)] transition-colors duration-300',
  loadingOverlay:
    'pointer-events-none absolute inset-0 flex items-center justify-center',
  lassoBox:
    'pointer-events-none absolute z-[var(--z-index-float)] box-border border border-[var(--brand-color-6)] bg-[color-mix(in_srgb,var(--brand-color-6)_20%,transparent)]',
}
