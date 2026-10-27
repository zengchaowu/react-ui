import { createSliderCaptchaApi } from '@zengchaowu/shared/functions/captcha/createSliderCaptchaApi'
import type { CreateSliderCaptchaApiDeps } from '@zengchaowu/shared/functions/captcha/types'
import type { CwDynamicDialogConfig } from '../CwDynamicDialog/types'
import { openSliderCaptchaToken } from '../CwSliderCaptchaDialog/showSliderCaptchaDialog'
import { preloadTurnstileScript } from './composables/useTurnstile'
import { openTurnstileCaptchaToken } from './showTurnstileCaptchaDialog'
import type { TurnstileWidgetSize } from '@zengchaowu/ui-shared/components/CwTurnstileCaptchaDialog/types'

export type CreateCaptchaVerifyDialogDeps = CreateSliderCaptchaApiDeps & {
  /** 默认 Turnstile widget 尺寸；也可在 open 时覆盖 */
  widgetSize?: TurnstileWidgetSize
  /** Turnstile 弹窗外壳 class / config */
  turnstileDialog?: {
    dialogContentClass?: string
    config?: Partial<CwDynamicDialogConfig>
  }
}

export type OpenCaptchaVerifyDialogOptions = {
  provider?: 'slider' | 'turnstile'
  siteKey?: string
  preloadPromise?: Promise<void>
  widgetSize?: TurnstileWidgetSize
}

export type CaptchaVerifyDialogApi = {
  openCaptchaVerifyDialog: (
    options?: OpenCaptchaVerifyDialogOptions,
  ) => Promise<string | null>
  openSliderCaptchaVerifyDialog: () => Promise<string | null>
  preloadTurnstileScript: typeof preloadTurnstileScript
}

/**
 * 站点侧人机验证入口工厂：滑块走 shared API，Turnstile 走本组件。
 * 各站只需注入 `buildApiUrl` + `fetch`。
 *
 * 与 shared 里 `window.xxx.bind(window)`、站点 `browserFetch` 同一套路：
 * 裸传 `window.fetch` 时先 bind，避免工厂内 `deps.fetch(...)` Illegal invocation。
 */
export function createCaptchaVerifyDialog(
  deps: CreateCaptchaVerifyDialogDeps,
): CaptchaVerifyDialogApi {
  const fetch = deps.fetch.bind(
    globalThis,
  ) as CreateSliderCaptchaApiDeps['fetch']

  const sliderCaptchaApi = createSliderCaptchaApi({
    buildApiUrl: deps.buildApiUrl,
    fetch,
  })

  async function openCaptchaVerifyDialog(
    options?: OpenCaptchaVerifyDialogOptions,
  ): Promise<string | null> {
    const provider = options?.provider ?? 'slider'

    if (provider === 'slider') {
      return openSliderCaptchaToken({
        onGenerate: () => sliderCaptchaApi.generate(),
        onVerify: (id, offsetX) => sliderCaptchaApi.verify(id, offsetX),
      })
    }

    return openTurnstileCaptchaToken({
      siteKey: options?.siteKey ?? '',
      preloadPromise: options?.preloadPromise ?? preloadTurnstileScript(),
      widgetSize: options?.widgetSize ?? deps.widgetSize,
      dialogContentClass: deps.turnstileDialog?.dialogContentClass,
      dialogConfig: deps.turnstileDialog?.config,
    })
  }

  function openSliderCaptchaVerifyDialog(): Promise<string | null> {
    return openCaptchaVerifyDialog({ provider: 'slider' })
  }

  return {
    openCaptchaVerifyDialog,
    openSliderCaptchaVerifyDialog,
    preloadTurnstileScript,
  }
}
