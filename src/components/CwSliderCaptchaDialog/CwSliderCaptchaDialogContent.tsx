import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type {
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
} from 'react'
import CwIcon from '../CwIcon/CwIcon'
import { useSliderCaptchaSession } from './composables/useSliderCaptchaSession'
import {
  clampSliderOffset,
  mapHandleOffsetToApiOffset,
} from '@zengchaowu/ui-shared/components/CwSliderCaptchaDialog/functions/index'
import { sliderCaptchaDialogBase } from '@zengchaowu/ui-shared/components/CwSliderCaptchaDialog/styles'
import { defaultTexts } from '@zengchaowu/ui-shared/components/CwSliderCaptchaDialog/texts'
import { CW_SLIDER_CAPTCHA_WIDTH_REM } from '@zengchaowu/ui-shared/components/CwSliderCaptchaDialog/types'
import { type CwSliderCaptchaDialogTexts, type GenerateSliderCaptchaChallenge, type VerifySliderCaptchaOffset } from '@zengchaowu/ui-shared/components/CwSliderCaptchaDialog/types'

export interface CwSliderCaptchaDialogContentProps {
  texts?: Partial<CwSliderCaptchaDialogTexts>
  onGenerate: GenerateSliderCaptchaChallenge
  onVerify: VerifySliderCaptchaOffset
  /** 验证成功（对应 Vue `success` 事件） */
  onSuccess?: (token: string) => void
  /** 验证失败（对应 Vue `failed` 事件） */
  onFailed?: (message: string) => void
  /** 点击帮助（对应 Vue `help` 事件） */
  onHelp?: () => void
  /** 点击客服（对应 Vue `service` 事件） */
  onService?: () => void
}

interface SliderLayoutMetrics {
  handleSize: number
  handleRadius: number
  trackWidth: number
  imageWidth: number
}

function maxHandleOffsetOf(metrics: SliderLayoutMetrics): number {
  if (!metrics.trackWidth) return 0
  return Math.max(0, metrics.trackWidth - metrics.handleSize)
}

interface LayeredImage {
  slots: [string, string]
  active: number
  setRef: (index: number, el: HTMLImageElement | null) => void
  promote: (index: number) => void
}

/** 换图时先画到隐藏层，解码完成再切到前台，避免 src 替换把整张图清空一帧。 */
function useLayeredImage(source: string): LayeredImage {
  const [slots, setSlots] = useState<[string, string]>(['', ''])
  const [active, setActive] = useState(0)
  const slotsRef = useRef<[string, string]>(['', ''])
  const activeRef = useRef(0)
  const elsRef = useRef<Array<HTMLImageElement | null>>([null, null])
  const pendingIndexRef = useRef<number | null>(null)

  const setRef = useCallback((index: number, el: HTMLImageElement | null): void => {
    elsRef.current[index] = el
  }, [])

  const promote = useCallback(
    (index: number): void => {
      const src = slotsRef.current[index]
      if (src && src === source) {
        activeRef.current = index
        setActive(index)
      }
    },
    [source],
  )

  useEffect(() => {
    if (!source || slotsRef.current[activeRef.current] === source) return
    const index = slotsRef.current[activeRef.current]
      ? 1 - activeRef.current
      : activeRef.current
    const next = [...slotsRef.current] as [string, string]
    next[index] = source
    slotsRef.current = next
    pendingIndexRef.current = index
    setSlots(next)
  }, [source])

  useLayoutEffect(() => {
    const index = pendingIndexRef.current
    if (index == null) return
    const el = elsRef.current[index]
    if (el?.complete && el.naturalWidth > 0 && el.src === source) {
      pendingIndexRef.current = null
      activeRef.current = index
      setActive(index)
    }
  }, [slots, source])

  return { slots, active, setRef, promote }
}

export function CwSliderCaptchaDialogContent({
  texts: textsProp,
  onGenerate,
  onVerify,
  onSuccess,
  onFailed,
  onHelp,
  onService,
}: CwSliderCaptchaDialogContentProps) {
  const texts = useMemo(
    () => ({ ...defaultTexts, ...(textsProp ?? {}) }) as CwSliderCaptchaDialogTexts,
    [textsProp],
  )
  const textsRef = useRef(texts)
  textsRef.current = texts

  const onSuccessRef = useRef(onSuccess)
  onSuccessRef.current = onSuccess
  const onFailedRef = useRef(onFailed)
  onFailedRef.current = onFailed
  const onHelpRef = useRef(onHelp)
  onHelpRef.current = onHelp
  const onServiceRef = useRef(onService)
  onServiceRef.current = onService

  const handleRef = useRef<HTMLDivElement | null>(null)
  const trackRef = useRef<HTMLDivElement | null>(null)
  const imageRef = useRef<HTMLDivElement | null>(null)
  const resizeObserverRef = useRef<ResizeObserver | null>(null)

  const draggingRef = useRef(false)
  const [dragging, setDragging] = useState(false)
  const dragStartXRef = useRef(0)
  const dragStartOffsetRef = useRef(0)
  const activePointerIdRef = useRef<number | null>(null)

  const initialLayout: SliderLayoutMetrics = {
    handleSize: 40,
    handleRadius: 0,
    trackWidth: 0,
    imageWidth: 0,
  }
  const [layout, setLayout] = useState<SliderLayoutMetrics>(initialLayout)
  const layoutRef = useRef(layout)

  const {
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
  } = useSliderCaptchaSession({
    onGenerate,
    onVerify,
    getTexts: () => ({
      loadError: texts.loadError,
      verifyError: texts.verifyError,
      imageLoadError: texts.imageLoadError,
      notReady: texts.notReady,
    }),
  })

  const refreshingRef = useRef(refreshing)
  refreshingRef.current = refreshing

  const backgroundLayers = useLayeredImage(backgroundSrc)
  const puzzleLayers = useLayeredImage(puzzleSrc)

  function syncLayoutMetrics(): void {
    const track = trackRef.current
    const image = imageRef.current
    const handle = handleRef.current
    const next: SliderLayoutMetrics = { ...layoutRef.current }
    if (track) next.trackWidth = track.clientWidth
    if (image) next.imageWidth = image.clientWidth
    if (handle) {
      next.handleSize = handle.offsetWidth
      const radius = Number.parseFloat(
        getComputedStyle(handle).borderTopLeftRadius,
      )
      next.handleRadius = Number.isFinite(radius) ? radius : 0
    } else if (track) {
      next.handleSize = track.clientHeight
    }
    layoutRef.current = next
    setLayout(next)
    setOffsetX((prev) =>
      clampSliderOffset(prev, maxHandleOffsetOf(layoutRef.current)),
    )
  }

  function getDisplayScale(): number {
    const apiWidth = challengeRef.current?.width ?? 0
    const imageWidth = layoutRef.current.imageWidth
    if (!apiWidth || !imageWidth) return 1
    return imageWidth / apiWidth
  }

  function maxHandleOffset(): number {
    return maxHandleOffsetOf(layoutRef.current)
  }

  function clampHandleOffset(value: number): number {
    return clampSliderOffset(value, maxHandleOffset())
  }

  function toApiOffsetX(handleOffset: number): number {
    const data = challengeRef.current
    if (!data) return 0
    return mapHandleOffsetToApiOffset(
      handleOffset,
      maxHandleOffset(),
      data.width - data.pieceWidth,
    )
  }

  const finishDragVerify = useCallback(async (): Promise<void> => {
    if (offsetXRef.current <= 0 || refreshingRef.current) return
    try {
      const token = await verifyOffset(toApiOffsetX(offsetXRef.current))
      onSuccessRef.current?.(token)
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : textsRef.current.verifyError
      onFailedRef.current?.(message)
      try {
        await loadChallenge({ refresh: true })
      } catch {
        /* error already set */
      }
    }
  }, [verifyOffset, loadChallenge, offsetXRef])

  const handleWindowPointerMove = useCallback((event: PointerEvent): void => {
    moveHandlerRef.current(event)
  }, [])

  const handleWindowPointerUp = useCallback((event: PointerEvent): void => {
    upHandlerRef.current(event)
  }, [])

  const detachWindowPointerListeners = useCallback((): void => {
    window.removeEventListener('pointermove', handleWindowPointerMove)
    window.removeEventListener('pointerup', handleWindowPointerUp)
    window.removeEventListener('pointercancel', handleWindowPointerUp)
  }, [handleWindowPointerMove, handleWindowPointerUp])

  const moveHandlerRef = useRef<(event: PointerEvent) => void>(() => {})
  const upHandlerRef = useRef<(event: PointerEvent) => void>(() => {})

  moveHandlerRef.current = (event: PointerEvent): void => {
    if (!draggingRef.current) return
    if (
      activePointerIdRef.current != null &&
      event.pointerId !== activePointerIdRef.current
    ) {
      return
    }
    event.preventDefault()
    const delta = event.clientX - dragStartXRef.current
    setOffsetX(
      clampSliderOffset(
        dragStartOffsetRef.current + delta,
        maxHandleOffsetOf(layoutRef.current),
      ),
    )
  }

  upHandlerRef.current = (event: PointerEvent): void => {
    if (!draggingRef.current) return
    if (
      activePointerIdRef.current != null &&
      event.pointerId !== activePointerIdRef.current
    ) {
      return
    }
    draggingRef.current = false
    setDragging(false)
    activePointerIdRef.current = null
    detachWindowPointerListeners()
    void finishDragVerify()
  }

  function onHandlePointerDown(event: ReactPointerEvent<HTMLDivElement>): void {
    if (verifying || refreshing || !challenge) return
    if (event.button !== 0 && event.pointerType === 'mouse') return

    event.preventDefault()
    syncLayoutMetrics()

    draggingRef.current = true
    setDragging(true)
    dragStartXRef.current = event.clientX
    dragStartOffsetRef.current = offsetXRef.current
    activePointerIdRef.current = event.pointerId

    const target = event.currentTarget
    try {
      target.setPointerCapture(event.pointerId)
    } catch {
      /* ignore */
    }

    window.addEventListener('pointermove', handleWindowPointerMove, {
      passive: false,
    })
    window.addEventListener('pointerup', handleWindowPointerUp)
    window.addEventListener('pointercancel', handleWindowPointerUp)
  }

  function onHandleKeyDown(event: ReactKeyboardEvent<HTMLDivElement>): void {
    if (verifying || refreshing || !challenge) return
    const step = Math.max(4, Math.round(maxHandleOffset() / 40))
    if (event.key === 'ArrowRight' || event.key === 'Right') {
      event.preventDefault()
      setOffsetX(clampHandleOffset(offsetXRef.current + step))
    } else if (event.key === 'ArrowLeft' || event.key === 'Left') {
      event.preventDefault()
      setOffsetX(clampHandleOffset(offsetXRef.current - step))
    } else if (event.key === 'Home') {
      event.preventDefault()
      setOffsetX(0)
    } else if (event.key === 'End') {
      event.preventDefault()
      setOffsetX(maxHandleOffset())
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      void finishDragVerify()
    }
  }

  function onRefreshClick(): void {
    if (refreshing || initialLoading || verifying) return
    void loadChallenge({ refresh: true }).catch((err: unknown) => {
      onFailedRef.current?.(
        err instanceof Error ? err.message : textsRef.current.loadError,
      )
    })
  }

  const bindResizeObserver = useCallback((): void => {
    resizeObserverRef.current?.disconnect()
    const observer = new ResizeObserver(() => {
      syncLayoutMetrics()
    })
    if (trackRef.current) observer.observe(trackRef.current)
    if (imageRef.current) observer.observe(imageRef.current)
    resizeObserverRef.current = observer
  }, [])

  useEffect(() => {
    let cancelled = false
    void loadChallenge().catch((err: unknown) => {
      if (cancelled) return
      onFailedRef.current?.(
        err instanceof Error ? err.message : textsRef.current.loadError,
      )
    })
    return () => {
      cancelled = true
    }
  }, [loadChallenge])

  useEffect(() => {
    if (!challenge) return
    syncLayoutMetrics()
    bindResizeObserver()
  }, [challenge, bindResizeObserver])

  useEffect(() => {
    return () => {
      detachWindowPointerListeners()
      resizeObserverRef.current?.disconnect()
      resizeObserverRef.current = null
    }
  }, [detachWindowPointerListeners])

  const handleToolbarKeyDown = (
    handler: () => void,
  ): ((event: ReactKeyboardEvent<HTMLDivElement>) => void) => {
    return (event: ReactKeyboardEvent<HTMLDivElement>): void => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        handler()
      }
    }
  }

  const puzzleOffsetX = ((): number => {
    const handleMax = maxHandleOffsetOf(layout)
    const puzzleMax = challenge
      ? (challenge.width - challenge.pieceWidth) * getDisplayScale()
      : 0
    if (!handleMax || !puzzleMax) return 0
    return offsetX * (puzzleMax / handleMax)
  })()

  const puzzleLayout = ((): { top: number; width: number; height: number } => {
    if (!challenge) return { top: 0, width: 0, height: 0 }
    const scale = getDisplayScale()
    return {
      top: challenge.puzzleY * scale,
      width: challenge.pieceWidth * scale,
      height: challenge.pieceHeight * scale,
    }
  })()

  const progressWidth =
    offsetX <= 0
      ? 0
      : Math.min(offsetX + layout.handleRadius, layout.trackWidth)

  return (
    <div
      className={sliderCaptchaDialogBase.root}
      style={{ width: `min(${CW_SLIDER_CAPTCHA_WIDTH_REM}rem, calc(100vw - 2rem))` }}
    >
      {initialLoading ? (
        <div className={sliderCaptchaDialogBase.loading}>{texts.loading}</div>
      ) : null}

      {!initialLoading && challenge ? (
        <>
          <div ref={imageRef} className={sliderCaptchaDialogBase.imageStage}>
            {backgroundLayers.slots.map((src, index) =>
              src ? (
                <img
                  key={`bg-${index}`}
                  ref={(el) => {
                    backgroundLayers.setRef(index, el)
                  }}
                  src={src}
                  alt=""
                  className={[
                    sliderCaptchaDialogBase.backgroundImage,
                    index === backgroundLayers.active
                      ? 'opacity-100'
                      : 'opacity-0',
                  ].filter(Boolean).join(' ')}
                  draggable={false}
                  onLoad={() => {
                    backgroundLayers.promote(index)
                  }}
                />
              ) : null,
            )}
            {puzzleLayers.slots.map((src, index) =>
              src ? (
                <img
                  key={`piece-${index}`}
                  ref={(el) => {
                    puzzleLayers.setRef(index, el)
                  }}
                  src={src}
                  alt=""
                  className={[
                    sliderCaptchaDialogBase.puzzleImage,
                    index === puzzleLayers.active
                      ? 'opacity-100'
                      : 'opacity-0',
                    dragging
                      ? ''
                      : 'transition-transform duration-150 ease-out',
                  ].filter(Boolean).join(' ')}
                  style={{
                    top: `${puzzleLayout.top}px`,
                    width: `${puzzleLayout.width}px`,
                    height: `${puzzleLayout.height}px`,
                    transform: `translate3d(${puzzleOffsetX}px, 0, 0)`,
                  }}
                  draggable={false}
                  onLoad={() => {
                    puzzleLayers.promote(index)
                  }}
                />
              ) : null,
            )}
            <div className={sliderCaptchaDialogBase.toolbar}>
              <div
                role="button"
                tabIndex={0}
                className={sliderCaptchaDialogBase.toolbarBtn}
                aria-label={texts.helpAriaLabel}
                title={texts.helpAriaLabel}
                onClick={() => {
                  onHelpRef.current?.()
                }}
                onKeyDown={handleToolbarKeyDown(() => {
                  onHelpRef.current?.()
                })}
              >
                <CwIcon
                  name="common--status--help-line"
                  size={sliderCaptchaDialogBase.toolbarIconStyles?.size ?? 1}
                  className={sliderCaptchaDialogBase.toolbarIconStyles?.class}
                />
              </div>
              <div
                role="button"
                tabIndex={0}
                className={sliderCaptchaDialogBase.toolbarBtn}
                aria-label={texts.refreshAriaLabel}
                title={texts.refreshAriaLabel}
                aria-disabled={
                  initialLoading || refreshing || verifying ? 'true' : 'false'
                }
                onClick={onRefreshClick}
                onKeyDown={handleToolbarKeyDown(onRefreshClick)}
              >
                <CwIcon
                  name="common--action--refresh-line"
                  spin={refreshing}
                  size={sliderCaptchaDialogBase.toolbarIconStyles?.size ?? 1}
                  className={sliderCaptchaDialogBase.toolbarIconStyles?.class}
                />
              </div>
              <div
                role="button"
                tabIndex={0}
                className={sliderCaptchaDialogBase.toolbarBtn}
                aria-label={texts.serviceAriaLabel}
                title={texts.serviceAriaLabel}
                onClick={() => {
                  onServiceRef.current?.()
                }}
                onKeyDown={handleToolbarKeyDown(() => {
                  onServiceRef.current?.()
                })}
              >
                <CwIcon
                  name="common--media--headphone-line"
                  size={sliderCaptchaDialogBase.toolbarIconStyles?.size ?? 1}
                  className={sliderCaptchaDialogBase.toolbarIconStyles?.class}
                />
              </div>
            </div>
          </div>

          <div ref={trackRef} className={sliderCaptchaDialogBase.track}>
            <div
              className={[
                sliderCaptchaDialogBase.progress,
                dragging
                  ? ''
                  : 'transition-[width] duration-150 ease-out',
              ].filter(Boolean).join(' ')}
              style={{ width: `${progressWidth}px` }}
            />
            {offsetX === 0 && !dragging && !verifying && !refreshing ? (
              <p className={sliderCaptchaDialogBase.hint}>{texts.hint}</p>
            ) : null}
            <div
              ref={handleRef}
              role="slider"
              tabIndex={0}
              aria-label={texts.handleAriaLabel}
              aria-valuemin={0}
              aria-valuemax={Math.round(maxHandleOffsetOf(layout))}
              aria-valuenow={Math.round(offsetX)}
              aria-disabled={verifying || refreshing ? 'true' : 'false'}
              className={[
                sliderCaptchaDialogBase.handle,
                dragging ? 'cursor-grabbing' : 'cursor-grab',
                dragging
                  ? ''
                  : 'transition-[left,opacity] duration-150 ease-out',
              ].filter(Boolean).join(' ')}
              style={{ left: `${offsetX}px` }}
              onPointerDown={onHandlePointerDown}
              onKeyDown={onHandleKeyDown}
            >
              <CwIcon
                name="common--dir--arrow-right-line"
                size={sliderCaptchaDialogBase.iconStyles?.size ?? 1}
                className={sliderCaptchaDialogBase.iconStyles?.class}
              />
            </div>
          </div>

          {error ? (
            <div className={sliderCaptchaDialogBase.footer}>
              <p className={sliderCaptchaDialogBase.error}>{error}</p>
            </div>
          ) : null}
        </>
      ) : null}

      {!initialLoading && !challenge && error ? (
        <p className={sliderCaptchaDialogBase.error}>{error}</p>
      ) : null}
    </div>
  )
}

export default CwSliderCaptchaDialogContent
