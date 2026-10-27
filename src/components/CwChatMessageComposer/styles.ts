import type { CwChatMessageComposerRootLayout } from './types'
import type { CwChatMessageComposerStyles } from '@zengchaowu/ui-shared/components/CwChatMessageComposer/types'
import { APP_PAGE_CHROME_SAFE_BOTTOM_CLASS } from '@zengchaowu/ui-shared/constants/appSafeAreaClasses'
import { CW_WORKSPACE_CHAT_RADIUS, CW_WORKSPACE_CHAT_INSET_PAD_X } from '../CwChatMessageCell/chatWorkspaceSurface'

const mobileSideBtnClass =
  'inline-flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center border-0 bg-transparent p-0 text-[var(--text-color-primary)] transition-[color,transform] duration-200 ease-out hover:text-[var(--brand-color-6)] active:scale-95 active:text-[var(--brand-color-6)] aria-disabled:cursor-not-allowed aria-disabled:pointer-events-none aria-disabled:opacity-45'

/** 移动端中间输入区 / 按住说话：微信式圆角灰底 */
export const mobileComposerInputSurfaceClass =
  'overflow-hidden rounded-lg bg-[var(--bg-color-secondarycontainer)]'

const workspaceActionBtnClass =
  'inline-flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center border-0 bg-transparent p-0 text-[var(--text-color-primary)] transition-[color,transform] duration-200 ease-out hover:text-[var(--brand-color-6)] active:scale-95 active:text-[var(--brand-color-6)] disabled:cursor-not-allowed disabled:pointer-events-none disabled:opacity-45 aria-disabled:cursor-not-allowed aria-disabled:pointer-events-none aria-disabled:opacity-45'

const workspaceIconBtnClass =
  'inline-flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-md border-0 bg-transparent p-0 text-[var(--text-color-secondary)] transition-[color,background-color,transform] duration-200 ease-out hover:bg-[var(--bg-color-component-hover)] hover:text-[var(--text-color-primary)] active:scale-95 disabled:cursor-not-allowed disabled:pointer-events-none disabled:opacity-45'

export const composerBase: CwChatMessageComposerStyles = {
  /** `shrink-0`：高度随内容，避免在纵向分栏/窄屏里被 `flex-1` 撑满整块底部区域 */
  root: 'cw-chat-message-composer flex min-h-0 min-w-0 w-full shrink-0 flex-col bg-[var(--bg-color-container)]',
  toolbarFileInput: 'fixed -left-[9999px] top-0 h-px w-px opacity-0',
  replyPreviewWrap:
    'mx-3 flex min-w-0 w-fit max-w-full shrink-0 justify-start pt-1.5 pb-1.5',
  mobileShell:
    'cw-chat-message-composer-mobile relative w-full shrink-0 bg-[var(--bg-color-container)] px-1.5 pt-0.5 [&_.cw-chat-message-composer-mobile__inner]:rounded-none [&_.cw-chat-message-composer-mobile__inner]:border-0 [&_.cw-chat-message-composer-mobile__inner]:bg-transparent',
  mobileSideBtn: mobileSideBtnClass,
  mobileSideBtnActive: '!text-[var(--brand-color-6)]',
  mobileSendBtn:
    [
      'inline-flex h-7 shrink-0 cursor-pointer items-center justify-center rounded-md border-0',
      'bg-[var(--brand-color-6)] px-2.5',
      '[font-size:var(--font-size-caption)] font-medium leading-none whitespace-nowrap text-[var(--text-color-anti)]',
      'transition-[width,padding,background-color,color,transform] duration-200 ease-[cubic-bezier(0.32,0.72,0,1)]',
      'hover:bg-[var(--brand-color-hover)] active:scale-[0.98]',
      'aria-disabled:cursor-not-allowed aria-disabled:pointer-events-none aria-disabled:opacity-45',
    ].join(' '),
  /** 动画外层：高度由 Transition 从 0 展开 */
  mobileAccessoryDock:
    'cw-chat-message-composer-mobile-dock w-full shrink-0 overflow-hidden bg-[var(--bg-color-container)]',
  mobileAccessoryDockInner:
    `flex h-[16.25rem] max-h-[42dvh] min-h-[14rem] min-w-0 flex-col ${APP_PAGE_CHROME_SAFE_BOTTOM_CLASS}`,
  workspaceShell:
    `cw-chat-message-composer-workspace flex min-h-0 min-w-0 w-full flex-col overflow-hidden ${CW_WORKSPACE_CHAT_RADIUS} border border-[var(--border-color-emphasis)] bg-[var(--bg-color-container)]`,
  workspaceFooter:
    `flex min-h-0 min-w-0 shrink-0 items-center gap-2 ${CW_WORKSPACE_CHAT_INSET_PAD_X} pb-2.5 pt-0`,
  workspaceFooterLeft: 'flex min-w-0 flex-1 items-center gap-1.5',
  workspaceFooterRight: 'ml-auto flex shrink-0 items-center gap-1.5',
  workspaceMetaBtn:
    'inline-flex h-7 max-w-full shrink-0 cursor-pointer items-center gap-1 rounded-full border-0 bg-[var(--bg-color-secondarycontainer)] px-2.5 [font-size:var(--font-size-caption)] leading-none text-[var(--text-color-primary)] transition-colors hover:bg-[var(--bg-color-component-hover)] disabled:cursor-not-allowed disabled:opacity-45',
  workspaceMetaBtnIcon:
    'inline-flex shrink-0 items-center justify-center [font-size:var(--font-size-body)] leading-none',
  workspaceMetaBtnChevron: 'shrink-0 text-[var(--text-color-placeholder)]',
  workspaceModeBtn:
    'inline-flex h-7 shrink-0 cursor-pointer items-center gap-0.5 rounded-md border-0 bg-transparent px-1.5 [font-size:var(--font-size-caption)] leading-none text-[var(--text-color-secondary)] transition-colors hover:bg-[var(--bg-color-component-hover)] hover:text-[var(--text-color-primary)] disabled:cursor-not-allowed disabled:opacity-45',
  workspaceIconBtn: workspaceIconBtnClass,
  workspaceSendBtn:
    'cw-chat-message-composer-workspace__send ' + workspaceActionBtnClass,
  workspaceSendBtnDisabled:
    'pointer-events-none text-[var(--text-color-disabled)] hover:opacity-100 active:scale-100',
  workspaceStopBtn:
    'cw-chat-message-composer-workspace__stop inline-flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center border-0 bg-transparent p-0 text-[var(--error-color-6)] transition-[color,opacity,transform] duration-200 ease-out hover:text-[var(--error-color-6)] hover:opacity-80 active:scale-95 active:text-[var(--error-color-6)] disabled:cursor-not-allowed disabled:pointer-events-none disabled:opacity-45 aria-disabled:cursor-not-allowed aria-disabled:pointer-events-none aria-disabled:opacity-45',
}

export function resolveComposerRootClass(
  layout: CwChatMessageComposerRootLayout,
): string {
  if (layout === 'fillPane') {
    return 'cw-chat-message-composer flex min-h-0 min-w-0 w-full flex-1 flex-col bg-[var(--bg-color-container)]'
  }
  if (layout === 'transparentShell') {
    return 'flex min-h-0 min-w-0 w-full shrink-0 flex-col bg-transparent'
  }
  return composerBase.root
}
