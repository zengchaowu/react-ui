import { useCallback, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import type {
  VoiceHoldGestureZone,
  VoiceHoldInteractionMode,
  VoiceRecordEndPayload,
} from './voiceHoldTypes'

/** swipe-up 模式：上滑超过该像素视为取消 */
const VOICE_SWIPE_CANCEL_PX = 40

/** wechat-overlay：进入侧向手势前需先上滑的最小距离 */
const WECHAT_OVERLAY_LIFT_PX = 48

/** wechat-overlay：左右滑入取消/转文字区的水平阈值 */
const WECHAT_OVERLAY_SIDE_PX = 44

export interface UseCwAiChatComposerVoiceHoldOptions {
  disabled: boolean
  mode?: VoiceHoldInteractionMode
  onStart: () => void
  onEnd: (payload: VoiceRecordEndPayload) => void
}

export function useCwAiChatComposerVoiceHold(
  options: UseCwAiChatComposerVoiceHoldOptions,
) {
  const mode = options.mode ?? 'swipe-up'

  const [isRecording, setIsRecording] = useState(false)
  const [isCancelPending, setIsCancelPending] = useState(false)
  const [isConvertTextPending, setIsConvertTextPending] = useState(false)

  const isRecordingRef = useRef(false)
  const isCancelPendingRef = useRef(false)
  const isConvertTextPendingRef = useRef(false)
  const startRef = useRef({ x: 0, y: 0 })
  const activePointerIdRef = useRef<number | null>(null)

  const disabledRef = useRef(options.disabled)
  disabledRef.current = options.disabled
  const onStartRef = useRef(options.onStart)
  onStartRef.current = options.onStart
  const onEndRef = useRef(options.onEnd)
  onEndRef.current = options.onEnd

  function setGestureFlags(input: {
    recording?: boolean
    cancel?: boolean
    convertText?: boolean
  }) {
    if (input.recording !== undefined) {
      isRecordingRef.current = input.recording
      setIsRecording(input.recording)
    }
    if (input.cancel !== undefined) {
      isCancelPendingRef.current = input.cancel
      setIsCancelPending(input.cancel)
    }
    if (input.convertText !== undefined) {
      isConvertTextPendingRef.current = input.convertText
      setIsConvertTextPending(input.convertText)
    }
  }

  function detachDocumentListeners() {
    document.removeEventListener('pointermove', onDocumentPointerMove)
    document.removeEventListener('pointerup', onDocumentPointerEnd)
    document.removeEventListener('pointercancel', onDocumentPointerEnd)
  }

  function resetPointerState() {
    setGestureFlags({ recording: false, cancel: false, convertText: false })
    activePointerIdRef.current = null
    detachDocumentListeners()
  }

  function updateGesture(deltaX: number, deltaY: number) {
    if (mode === 'swipe-up') {
      const cancel = deltaY > VOICE_SWIPE_CANCEL_PX
      if (cancel !== isCancelPendingRef.current) {
        setGestureFlags({ cancel })
      }
      return
    }

    if (deltaY < WECHAT_OVERLAY_LIFT_PX) {
      if (isCancelPendingRef.current) setGestureFlags({ cancel: false })
      if (isConvertTextPendingRef.current) setGestureFlags({ convertText: false })
      return
    }

    if (deltaX <= -WECHAT_OVERLAY_SIDE_PX) {
      setGestureFlags({ cancel: true, convertText: false })
      return
    }

    if (deltaX >= WECHAT_OVERLAY_SIDE_PX) {
      setGestureFlags({ cancel: false, convertText: true })
      return
    }

    setGestureFlags({ cancel: false, convertText: false })
  }

  function onDocumentPointerMove(e: PointerEvent) {
    if (!isRecordingRef.current || activePointerIdRef.current !== e.pointerId) {
      return
    }
    updateGesture(e.clientX - startRef.current.x, startRef.current.y - e.clientY)
  }

  function onDocumentPointerEnd(e: PointerEvent) {
    if (activePointerIdRef.current !== e.pointerId) return
    if (!isRecordingRef.current) return
    const payload: VoiceRecordEndPayload = {
      cancelled: e.type === 'pointercancel' || isCancelPendingRef.current,
      convertToText:
        e.type === 'pointercancel' ? false : isConvertTextPendingRef.current,
    }
    resetPointerState()
    onEndRef.current(payload)
  }

  function attachDocumentListeners() {
    document.addEventListener('pointermove', onDocumentPointerMove)
    document.addEventListener('pointerup', onDocumentPointerEnd)
    document.addEventListener('pointercancel', onDocumentPointerEnd)
  }

  const onPointerDown = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (disabledRef.current || e.button !== 0) return
      e.preventDefault()
      const target = e.currentTarget
      target.setPointerCapture(e.pointerId)
      activePointerIdRef.current = e.pointerId
      startRef.current = { x: e.clientX, y: e.clientY }
      setGestureFlags({ recording: true, cancel: false, convertText: false })
      if (mode === 'wechat-overlay') {
        attachDocumentListeners()
      }
      onStartRef.current()
    },
    [mode],
  )

  const onPointerMove = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (
        !isRecordingRef.current ||
        activePointerIdRef.current !== e.pointerId
      ) {
        return
      }
      if (mode === 'wechat-overlay') return
      updateGesture(e.clientX - startRef.current.x, startRef.current.y - e.clientY)
    },
    [mode],
  )

  const finishPointer = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    if (activePointerIdRef.current !== e.pointerId) return
    const target = e.currentTarget
    if (target.hasPointerCapture(e.pointerId)) {
      target.releasePointerCapture(e.pointerId)
    }
    if (!isRecordingRef.current) return
    const payload: VoiceRecordEndPayload = {
      cancelled: e.type === 'pointercancel' || isCancelPendingRef.current,
      convertToText:
        e.type === 'pointercancel' ? false : isConvertTextPendingRef.current,
    }
    resetPointerState()
    onEndRef.current(payload)
  }, [])

  const cancelActiveHold = useCallback(() => {
    if (!isRecordingRef.current) return
    resetPointerState()
    onEndRef.current({ cancelled: true, convertToText: false })
  }, [])

  const gestureZone: VoiceHoldGestureZone = !isRecording
    ? 'hold'
    : isCancelPending
      ? 'cancel'
      : isConvertTextPending
        ? 'convertText'
        : 'hold'

  return {
    isRecording,
    isCancelPending,
    isConvertTextPending,
    gestureZone,
    onPointerDown,
    onPointerMove,
    onPointerUp: finishPointer,
    onPointerCancel: finishPointer,
    cancelActiveHold,
  }
}
