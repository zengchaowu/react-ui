import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
} from 'react'
import type {
  CwStackComponent,
  CwStackExposed,
  CwStackItem,
  CwStackProps,
} from './types'
import { stackBase } from '@zengchaowu/ui-shared/components/CwStack/styles'

type LayerMotion =
  | 'idle-top'
  | 'idle-under'
  | 'enter-fwd'
  | 'leave-fwd'
  | 'enter-fwd-root'
  | 'enter-back'
  | 'leave-back'

const SLIDE_MS = 340

const motionClassMap: Record<LayerMotion, string> = {
  'idle-top': stackBase.layerIdleTop,
  'idle-under': stackBase.layerIdleUnder,
  'enter-fwd': stackBase.layerEnterFwd,
  'leave-fwd': stackBase.layerLeaveFwd,
  'enter-fwd-root': stackBase.layerEnterFwdRoot,
  'enter-back': stackBase.layerEnterBack,
  'leave-back': stackBase.layerLeaveBack,
}

/** CwStack → 子页面的页面栈上下文（对应 Vue provide/inject） */
export const CwStackContext = createContext<CwStackExposed | null>(null)

export function useCwStackContext(): CwStackExposed | null {
  return useContext(CwStackContext)
}

export interface CwStackComponentProps
  extends CwStackProps,
    Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'className'> {
  className?: string
}

export const CwStack = forwardRef<CwStackExposed, CwStackComponentProps>(
  function CwStack(
    {
      slideTransition = false,
      initialComponent,
      initialProps,
      stackCache = true,
      opaqueLayerBackground = true,
      onStackChange,
      onComponentPush,
      onComponentPop,
      className,
      ...rest
    },
    ref,
  ) {
    const stackCacheEnabled = stackCache !== false

    const [stack, setStack] = useState<CwStackItem[]>([])
    /** pop 转场期间暂留栈顶 DOM，动画结束后再卸 */
    const [leavingLayer, setLeavingLayer] = useState<CwStackItem | null>(null)
    /** 栈帧 id → 当前转场态；结束后清空，非栈顶回落为 idle-under（visibility 隐藏，保留 scrollTop） */
    const [layerMotions, setLayerMotions] = useState<Record<string, LayerMotion>>({})

    const stackRef = useRef(stack)
    const isInitializedRef = useRef(false)
    const silentStackBatchDepthRef = useRef(0)
    const nextStackEntryIdRef = useRef(0)
    const slideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    const slideTransitionRef = useRef(slideTransition)
    slideTransitionRef.current = slideTransition
    const stackCacheRef = useRef(stackCacheEnabled)
    stackCacheRef.current = stackCacheEnabled

    const callbacksRef = useRef({ onStackChange, onComponentPush, onComponentPop })
    callbacksRef.current = { onStackChange, onComponentPush, onComponentPop }

    const layerSurfaceClass = opaqueLayerBackground
      ? 'bg-[var(--bg-color-page)]'
      : 'bg-transparent'

    const allocStackEntryId = useCallback(() => {
      nextStackEntryIdRef.current += 1
      return `cw-stack-${nextStackEntryIdRef.current}`
    }, [])

    const clearSlideTimer = useCallback(() => {
      if (slideTimerRef.current) {
        clearTimeout(slideTimerRef.current)
        slideTimerRef.current = null
      }
    }, [])

    const finishSlideTransition = useCallback(() => {
      clearSlideTimer()
      setLayerMotions({})
      setLeavingLayer(null)
    }, [clearSlideTimer])

    const scheduleFinishSlide = useCallback(() => {
      clearSlideTimer()
      slideTimerRef.current = setTimeout(finishSlideTransition, SLIDE_MS)
    }, [clearSlideTimer, finishSlideTransition])

    const beginLayerMotions = useCallback(
      (motions: Record<string, LayerMotion>) => {
        setLayerMotions({ ...motions })
        scheduleFinishSlide()
      },
      [scheduleFinishSlide],
    )

    const push = useCallback(
      (component: CwStackComponent, propsForItem?: Record<string, unknown>) => {
        if (!component) {
          console.warn('CwStack: push 方法接收到了空组件')
          return
        }

        const prevStack = stackRef.current
        const wasEmpty = prevStack.length === 0
        const prevTop = prevStack[prevStack.length - 1]
        const silent = silentStackBatchDepthRef.current > 0
        const slide =
          slideTransitionRef.current && !silent && stackCacheRef.current

        const item: CwStackItem = {
          id: allocStackEntryId(),
          component,
          props: propsForItem,
        }

        if (slide) {
          setLeavingLayer(null)
          const motions: Record<string, LayerMotion> = {}
          if (prevTop) motions[prevTop.id] = 'leave-fwd'
          motions[item.id] = wasEmpty ? 'enter-fwd-root' : 'enter-fwd'
          beginLayerMotions(motions)
        } else {
          finishSlideTransition()
        }

        const nextStack = [...prevStack, item]
        stackRef.current = nextStack
        setStack(nextStack)
        callbacksRef.current.onComponentPush?.(item)
        callbacksRef.current.onStackChange?.(nextStack)
      },
      [allocStackEntryId, beginLayerMotions, finishSlideTransition],
    )

    const pop = useCallback((): CwStackItem | undefined => {
      const prevStack = stackRef.current
      if (prevStack.length === 0) return undefined

      const popped = prevStack[prevStack.length - 1]!
      const newTop = prevStack.length > 1 ? prevStack[prevStack.length - 2]! : undefined
      const silent = silentStackBatchDepthRef.current > 0
      const slide =
        slideTransitionRef.current && !silent && stackCacheRef.current && !!newTop

      const nextStack = prevStack.slice(0, -1)
      stackRef.current = nextStack
      setStack(nextStack)

      if (slide && newTop) {
        setLeavingLayer(popped)
        beginLayerMotions({
          [popped.id]: 'leave-back',
          [newTop.id]: 'enter-back',
        })
      } else {
        finishSlideTransition()
      }

      callbacksRef.current.onComponentPop?.(popped)
      callbacksRef.current.onStackChange?.(nextStack)
      return popped
    }, [beginLayerMotions, finishSlideTransition])

    const clear = useCallback(() => {
      finishSlideTransition()
      stackRef.current = []
      setStack([])
      isInitializedRef.current = false
    }, [finishSlideTransition])

    const size = useCallback(() => stackRef.current.length, [])

    const isEmpty = useCallback(() => stackRef.current.length === 0, [])

    const beginSilentStackBatch = useCallback(() => {
      silentStackBatchDepthRef.current += 1
    }, [])

    const endSilentStackBatch = useCallback(() => {
      silentStackBatchDepthRef.current = Math.max(
        0,
        silentStackBatchDepthRef.current - 1,
      )
    }, [])

    // 对应 Vue 的 immediate watchEffect：初始组件只装一次
    useEffect(() => {
      if (!initialComponent || stack.length > 0 || isInitializedRef.current) return
      const item: CwStackItem = {
        id: allocStackEntryId(),
        component: initialComponent,
        props: initialProps,
      }
      const nextStack = [item]
      stackRef.current = nextStack
      setStack(nextStack)
      isInitializedRef.current = true
    }, [allocStackEntryId, initialComponent, initialProps, stack.length])

    useEffect(() => {
      return () => clearSlideTimer()
    }, [clearSlideTimer])

    const currentItem: CwStackItem | null =
      stack.length > 0 ? stack[stack.length - 1]! : null

    const visibleLayers = useMemo(() => {
      if (!stackCacheEnabled) return currentItem ? [currentItem] : []
      const layers = [...stack]
      if (leavingLayer) layers.push(leavingLayer)
      return layers
    }, [currentItem, leavingLayer, stack, stackCacheEnabled])

    const stackHostClass =
      stackCacheEnabled || slideTransition ? stackBase.layerHost : ''

    function getStackIndex(item: CwStackItem): number {
      return stack.findIndex((entry) => entry.id === item.id)
    }

    function resolveLayerMotion(item: CwStackItem): LayerMotion {
      const explicit = layerMotions[item.id]
      if (explicit) return explicit
      if (leavingLayer?.id === item.id) return 'leave-back'
      const idx = getStackIndex(item)
      if (idx < 0) return 'idle-under'
      return idx === stack.length - 1 ? 'idle-top' : 'idle-under'
    }

    function getLayerClass(item: CwStackItem): string {
      const motion = resolveLayerMotion(item)
      return [
        stackBase.layer,
        layerSurfaceClass,
        motionClassMap[motion],
      ]
        .filter(Boolean)
        .join(' ')
    }

    function isDirectUnderTop(item: CwStackItem): boolean {
      const idx = getStackIndex(item)
      return idx >= 0 && idx === stack.length - 2
    }

    function shouldShowLayerScrim(item: CwStackItem): boolean {
      if (!slideTransition || !stackCacheEnabled) return false
      const motion = resolveLayerMotion(item)
      if (motion === 'leave-fwd' || motion === 'enter-back') return true
      return motion === 'idle-under' && isDirectUnderTop(item)
    }

    function getLayerScrimClass(item: CwStackItem): string {
      const motion = resolveLayerMotion(item)
      const scrimMap: Partial<Record<LayerMotion, string>> = {
        'leave-fwd': stackBase.layerScrimEnter,
        'enter-back': stackBase.layerScrimLeave,
        'idle-under': stackBase.layerScrimIdle,
      }
      return [stackBase.layerScrim, scrimMap[motion] ?? stackBase.layerScrimIdle]
        .filter(Boolean)
        .join(' ')
    }

    const renderItemContent = (item: CwStackItem, withKey = false) => {
      const ItemComponent = item.component
      return withKey ? (
        <ItemComponent key={item.id} {...(item.props ?? {})} />
      ) : (
        <ItemComponent {...(item.props ?? {})} />
      )
    }

    useImperativeHandle(
      ref,
      () => ({
        push,
        pop,
        clear,
        size,
        isEmpty,
        beginSilentStackBatch,
        endSilentStackBatch,
        get stack() {
          return stackRef.current
        },
      }),
      [
        push,
        pop,
        clear,
        size,
        isEmpty,
        beginSilentStackBatch,
        endSilentStackBatch,
      ],
    )

    const contextValue = useMemo<CwStackExposed>(
      () => ({
        push,
        pop,
        clear,
        size,
        isEmpty,
        beginSilentStackBatch,
        endSilentStackBatch,
        stack,
      }),
      [
        push,
        pop,
        clear,
        size,
        isEmpty,
        beginSilentStackBatch,
        endSilentStackBatch,
        stack,
      ],
    )

    const rootClass = [stackBase.root, stackHostClass, className]
      .filter(Boolean)
      .join(' ')

    return (
      <CwStackContext.Provider value={contextValue}>
        <div {...rest} className={rootClass}>
          {stackCacheEnabled ? (
            visibleLayers.map((item) => (
              <div key={item.id} className={getLayerClass(item)}>
                {shouldShowLayerScrim(item) ? (
                  <div className={getLayerScrimClass(item)} aria-hidden="true" />
                ) : null}
                {renderItemContent(item)}
              </div>
            ))
          ) : currentItem ? (
            renderItemContent(currentItem, true)
          ) : null}
        </div>
      </CwStackContext.Provider>
    )
  },
)

export default CwStack
