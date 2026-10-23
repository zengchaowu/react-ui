import { APP_PAGE_CHROME_SAFE_BOTTOM_CLASS } from '@zengchaowu/ui-shared/constants/appSafeAreaClasses'
import { chatMessageBodyTextClass } from '../CwChatMessageCell/chatMessageTypography'

import type { CwMessageInputFieldLayout } from './types'

export type { CwMessageInputFieldLayout }

/**
 * 与 vue-ui `components/chatWorkspaceSurface.ts` 的 `CW_WORKSPACE_CHAT_INSET_PAD_X` 对齐。
 * React 侧该文件尚未导出此常量，这里保持同一 class 值。
 */
const CW_WORKSPACE_CHAT_INSET_PAD_X = 'px-2.5'

export interface CwMessageInputLayoutClasses {
  root: string
  fieldShell: string
  field: string
  fieldDisabled: string
}

const messageInputFieldDefault = [
  `flex min-h-0 min-w-0 w-full max-h-full flex-1 flex-col overflow-y-auto cursor-text border-0 bg-transparent px-3 py-3.5 ${chatMessageBodyTextClass} leading-relaxed text-[var(--text-color-primary)] outline-none placeholder:text-[var(--text-color-placeholder)] focus:ring-0`,
  '[&_.ProseMirror]:min-h-full [&_.ProseMirror]:[font-size:inherit] [&_.ProseMirror]:text-[var(--text-color-primary)] [&_.ProseMirror]:leading-relaxed [&_.ProseMirror]:outline-none',
  '[&_.ProseMirror_p.is-editor-empty:first-child::before]:text-[var(--text-color-placeholder)] [&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left [&_.ProseMirror_p.is-editor-empty:first-child::before]:h-0 [&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none [&_.ProseMirror_p.is-editor-empty:first-child::before]:cursor-text',
  '[&_.cw-emoji-wrap]:inline-flex [&_.cw-emoji-wrap]:items-center [&_.cw-emoji-wrap]:align-middle',
  '[&_.ProseMirror_img.cw-emoji]:inline-block [&_.ProseMirror_img.cw-emoji]:h-[1.25em] [&_.ProseMirror_img.cw-emoji]:w-[1.25em] [&_.ProseMirror_img.cw-emoji]:max-h-[1.25em] [&_.ProseMirror_img.cw-emoji]:max-w-[1.25em] [&_.ProseMirror_img.cw-emoji]:shrink-0 [&_.ProseMirror_img.cw-emoji]:object-contain [&_.ProseMirror_img.cw-emoji]:align-middle',
].join(' ')

/** 与 `CwChatMessageComposer` 移动端壳内 `.cw-chat-message-composer-mobile__field` 对齐 */
export const messageInputMobileCompactFieldClass = [
  'cw-chat-message-composer-mobile__field',
  'flex min-h-0 min-w-0 h-full w-full flex-1 flex-col justify-center overflow-y-auto overflow-x-hidden cursor-text border-0 bg-transparent px-2 py-0 shadow-none outline-none ring-0',
  chatMessageBodyTextClass,
  'leading-[var(--line-height-composer)] text-[var(--text-color-primary)]',
  '[&_.ProseMirror]:min-h-0 [&_.ProseMirror]:[font-size:inherit] [&_.ProseMirror]:text-[var(--text-color-primary)] [&_.ProseMirror]:leading-[var(--line-height-composer)] [&_.ProseMirror]:outline-none',
  '[&_.ProseMirror_p.is-editor-empty:first-child::before]:hidden',
  '[&_.cw-emoji-wrap]:inline-flex [&_.cw-emoji-wrap]:items-center [&_.cw-emoji-wrap]:align-middle',
  '[&_.ProseMirror_img.cw-emoji]:inline-block [&_.ProseMirror_img.cw-emoji]:h-[1.25em] [&_.ProseMirror_img.cw-emoji]:w-[1.25em]',
].join(' ')

export const messageInputWorkspaceInlineFieldClass = [
  'flex min-h-0 min-w-0 w-full flex-col overflow-y-auto cursor-text border-0 bg-transparent px-0 py-0',
  chatMessageBodyTextClass,
  'leading-[var(--line-height-composer)] text-[var(--text-color-primary)] outline-none',
  '[&_.ProseMirror]:min-h-[var(--line-height-composer)] [&_.ProseMirror]:[font-size:inherit] [&_.ProseMirror]:text-[var(--text-color-primary)] [&_.ProseMirror]:leading-[var(--line-height-composer)] [&_.ProseMirror]:outline-none',
  '[&_.ProseMirror_p.is-editor-empty:first-child::before]:text-[var(--text-color-placeholder)] [&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left [&_.ProseMirror_p.is-editor-empty:first-child::before]:h-0 [&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none [&_.ProseMirror_p.is-editor-empty:first-child::before]:cursor-text',
  '[&_.cw-emoji-wrap]:inline-flex [&_.cw-emoji-wrap]:items-center [&_.cw-emoji-wrap]:align-middle',
  '[&_.ProseMirror_img.cw-emoji]:inline-block [&_.ProseMirror_img.cw-emoji]:h-[1.25em] [&_.ProseMirror_img.cw-emoji]:w-[1.25em]',
].join(' ')

export const messageInputWorkspaceFieldClass = [
  `flex min-h-0 min-w-0 w-full flex-col overflow-y-auto cursor-text border-0 bg-transparent ${CW_WORKSPACE_CHAT_INSET_PAD_X} pt-2.5 pb-1`,
  chatMessageBodyTextClass,
  'leading-[var(--line-height-composer)] text-[var(--text-color-primary)] outline-none',
  '[&_.ProseMirror]:min-h-[var(--line-height-composer)] [&_.ProseMirror]:[font-size:inherit] [&_.ProseMirror]:text-[var(--text-color-primary)] [&_.ProseMirror]:leading-[var(--line-height-composer)] [&_.ProseMirror]:outline-none',
  '[&_.ProseMirror_p.is-editor-empty:first-child::before]:text-[var(--text-color-placeholder)] [&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left [&_.ProseMirror_p.is-editor-empty:first-child::before]:h-0 [&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none [&_.ProseMirror_p.is-editor-empty:first-child::before]:cursor-text',
  '[&_.cw-emoji-wrap]:inline-flex [&_.cw-emoji-wrap]:items-center [&_.cw-emoji-wrap]:align-middle',
  '[&_.ProseMirror_img.cw-emoji]:inline-block [&_.ProseMirror_img.cw-emoji]:h-[1.25em] [&_.ProseMirror_img.cw-emoji]:w-[1.25em]',
].join(' ')

export const messageInputBase: CwMessageInputLayoutClasses = {
  root: `cw-message-input relative flex min-h-0 w-full min-w-0 flex-1 flex-col ${APP_PAGE_CHROME_SAFE_BOTTOM_CLASS}`,
  fieldShell: 'flex min-h-0 min-w-0 w-full max-h-full flex-1 flex-col',
  field: messageInputFieldDefault,
  fieldDisabled: 'opacity-50 pointer-events-none',
}

export function resolveMessageInputLayoutClasses(
  fieldLayout: CwMessageInputFieldLayout,
): CwMessageInputLayoutClasses {
  if (fieldLayout === 'workspace' || fieldLayout === 'workspaceInline') {
    return {
      ...messageInputBase,
      root: 'cw-message-input relative flex min-h-0 w-full min-w-0 flex-col',
      fieldShell: 'flex min-h-0 min-w-0 w-full flex-col',
      field:
        fieldLayout === 'workspaceInline'
          ? messageInputWorkspaceInlineFieldClass
          : messageInputWorkspaceFieldClass,
    }
  }
  if (fieldLayout === 'mobileCompact') {
    return {
      ...messageInputBase,
      root: 'cw-message-input relative flex h-full min-h-0 w-full min-w-0 flex-col',
      fieldShell: 'flex min-h-0 min-w-0 h-full w-full flex-1 flex-col',
      field: messageInputMobileCompactFieldClass,
    }
  }
  return messageInputBase
}
