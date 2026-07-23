import type { TpTipTapEditorStyles } from './types'

export const defaultStyles: TpTipTapEditorStyles = {
  root:
    'tp-tiptap-editor flex flex-col w-full rounded-lg border border-[var(--component-border)] bg-[var(--bg-color-container)] overflow-hidden',
  toolbar:
    'flex items-center gap-1 flex-wrap px-3 py-2 hairline-border-b border-[var(--border-color-light)] bg-[var(--bg-color-secondarycontainer)]',
  toolbarDisabled:
    'opacity-50 pointer-events-none cursor-not-allowed',
  toolbarGroup: 'flex items-center gap-0.5 border-r border-[var(--component-border)] pr-2 last:border-r-0 last:pr-0',
  toolbarButton:
    'flex items-center justify-center w-8 h-8 rounded text-[var(--text-color-secondary)] hover:bg-[var(--bg-color-component-hover)] hover:text-[var(--text-color-primary)] transition-colors cursor-pointer',
  toolbarButtonActive:
    'bg-[var(--button-brand-tint-hover-bg)] text-[var(--brand-color-6)] hover:bg-[var(--button-brand-tint-hover-bg)] hover:text-[var(--brand-color-6)]',
  editorWrap: 'flex-1 min-h-0 overflow-auto',
  editorContent:
    'min-h-full px-3 py-3 text-[var(--text-color-primary)] outline-none prose prose-sm max-w-none [&_.ProseMirror]:min-h-[var(--tiptap-min-height)] [&_.ProseMirror]:outline-none [&_.ProseMirror_p.is-editor-empty:first-child::before]:text-[var(--text-color-secondary)] [&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left [&_.ProseMirror_p.is-editor-empty:first-child::before]:h-0 [&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none [&_.ProseMirror_img]:max-w-full [&_.ProseMirror_img]:h-auto [&_.ProseMirror_img]:rounded [&_.ProseMirror_video]:max-w-full [&_.ProseMirror_video]:rounded [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:pl-6 [&_.ProseMirror_ul]:my-2 [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:pl-6 [&_.ProseMirror_ol]:my-2 [&_.ProseMirror_li]:my-0.5 [&_.ProseMirror_code]:bg-[var(--bg-color-component)] [&_.ProseMirror_code]:font-mono [&_.ProseMirror_code]:text-sm [&_.ProseMirror_code]:px-1.5 [&_.ProseMirror_code]:py-0.5 [&_.ProseMirror_code]:rounded [&_.ProseMirror_code]:text-[var(--text-color-primary)] [&_.ProseMirror_pre_code]:bg-transparent [&_.ProseMirror_pre_code]:p-0 [&_.ProseMirror_blockquote]:border-l-4 [&_.ProseMirror_blockquote]:border-[var(--brand-color-6)] [&_.ProseMirror_blockquote]:bg-[var(--button-brand-tint-hover-bg)] [&_.ProseMirror_blockquote]:pl-4 [&_.ProseMirror_blockquote]:py-2 [&_.ProseMirror_blockquote]:pr-4 [&_.ProseMirror_blockquote]:my-3 [&_.ProseMirror_blockquote]:text-[var(--text-color-primary)] [&_.ProseMirror_blockquote]:rounded-r [&_.ProseMirror_blockquote]:not-italic [&_.ProseMirror_pre]:bg-[var(--bg-color-component)] [&_.ProseMirror_pre]:font-mono [&_.ProseMirror_pre]:text-sm [&_.ProseMirror_pre]:p-4 [&_.ProseMirror_pre]:rounded-lg [&_.ProseMirror_pre]:overflow-x-auto [&_.ProseMirror_pre]:my-3 [&_.ProseMirror_pre]:text-[var(--text-color-primary)] [&_.ProseMirror_pre]:border [&_.ProseMirror_pre]:border-[var(--border-color-light)]',
}
