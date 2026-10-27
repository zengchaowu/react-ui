import { useEffect, useMemo, useRef, useState } from 'react'
import { useTurnstile } from './composables/useTurnstile'
import { turnstileCaptchaDialogBase } from '@zengchaowu/ui-shared/components/CwTurnstileCaptchaDialog/styles'
import { defaultTexts } from '@zengchaowu/ui-shared/components/CwTurnstileCaptchaDialog/texts'
import type { CwTurnstileCaptchaDialogTexts, TurnstileWidgetSize } from '@zengchaowu/ui-shared/components/CwTurnstileCaptchaDialog/types'

export interface CwTurnstileCaptchaDialogContentProps {
  siteKey: string
  texts?: Partial<CwTurnstileCaptchaDialogTexts>
  preloadPromise?: Promise<void>
  widgetSize?: TurnstileWidgetSize
  /** 验证成功（对应 Vue `success` 事件） */
  onSuccess?: (token: string) => void
  /** 验证失败（对应 Vue `failed` 事件） */
  onFailed?: (message: string) => void
}

export function CwTurnstileCaptchaDialogContent({
  siteKey,
  texts: textsProp,
  preloadPromise,
  widgetSize,
  onSuccess,
  onFailed,
}: CwTurnstileCaptchaDialogContentProps) {
  const texts = useMemo(
    () => ({ ...defaultTexts, ...(textsProp ?? {}) }) as CwTurnstileCaptchaDialogTexts,
    [textsProp],
  )

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const turnstileContainerRef = useRef<HTMLDivElement | null>(null)
  const turnstile = useTurnstile(siteKey, turnstileContainerRef, { widgetSize })
  const { ensureWidget, waitForVerification } = turnstile

  const onSuccessRef = useRef(onSuccess)
  onSuccessRef.current = onSuccess
  const onFailedRef = useRef(onFailed)
  onFailedRef.current = onFailed
  const failedTextRef = useRef(texts.failed)
  failedTextRef.current = texts.failed

  useEffect(() => {
    let cancelled = false

    const run = async (): Promise<void> => {
      try {
        await preloadPromise
        await ensureWidget()
        if (cancelled) return
        setLoading(false)
        const token = await waitForVerification()
        if (cancelled) return
        onSuccessRef.current?.(token)
      } catch (err: unknown) {
        if (cancelled) return
        setLoading(false)
        const message =
          err instanceof Error ? err.message : failedTextRef.current
        setError(message)
        onFailedRef.current?.(message)
      }
    }

    void run()

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className={turnstileCaptchaDialogBase.root}>
      <div
        ref={turnstileContainerRef}
        className={turnstileCaptchaDialogBase.container}
      >
        {loading ? (
          <p className={turnstileCaptchaDialogBase.loading}>{texts.loading}</p>
        ) : null}
      </div>
      {error ? (
        <p className={turnstileCaptchaDialogBase.error}>{error}</p>
      ) : null}
    </div>
  )
}

export default CwTurnstileCaptchaDialogContent
