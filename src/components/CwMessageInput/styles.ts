import { APP_PAGE_CHROME_SAFE_BOTTOM_CLASS } from '../../constants/appSafeAreaClasses'
import type { CwMessageInputStyles } from './types'
import { defaultCwMessageInputMentionPanelStyles } from '../CwMessageInputMentionPanel/styles'
import { chatMessageBodyTextClass } from '../CwChatMessageCell/chatMessageTypography'
import {
  FILE_CHIP_WRAP_CLASS,
  FILE_CHIP_INNER_CLASS,
} from './chips/chipStyles'
import { FOCUS_VISIBLE_INTERACTIVE_CLASS } from '../../utils/focusStyles'

const fileRefInlineScoped = `${FILE_CHIP_WRAP_CLASS} ${FILE_CHIP_INNER_CLASS.split(/\s+/)
  .filter(Boolean)
  .map((c) => `[&_.cw-file-ref]:${c}`)
  .join(' ')}`

export const defaultCwMessageInputStyles: CwMessageInputStyles = {
  root: `cw-message-input relative flex min-h-0 w-full min-w-0 flex-1 flex-col ${APP_PAGE_CHROME_SAFE_BOTTOM_CLASS}`,
  fieldShell: 'flex min-h-0 min-w-0 w-full max-h-full flex-1 flex-col',
  field:
    `flex min-h-0 min-w-0 w-full max-h-full flex-1 flex-col overflow-y-auto cursor-text border-0 bg-transparent px-3 py-3.5 ${chatMessageBodyTextClass} leading-relaxed text-[var(--text-color-primary)] outline-none placeholder:text-[var(--text-color-placeholder)] focus:ring-0 [&_.ProseMirror]:min-h-full [&_.ProseMirror]:[font-size:inherit] [&_.ProseMirror]:leading-relaxed [&_.ProseMirror]:outline-none [&_.ProseMirror_p.is-editor-empty:first-child::before]:text-[var(--text-color-placeholder)] [&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left [&_.ProseMirror_p.is-editor-empty:first-child::before]:h-0 [&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none [&_.ProseMirror_p.is-editor-empty:first-child::before]:cursor-text [&_.cw-emoji-wrap]:inline-flex [&_.cw-emoji-wrap]:items-center [&_.cw-emoji-wrap]:align-middle [&_.ProseMirror_img.cw-emoji]:inline-block [&_.ProseMirror_img.cw-emoji]:h-[1.25em] [&_.ProseMirror_img.cw-emoji]:w-[1.25em] [&_.ProseMirror_img.cw-emoji]:max-h-[1.25em] [&_.ProseMirror_img.cw-emoji]:max-w-[1.25em] [&_.ProseMirror_img.cw-emoji]:shrink-0 [&_.ProseMirror_img.cw-emoji]:object-contain [&_.ProseMirror_img.cw-emoji]:align-middle`,
  fieldDisabled: 'opacity-50 pointer-events-none',
  ...defaultCwMessageInputMentionPanelStyles,
  pendingListAbove:
    'w-full min-w-0 shrink-0 px-3 pb-1.5 pt-1.5',
  pendingListAboveInner:
    'flex w-max max-w-none flex-nowrap items-start gap-1.5',
  pendingRasterFrame:
    `relative block h-7 w-7 cursor-pointer bg-[var(--bg-color-component)] outline-none ${FOCUS_VISIBLE_INTERACTIVE_CLASS}`,
  pendingRasterImg: 'h-full w-full object-cover',
  pendingFileCard:
    `relative flex h-7 w-[var(--size-pending-file-card)] cursor-pointer items-stretch gap-1 bg-[var(--bg-color-component)] px-1 outline-none ${FOCUS_VISIBLE_INTERACTIVE_CLASS}`,
  pendingFileCardIconWrap:
    'flex h-full w-[1rem] shrink-0 items-center justify-center overflow-hidden',
  pendingFileCardMeta:
    'flex min-w-0 flex-1 flex-col justify-center gap-0 leading-none',
  pendingFileCardTitle:
    'min-w-0 truncate [font-size:var(--font-size-xs)] font-medium leading-tight text-[var(--text-color-primary)]',
  pendingFileCardSize:
    'min-w-0 truncate [font-size:var(--font-size-xs)] leading-tight text-[var(--text-color-secondary)]',
  /** 与 `CwMessageInputInlineChip` / 编辑器内 DOM 同步（由 chipStyles 生成） */
  fileRefInline: fileRefInlineScoped,
}
