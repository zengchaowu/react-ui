import {
  chatMessageMetaTextClass,
  chatMessageQuoteSnippetTextClass,
} from '../CwChatMessageCell/chatMessageTypography'

export const defaultCwChatMessageQuoteStyles = {
  root:
    'cw-chat-message-quote relative box-border flex min-w-0 rounded-md bg-[var(--bg-color-component)] px-2.5 py-1.5 text-left',
  rootNavigable:
    'cursor-pointer transition-colors hover:bg-[color-mix(in_srgb,var(--brand-color-6)_8%,var(--bg-color-component))]',
  rootMissing: 'opacity-70',
  rootComposer: 'min-w-0 max-w-full shrink-0',
  body: 'min-w-0 flex-1',
  sender: `truncate ${chatMessageMetaTextClass} font-medium text-[var(--brand-color-6)]`,
  snippet:
    `min-w-0 line-clamp-2 break-words ${chatMessageQuoteSnippetTextClass}`,
  dismissBtn:
    'ml-1 shrink-0 cursor-pointer border-0 bg-transparent p-0 text-lg leading-none text-[var(--text-color-placeholder)] hover:text-[var(--text-color-primary)]',
}
