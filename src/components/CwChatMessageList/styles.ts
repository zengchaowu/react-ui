import type { CwChatMessageListStyles } from '@zengchaowu/ui-shared/components/CwChatMessageList/types'
import { chatMessageBodyTextClass } from '@zengchaowu/ui-shared/components/CwChatMessageCell/chatMessageTypography'

/** 消息列表 / composer 左右外边距（相对面板）——与 vue-ui `chatWorkspaceSurface` 对齐 */
const CW_WORKSPACE_CHAT_GUTTER_X = 'px-[18px]'

/** 消息区衬底（吸顶遮罩 / 描边气泡底，避免透出下层滚动内容） */
const CW_WORKSPACE_CHAT_AREA_BG = 'bg-[var(--chat-message-area-bg)]'

/**
 * 己方消息吸顶行：`top-0` + `!pt-2` 做出离顶 8px 且不露缝
 *（`!` 压过同行 `messageRowWorkspace` 的 `first:pt-0`）。
 * 列表 content 在 workspace 下不再加 pt，避免首条静止态比吸顶态多一层顶距。
 * `box-shadow` 外扩衬底遮圆角外侧，不改行宽（勿用 -mx）。
 */
const CW_WORKSPACE_OWN_STICKY_ROW = [
  'sticky top-0 z-[var(--z-index-sticky)] w-full self-start',
  CW_WORKSPACE_CHAT_AREA_BG,
  '!pt-2',
  'shadow-[0_0_0_8px_var(--chat-message-area-bg)]',
].join(' ')

export const messageListBase: CwChatMessageListStyles = {
  root: 'cw-chat-message-list relative flex h-full min-h-0 w-full min-w-0 flex-1 flex-col',
  scrollRoot: 'min-h-0 min-w-0 flex-1',
  content: '',
  contentWorkspace: CW_WORKSPACE_CHAT_GUTTER_X,
  /**
   * 无消息时叠在列表视口上居中（与 loadingOverlay 同定位，无底色）。
   * workspace / Cursor 布局不展示此空状态（新会话 composer 置顶）。
   */
  emptyState:
    'pointer-events-none absolute inset-0 flex min-w-0 items-center justify-center',
  emptyHint: `${chatMessageBodyTextClass} text-[var(--text-color-placeholder)]`,
  /** 无 flex gap：行距用每行 `pt`；拖选手势在列上 capture，列级 touch-pan-y */
  messagesColumn: 'flex min-w-0 w-full flex-col touch-pan-y',
  prepend: 'flex min-w-0 w-full shrink-0 justify-center py-2',
  /** 消息列末尾追加（随列表滚动） */
  append: 'flex min-w-0 w-full shrink-0 flex-col py-2',
  /** Cursor / workspace：列表底部留白（h-60 = 240px），不与宿主 contentClass 的 py/pb 打架 */
  bottomSpacerWorkspace: 'pointer-events-none h-60 w-full shrink-0',
  messageRow: 'flex min-w-0 w-full flex-col pt-1.5 first:pt-0',
  messageRowWorkspace: 'flex min-w-0 w-full flex-col pt-3 first:pt-0',
  /**
   * workspace：一轮（己方 + 其后回复）容器；sticky 边界止于本轮末尾。
   * 轮与轮间距用 turn 的 pt，避免行上 `first:pt-0` 把轮间距吃掉。
   */
  messageTurnWorkspace: 'flex min-w-0 w-full flex-col pt-3 first:pt-0',
  /** workspace：己方消息吸顶（见 CW_WORKSPACE_OWN_STICKY_ROW） */
  messageRowStickyOwn: CW_WORKSPACE_OWN_STICKY_ROW,
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
   * 气泡宽度仍相对本层内容盒计算（`CHAT_BUBBLE_MAX_WIDTH_CLASS` / `bubblesFullWidth`）。
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
