import type { CwDynamicDialogConfig } from '../components/CwDynamicDialog/types'

export type OverlayDialogChrome = 'light' | 'dark' | 'none'

const overlayDialogChromeClass: Record<
  Exclude<OverlayDialogChrome, 'none'>,
  string
> = {
  light:
    '!bg-[var(--bg-color-container,#fff)] shadow-xl transition-opacity duration-300',
  dark:
    '!bg-[var(--bg-color-page,var(--bg-color-container,#fff))] shadow-xl transition-opacity duration-300',
}

/** Dialog / Sheet 内根：填满宿主，供 CwStackShell 等 flex 子树 */
export const CW_OVERLAY_DIALOG_HOST_CLASS =
  'flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden'

/** 宽屏 Dialog 顶栏 / header 条 */
export const CW_OVERLAY_DIALOG_SURFACE_CLASS =
  'bg-[var(--bg-color-container,#fff)] text-[var(--text-color-primary)]'

/** 宽屏 Dialog 表单内容区：灰底 + 白表单行 */
export const CW_OVERLAY_DIALOG_CONTENT_SURFACE_CLASS =
  'bg-[var(--bg-color-page,#f5f6f7)] text-[var(--text-color-primary)]'

/** 默认 modal chrome（阴影白底） */
export const CW_OVERLAY_DIALOG_DEFAULT_CHROME_CLASS =
  '!bg-[var(--bg-color-container,#fff)] shadow-xl transition-opacity duration-300'

/**
 * 从 preset 映射拼接 content class（完整静态类名，供 Tailwind JIT 扫描）。
 */
export function buildOverlayDialogContentClass<P extends string>(
  presets: Record<P, string>,
  preset: P,
  options?: {
    chrome?: OverlayDialogChrome
    /** 固定 chrome 类（优先于 chrome 枚举） */
    fixedChromeClass?: string
  },
): string {
  const chromeClass =
    options?.fixedChromeClass ??
    (options?.chrome && options.chrome !== 'none'
      ? overlayDialogChromeClass[options.chrome]
      : '')
  return [presets[preset], chromeClass].filter(Boolean).join(' ')
}

function fullscreenOverlayConfig(
  overrides?: Partial<CwDynamicDialogConfig>,
): CwDynamicDialogConfig {
  return {
    variant: 'fullscreen',
    bodyPadding: false,
    bodyScroll: false,
    ...overrides,
  }
}

function modalOverlayConfig(
  contentClass: string,
  overrides?: Partial<CwDynamicDialogConfig>,
): CwDynamicDialogConfig {
  return {
    variant: 'modal',
    bodyPadding: false,
    bodyScroll: false,
    contentTransition: 'fade',
    content: { class: contentClass },
    ...overrides,
  }
}

/** 窄屏 fullscreen / 宽屏 modal（fade、flex 高度链） */
export function resolveResponsiveOverlayDialogConfig(
  isBelowMd: boolean,
  options: {
    contentClass: string
    fullscreen?: Partial<CwDynamicDialogConfig>
    modal?: Partial<CwDynamicDialogConfig>
  },
): CwDynamicDialogConfig {
  if (isBelowMd) {
    return fullscreenOverlayConfig(options.fullscreen)
  }
  return modalOverlayConfig(options.contentClass, options.modal)
}
