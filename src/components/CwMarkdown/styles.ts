import type { CwMarkdownStyles } from './types'
import { INTERACTIVE_FOCUS_CLASS } from '../../utils/focusStyles'

export const defaultStyles: CwMarkdownStyles = {
  root: 'cw-markdown outline-none',
  rootNormal: 'text-[var(--text-color-primary)]',
  heading: 'font-semibold text-[var(--text-color-primary)]',
  heading1: 'text-2xl mt-6 mb-4',
  heading2: 'text-xl mt-5 mb-3',
  heading3: 'text-lg mt-4 mb-2',
  heading4: 'text-base mt-3 mb-2',
  heading5: 'text-sm mt-2 mb-1',
  heading6: 'text-sm mt-2 mb-1 opacity-90',
  paragraph: 'text-[var(--text-color-primary)]',
  codeBlock:
    'my-3 flex flex-col overflow-hidden rounded-[var(--radius-default)] border border-[var(--component-border)] bg-[var(--bg-color-secondarycontainer)]',
  codeBlockToolbar:
    'relative flex min-h-9 shrink-0 cursor-pointer items-center gap-2 select-none bg-[var(--bg-color-component)] px-2 py-1',
  codeBlockToolbarDivider: 'hairline-border-b border-[var(--component-border)]',
  codeBlockLang:
    'min-w-0 max-w-[70%] truncate pr-2 text-left text-xs font-medium uppercase text-[var(--text-color-secondary)]',
  codeBlockToggleBtn:
    'relative z-[var(--z-index-above)] inline-flex h-7 w-7 shrink-0 items-center justify-center text-[var(--text-color-secondary)]',
  codeBlockCopyBtn:
    'relative z-[var(--z-index-above)] inline-flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-[var(--radius-default)] text-[var(--text-color-secondary)] transition-colors hover:bg-[var(--bg-color-component-hover)] hover:text-[var(--text-color-primary)]',
  codeBlockInner: 'p-3 overflow-x-auto text-sm font-mono text-[var(--text-color-primary)]',
  codeBlockExpand:
    'grid overflow-hidden transition-[grid-template-rows] duration-[280ms] ease-[cubic-bezier(0.4,0,0.2,1)]',
  codeBlockExpandOpen: 'grid-rows-[1fr]',
  codeBlockExpandClosed: 'grid-rows-[0fr]',
  codeBlockExpandInner: 'min-h-0 overflow-hidden',
  codeBlockExtensionBody: 'min-w-0 max-w-full',
  blockquote: 'my-3 pl-4 border-l-4 border-[var(--component-border)] text-[var(--text-color-secondary)]',
  blockquoteBorder: 'border-[var(--component-border)]',
  list: 'my-2 pl-6',
  listOrdered: 'list-decimal',
  listUnordered: 'list-disc',
  listItem: 'my-0.5',
  hr: 'my-4 border-0 hairline-border-t border-[var(--component-border)]',
  tableWrapper: 'my-3 w-full max-w-full overflow-x-auto',
  table:
    'w-full min-w-0 border-collapse hairline-border border-[var(--component-border)] text-sm',
  tableTh:
    'hairline-border border-[var(--component-border)] bg-[var(--bg-color-secondarycontainer)] px-2 py-1.5 font-semibold text-[var(--text-color-primary)]',
  tableTd:
    'hairline-border border-[var(--component-border)] px-2 py-1.5 align-top text-[var(--text-color-primary)]',
  inlineText: '',
  inlineBold: 'font-semibold',
  inlineItalic: 'italic',
  inlineCode:
    'max-w-full break-words px-1.5 py-0.5 rounded bg-[var(--bg-color-component)] font-mono text-sm border border-[var(--component-border)] [overflow-wrap:anywhere]',
  link: 'outline-none focus:outline-none text-[var(--text-color-link)] cursor-pointer hover:underline',
  linkNormal: '',
  linkFocused: INTERACTIVE_FOCUS_CLASS,
  image:
    'max-w-full overflow-hidden rounded-[var(--radius-default)] bg-[var(--bg-color-component)]',
  sizeSmall: 'text-xs',
  sizeMedium: 'text-sm',
  sizeLarge: 'text-base'
}
