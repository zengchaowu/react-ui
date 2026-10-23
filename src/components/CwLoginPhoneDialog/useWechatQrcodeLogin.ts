import { useCallback, useEffect, useRef, useState } from 'react'
import type { TokenPair } from '@zengchaowu/shared/types/auth'
import type {
  WechatPcQrcodeGenerateResult,
  WechatPcQrcodeLoginStatus,
} from '@zengchaowu/shared/functions/wechat/openPlatform/resolveWechatPcQrcodeLoginSession'
import { isWechatOaFollowQrcodeResult } from '@zengchaowu/shared/functions/wechat/openPlatform/resolveWechatPcQrcodeLoginSession'
import {
  mountWechatOpenPlatformWxLogin,
  createBoundWechatWxLoginDocumentDeps,
} from '@zengchaowu/shared/functions/wechat/openPlatform/mountWechatOpenPlatformWxLogin'
import { WECHAT_OPEN_PLATFORM_WX_LOGIN_MINIMAL_CSS } from '@zengchaowu/shared/functions/wechat/openPlatform/encodeWechatOpenPlatformWxLoginHrefCss'

export interface UseWechatQrcodeLoginOptions {
  containerId: string
  generateQrcode: () => Promise<WechatPcQrcodeGenerateResult>
  pollLogin: (options: {
    state: string
    signal?: AbortSignal
  }) => Promise<WechatPcQrcodeLoginStatus>
  onSuccess: (pair: TokenPair) => void | Promise<void>
  /** 覆盖默认极简样式；传空字符串可禁用（仅 open_platform） */
  customCss?: string
  style?: string
}

function mountOaFollowQrcodeImage(containerId: string, qrcodeUrl: string) {
  const host = document.getElementById(containerId)
  if (!host) throw new Error(`未找到微信二维码容器 #${containerId}`)
  host.innerHTML = ''
  const img = document.createElement('img')
  img.src = qrcodeUrl
  img.alt = '微信登录二维码'
  img.style.display = 'block'
  img.style.width = '100%'
  img.style.height = '100%'
  img.style.maxWidth = '100%'
  img.style.maxHeight = '100%'
  img.style.objectFit = 'contain'
  img.style.border = '0'
  host.appendChild(img)
}

/** PC 微信扫码登录：开放平台 iframe 或公众号关注码图片 + 轮询 */
export function useWechatQrcodeLogin(options: UseWechatQrcodeLoginOptions) {
  const [qrcodeReady, setQrcodeReady] = useState(false)
  const [qrcodeHint, setQrcodeHint] = useState('')
  const [qrcodeLoading, setQrcodeLoading] = useState(false)

  const optionsRef = useRef(options)
  optionsRef.current = options

  const abortControllerRef = useRef<AbortController | null>(null)
  const sessionIdRef = useRef(0)

  const stop = useCallback(() => {
    abortControllerRef.current?.abort()
    abortControllerRef.current = null
  }, [])

  const start = useCallback(async (): Promise<void> => {
    stop()
    const currentSession = ++sessionIdRef.current
    const abortController = new AbortController()
    abortControllerRef.current = abortController
    const { signal } = abortController

    setQrcodeLoading(true)
    setQrcodeReady(false)
    setQrcodeHint('')

    let state = ''

    try {
      const qrcode = await optionsRef.current.generateQrcode()
      if (currentSession !== sessionIdRef.current || signal.aborted) return

      state = qrcode.state

      if (isWechatOaFollowQrcodeResult(qrcode)) {
        mountOaFollowQrcodeImage(optionsRef.current.containerId, qrcode.qrcodeUrl)
      } else {
        const customCss =
          optionsRef.current.customCss === undefined
            ? WECHAT_OPEN_PLATFORM_WX_LOGIN_MINIMAL_CSS
            : optionsRef.current.customCss

        await mountWechatOpenPlatformWxLogin(
          {
            containerId: optionsRef.current.containerId,
            appId: qrcode.appId,
            redirectUri: qrcode.redirectUri,
            state: qrcode.state,
            scope: qrcode.scope,
            selfRedirect: true,
            style: optionsRef.current.style ?? 'black',
            customCss: customCss || undefined,
          },
          {
            document: createBoundWechatWxLoginDocumentDeps(document),
          },
        )
      }

      if (currentSession !== sessionIdRef.current || signal.aborted) return

      setQrcodeReady(true)
      setQrcodeHint('')
      setQrcodeLoading(false)
    } catch (error) {
      if (currentSession !== sessionIdRef.current || signal.aborted) return
      setQrcodeReady(false)
      setQrcodeHint(
        error instanceof Error ? error.message : '微信扫码登录暂不可用',
      )
      setQrcodeLoading(false)
      return
    }

    try {
      const result = await optionsRef.current.pollLogin({ state, signal })

      if (currentSession !== sessionIdRef.current || signal.aborted) return

      if (result.status === 'success' && result.tokenPair) {
        await optionsRef.current.onSuccess(result.tokenPair)
        return
      }

      if (result.status === 'expired') {
        setQrcodeReady(false)
        setQrcodeHint('二维码已过期，正在刷新…')
        await start()
      }
    } catch (error) {
      if (currentSession !== sessionIdRef.current || signal.aborted) return
      setQrcodeReady(false)
      setQrcodeHint(
        error instanceof Error ? error.message : '微信扫码登录暂不可用',
      )
    }
  }, [stop])

  useEffect(() => {
    return () => {
      sessionIdRef.current += 1
      stop()
    }
  }, [stop])

  return {
    qrcodeReady,
    qrcodeHint,
    qrcodeLoading,
    start,
    stop,
  }
}
