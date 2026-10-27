import { useCallback, useRef, useState } from 'react'
import type { Dispatch, MutableRefObject, SetStateAction } from 'react'
import {
  preloadSliderCaptchaImage,
  toSliderCaptchaDataUrl,
} from '@zengchaowu/ui-shared/components/CwSliderCaptchaDialog/functions/index'
import type { CwSliderCaptchaChallenge, GenerateSliderCaptchaChallenge, VerifySliderCaptchaOffset } from '@zengchaowu/ui-shared/components/CwSliderCaptchaDialog/types'

export interface UseSliderCaptchaSessionOptions {
  onGenerate: GenerateSliderCaptchaChallenge
  onVerify: VerifySliderCaptchaOffset
  getTexts: () => {
    loadError: string
    verifyError: string
    imageLoadError: string
    notReady: string
  }
}

export interface UseSliderCaptchaSessionReturn {
  initialLoading: boolean
  refreshing: boolean
  verifying: boolean
  error: string
  challenge: CwSliderCaptchaChallenge | null
  challengeRef: MutableRefObject<CwSliderCaptchaChallenge | null>
  offsetX: number
  offsetXRef: MutableRefObject<number>
  backgroundSrc: string
  puzzleSrc: string
  setOffsetX: Dispatch<SetStateAction<number>>
  loadChallenge: (opts?: { refresh?: boolean }) => Promise<void>
  verifyOffset: (apiOffsetX: number) => Promise<string>
}

export function useSliderCaptchaSession(
  options: UseSliderCaptchaSessionOptions,
): UseSliderCaptchaSessionReturn {
  const optionsRef = useRef(options)
  optionsRef.current = options

  const [initialLoading, setInitialLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [error, setError] = useState('')
  const [challenge, setChallenge] = useState<CwSliderCaptchaChallenge | null>(
    null,
  )
  const challengeRef = useRef<CwSliderCaptchaChallenge | null>(null)
  const [offsetX, setOffsetXState] = useState(0)
  const offsetXRef = useRef(0)
  const [backgroundSrc, setBackgroundSrc] = useState('')
  const [puzzleSrc, setPuzzleSrc] = useState('')

  const setOffsetX = useCallback<Dispatch<SetStateAction<number>>>((value) => {
    const next =
      typeof value === 'function'
        ? (value as (prev: number) => number)(offsetXRef.current)
        : value
    offsetXRef.current = next
    setOffsetXState(next)
  }, [])

  const loadChallenge = useCallback(
    async (opts?: { refresh?: boolean }): Promise<void> => {
      const isRefresh = opts?.refresh === true && challengeRef.current !== null
      const t = optionsRef.current.getTexts()

      if (isRefresh) {
        setRefreshing(true)
        setOffsetX(0)
      } else if (!challengeRef.current) {
        setInitialLoading(true)
      }

      setError('')

      try {
        const data = await optionsRef.current.onGenerate()
        if (!data?.challengeId) {
          throw new Error(t.loadError)
        }

        const nextBackgroundSrc = toSliderCaptchaDataUrl(data.backgroundImage)
        const nextPuzzleSrc = toSliderCaptchaDataUrl(data.puzzleImage)
        try {
          await Promise.all([
            preloadSliderCaptchaImage(nextBackgroundSrc),
            preloadSliderCaptchaImage(nextPuzzleSrc),
          ])
        } catch {
          throw new Error(t.imageLoadError)
        }

        challengeRef.current = data
        setChallenge(data)
        setBackgroundSrc(nextBackgroundSrc)
        setPuzzleSrc(nextPuzzleSrc)
        setOffsetX(0)
      } catch (err: unknown) {
        const message =
          err instanceof Error && err.message ? err.message : t.loadError
        setError(message)
        throw err
      } finally {
        setInitialLoading(false)
        setRefreshing(false)
      }
    },
    [setOffsetX],
  )

  const verifyOffset = useCallback(async (apiOffsetX: number): Promise<string> => {
    const t = optionsRef.current.getTexts()
    const current = challengeRef.current
    if (!current) {
      throw new Error(t.notReady)
    }

    setVerifying(true)
    setError('')

    try {
      const token = await optionsRef.current.onVerify(
        current.challengeId,
        Math.round(apiOffsetX),
      )
      if (!token) {
        throw new Error(t.verifyError)
      }
      return token
    } catch (err: unknown) {
      const message =
        err instanceof Error && err.message ? err.message : t.verifyError
      setError(message)
      throw err
    } finally {
      setVerifying(false)
    }
  }, [])

  return {
    initialLoading,
    refreshing,
    verifying,
    error,
    challenge,
    challengeRef,
    offsetX,
    offsetXRef,
    backgroundSrc,
    puzzleSrc,
    setOffsetX,
    loadChallenge,
    verifyOffset,
  }
}
