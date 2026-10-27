import {
  createArrow,
  createDimensions,
  createFlip,
  createOffset,
  createPosition,
  createPreventOverflow,
} from '../CwPopup'
import { getEmojiCategoryOrder, type EmojiItem } from '../../utils/emojioneEmoji'
import {
  CW_GLASS_FROSTED_MENU_ITEM_HOVER_CLASS,
  CW_GLASS_FROSTED_MENU_ITEM_SELECTED_CLASS,
} from '@zengchaowu/ui-shared/components/CwContextMenu/styles'

export const EMOJI_PICKER_GRID_COLUMNS = 8

export const emojiPickerPanelClass =
  'flex min-h-0 flex-1 flex-col overflow-hidden'

export const EMOJI_RECENT_TAB_KEY = '__recent__'

export const emojiPickerTabsClass =
  'flex min-h-[1.75rem] shrink-0 hairline-border-b border-[var(--border-color)]'

export const emojiPickerTabBtnClass =
  'flex-1 cursor-pointer px-1 py-1 [font-size:var(--font-size-caption)] font-medium'

/** 未激活分类 Tab hover（6%）；激活 Tab 改用 emojiPickerTabBtnActiveClass，勿同挂 */
export const emojiPickerTabBtnHoverClass = CW_GLASS_FROSTED_MENU_ITEM_HOVER_CLASS

/** 激活分类 Tab＝选中态（12%，再 hover 16%），叠加品牌色文字 */
export const emojiPickerTabBtnActiveClass = [
  'text-[var(--brand-color-6)]',
  CW_GLASS_FROSTED_MENU_ITEM_SELECTED_CLASS,
].join(' ')

export const emojiPickerTabBtnInactiveClass = 'text-[var(--text-color-secondary)]'

/** 表情包切换条（微信式：均为图标 Tab） */
export const expressionPackTabsClass =
  'flex max-w-full shrink-0 flex-nowrap items-center gap-1 overflow-x-auto overscroll-x-contain px-2 pt-1 pb-0.5'

export const expressionPackTabsTopClass = `${expressionPackTabsClass} hairline-border-b border-[var(--border-color)]`

/** 移动端 Composer 底栏：无分割线，背景与 composer 一致 */
export const expressionPackTabsMobileDockClass = expressionPackTabsClass

/** 单个表情包 Tab 按钮（图标 / 封面） */
export const expressionPackTabBtnClass =
  'flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded'

/** 未激活表情包 Tab hover（6%）；激活 Tab 改用 expressionPackTabBtnActiveClass，勿同挂 */
export const expressionPackTabBtnHoverClass = CW_GLASS_FROSTED_MENU_ITEM_HOVER_CLASS

export const expressionPackTabBtnActiveClass = [
  'text-[var(--text-color-primary)]',
  CW_GLASS_FROSTED_MENU_ITEM_SELECTED_CLASS,
].join(' ')

export const expressionPackTabBtnInactiveClass = 'text-[var(--text-color-secondary)]'

export const EXPRESSION_PACK_TAB_ICON_SIZE = 1.25

export const expressionPackTabThumbClass =
  'h-[1.25rem] w-[1.25rem] rounded object-contain'

export const emojiPickerGridScrollClass =
  'min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-2'

/** 移动端底栏内嵌：更宽面板、多一列（布局用 CwGrid columns） */
export const EMOJI_PICKER_MOBILE_GRID_COLUMNS = 9

export const emojiPickerMobilePanelClass =
  'flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-[var(--bg-color-container)]'

/** 移动端「常用」：8 列，尺寸对齐微信常用区 */
export const EMOJI_PICKER_MOBILE_RECENT_COLUMNS = 8

export const emojiPickerMobileRecentImgClass = 'h-6 w-6 select-none'

export const emojiPickerCellClass =
  'flex aspect-square w-full items-center justify-center rounded-md hover:bg-[var(--bg-color-component-hover)] active:bg-[var(--bg-color-component-active)]'

export const emojiPickerRecentSectionClass =
  'shrink-0 hairline-border-t border-[var(--border-color)] p-2'

export const emojiPickerRecentCellClass =
  'flex h-7 w-7 items-center justify-center rounded-md hover:bg-[var(--bg-color-component-hover)]'

export const emojiPickerImgClass = 'h-5 w-5 select-none'

export const emojiPickerPopupPlugins = [
  createDimensions(),
  createFlip({ padding: 8 }),
  createPosition(),
  createOffset({ offset: 8 }),
  createPreventOverflow({ padding: 8 }),
  createArrow({
    margin: 8,
    arrowClass:
      'h-2 w-2 border-[var(--border-color)] bg-[var(--bg-color-container)]',
  }),
]

export function resolveInitialEmojiCategory(
  byCategory: Record<string, EmojiItem[]>,
): string {
  const order = getEmojiCategoryOrder()
  return (
    order.find((key) => (byCategory[key]?.length ?? 0) > 0) ??
    'Smileys & Emotion'
  )
}
