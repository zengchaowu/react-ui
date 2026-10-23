import type { TokenPair } from '@zengchaowu/shared/types/auth'
import { resolveWechatPcQrcodeLoginSession } from '@zengchaowu/shared/functions/wechat/openPlatform/resolveWechatPcQrcodeLoginSession'
import { createDefaultApiErrorHandler } from '@zengchaowu/shared/functions/api/createDefaultApiErrorHandler'
import type { CaptchaChallenge } from '@zengchaowu/shared/functions/captcha/captchaPublicApi'
import type {
  FetchFunction,
  Response as SharedResponse,
} from '@zengchaowu/shared/references/fetch'
import { readIsBelowMdViewport } from '@zengchaowu/shared/functions/browser/readLayoutViewportSignals'
import { showCwToast } from '../components/CwToast/showCwToast'
import { showLoginDialog } from '../components/CwLoginDialog/showLoginDialog'
import type {
  CwLoginDialogAgreementLink,
  CwLoginDialogCarrierOneTap,
  CwLoginDialogCarrierOneTapRef,
  CwLoginDialogTexts,
  ShowLoginDialogOptions,
  ShowLoginDialogResult,
} from '../components/CwLoginDialog/types'
import type {
  CaptchaVerifyDialogApi,
  OpenCaptchaVerifyDialogOptions,
} from '../components/CwTurnstileCaptchaDialog/createCaptchaVerifyDialog'

export type CreateOpenPhoneLoginDialogDeps = {
  buildApiUrl: (path: string) => string
  setAuthToken: (token: string) => void
  setRefreshToken: (token: string) => void
  setAuthExpiresAt: (expiresAt: number) => void
  fetchChallenge: (phone: string) => Promise<CaptchaChallenge>
  openCaptchaVerifyDialog: (
    options?: OpenCaptchaVerifyDialogOptions,
  ) => Promise<string | null>
  preloadTurnstileScript: CaptchaVerifyDialogApi['preloadTurnstileScript']
  refreshCurrentUser: () => void | Promise<void>
  getCurrentUser: () => unknown
  /** SMS / 微信扫码 HTTP；默认 globalThis.fetch */
  fetch?: FetchFunction
  /** 持久化 token 后回调（如 admin 重调度刷新） */
  onTokensPersisted?: () => void
  texts?: CwLoginDialogTexts
  successToastMessage?: string
  /** 覆盖默认协议链接；传空数组可隐藏协议勾选 */
  agreementLinks?: CwLoginDialogAgreementLink[]
  onAgreementLink?: (id: string) => void
  /**
   * 覆盖默认展示。窄屏站内 CwStack 应走 push 子页，而不是再盖一层 overlay。
   */
  presentLoginDialog?: (
    options: ShowLoginDialogOptions,
  ) => Promise<ShowLoginDialogResult | 'cancel'>
  /**
   * 原生本机号一键登录。返回 null 则走短信。
   */
  tryCarrierOneTap?: () => Promise<{
    maskedPhone: string
    carrier: string
  } | null>
  /** 调原生 SDK 拿到厂商 accessToken */
  carrierGetAccessToken?: () => Promise<string>
  /**
   * 打开登录页前最多等待本机号探测的毫秒数。
   * 默认 0：立刻出登录页，探测完成后补齐一键登录按钮。
   * Cap 可传 120 以尽量首屏就带上按钮。
   */
  carrierOneTapProbeMs?: number
  /**
   * 是否启用微信扫码登录。默认按视口宽度决定。
   * 客户端壳（原生 App / Electron）内通常无法扫码，应显式传 false 只走手机号登录。
   */
  enableWechatQr?: boolean
}

const DEFAULT_LOGIN_TEXTS: CwLoginDialogTexts = {
  title: '登录以解锁更多功能',
  navTitle: '登录',
  phonePlaceholder: '请输入手机号',
  nextStep: '下一步',
  nextStepLoading: '发送中...',
  agreementPrefix: '已阅读并同意',
  agreementRequiredError: '请先阅读并同意相关协议',
  qrInstruction: '请使用微信扫描二维码登录',
  qrPlaceholder: '正在加载二维码…',
  otpNavTitle: '输入 6 位验证码',
  backLabel: '返回',
  otpMainTitle: '输入 6 位验证码',
  otpSentHint: '验证码已发送至 +{dialCode} {phone}',
  sendCodeButton: '重新发送',
  countdownText: '{seconds}秒',
  otpVerifyLoading: '验证中...',
  otpHelpLabel: '帮助',
  switchToQrLabel: '切换微信扫码登录',
  switchToPhoneLabel: '切换手机号登录',
  sendCodeError: '发送失败，请稍后重试',
  loginError: '验证码错误，请重新输入',
  loginErrorGeneral: '登录失败，请稍后重试',
  oneTapTitle: '手机号一键登录',
  oneTapButton: '手机号一键登录',
  oneTapOther: '其他登录方式',
  oneTapHint: '{carrier}提供认证服务',
  oneTapLoading: '登录中...',
}

const DEFAULT_AGREEMENT_LINKS: CwLoginDialogAgreementLink[] = [
  { id: 'user', text: '用户协议' },
  { id: 'privacy', text: '隐私政策' },
]

const DEFAULT_AGREEMENT_URLS: Record<string, string> = {
  user: 'https://users.zengchaowu.com/terms',
  privacy: 'https://users.zengchaowu.com/privacy',
}

function openDefaultAgreementLink(id: string) {
  const url = DEFAULT_AGREEMENT_URLS[id]
  if (!url || typeof window === 'undefined') return
  window.open(url, '_blank', 'noopener,noreferrer')
}

function expiresAtFromExpiresIn(expiresIn: number | undefined): number | null {
  if (typeof expiresIn !== 'number' || !Number.isFinite(expiresIn) || expiresIn <= 0) return null
  return Date.now() + expiresIn * 1000
}

type CarrierLoginTokens = {
  accessToken?: string
  refreshToken?: string
  expiresIn?: number
}

function isCarrierUserCancel(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false
  const rec = err as { code?: unknown; message?: unknown }
  const code = String(rec.code ?? '').trim()
  if (code === 'USER_CANCEL' || code === '700000' || code === '700001' || code === 'TIMEOUT' || code === '600015') return true
  const msg = String(rec.message ?? '')
  return msg.includes('取消') || msg.includes('超时')
}

function carrierLoginErrorMessage(err: unknown): string {
  if (err instanceof Error && err.message.trim()) return err.message.trim()
  if (err && typeof err === 'object' && 'message' in err) {
    const msg = String((err as { message?: unknown }).message ?? '').trim()
    if (msg) return msg
  }
  return '本机号登录失败，请改用短信'
}

function tokensFromCarrierLoginJson(json: Record<string, unknown>, ok: boolean) {
  const data = json?.data as CarrierLoginTokens | undefined
  const accessToken = data?.accessToken?.trim()
  const refreshToken = data?.refreshToken?.trim()
  const expiresAt = expiresAtFromExpiresIn(data?.expiresIn)
  if (!ok || !accessToken || !refreshToken || !expiresAt) {
    const msg = String(json?.message ?? '').trim()
    return { ok: false as const, error: msg || '本机号登录失败，请改用短信' }
  }
  return { ok: true as const, accessToken, refreshToken, expiresAt }
}

async function parseJsonSafe(res: SharedResponse): Promise<Record<string, unknown>> {
  return res.json().catch(() => ({}))
}

/** 可订阅的只读 ref（对齐 Vue shallowRef：补齐一键登录时通知 React 重渲染） */
function createCarrierOneTapRef(): {
  ref: CwLoginDialogCarrierOneTapRef
  set: (value: CwLoginDialogCarrierOneTap | undefined) => void
} {
  let current: CwLoginDialogCarrierOneTap | undefined
  const listeners = new Set<() => void>()
  return {
    ref: {
      get current() {
        return current
      },
      subscribe(listener: () => void) {
        listeners.add(listener)
        return () => {
          listeners.delete(listener)
        }
      },
    },
    set(value) {
      current = value
      listeners.forEach((listener) => listener())
    },
  }
}

/**
 * 工厂：各站手机号 / 微信扫码登录弹窗（单飞）。
 * 每个站在模块顶层调用一次，得到 openPhoneLoginDialog。
 * 微信扫码按 admin `pcLoginMode` 自动切换开放平台 / 公众号关注。
 */
export function createOpenPhoneLoginDialog(
  deps: CreateOpenPhoneLoginDialogDeps,
): () => Promise<boolean> {
  let activeLoginPromise: Promise<boolean> | null = null
  const baseTexts = deps.texts ?? DEFAULT_LOGIN_TEXTS
  const successToastMessage = deps.successToastMessage ?? '登录成功'
  const fetchImpl: FetchFunction =
    deps.fetch ?? (globalThis.fetch.bind(globalThis) as FetchFunction)

  function persistTokenPair(pair: TokenPair) {
    const accessToken = pair.accessToken?.trim()
    const refreshToken = pair.refreshToken?.trim()
    const expiresAt = expiresAtFromExpiresIn(pair.expiresIn)
    if (!accessToken || !refreshToken || !expiresAt) {
      throw new Error('登录失败：未获取到有效 token')
    }
    deps.setAuthToken(accessToken)
    deps.setRefreshToken(refreshToken)
    deps.setAuthExpiresAt(expiresAt)
    deps.onTokensPersisted?.()
    return accessToken
  }

  function wechatRequestDeps() {
    const { parseErrorAndThrow } = createDefaultApiErrorHandler()
    return {
      buildApiUrl: deps.buildApiUrl,
      parseErrorAndThrow,
      fetch: fetchImpl,
      AbortController: globalThis.AbortController,
      setTimeout: globalThis.setTimeout.bind(globalThis),
    }
  }

  async function sendSmsWithCaptcha(
    phone: string,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const challenge = await deps.fetchChallenge(phone)
      let captchaToken: string | undefined
      if (challenge.required) {
        if (challenge.provider === 'turnstile') {
          if (!challenge.siteKey) {
            return { success: false, error: '人机验证未配置，请联系管理员' }
          }
          const preloadPromise = deps.preloadTurnstileScript()
          const token = await deps.openCaptchaVerifyDialog({
            provider: 'turnstile',
            siteKey: challenge.siteKey,
            preloadPromise,
          })
          if (!token) return { success: false, error: '已取消人机验证' }
          captchaToken = token
        } else {
          const token = await deps.openCaptchaVerifyDialog({ provider: 'slider' })
          if (!token) return { success: false, error: '已取消人机验证' }
          captchaToken = token
        }
      }

      const res = await fetchImpl(deps.buildApiUrl('/sms/send'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone,
          ...(captchaToken ? { captchaToken } : {}),
        }),
      })
      const json = await parseJsonSafe(res)
      const data = json?.data as { ok?: boolean } | undefined
      if (!res.ok || data?.ok !== true) {
        const msg = String(json?.message ?? '').trim()
        return { success: false, error: msg || '验证码发送失败' }
      }
      return { success: true }
    } catch (err: unknown) {
      return {
        success: false,
        error: err instanceof Error ? err.message : '发送失败，请稍后重试',
      }
    }
  }

  return async function openPhoneLoginDialog(): Promise<boolean> {
    if (activeLoginPromise) return activeLoginPromise

    activeLoginPromise = (async () => {
      const carrier = createCarrierOneTapRef()

      const bindCarrierFromPre = (
        pre: { maskedPhone: string; carrier: string },
      ): CwLoginDialogCarrierOneTap => {
        const persistCarrier = async (access: string) => {
          const res = await fetchImpl(deps.buildApiUrl('/sms/carrier-login'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ accessToken: access }),
          })
          const json = await parseJsonSafe(res)
          const tokens = tokensFromCarrierLoginJson(json, res.ok)
          if (!tokens.ok) return { success: false as const, error: tokens.error }
          deps.setAuthToken(tokens.accessToken)
          deps.setRefreshToken(tokens.refreshToken)
          deps.setAuthExpiresAt(tokens.expiresAt)
          deps.onTokensPersisted?.()
          await deps.refreshCurrentUser()
          return {
            success: true as const,
            token: tokens.accessToken,
            userInfo: deps.getCurrentUser(),
          }
        }
        return {
          maskedPhone: pre.maskedPhone,
          carrier: pre.carrier,
          onLogin: async () => {
            try {
              const access = await deps.carrierGetAccessToken!()
              return persistCarrier(access)
            } catch (err: unknown) {
              if (isCarrierUserCancel(err)) {
                return { success: false as const, error: '' }
              }
              return {
                success: false as const,
                error: carrierLoginErrorMessage(err),
              }
            }
          },
        }
      }

      const runCarrierProbe = async () => {
        if (!deps.tryCarrierOneTap || !deps.carrierGetAccessToken) return
        try {
          const pre = await deps.tryCarrierOneTap()
          if (pre) carrier.set(bindCarrierFromPre(pre))
        } catch {
          /* 保持短信登录 */
        }
      }

      if (deps.tryCarrierOneTap && deps.carrierGetAccessToken) {
        const probeMs =
          typeof deps.carrierOneTapProbeMs === 'number' && deps.carrierOneTapProbeMs > 0
            ? deps.carrierOneTapProbeMs
            : 0
        if (probeMs > 0) {
          try {
            const pre = await Promise.race([
              deps.tryCarrierOneTap(),
              new Promise<null>((resolve) => {
                setTimeout(() => resolve(null), probeMs)
              }),
            ])
            if (pre) carrier.set(bindCarrierFromPre(pre))
            else void runCarrierProbe()
          } catch {
            void runCarrierProbe()
          }
        } else {
          void runCarrierProbe()
        }
      }

      const shouldEnableWechatQr = deps.enableWechatQr ?? !readIsBelowMdViewport()
      const session = shouldEnableWechatQr
        ? await resolveWechatPcQrcodeLoginSession(wechatRequestDeps())
        : null
      const texts: CwLoginDialogTexts = {
        ...baseTexts,
        qrInstruction: session?.qrInstruction ?? baseTexts.qrInstruction,
      }

      const present = deps.presentLoginDialog ?? showLoginDialog
      const result = await present({
        texts,
        agreementLinks: deps.agreementLinks ?? DEFAULT_AGREEMENT_LINKS,
        onAgreementLink: deps.onAgreementLink ?? openDefaultAgreementLink,
        generateWechatQrcode: session
          ? () => session.generateQrcode()
          : undefined,
        pollWechatLogin: session
          ? (options) => session.pollLoginStatus(options)
          : undefined,
        onWechatSuccess: session
          ? async (pair) => {
              persistTokenPair(pair)
              await deps.refreshCurrentUser()
            }
          : undefined,
        carrierOneTap: carrier.ref.current,
        carrierOneTapRef: carrier.ref,
        onSendCode: async (phone) => sendSmsWithCaptcha(phone),
        onLogin: async (phone, code) => {
          const res = await fetchImpl(deps.buildApiUrl('/sms/login'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone, code }),
          })
          const json = await parseJsonSafe(res)
          const data = json?.data as {
            accessToken?: string
            refreshToken?: string
            expiresIn?: number
          } | undefined
          const accessToken = data?.accessToken?.trim()
          const refreshToken = data?.refreshToken?.trim()
          const expiresAt = expiresAtFromExpiresIn(data?.expiresIn)
          if (!res.ok || !accessToken || !refreshToken || !expiresAt) {
            const msg = String(json?.message ?? '').trim()
            return { success: false, error: msg || '登录失败，请稍后重试' }
          }
          deps.setAuthToken(accessToken)
          deps.setRefreshToken(refreshToken)
          deps.setAuthExpiresAt(expiresAt)
          deps.onTokensPersisted?.()
          await deps.refreshCurrentUser()
          return { success: true, token: accessToken, userInfo: deps.getCurrentUser() }
        },
        onSuccess: () => {
          showCwToast({ message: successToastMessage, type: 'success' })
        },
      })
      return result !== 'cancel'
    })()

    try {
      return await activeLoginPromise
    } finally {
      activeLoginPromise = null
    }
  }
}
