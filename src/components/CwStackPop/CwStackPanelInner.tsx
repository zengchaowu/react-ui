import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { CwStack } from '../CwStack'
import type { CwStackComponent, CwStackHandle } from '../CwStack'
import type { CwStackPopApi, CwStackPopStepConfig } from './types'
import { CwStackPopContext } from './context'

export interface CwStackPanelInnerProps {
  onClose: () => void
  onComplete: () => void
  steps?: CwStackPopStepConfig[]
  initialStepIndex?: number
  /** 透传 CwStack.slideTransition：push/pop 横向转场 */
  slideTransition?: boolean
  registerStack?: (stack: CwStackHandle | null) => void
}

/**
 * 内部组件：作为 CwDynamicSheet 的 body 内容，承载 CwStack 并向下提供 api。
 * 由 CwStackPop 通过 `sheet.show(<CwStackPanelInner />)` 挂载。
 */
export function CwStackPanelInner({
  onClose,
  onComplete,
  steps = [],
  initialStepIndex,
  slideTransition = true,
  registerStack,
}: CwStackPanelInnerProps) {
  const stackRef = useRef<CwStackHandle | null>(null)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [stackSize, setStackSize] = useState(0)
  const initialStepsPushedRef = useRef(false)

  const total = steps.length
  const isFirst = currentStepIndex <= 0
  const isLast = total > 0 && currentStepIndex >= total - 1
  const isEntryStep =
    initialStepIndex != null &&
    initialStepIndex >= 0 &&
    currentStepIndex === initialStepIndex

  const doBack = useCallback(() => {
    stackRef.current?.pop()
    if (steps.length && currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1)
    }
  }, [currentStepIndex, steps.length])

  const doPush = useCallback(
    (
      component?: CwStackComponent,
      propsData?: Record<string, unknown>,
      _stepId?: string,
    ) => {
      if (!component) return
      stackRef.current?.push(component, propsData)
    },
    [],
  )

  const goNext = useCallback(() => {
    if (steps.length && currentStepIndex < steps.length - 1) {
      const next = steps[currentStepIndex + 1]
      if (next) {
        doPush(next.component, next.props, next.id)
        setCurrentStepIndex(currentStepIndex + 1)
      }
    } else {
      onComplete()
    }
  }, [currentStepIndex, doPush, onComplete, steps])

  const api = useMemo<CwStackPopApi>(
    () => ({
      close: onClose,
      back: doBack,
      push: doPush,
      complete: onComplete,
      stackSize,
      goPrev: doBack,
      goNext,
      isFirst,
      isLast,
      currentIndex: currentStepIndex,
      total,
      isEntryStep,
    }),
    [
      currentStepIndex,
      doBack,
      doPush,
      goNext,
      isEntryStep,
      isFirst,
      isLast,
      onClose,
      onComplete,
      stackSize,
      total,
    ],
  )

  useEffect(() => {
    const stack = stackRef.current
    if (!stack) return
    if (!initialStepsPushedRef.current && steps.length > 0) {
      const init = Math.min(
        Math.max(0, initialStepIndex ?? 0),
        steps.length - 1,
      )
      // 首屏连推多步不播转场；之后用户 back/push 才走 slideTransition
      stack.beginSilentStackBatch()
      try {
        for (let i = 0; i <= init; i++) {
          const step = steps[i]
          if (step) stack.push(step.component, step.props)
        }
      } finally {
        stack.endSilentStackBatch()
      }
      setCurrentStepIndex(init)
      initialStepsPushedRef.current = true
    }
    registerStack?.(stack)
    // 对应 Vue watch(stackRef, { flush: 'post', immediate: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <CwStackPopContext.Provider value={api}>
      <div className="flex min-h-0 w-full flex-1 flex-col">
        <CwStack
          ref={stackRef}
          className="min-h-0 flex-1 overflow-hidden"
          slideTransition={slideTransition}
          onStackChange={(next) => setStackSize(next.length)}
        />
      </div>
    </CwStackPopContext.Provider>
  )
}

export default CwStackPanelInner
