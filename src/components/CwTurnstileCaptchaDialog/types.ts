import type { CwDynamicDialogConfig } from '../CwDynamicDialog/types'

export type TurnstileWidgetSize = 'normal' | 'compact' | 'invisible'

export interface CwTurnstileCaptchaDialogStyles {
  root: string
  container: string
  loading: string
  error: string
}

export interface CwTurnstileCaptchaDialogTexts {
  title: string
  loading: string
  failed: string
}

export interface ShowTurnstileCaptchaDialogOptions {
  siteKey: string
  texts?: Partial<CwTurnstileCaptchaDialogTexts>
  /** 可选：提前加载脚本的 Promise（如登录页预热） */
  preloadPromise?: Promise<void>
  widgetSize?: TurnstileWidgetSize
  /** 追加到 modal content 壳的 class */
  dialogContentClass?: string
  /** 与默认 config 合并（header / closeOnClickOutside 等仍由组件保证） */
  dialogConfig?: Partial<CwDynamicDialogConfig>
  onSuccess?: (token: string) => void
}

export type ShowTurnstileCaptchaDialogResult = string | 'cancel'
