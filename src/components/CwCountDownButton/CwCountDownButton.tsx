import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react'
import type { HTMLAttributes } from 'react'
import type {
  CwCountDownButtonExpose,
  CwCountDownButtonProps,
  CwCountDownButtonSlotProps,
  CwCountDownButtonStatus,
} from './types'
import {
  countDownRootBase,
  countDownRootBlock,
  resolveCountDownLabelClass,
} from '@zengchaowu/ui-shared/components/CwCountDownButton/styles'
import { defaultTexts } from '@zengchaowu/ui-shared/components/CwCountDownButton/texts'
import { CwButton } from '../CwButton'

export interface CwCountDownButtonComponentProps
  extends CwCountDownButtonProps,
    Omit<
      HTMLAttributes<HTMLDivElement>,
      'children' | 'className' | 'onClick' | 'onChange' | 'onReset'
    > {
  className?: string
}

const formatTemplate = (
  template: string,
  payload: { remaining: number; duration: number },
) => {
  const elapsed = Math.max(0, payload.duration - payload.remaining)
  return template
    .replace(/\{\{\s*remaining\s*\}\}/g, String(payload.remaining))
    .replace(/\{\{\s*duration\s*\}\}/g, String(payload.duration))
    .replace(/\{\{\s*total\s*\}\}/g, String(payload.duration))
    .replace(/\{\{\s*elapsed\s*\}\}/g, String(elapsed))
}

/**
 * CwCountDownButton（对应 vue-ui `CwCountDownButton.vue`）
 */
export const CwCountDownButton = forwardRef<
  CwCountDownButtonExpose,
  CwCountDownButtonComponentProps
>(function CwCountDownButton(
  {
    type = 'primary',
    variant = 'solid',
    appearance = 'default',
    size = 'medium',
    shape = 'rounded',
    disabled = false,
    readonly = false,
    duration = 60,
    interval = 1,
    autoStart = false,
    value,
    beforeStart,
    pendingLoading = true,
    block = false,
    texts: textsProp,
    children,
    className,
    onClick,
    onChange,
    onCountdownStart,
    onCountdownTick,
    onCountdownFinish,
    onBeforeStartError,
    onBeforeStartReject,
    onReset,
    ...rest
  },
  ref,
) {
  const texts = useMemo(() => {
    const override = textsProp ?? {}
    const mergedButtonTexts = {
      ...(defaultTexts.buttonTexts || {}),
      ...(override.buttonTexts || {}),
    }

    return {
      ...defaultTexts,
      ...override,
      buttonTexts: mergedButtonTexts,
    }
  }, [textsProp])

  const isControlled = value !== undefined

  const durationMs = useMemo(() => {
    const raw = Number.isFinite(duration) ? Number(duration) : 60
    return Math.max(0, Math.round(Math.max(raw, 0) * 1000))
  }, [duration])

  const intervalMs = useMemo(() => {
    const raw = Number.isFinite(interval) ? Number(interval) : 1
    return Math.max(1, Math.round(Math.max(raw, 0.1) * 1000))
  }, [interval])

  const [status, setStatusState] = useState<CwCountDownButtonStatus>('idle')
  const statusRef = useRef(status)
  const setStatus = (next: CwCountDownButtonStatus) => {
    statusRef.current = next
    setStatusState(next)
  }

  const [remainingMs, setRemainingMsState] = useState(durationMs)
  const remainingMsRef = useRef(remainingMs)
  const setRemainingMs = (next: number) => {
    remainingMsRef.current = next
    setRemainingMsState(next)
  }

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const uncontrolledActiveRef = useRef(false)

  // 供异步/timer 回调读取最新 props
  const valueRef = useRef(value)
  const isControlledRef = useRef(isControlled)
  const durationMsRef = useRef(durationMs)
  const intervalMsRef = useRef(intervalMs)
  const disabledRef = useRef(disabled)
  const readonlyRef = useRef(readonly)
  const beforeStartRef = useRef(beforeStart)
  const onChangeRef = useRef(onChange)
  const onCountdownStartRef = useRef(onCountdownStart)
  const onCountdownTickRef = useRef(onCountdownTick)
  const onCountdownFinishRef = useRef(onCountdownFinish)
  const onBeforeStartErrorRef = useRef(onBeforeStartError)
  const onBeforeStartRejectRef = useRef(onBeforeStartReject)
  const onResetRef = useRef(onReset)

  valueRef.current = value
  isControlledRef.current = isControlled
  durationMsRef.current = durationMs
  intervalMsRef.current = intervalMs
  disabledRef.current = disabled
  readonlyRef.current = readonly
  beforeStartRef.current = beforeStart
  onChangeRef.current = onChange
  onCountdownStartRef.current = onCountdownStart
  onCountdownTickRef.current = onCountdownTick
  onCountdownFinishRef.current = onCountdownFinish
  onBeforeStartErrorRef.current = onBeforeStartError
  onBeforeStartRejectRef.current = onBeforeStartReject
  onResetRef.current = onReset

  const durationSeconds = Math.ceil(durationMs / 1000)
  const remainingSeconds = Math.ceil(remainingMs / 1000)

  const percentage = useMemo(() => {
    if (durationMs === 0) return 1
    return Math.min(1, Math.max(0, (durationMs - remainingMs) / durationMs))
  }, [durationMs, remainingMs])

  const rootClass = block ? countDownRootBlock : countDownRootBase
  const labelClass = resolveCountDownLabelClass(appearance)

  let displayLabel: string
  switch (status) {
    case 'pending':
      displayLabel = texts.pending
      break
    case 'counting':
      displayLabel = formatTemplate(texts.counting, {
        remaining: remainingSeconds,
        duration: durationSeconds,
      })
      break
    case 'finished':
      displayLabel = texts.finished
      break
    default:
      displayLabel = texts.idle
  }

  const buttonButtonTexts = {
    ...(texts.buttonTexts || {}),
    label: texts.ariaLabel ?? displayLabel,
  }

  const buttonDisabled =
    disabled || status === 'pending' || status === 'counting'

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  const setActive = (active: boolean) => {
    if (isControlledRef.current) {
      if (valueRef.current !== active) {
        onChangeRef.current?.(active)
      }
      return
    }

    if (uncontrolledActiveRef.current !== active) {
      uncontrolledActiveRef.current = active
      onChangeRef.current?.(active)
    }
  }

  const emitTick = () => {
    onCountdownTickRef.current?.({
      remaining: Math.ceil(remainingMsRef.current / 1000),
      duration: Math.ceil(durationMsRef.current / 1000),
    })
  }

  const finishCountdown = () => {
    clearTimer()
    setRemainingMs(0)
    setStatus('finished')
    setActive(false)
    emitTick()
    onCountdownFinishRef.current?.()
  }

  const beginCountdown = () => {
    const totalMs = durationMsRef.current
    const stepMs = intervalMsRef.current

    setRemainingMs(totalMs)
    setStatus('counting')
    setActive(true)
    onCountdownStartRef.current?.({
      duration: Math.ceil(totalMs / 1000),
    })

    if (totalMs === 0) {
      finishCountdown()
      return
    }

    emitTick()

    clearTimer()
    timerRef.current = setInterval(() => {
      const next = Math.max(0, remainingMsRef.current - stepMs)
      setRemainingMs(next)
      emitTick()
      if (next <= 0) {
        finishCountdown()
      }
    }, stepMs)
  }

  const startCountdown = async (options?: { skipBeforeStart?: boolean }) => {
    if (disabledRef.current || readonlyRef.current) {
      return
    }

    if (statusRef.current === 'pending' || statusRef.current === 'counting') {
      return
    }

    if (!options?.skipBeforeStart && beforeStartRef.current) {
      setStatus('pending')
      try {
        const result = await beforeStartRef.current()
        if (result === false) {
          setStatus('idle')
          onBeforeStartRejectRef.current?.()
          return
        }
      } catch (error) {
        setStatus('idle')
        onBeforeStartErrorRef.current?.(error)
        return
      }
    }

    beginCountdown()
  }

  const resetCountdown = () => {
    clearTimer()
    setStatus('idle')
    setRemainingMs(durationMsRef.current)
    setActive(false)
    onResetRef.current?.()
  }

  const handleTrigger = (event: MouseEvent | KeyboardEvent) => {
    onClick?.(event)
    if (disabled || readonly) return
    void startCountdown()
  }

  // 监听 duration 变化
  useEffect(() => {
    if (statusRef.current === 'idle' || statusRef.current === 'finished') {
      setRemainingMs(durationMs)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [durationMs])

  // 监听受控 value 变化（对应 Vue watch immediate）
  useEffect(() => {
    if (!isControlledRef.current) return
    if (value) {
      void startCountdown({ skipBeforeStart: true })
    } else if (
      statusRef.current === 'counting' ||
      statusRef.current === 'pending'
    ) {
      resetCountdown()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  // 监听 autoStart（对应 Vue watch immediate）
  useEffect(() => {
    if (!autoStart) return
    if (statusRef.current === 'idle' || statusRef.current === 'finished') {
      void startCountdown()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStart])

  // 挂载后同步剩余时间（对应 Vue onMounted）
  useEffect(() => {
    setRemainingMs(durationMsRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 卸载时清理定时器（对应 Vue onBeforeUnmount）
  useEffect(() => {
    return () => clearTimer()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useImperativeHandle(ref, () => ({
    start: (options) => startCountdown(options),
    reset: () => resetCountdown(),
    get status() {
      return statusRef.current
    },
    get remaining() {
      return Math.ceil(remainingMsRef.current / 1000)
    },
  }))

  const slotProps: CwCountDownButtonSlotProps = {
    status,
    remaining: remainingSeconds,
    duration: durationSeconds,
    percentage,
    pending: status === 'pending',
  }

  const content =
    typeof children === 'function' ? (
      children(slotProps)
    ) : children != null ? (
      children
    ) : (
      <span className={labelClass}>{displayLabel}</span>
    )

  return (
    <div
      {...rest}
      className={[rootClass, className].filter(Boolean).join(' ')}
    >
      <CwButton
        type={type}
        variant={variant}
        appearance={appearance}
        size={size}
        shape={shape}
        disabled={buttonDisabled}
        loading={pendingLoading && status === 'pending'}
        texts={buttonButtonTexts}
        onClick={handleTrigger}
      >
        {content}
      </CwButton>
    </div>
  )
})

export default CwCountDownButton
