import {
  CW_OVERLAY_MODAL_Z_CLASS,
  CW_OVERLAY_TOAST_Z_CLASS,
} from '@zengchaowu/ui-shared/constants/cwOverlayZIndex'
import {
  CW_OVERLAY_DIALOG_BODY_BASE_CLASS,
  CW_OVERLAY_ELECTRON_NO_DRAG_CLASS,
  CW_OVERLAY_HEADER_BAR_CLASS,
  CW_OVERLAY_DIALOG_CLOSE_BUTTON_ROOT_CLASS,
  CW_OVERLAY_ICON_CLOSE_BUTTON_FOCUSED_CLASS,
} from '@zengchaowu/ui-shared/constants/cwOverlayHeaderTitle'
import type { CwDynamicDialogStyles } from './types'
import { mergeOverlayTailwindClass } from '@zengchaowu/ui-shared/functions/ui/mergeOverlayTailwindClass'

/** 库内 modal / toast / hud 壳层 class，不对外暴露为可覆盖 styles */
export const dialogBase: CwDynamicDialogStyles = {
  overlay: [
    `cw-dynamic-dialog fixed inset-0 ${CW_OVERLAY_MODAL_Z_CLASS} flex justify-center transition-opacity duration-300 p-4`,
    CW_OVERLAY_ELECTRON_NO_DRAG_CLASS,
  ].join(' '),
  overlayAlignCenter: 'items-center',
  overlayAlignUpper: 'items-start pt-[min(12vh,5.5rem)]',
  overlayVisible: 'opacity-100',
  overlayHidden: 'opacity-0 pointer-events-none',
  overlayFullscreen: [
    `cw-dynamic-dialog fixed inset-0 ${CW_OVERLAY_MODAL_Z_CLASS} flex flex-col transition-opacity duration-300`,
    CW_OVERLAY_ELECTRON_NO_DRAG_CLASS,
  ].join(' '),
  overlayToast: `cw-dynamic-dialog fixed inset-x-0 ${CW_OVERLAY_TOAST_Z_CLASS} box-border flex justify-center px-4 pointer-events-none transition-opacity duration-[250ms]`,
  overlayToastTop: 'top-[var(--toast-inset-top)]',
  overlayToastMiddle: 'top-1/2 -translate-y-1/2',
  overlayToastBottom: 'bottom-[var(--toast-inset-bottom)]',
  overlayHud: `cw-dynamic-dialog fixed inset-0 ${CW_OVERLAY_TOAST_Z_CLASS} flex items-center justify-center p-6 transition-opacity duration-200`,
  backdrop: 'absolute inset-0 transition-opacity duration-300',
  backdropDefault: 'bg-[var(--mask-active)]',
  backdropVisible: 'opacity-100',
  backdropHidden: 'opacity-0',
  backdropHiddenVariant: 'opacity-0 pointer-events-none',
  /**
   * modal 默认面板：w-full + max-w-lg（32rem）。overlay 已有 p-4，窄屏不会贴边。
   * 列表/选择类弹窗在 content.class 里覆盖 max-w（如 max-w-[40rem]）；勿写带逗号的 min()，JIT 扫不到。
   */
  content: [
    'relative w-full min-w-0 max-w-lg max-h-[90vh] overflow-hidden flex flex-col rounded-lg bg-[var(--bg-color-container)] shadow-xl transition-opacity transition-transform duration-300',
    CW_OVERLAY_ELECTRON_NO_DRAG_CLASS,
  ].join(' '),
  contentFullscreen:
    'absolute inset-0 z-[var(--z-index-above)] flex min-h-0 flex-col overflow-hidden bg-transparent shadow-none',
  contentToast:
    'pointer-events-auto w-fit max-w-[min(20rem,calc(100vw-2rem))] bg-transparent transition-opacity duration-[250ms]',
  contentHud:
    'relative z-[var(--z-index-above)] pointer-events-auto flex min-w-[7.5rem] max-w-[min(20rem,calc(100vw-3rem))] flex-col items-center gap-3 rounded-xl bg-[var(--bg-color-container)] px-8 py-6 shadow-[0_8px_32px_var(--overlay-scrim-strong)] ring-1 ring-[var(--overlay-scrim-soft)]',
  contentHudNoMask:
    'pointer-events-auto flex min-w-[7.5rem] max-w-[min(20rem,calc(100vw-3rem))] flex-col items-center gap-3',
  contentVisible: 'opacity-100 scale-100',
  contentHidden: 'opacity-0 scale-95',
  contentDraggable: 'transition-none',
  header: CW_OVERLAY_HEADER_BAR_CLASS,
  /** 可拖拽标题栏仍用 pointer（与关闭钮等交互一致） */
  headerDraggable: 'cursor-pointer select-none',
  closeButtonStandalone: CW_OVERLAY_DIALOG_CLOSE_BUTTON_ROOT_CLASS,
  closeButton: CW_OVERLAY_DIALOG_CLOSE_BUTTON_ROOT_CLASS,
  closeButtonNormal: 'cursor-pointer',
  closeButtonHover: '',
  closeButtonFocused: CW_OVERLAY_ICON_CLOSE_BUTTON_FOCUSED_CLASS,
  closeIcon: '',
  body: CW_OVERLAY_DIALOG_BODY_BASE_CLASS,
}

/** 命令式登录等场景：只返回要覆盖的宽度 / 圆角（会与 dialogBase.content 合并） */
export function buildDialogModalContentClass(options?: {
  maxWidth?: 'sm' | 'unlock' | 'none'
  appendClass?: string
}): string {
  const parts: string[] = []
  if (options?.maxWidth === 'sm') parts.push('max-w-sm')
  if (options?.maxWidth === 'none') parts.push('max-w-none')
  if (options?.maxWidth === 'unlock') {
    // 左栏 20rem + 扫码 13.75rem + 内边距，收拢为紧凑双栏
    parts.push('max-w-[40rem]', 'rounded-xl')
  }
  const extra = options?.appendClass?.trim()
  if (extra) parts.push(extra)
  return parts.join(' ')
}

/**
 * 合并 modal content 壳 class（尺寸 / 圆角冲突组从 base 剔除后再追加 extra）。
 * @see mergeOverlayTailwindClass
 */
export function mergeDialogModalContentClass(base: string, extra?: string): string {
  return mergeOverlayTailwindClass(base, extra)
}
