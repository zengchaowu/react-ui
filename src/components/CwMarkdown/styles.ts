import type { CwMarkdownStyles } from '@zengchaowu/ui-shared/components/CwMarkdown/types'
import { INTERACTIVE_FOCUS_CLASS } from '@zengchaowu/ui-shared/functions/ui/focusStyles'

export const markdownBase: CwMarkdownStyles = {
  root: 'cw-markdown outline-none',
  rootNormal: 'text-[var(--text-color-primary)]',
  heading: 'font-semibold text-[var(--text-color-primary)]',
  heading1: 'text-2xl mt-6 mb-4',
  heading2: 'text-xl mt-5 mb-3',
  heading3: 'text-lg mt-4 mb-2',
  heading4: 'text-base mt-3 mb-2',
  heading5: 'text-sm mt-2 mb-1',
  heading6: 'text-sm mt-2 mb-1 opacity-90',
  paragraph: 'mb-2 last:mb-0 text-[var(--text-color-primary)]',
  codeBlock:
    'my-2 flex flex-col overflow-hidden rounded-lg border border-[var(--border-color)] bg-[var(--chat-message-card-bg)]',
  codeBlockToolbar:
    'relative flex min-h-0 shrink-0 cursor-pointer items-center gap-1 select-none px-2 py-1',
  codeBlockToolbarDivider: 'hairline-border-b border-[var(--border-color)]',
  codeBlockLang:
    'min-w-0 max-w-[70%] truncate pr-1 text-left [font-size:var(--font-size-caption)] font-medium uppercase leading-none text-[var(--text-color-secondary)]',
  codeBlockToggleBtn:
    'relative z-[var(--z-index-above)] inline-flex h-5 w-5 shrink-0 items-center justify-center text-[var(--text-color-placeholder)]',
  codeBlockCopyBtn:
    'relative z-[var(--z-index-above)] inline-flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded text-[var(--text-color-placeholder)] transition-colors hover:bg-[var(--bg-color-component-hover)] hover:text-[var(--text-color-primary)]',
  codeBlockInner:
    'overflow-x-auto px-2 py-1.5 font-mono [font-size:inherit] leading-snug text-[var(--text-color-primary)]',
  // KEEP CSS grid: 0fr/1fr expand animation (CwGrid is equal-column flex only).
  codeBlockExpand:
    'grid overflow-hidden transition-[grid-template-rows] duration-[280ms] ease-[cubic-bezier(0.4,0,0.2,1)]',
  codeBlockExpandOpen: 'grid-rows-[1fr]',
  codeBlockExpandClosed: 'grid-rows-[0fr]',
  codeBlockExpandInner:
    'min-h-0 max-h-[min(24rem,40vh)] overflow-auto',
  codeBlockExtensionBody: 'min-w-0 max-w-full',
  blockquote: 'my-3 pl-4 border-l-4 border-[var(--border-color)] text-[var(--text-color-secondary)]',
  blockquoteBorder: 'border-[var(--border-color)]',
  list: 'my-2 space-y-2 pl-6 [font-size:inherit] leading-[inherit]',
  listOrdered: 'list-decimal [font-size:inherit]',
  listUnordered: 'list-disc [font-size:inherit]',
  listItem: 'min-w-0 [font-size:inherit] leading-[inherit] marker:[font-size:inherit]',
  hr: 'my-4 border-0 hairline-border-t border-[var(--border-color)]',
  tableWrapper: 'my-3 w-full max-w-full overflow-x-auto',
  table:
    'w-full min-w-0 border-collapse hairline-border border-[var(--border-color)] text-sm',
  tableTh:
    'hairline-border border-[var(--border-color)] bg-[var(--bg-color-secondarycontainer)] px-2 py-1.5 font-semibold text-[var(--text-color-primary)]',
  tableTd:
    'hairline-border border-[var(--border-color)] px-2 py-1.5 align-top text-[var(--text-color-primary)]',
  inlineText: '',
  inlineBold: 'font-semibold',
  inlineItalic: 'italic',
  inlineCode:
    'max-w-full break-words px-0.5 py-0 rounded-[var(--radius-medium)] bg-[var(--markdown-inline-code-bg)] border border-[var(--border-color)] [overflow-wrap:anywhere] [font-size:0.85em]',
  link: 'outline-none focus:outline-none text-[var(--brand-color-6)] cursor-pointer hover:underline',
  linkNormal: '',
  linkFocused: INTERACTIVE_FOCUS_CLASS,
  image:
    'max-w-full overflow-hidden rounded-[var(--radius-default)] bg-[var(--bg-color-component)]',
  sizeSmall: 'text-xs',
  sizeMedium: 'text-sm',
  sizeLarge: 'text-base',
}
