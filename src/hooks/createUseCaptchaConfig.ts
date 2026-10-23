import { useCallback, useRef, useState } from 'react'
import {
  fetchCaptchaChallenge,
  fetchCaptchaPublicConfig,
  resolveCaptchaSiteKey,
  type CaptchaChallenge,
  type CaptchaMode,
  type CaptchaProvider,
  type CaptchaPublicApiDeps,
} from '@zengchaowu/shared/functions/captcha/captchaPublicApi'

export type CreateUseCaptchaConfigDeps = {
  buildApiUrl: (path: string) => string
  getFallbackSiteKey?: () => string
  fetch?: CaptchaPublicApiDeps['fetch']
}

export type UseCaptchaConfigResult = {
  enabled: boolean
  mode: CaptchaMode
  provider: CaptchaProvider | null
  siteKey: string
  loading: boolean
  loaded: boolean
  load: () => Promise<void>
  fetchChallenge: (phone: string) => Promise<CaptchaChallenge>
}

export function createUseCaptchaConfig(
  depsFactory: () => CreateUseCaptchaConfigDeps,
): () => UseCaptchaConfigResult {
  return function useCaptchaConfig(): UseCaptchaConfigResult {
    const [enabled, setEnabled] = useState(false)
    const [mode, setMode] = useState<CaptchaMode>('off')
    const [provider, setProvider] = useState<CaptchaProvider | null>(null)
    const [siteKey, setSiteKey] = useState('')
    const [loading, setLoading] = useState(false)
    const [loaded, setLoaded] = useState(false)

    const stateRef = useRef({ mode, provider, siteKey })
    stateRef.current = { mode, provider, siteKey }

    function captchaDeps(): CaptchaPublicApiDeps {
      const d = depsFactory()
      return {
        buildApiUrl: d.buildApiUrl,
        fetch: d.fetch,
        getFallbackSiteKey: d.getFallbackSiteKey,
      }
    }

    const load = useCallback(async (): Promise<void> => {
      if (loaded || loading) return
      setLoading(true)
      try {
        const config = await fetchCaptchaPublicConfig(captchaDeps())
        const fallback = String(depsFactory().getFallbackSiteKey?.() ?? '').trim()
        setMode(config?.mode ?? 'off')
        setEnabled(config?.enabled === true)
        setProvider(config?.provider ?? null)
        setSiteKey(resolveCaptchaSiteKey(config?.siteKey, fallback))
      } catch {
        const fallback = String(depsFactory().getFallbackSiteKey?.() ?? '').trim()
        setEnabled(false)
        setMode('off')
        setProvider(null)
        setSiteKey(resolveCaptchaSiteKey(null, fallback))
      } finally {
        setLoading(false)
        setLoaded(true)
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loaded, loading])

    const fetchChallenge = useCallback(
      async (phone: string): Promise<CaptchaChallenge> => {
        const { mode: m, provider: p, siteKey: k } = stateRef.current
        return fetchCaptchaChallenge(captchaDeps(), phone, {
          mode: m,
          provider: p,
          siteKey: k,
        })
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [],
    )

    return { enabled, mode, provider, siteKey, loading, loaded, load, fetchChallenge }
  }
}
