import { CW_POPUP_MENTION_PANEL_SHELL_CLASS } from '../CwPopup/styles'
import {
  CW_GLASS_FROSTED_MENU_ITEM_HOVER_CLASS,
  CW_GLASS_FROSTED_MENU_ITEM_KEYBOARD_CLASS,
  CW_GLASS_FROSTED_SHELL_PAD_CLASS,
} from '@zengchaowu/ui-shared/components/CwContextMenu/styles'
import type { CwMessageInputMentionPanelStyles } from './types'

export const mentionPanelBase: CwMessageInputMentionPanelStyles = {
  mentionPanel: CW_POPUP_MENTION_PANEL_SHELL_CLASS,
  /** 内层 listbox：壳滚动条贴边，等宽留白在内容层 */
  mentionList: CW_GLASS_FROSTED_SHELL_PAD_CLASS,
  mentionOption:
    'scroll-my-1 flex w-full cursor-pointer items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-[0.8125rem] leading-snug text-[var(--text-color-primary)]',
  /** 未高亮行 hover（6%）；勿与高亮行同挂 */
  mentionOptionHover: CW_GLASS_FROSTED_MENU_ITEM_HOVER_CLASS,
  /** 键盘/鼠标高亮行：与 hover 同档 6%（对齐 CwSelect） */
  mentionOptionKeyboard: CW_GLASS_FROSTED_MENU_ITEM_KEYBOARD_CLASS,
  mentionAvatarWrap:
    'flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--bg-color-secondarycomponent)] ring-1 ring-[var(--border-color)]',
  mentionAvatarImg: 'h-full w-full object-cover',
  mentionAvatarFallback:
    'select-none [font-size:var(--font-size-xs)] font-medium leading-none text-[var(--text-color-secondary)]',
  mentionEmpty: 'px-3 py-2 text-center text-[0.8125rem] text-[var(--text-color-secondary)]',
}

export default mentionPanelBase
