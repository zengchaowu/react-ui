import { CW_OVERLAY_MODAL_Z_CLASS } from '../../constants/cwOverlayStack'
import type { CwMessageInputMentionPanelStyles } from './types'

export const defaultCwMessageInputMentionPanelStyles: CwMessageInputMentionPanelStyles = {
  mentionPanel: [
    CW_OVERLAY_MODAL_Z_CLASS,
    'max-h-48 min-w-[var(--size-mention-panel-min)] max-w-[min(22.5rem,calc(100vw-1.5rem))] overflow-y-auto rounded-md border border-[var(--component-border)] bg-[var(--bg-color-container)] py-1 shadow-lg',
  ].join(' '),
  mentionOption:
    'flex w-full cursor-pointer items-center gap-2 px-2.5 py-1.5 text-left text-xs leading-snug text-[var(--text-color-primary)] hover:bg-[var(--bg-color-component-hover)]',
  mentionOptionActive: 'bg-[var(--bg-color-secondarycontainer)]',
  mentionAvatarWrap:
    'flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--bg-color-secondarycomponent)] ring-1 ring-[var(--border-color-extra-light)]',
  mentionAvatarImg: 'h-full w-full object-cover',
  mentionAvatarFallback:
    'select-none [font-size:var(--font-size-xs)] font-medium leading-none text-[var(--text-color-secondary)]',
  mentionEmpty: 'px-3 py-2 text-center text-xs text-[var(--text-color-secondary)]',
}
