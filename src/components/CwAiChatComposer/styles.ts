import type { CwAiChatComposerStyles } from './types'

const editorFieldClass =
  'w-full min-w-0 cursor-text [font-size:var(--font-size-body-lg)] leading-[var(--line-height-composer)] text-[var(--text-color-primary)] [&>div]:flex [&>div]:h-full [&>div]:min-h-0 [&>div]:flex-col [&>div]:overflow-hidden [&_.ProseMirror]:box-border [&_.ProseMirror]:min-h-0 [&_.ProseMirror]:max-h-full [&_.ProseMirror]:flex-1 [&_.ProseMirror]:overflow-x-hidden [&_.ProseMirror]:overflow-y-auto [&_.ProseMirror_p]:my-0 [&_.ProseMirror]:[font-size:inherit] [&_.ProseMirror]:outline-none [&_.ProseMirror_p.is-editor-empty:first-child::before]:text-[var(--text-color-placeholder)] [&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left [&_.ProseMirror_p.is-editor-empty:first-child::before]:h-0 [&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none [&_.ProseMirror_p.is-editor-empty:first-child::before]:cursor-text [&_.cw-emoji-wrap]:inline-flex [&_.cw-emoji-wrap]:items-center [&_.cw-emoji-wrap]:align-middle [&_.ProseMirror_img.cw-emoji]:inline-block [&_.ProseMirror_img.cw-emoji]:h-[1.25em] [&_.ProseMirror_img.cw-emoji]:w-[1.25em] [&_.ProseMirror_img.cw-emoji]:max-h-[1.25em] [&_.ProseMirror_img.cw-emoji]:max-w-[1.25em] [&_.ProseMirror_img.cw-emoji]:shrink-0 [&_.ProseMirror_img.cw-emoji]:object-contain [&_.ProseMirror_img.cw-emoji]:align-middle [&_.ProseMirror[contenteditable=false]]:cursor-not-allowed [&_.ProseMirror[contenteditable=false]]:opacity-[0.55]'

export const defaultCwAiChatComposerStyles: CwAiChatComposerStyles = {
  root: 'cw-ai-chat-composer w-full',
  shell:
    'cw-ai-chat-composer__shell relative box-border overflow-hidden rounded-lg border border-[var(--component-border)] bg-transparent',
  editorField: `${editorFieldClass} cw-ai-chat-composer__editor-field`,
  editorFieldCompact:
    '[&_.ProseMirror]:my-0 [&_.ProseMirror]:min-h-0 [&_.ProseMirror]:max-h-[var(--line-height-composer)] [&_.ProseMirror]:overflow-hidden [&_.ProseMirror]:leading-[var(--line-height-composer)] [&_.ProseMirror_p]:my-0',
  attachBtn:
    'cw-ai-chat-composer__attach inline-flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center border-0 bg-transparent p-0 text-[var(--text-color-primary)] transition-[color,transform] duration-200 ease-out hover:text-[var(--brand-color-6)] active:scale-95 active:text-[var(--brand-color-6)] aria-disabled:cursor-not-allowed aria-disabled:pointer-events-none aria-disabled:opacity-45',
  voiceBtn:
    'cw-ai-chat-composer__voice inline-flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center border-0 bg-transparent p-0 text-[var(--text-color-primary)] transition-[color,transform] duration-200 ease-out hover:text-[var(--brand-color-6)] active:scale-95 active:text-[var(--brand-color-6)] aria-disabled:cursor-not-allowed aria-disabled:pointer-events-none aria-disabled:opacity-45',
  sendSlot:
    'cw-ai-chat-composer__send-slot flex shrink-0 items-center justify-center',
  sendBtn:
    'cw-ai-chat-composer__send inline-flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center border-0 bg-transparent p-0 text-[var(--text-color-primary)] transition-[color,transform] duration-200 ease-out hover:text-[var(--brand-color-6)] active:scale-95 active:text-[var(--brand-color-6)] aria-disabled:cursor-not-allowed aria-disabled:pointer-events-none aria-disabled:opacity-45',
  stopBtn:
    'cw-ai-chat-composer__stop inline-flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center border-0 bg-transparent p-0 text-[var(--text-color-primary)] transition-[color,transform] duration-200 ease-out hover:text-[var(--brand-color-6)] active:scale-95 active:text-[var(--brand-color-6)] aria-disabled:cursor-not-allowed aria-disabled:pointer-events-none aria-disabled:opacity-45',
  sendBtnDisabled:
    'pointer-events-none text-[var(--text-color-disabled)] hover:opacity-100 active:scale-100',
  voiceHoldArea:
    'cw-ai-chat-composer__voice-hold absolute inset-0 z-[var(--z-index-base)] box-border flex cursor-pointer touch-none select-none items-center justify-center rounded-lg bg-[var(--bg-color-secondarycontainer)] [font-size:var(--font-size-body-lg)] font-medium leading-[var(--line-height-composer)] text-[var(--text-color-secondary)] transition-[background-color,color] duration-150 ease-out',
  voiceHoldAreaDisabled:
    'cursor-not-allowed opacity-55 pointer-events-none',
  voiceHoldAreaActive:
    'bg-[var(--brand-color-6)] text-[var(--text-color-anti)] [&_span]:text-[var(--text-color-anti)]',
  voiceHoldAreaCancel:
    'bg-[var(--error-color-6)] text-[var(--text-color-anti)] [&_span]:text-[var(--text-color-anti)]',
  toolbarBtnVoiceHold:
    '!text-[var(--text-color-anti)] hover:!text-[var(--text-color-anti)] active:!text-[var(--text-color-anti)] [&_.iconfont]:!text-[var(--text-color-anti)] [&_svg]:!text-[var(--text-color-anti)]',
  voiceHint:
    'cw-ai-chat-composer__voice-hint pointer-events-none absolute bottom-full left-1/2 z-[var(--z-index-above-high)] mb-2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[var(--inverse-surface-bg)] px-3 py-1.5 [font-size:var(--font-size-body)] leading-none text-[var(--inverse-surface-fg)] shadow-[var(--shadow-2)]',
}
