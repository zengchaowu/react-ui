import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type HTMLAttributes,
} from 'react'
import { CwDynamicSheet } from '../CwDynamicSheet'
import type { CwDynamicSheetHandle } from '../CwDynamicSheet'
import { CwStackPanelInner } from './CwStackPanelInner'
import type { CwStackComponent, CwStackHandle } from '../CwStack'
import type {
  CwStackPopHandle,
  CwStackPopProps,
  CwStackPopStepConfig,
} from './types'
import { defaultTexts as defaultSheetTexts } from '@zengchaowu/ui-shared/components/CwDynamicSheet/texts'
import { CW_OVERLAY_CONTENT_BODY_NO_PADDING_FLEX_CLASS } from '@zengchaowu/ui-shared/constants/cwOverlayHeaderTitle'

/** bottom sheet 需有明确 min-height，否则 CwStack 绝对定位层在 flex 布局下高度为 0 */
function resolveSheetContentMinHeightClass(height?: string): string {
  const normalized = height?.trim().toLowerCase()
  if (normalized === '100%' || normalized === '100dvh' || normalized === '100vh') {
    return 'min-h-[100dvh]'
  }
  if (normalized === '80%' || normalized === '80vh') {
    return 'min-h-[80vh]'
  }
  if (normalized === '70%' || normalized === '70vh') {
    return 'min-h-[70vh]'
  }
  return 'min-h-[70vh]'
}

export interface CwStackPopComponentProps
  extends CwStackPopProps,
    Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'className' | 'onClose'> {
  className?: string
}

export const CwStackPop = forwardRef<CwStackPopHandle, CwStackPopComponentProps>(
  function CwStackPop(
    {
      show = false,
      height = '80%',
      transition = true,
      steps = [],
      initialStepIndex,
      texts: textsProp,
      onShowChange,
      onClose,
      onComplete,
      className,
      ...rest
    },
    ref,
  ) {
    const sheetRef = useRef<CwDynamicSheetHandle | null>(null)
    const sheetIdRef = useRef<string | null>(null)
    const innerStackRef = useRef<CwStackHandle | null>(null)
    const pendingPushesRef = useRef<
      Array<{ component?: CwStackComponent; props?: Record<string, unknown> }>
    >([])

    const [sheetHostReady, setSheetHostReady] = useState(false)

    const propsRef = useRef({ steps, initialStepIndex, transition, height })
    propsRef.current = { steps, initialStepIndex, transition, height }

    const onShowChangeRef = useRef(onShowChange)
    onShowChangeRef.current = onShowChange
    const onCloseRef = useRef(onClose)
    onCloseRef.current = onClose
    const onCompleteRef = useRef(onComplete)
    onCompleteRef.current = onComplete

    const sheetTexts = { ...defaultSheetTexts, ...(textsProp ?? {}) }

    useEffect(() => {
      setSheetHostReady(true)
    }, [])

    const handleSheetClose = useCallback((id: string) => {
      if (id === sheetIdRef.current) {
        sheetIdRef.current = null
        innerStackRef.current = null
        onShowChangeRef.current?.(false)
        onCloseRef.current?.()
      }
    }, [])

    const hideSheet = useCallback(() => {
      if (sheetIdRef.current && sheetRef.current) {
        sheetRef.current.hide(sheetIdRef.current)
        sheetIdRef.current = null
        innerStackRef.current = null
      }
    }, [])

    const handleClose = useCallback(() => {
      hideSheet()
      onShowChangeRef.current?.(false)
      onCloseRef.current?.()
    }, [hideSheet])

    const handleComplete = useCallback(() => {
      hideSheet()
      onShowChangeRef.current?.(false)
      onCompleteRef.current?.()
    }, [hideSheet])

    const handleRegisterStack = useCallback((stack: CwStackHandle | null) => {
      if (!stack) return
      innerStackRef.current = stack
      const pending = pendingPushesRef.current
      pendingPushesRef.current = []
      pending.forEach(({ component, props: propsData }) => {
        if (component) stack.push(component, propsData)
      })
    }, [])

    const doPush = useCallback(
      (
        component?: CwStackComponent,
        propsData?: Record<string, unknown>,
        _stepId?: string,
      ) => {
        if (!component) return
        if (innerStackRef.current) {
          innerStackRef.current.push(component, propsData)
        } else {
          pendingPushesRef.current.push({ component, props: propsData })
        }
      },
      [],
    )

    const doBack = useCallback(() => {
      innerStackRef.current?.pop()
    }, [])

    const doClear = useCallback(() => {
      innerStackRef.current?.clear()
    }, [])

    useEffect(() => {
      if (!show) {
        hideSheet()
        pendingPushesRef.current = []
        return
      }
      const sheet = sheetRef.current
      if (!sheet || sheetIdRef.current) return

      const current = propsRef.current
      const panelContent = (
        <CwStackPanelInner
          onClose={handleClose}
          onComplete={handleComplete}
          steps={current.steps}
          initialStepIndex={current.initialStepIndex}
          slideTransition={current.transition}
          registerStack={handleRegisterStack}
        />
      )
      const id = sheet.show(panelContent, {
        direction: 'bottom',
        closeOnClickOutside: true,
        header: <div className="flex-1" />,
        bodyPadding: false,
        bodyScroll: false,
        body: { class: CW_OVERLAY_CONTENT_BODY_NO_PADDING_FLEX_CLASS },
        content: { class: resolveSheetContentMinHeightClass(current.height) },
      })
      sheetIdRef.current = id
    }, [
      show,
      sheetHostReady,
      handleClose,
      handleComplete,
      handleRegisterStack,
      hideSheet,
    ])

    useImperativeHandle(
      ref,
      () => ({
        push: doPush,
        back: doBack,
        close: handleClose,
        complete: handleComplete,
        clear: doClear,
        get stackRef() {
          return innerStackRef.current
        },
      }),
      [doPush, doBack, handleClose, handleComplete, doClear],
    )

    return (
      <CwDynamicSheet
        {...rest}
        ref={sheetRef}
        texts={sheetTexts}
        className={className}
        onClose={handleSheetClose}
      />
    )
  },
)

export default CwStackPop
