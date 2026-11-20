import {
  createCaptchaVerifyDialog as createCaptchaVerifyDialogCore,
  type CaptchaVerifyDialogApi,
  type CreateCaptchaVerifyDialogDeps,
} from '@zengchaowu/ui-shared/components/CwTurnstileCaptchaDialog/createCaptchaVerifyDialog'
import { openSliderCaptchaToken } from '../CwSliderCaptchaDialog/showSliderCaptchaDialog'
import { preloadTurnstileScript } from './composables/useTurnstile'
import { openTurnstileCaptchaToken } from './showTurnstileCaptchaDialog'

export type {
  CaptchaVerifyDialogApi,
  CreateCaptchaVerifyDialogDeps,
  OpenCaptchaVerifyDialogOptions,
} from '@zengchaowu/ui-shared/components/CwTurnstileCaptchaDialog/createCaptchaVerifyDialog'

/**
 * 站点侧人机验证入口工厂：滑块走 shared API，Turnstile 走本框架弹窗。
 * 各站只需注入 `buildApiUrl` + `fetch`。
 */
export function createCaptchaVerifyDialog(
  deps: CreateCaptchaVerifyDialogDeps,
): CaptchaVerifyDialogApi {
  return createCaptchaVerifyDialogCore(deps, {
    openSliderCaptchaToken,
    openTurnstileCaptchaToken,
    preloadTurnstileScript,
  })
}
