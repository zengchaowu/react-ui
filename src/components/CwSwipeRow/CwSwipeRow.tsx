import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type PointerEvent as ReactPointerEvent,
  type MouseEvent as ReactMouseEvent,
} from 'react'
import type { CwSwipeRowProps } from './types'
import type { CwSwipeRowAction, CwSwipeRowActionTone, CwSwipeRowContentClass } from '@zengchaowu/ui-shared/components/CwSwipeRow/types'
import { swipeRowBase } from '@zengchaowu/ui-shared/components/CwSwipeRow/styles'

export interface CwSwipeRowComponentProps
  extends CwSwipeRowProps,
    Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'className' | 'onClick' | 'content'> {
  className?: string
}

const SWIPE_ACTION_DEDUPE_MS = 400
const SLIDE_CLICK_SUPPRESS_MS = 450
const LIST_SCROLL_INTERACTION_GUARD_MS = 480

const toneClassMap: Record<CwSwipeRowActionTone, string> = {
  default: swipeRowBase.swipeActionToneDefault,
  primary: swipeRowBase.swipeActionTonePrimary,
  muted: swipeRowBase.swipeActionToneMuted,
  warning: swipeRowBase.swipeActionToneWarning,
  danger: swipeRowBase.swipeActionToneDanger,
}

function resolveSwipeTone(action: CwSwipeRowAction): CwSwipeRowActionTone {
  if (action.tone) return action.tone
  if (action.danger) return 'danger'
  return 'default'
}

/** 等价 Vue `:class` 对 string / 对象 / 数组的归一化 */
function normalizeContentClass(value: CwSwipeRowContentClass | undefined): string {
  if (!value) return ''
  if (typeof value === 'string') return value
  if (Array.isArray(value)) {
    return value.map((item) => normalizeContentClass(item)).filter(Boolean).join(' ')
  }
  return Object.keys(value)
    .filter((key) => value[key])
    .join(' ')
}

function isFullyOpenTranslate(x: number, actionsWidth: number): boolean {
  const w = Math.max(1, actionsWidth)
  return x <= -w + 1
}

export function CwSwipeRow({
  contentClass,
  swipeActions,
  swipeDirectionThresholdPx,
  swipeOpenThresholdMinPx,
  swipeOpenThresholdRatio: _swipeOpenThresholdRatio,
  swipeRowKey,
  swipePeerOpenKey,
  showBodyInsetDivider = false,
  bodyInsetDividerClass,
  children,
  className,
  onClick,
  onSwipeAction,
  onSwipeOpenChange,
  ...rest
}: CwSwipeRowComponentProps) {
  const hasSwipeActions =
    Array.isArray(swipeActions) && swipeActions.length > 0
  const normalizedSwipeActions = swipeActions ?? []

  const slideLayerRef = useRef<HTMLDivElement | null>(null)
  const actionsBarRef = useRef<HTMLDivElement | null>(null)

  const [translateX, setTranslateX] = useState(0)
  const translateXRef = useRef(0)

  const [actionsWidth, setActionsWidth] = useState(120)
  const actionsWidthRef = useRef(120)

  const [draggingHorizontal, setDraggingHorizontal] = useState(false)
  const draggingRef = useRef(false)

  const [swipeTransformNoTransition, setSwipeTransformNoTransition] =
    useState(true)

  const hasSwipeActionsRef = useRef(hasSwipeActions)
  hasSwipeActionsRef.current = hasSwipeActions

  const propsRef = useRef({
    swipeDirectionThresholdPx,
    swipeOpenThresholdMinPx,
    swipeRowKey,
  })
  propsRef.current = {
    swipeDirectionThresholdPx,
    swipeOpenThresholdMinPx,
    swipeRowKey,
  }

  const callbacksRef = useRef({ onClick, onSwipeAction, onSwipeOpenChange })
  callbacksRef.current = { onClick, onSwipeAction, onSwipeOpenChange }

  /** 等价 Vue setup 作用域下随组件生命周期存活的普通变量 */
  const gestureRef = useRef({
    gestureStartX: 0,
    gestureStartY: 0,
    gestureStartTranslate: 0,
    decidedAxis: false,
    activePointerId: null as number | null,
    lastSwipeActionKey: '',
    lastSwipeActionAt: 0,
    ignoreSlideClickUntil: 0,
    recentListScrollUntil: 0,
    touchStartedDuringRecentScroll: false,
    scrollViewport: null as HTMLElement | null,
    onScrollViewportScroll: null as (() => void) | null,
    resizeObserver: null as ResizeObserver | null,
  })

  const applyTranslate = useCallback((next: number) => {
    translateXRef.current = next
    setTranslateX(next)
  }, [])

  const applyNoTransition = useCallback((next: boolean) => {
    setSwipeTransformNoTransition(next)
  }, [])

  const setDraggingHorizontalValue = useCallback((next: boolean) => {
    draggingRef.current = next
    setDraggingHorizontal(next)
  }, [])

  function isRecentListScroll(): boolean {
    return Date.now() < gestureRef.current.recentListScrollUntil
  }

  function bumpRecentListScroll(): void {
    gestureRef.current.recentListScrollUntil =
      Date.now() + LIST_SCROLL_INTERACTION_GUARD_MS
  }

  function extendClickSuppress(): void {
    const g = gestureRef.current
    g.ignoreSlideClickUntil = Math.max(
      Date.now() + SLIDE_CLICK_SUPPRESS_MS,
      g.recentListScrollUntil + 80,
    )
  }

  const directionThresholdPx = (): number =>
    propsRef.current.swipeDirectionThresholdPx ??
    propsRef.current.swipeOpenThresholdMinPx ??
    40

  const clampTranslate = useCallback((value: number) => {
    const w = Math.max(1, actionsWidthRef.current)
    return Math.max(-w, Math.min(0, value))
  }, [])

  const setTranslateXInstant = useCallback(
    (next: number) => {
      applyNoTransition(true)
      applyTranslate(next)
      queueMicrotask(() => {
        applyNoTransition(false)
      })
    },
    [applyNoTransition, applyTranslate],
  )

  const setTranslateXWithSnapAnimation = useCallback(
    (next: number) => {
      const cur = translateXRef.current
      applyNoTransition(false)
      const apply = () => {
        applyTranslate(next)
      }
      if (cur !== next) {
        requestAnimationFrame(() => {
          apply()
        })
      } else {
        apply()
      }
    },
    [applyNoTransition, applyTranslate],
  )

  const measureActionsWidth = useCallback(() => {
    const el = actionsBarRef.current
    if (!el) return
    const w = el.offsetWidth
    if (w > 0) {
      actionsWidthRef.current = w
      setActionsWidth(w)
    }
  }, [])

  const unlockActivePointer = useCallback(
    (el: HTMLElement | null, pointerId: number | null) => {
      if (!el || pointerId == null) return
      try {
        if (el.hasPointerCapture?.(pointerId)) {
          el.releasePointerCapture(pointerId)
        }
      } catch {
        /* ignore */
      }
    },
    [],
  )

  const resolveScrollViewport = useCallback((): HTMLElement | null => {
    const el = slideLayerRef.current
    if (!el) return null
    let node: HTMLElement | null = el.parentElement
    while (node) {
      if (node.classList.contains('cw-div__viewport')) return node
      const { overflowY } = getComputedStyle(node)
      if (
        (overflowY === 'auto' || overflowY === 'scroll') &&
        node.scrollHeight > node.clientHeight + 1
      ) {
        return node
      }
      node = node.parentElement
    }
    return null
  }, [])

  const unbindScrollViewportListener = useCallback(() => {
    const g = gestureRef.current
    if (g.scrollViewport && g.onScrollViewportScroll) {
      g.scrollViewport.removeEventListener('scroll', g.onScrollViewportScroll)
    }
    g.scrollViewport = null
    g.onScrollViewportScroll = null
  }, [])

  const bindScrollViewportListener = useCallback(() => {
    unbindScrollViewportListener()
    const g = gestureRef.current
    g.scrollViewport = resolveScrollViewport()
    if (!g.scrollViewport) return
    g.onScrollViewportScroll = () => bumpRecentListScroll()
    g.scrollViewport.addEventListener('scroll', g.onScrollViewportScroll, {
      passive: true,
    })
  }, [resolveScrollViewport, unbindScrollViewportListener])

  const onPointerMove = useCallback(
    (event: PointerEvent) => {
      const g = gestureRef.current
      if (!hasSwipeActionsRef.current || g.activePointerId !== event.pointerId) {
        return
      }
      const dx = event.clientX - g.gestureStartX
      const dy = event.clientY - g.gestureStartY
      const ax = Math.abs(dx)
      const ay = Math.abs(dy)
      if (!g.decidedAxis) {
        if (ax > 8 || ay > 8) {
          g.decidedAxis = true
          setDraggingHorizontalValue(
            g.touchStartedDuringRecentScroll
              ? ax > ay * 1.25 && ax > 12
              : ax > ay,
          )
        }
      } else if (
        !draggingRef.current &&
        g.touchStartedDuringRecentScroll &&
        ax > 14 &&
        ax > ay * 1.25
      ) {
        setDraggingHorizontalValue(true)
      }
      if (!draggingRef.current) return
      // 触摸横向拖时阻止页面滚动；鼠标无默认滚动冲突
      if (event.pointerType !== 'mouse') event.preventDefault()
      applyTranslate(clampTranslate(g.gestureStartTranslate + dx))
    },
    [applyTranslate, clampTranslate, setDraggingHorizontalValue],
  )

  const bindPointerMove = useCallback(() => {
    const el = slideLayerRef.current
    if (!el) return
    el.addEventListener('pointermove', onPointerMove, { passive: false })
  }, [onPointerMove])

  const unbindPointerMove = useCallback(() => {
    const el = slideLayerRef.current
    if (!el) return
    el.removeEventListener('pointermove', onPointerMove)
  }, [onPointerMove])

  const finishGesture = useCallback(
    (clientX: number) => {
      const g = gestureRef.current
      if (draggingRef.current) {
        const w = Math.max(1, actionsWidthRef.current)
        const dirTh = directionThresholdPx()
        const deltaX = clientX - g.gestureStartX
        let next: number
        if (deltaX < -dirTh) {
          next = -w
        } else if (deltaX > dirTh) {
          next = 0
        } else {
          const x = translateXRef.current
          next = x <= -w * 0.5 ? -w : 0
        }
        setTranslateXWithSnapAnimation(next)
        if (next === -w && propsRef.current.swipeRowKey != null) {
          callbacksRef.current.onSwipeOpenChange?.(propsRef.current.swipeRowKey)
        }
        if (next === 0 && g.gestureStartTranslate < -1) {
          callbacksRef.current.onSwipeOpenChange?.(null)
        }
        extendClickSuppress()
      } else {
        applyNoTransition(false)
        if (g.touchStartedDuringRecentScroll || isRecentListScroll()) {
          if (translateXRef.current !== g.gestureStartTranslate) {
            setTranslateXWithSnapAnimation(
              g.gestureStartTranslate < -1 ? g.gestureStartTranslate : 0,
            )
          }
          extendClickSuppress()
        }
      }
      g.touchStartedDuringRecentScroll = false
      g.decidedAxis = false
      setDraggingHorizontalValue(false)
    },
    [
      applyNoTransition,
      setDraggingHorizontalValue,
      setTranslateXWithSnapAnimation,
    ],
  )

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    const g = gestureRef.current
    if (!hasSwipeActionsRef.current) return
    // 仅主键；忽略多指中的非主 pointer
    if (event.pointerType === 'mouse' && event.button !== 0) return
    if (g.activePointerId != null) return

    const el = event.currentTarget
    g.activePointerId = event.pointerId
    try {
      el.setPointerCapture(event.pointerId)
    } catch {
      /* ignore */
    }
    bindPointerMove()

    applyNoTransition(true)
    g.gestureStartX = event.clientX
    g.gestureStartY = event.clientY
    g.gestureStartTranslate = translateXRef.current
    g.touchStartedDuringRecentScroll = isRecentListScroll()
    g.decidedAxis = false
    setDraggingHorizontalValue(false)
  }

  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    const g = gestureRef.current
    if (!hasSwipeActionsRef.current || g.activePointerId !== event.pointerId) {
      return
    }
    unlockActivePointer(slideLayerRef.current, g.activePointerId)
    unbindPointerMove()
    g.activePointerId = null
    finishGesture(event.clientX)
  }

  const handleClickSwipe = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (
      Date.now() < gestureRef.current.ignoreSlideClickUntil ||
      isRecentListScroll()
    ) {
      event.preventDefault()
      event.stopPropagation()
      return
    }
    if (isFullyOpenTranslate(translateXRef.current, actionsWidthRef.current)) {
      setTranslateXWithSnapAnimation(0)
      callbacksRef.current.onSwipeOpenChange?.(null)
      event.stopPropagation()
      return
    }
    callbacksRef.current.onClick?.(event)
  }

  /** 移动端左滑后 click 可能不触发，用 pointerup；与 click 去重避免桌面双发 */
  const onSwipeActionActivate = (key: string) => {
    const g = gestureRef.current
    const now = Date.now()
    if (
      key === g.lastSwipeActionKey &&
      now - g.lastSwipeActionAt < SWIPE_ACTION_DEDUPE_MS
    ) {
      return
    }
    g.lastSwipeActionKey = key
    g.lastSwipeActionAt = now
    callbacksRef.current.onSwipeAction?.(key)
    setTranslateXWithSnapAnimation(0)
    callbacksRef.current.onSwipeOpenChange?.(null)
  }

  // 同行互斥展开：其他行打开时收起当前行
  useEffect(() => {
    if (swipePeerOpenKey == null || swipePeerOpenKey === '') return
    if (swipePeerOpenKey === propsRef.current.swipeRowKey) return
    if (translateXRef.current < 0) {
      setTranslateXWithSnapAnimation(0)
    }
  }, [swipePeerOpenKey, setTranslateXWithSnapAnimation])

  // swipeActions 变化时复位
  useEffect(() => {
    setTranslateXInstant(0)
  }, [swipeActions, setTranslateXInstant])

  // 等价 Vue watch(hasSwipeActions, { flush: 'post', immediate: true })
  useEffect(() => {
    const g = gestureRef.current
    setTranslateXInstant(0)
    unlockActivePointer(slideLayerRef.current, g.activePointerId)
    unbindPointerMove()
    g.activePointerId = null
    setDraggingHorizontalValue(false)
    unbindScrollViewportListener()
    g.resizeObserver?.disconnect()
    g.resizeObserver = null
    if (!hasSwipeActions) return

    let cancelled = false
    queueMicrotask(() => {
      if (cancelled) return
      measureActionsWidth()
      bindScrollViewportListener()
      const bar = actionsBarRef.current
      if (bar && typeof ResizeObserver !== 'undefined') {
        const observer = new ResizeObserver(() => measureActionsWidth())
        observer.observe(bar)
        g.resizeObserver = observer
      }
    })

    return () => {
      cancelled = true
    }
  }, [
    hasSwipeActions,
    measureActionsWidth,
    bindScrollViewportListener,
    unbindScrollViewportListener,
    setDraggingHorizontalValue,
    setTranslateXInstant,
    unbindPointerMove,
    unlockActivePointer,
  ])

  useEffect(() => {
    const g = gestureRef.current
    return () => {
      unlockActivePointer(slideLayerRef.current, g.activePointerId)
      unbindPointerMove()
      g.activePointerId = null
      unbindScrollViewportListener()
      g.resizeObserver?.disconnect()
      g.resizeObserver = null
    }
  }, [unbindPointerMove, unbindScrollViewportListener, unlockActivePointer])

  const styles = swipeRowBase

  const mergedRowDividerInset = useMemo(
    () => bodyInsetDividerClass ?? swipeRowBase.rowDividerInset,
    [bodyInsetDividerClass],
  )

  const slideTransformStyle = useMemo<CSSProperties>(
    () => ({
      transform: `translate3d(${translateX}px,0,0)`,
      transition: swipeTransformNoTransition
        ? 'none'
        : 'transform 0.22s cubic-bezier(0.33, 1, 0.68, 1)',
      willChange: swipeTransformNoTransition ? 'transform' : 'auto',
    }),
    [translateX, swipeTransformNoTransition],
  )

  const actionsBarRevealed = isFullyOpenTranslate(translateX, actionsWidth)

  const contentClassName = normalizeContentClass(contentClass) || undefined

  if (!hasSwipeActions) {
    return (
      <div
        {...rest}
        className={[styles.swipeOuter, className].filter(Boolean).join(' ')}
      >
        <div
          className={contentClassName}
          onClick={(event) => callbacksRef.current.onClick?.(event)}
        >
          {children}
          {showBodyInsetDivider ? (
            <div
              className={mergedRowDividerInset}
              aria-hidden="true"
            />
          ) : null}
        </div>
      </div>
    )
  }

  return (
    <div
      {...rest}
      className={[styles.swipeOuter, className].filter(Boolean).join(' ')}
    >
      <div className={styles.swipeTrack}>
        <div
          ref={actionsBarRef}
          className={[
            styles.swipeActionsBar,
            actionsBarRevealed ? styles.swipeActionsBarRevealed : '',
          ]
            .filter(Boolean)
            .join(' ')}
          aria-hidden={actionsBarRevealed ? undefined : true}
          aria-expanded={actionsBarRevealed}
        >
          {normalizedSwipeActions.map((action) => (
            <div
              key={action.key}
              role="button"
              tabIndex={0}
              className={[
                styles.swipeActionBtn,
                toneClassMap[resolveSwipeTone(action)] ?? '',
                action.buttonClass,
              ]
                .filter(Boolean)
                .join(' ')}
              onPointerUp={(event) => {
                event.stopPropagation()
                onSwipeActionActivate(action.key)
              }}
              onClick={(event) => {
                event.stopPropagation()
                onSwipeActionActivate(action.key)
              }}
            >
              {action.label}
            </div>
          ))}
        </div>

        <div
          ref={slideLayerRef}
          className={[
            contentClassName,
            styles.swipeSlideLayer,
            'touch-pan-y cursor-grab',
            draggingHorizontal ? 'cursor-grabbing select-none' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          style={slideTransformStyle}
          onClick={handleClickSwipe}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          {children}
          {showBodyInsetDivider ? (
            <div
              className={mergedRowDividerInset}
              aria-hidden="true"
            />
          ) : null}
        </div>
      </div>
    </div>
  )
}

export default CwSwipeRow
