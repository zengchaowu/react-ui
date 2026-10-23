import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react'
import type { HTMLAttributes } from 'react'
import { createPortal } from 'react-dom'
import { createCwPopup } from './functions/createCwPopup'
import { PopupContainer } from './functions/PopupContainer'
import type {
  CwPopupInstance,
  CwPopupProps,
  PopupPluginFunction,
  VirtualElement,
} from './types'
import { resolveCwPopupShellClass, resolveCwPopupTriggerClass } from './styles'
import { DEFAULT_CONFIG } from './constants'

const EMPTY_PLUGINS: PopupPluginFunction[] = []

export interface CwPopupComponentProps
  extends CwPopupProps,
    Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'className'> {}

/**
 * CwPopup - 自研定位引擎浮层底座
 * 由 React Hook 版函数式 API（createCwPopup）+ createPortal 容器组合实现。
 */
export const CwPopup = forwardRef<CwPopupInstance, CwPopupComponentProps>(
  function CwPopup(props, ref) {
    const {
      placement = DEFAULT_CONFIG.placement,
      trigger = DEFAULT_CONFIG.trigger,
      plugins = EMPTY_PLUGINS,
      showDelay = DEFAULT_CONFIG.showDelay,
      hideDelay = DEFAULT_CONFIG.hideDelay,
      closeOnClickOutside = DEFAULT_CONFIG.closeOnClickOutside,
      modelValue = false,
      appearance = 'default',
      popupClass,
      triggerClass,
      texts: _texts,
      virtualReference,
      dismissGraceMs,
      closeOnScroll,
      extraTraps,
      getMountContainer,
      children,
      triggerSlot,
      className,
      onVisibleChange,
      onUpdateModelValue,
      onTriggerResize,
      onMaxHeightChange,
      ...rest
    } = props

    const triggerRef = useRef<HTMLDivElement | null>(null)

    const resolvedPopupClass = useMemo(
      () => resolveCwPopupShellClass(appearance, popupClass),
      [appearance, popupClass],
    )
    const resolvedTriggerClass = useMemo(
      () => resolveCwPopupTriggerClass(appearance, triggerClass),
      [appearance, triggerClass],
    )

    const getTriggerElement = useCallback((): HTMLElement | VirtualElement | null => {
      if (virtualReference) return virtualReference
      return triggerRef.current
    }, [virtualReference])

    const handleVisibleChange = useCallback(
      (visible: boolean) => {
        onVisibleChange?.(visible)
        onUpdateModelValue?.(visible)
      },
      [onVisibleChange, onUpdateModelValue],
    )

    const { instance, state, containerMounted, mountContainer, hostRef, popupElement, pluginElement, bridgeElement } =
      createCwPopup({
        placement,
        trigger,
        plugins,
        showDelay,
        hideDelay,
        closeOnClickOutside,
        popupClass: resolvedPopupClass,
        virtualReference,
        dismissGraceMs,
        closeOnScroll,
        extraTraps,
        getMountContainer,
        getTriggerElement,
        onVisibleChange: handleVisibleChange,
        onTriggerResize,
        onMaxHeightChange,
      })

    useImperativeHandle(ref, () => instance, [instance])

    const isManual = trigger === 'manual'

    // 首次挂载：manual + modelValue=true 时自动显示
    const didInitRef = useRef(false)
    useEffect(() => {
      if (didInitRef.current) return
      didInitRef.current = true
      if (isManual && modelValue) {
        void instance.show()
      }
    }, [instance, isManual, modelValue])

    // v-model：仅 manual 模式响应
    const prevModelValueRef = useRef(modelValue)
    useEffect(() => {
      if (prevModelValueRef.current === modelValue) return
      prevModelValueRef.current = modelValue
      if (!isManual) return
      if (modelValue) {
        void instance.show()
      } else {
        instance.hide()
      }
    }, [instance, isManual, modelValue])

    // 虚拟参考元素变化：保持已打开浮层位置同步
    useEffect(() => {
      if (modelValue) instance.updatePosition()
    }, [instance, modelValue, virtualReference])

    return (
      <>
        {!virtualReference ? (
          <div
            ref={triggerRef}
            className={[resolvedTriggerClass, className].filter(Boolean).join(' ')}
            {...rest}
          >
            {triggerSlot}
          </div>
        ) : null}
        {containerMounted && mountContainer
          ? createPortal(
              <div ref={hostRef} className="pointer-events-none">
                <PopupContainer
                  visible={state.visible}
                  offsetX={state.position?.x ?? null}
                  offsetY={state.position?.y ?? null}
                  styleClass={resolvedPopupClass}
                  popupRef={popupElement}
                  pluginRef={pluginElement}
                  bridgeRef={bridgeElement}
                >
                  {children}
                </PopupContainer>
              </div>,
              mountContainer,
            )
          : null}
      </>
    )
  },
)

export default CwPopup
