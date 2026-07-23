import type { CwTurnstileCaptchaDialogStyles } from './types'

export const defaultStyles: CwTurnstileCaptchaDialogStyles = {
  root: 'cw-turnstile-captcha-dialog flex min-w-0 w-full flex-col gap-2',
  container: 'flex min-h-[4.0625rem] w-full items-center justify-center',
  loading: 'text-sm text-[var(--text-color-secondary)]',
  error: 'text-xs text-[var(--error-color-6)]',
}
