import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react'
import type { HTMLAttributes, ReactNode } from 'react'
import { CwPopup } from '../CwPopup'
import type { CwPopupInstance } from '../CwPopup'
import { resolveHoverCloseOnClickOutside } from '../CwPopup'
import { buildTooltipPopupPlugins } from '@zengchaowu/ui-shared/components/CwTooltip/buildTooltipPlugins'
import { appearanceStyles, tooltipBase } from '@zengchaowu/ui-shared/components/CwTooltip/styles'
import { defaultTexts } from '@zengchaowu/ui-shared/components/CwTooltip/texts'
import type { CwTooltipEmits, CwTooltipInstance, CwTooltipProps, CwTooltipSlotScope } from './types'
import type { CwTooltipStyles, CwTooltipTexts } from '@zengchaowu/ui-shared/components/CwTooltip/types'

export interface CwTooltipComponentProps
  extends CwTooltipProps,
    CwTooltipEmits,
    Omit<
      HTMLAttributes<HTMLDivElement>,
      'id' | 'content' | 'children' | 'className' | 'onChange'
    > {
  /** 默认插槽（浮层内容）；支持作用域插槽函数 */
  children?:
    | ReactNode
    | ((scope: CwTooltipSlotScope) => ReactNode)
  /** Vue `#trigger` 具名插槽；支持作用域插槽函数 */
  triggerSlot?:
    | ReactNode
    | ((scope: CwTooltipSlotScope) => ReactNode)
  className?: string
}

const generateTooltipId = () =>
  `cw-tooltip-${Math.random().toString(36).slice(2, 10)}`

/**
 * CwTooltip - 基于 CwPopup 的轻量提示浮层。
 * Vue `useCwTooltipPopup` 的 React 等价实现。
 */
export const CwTooltip = forwardRef<CwTooltipInstance, CwTooltipComponentProps>(
  function CwTooltip(props, ref) {
    const {
      id,
      content,
      placement = 'top',
      trigger = 'hover',
      showDelay = 120,
      hideDelay = 100,
      offset = 8,
      arrowMargin = 8,
      showArrow = true,
      closeOnClickOutside = false,
      viewportPadding = 8,
      flip = true,
      plugins,
      value,
      appearance = 'default',
      texts: textsProp,
      children,
      triggerSlot,
      className,
      onVisibleChange,
      onChange,
      onTriggerResize,
      ...rest
    } = props

    const popupRef = useRef<CwPopupInstance | null>(null)

    const generatedIdRef = useRef<string>('')
    if (!generatedIdRef.current) {
      generatedIdRef.current = generateTooltipId()
    }
    const tooltipId = id ?? generatedIdRef.current

    const styles = useMemo<CwTooltipStyles>(
      () => ({
        ...tooltipBase,
        ...(appearanceStyles[appearance] ?? {}),
      }),
      [appearance],
    )

    const texts = useMemo<CwTooltipTexts>(
      () => ({ ...defaultTexts, ...(textsProp ?? {}) }),
      [textsProp],
    )

    const resolvedCloseOnClickOutside = useMemo(
      () => resolveHoverCloseOnClickOutside(trigger, closeOnClickOutside),
      [trigger, closeOnClickOutside],
    )

    const tooltipPlugins = useMemo(
      () =>
        buildTooltipPopupPlugins({
          flip,
          viewportPadding,
          offset,
          showArrow,
          arrowMargin,
          arrowClass: styles.arrow,
          extraPlugins: plugins,
        }),
      [
        flip,
        viewportPadding,
        offset,
        showArrow,
        arrowMargin,
        styles.arrow,
        plugins,
      ],
    )

    const [visible, setVisible] = useState(false)
    const visibleRef = useRef(visible)
    visibleRef.current = visible

    const handleVisibleChange = useCallback(
      (nextVisible: boolean) => {
        setVisible(nextVisible)
        onVisibleChange?.(nextVisible)
      },
      [onVisibleChange],
    )

    const handleChange = useCallback(
      (nextVisible: boolean) => {
        onChange?.(nextVisible)
      },
      [onChange],
    )

    // Vue 在重创建设置变更时销毁并重建 popup：用 key 复刻同一语义
    const recreateKey = useMemo(
      () =>
        JSON.stringify([
          trigger,
          placement,
          showDelay,
          hideDelay,
          offset,
          arrowMargin,
          showArrow,
          closeOnClickOutside,
          viewportPadding,
          flip,
          appearance,
          plugins?.length,
        ]),
      [
        trigger,
        placement,
        showDelay,
        hideDelay,
        offset,
        arrowMargin,
        showArrow,
        closeOnClickOutside,
        viewportPadding,
        flip,
        appearance,
        plugins,
      ],
    )

    useEffect(() => {
      setVisible(false)
    }, [recreateKey])

    useImperativeHandle(
      ref,
      () => ({
        show: () => popupRef.current?.show(),
        hide: () => popupRef.current?.hide(),
        toggle: () => popupRef.current?.toggle(),
        updatePosition: () => popupRef.current?.updatePosition(),
        getState: () => popupRef.current?.state,
        isVisible: () => visibleRef.current,
      }),
      [],
    )

    const scope: CwTooltipSlotScope = { visible, id: tooltipId }

    const scopedContent =
      typeof children === 'function' ? children(scope) : children
    const resolvedContent =
      scopedContent != null ? scopedContent : (content ?? texts.content)

    const scopedTrigger =
      typeof triggerSlot === 'function' ? triggerSlot(scope) : triggerSlot
    const resolvedTrigger =
      scopedTrigger !== undefined ? (
        scopedTrigger
      ) : (
        <span className={styles.fallbackTrigger}>{texts.trigger}</span>
      )

    const triggerAttrs: { 'data-cw-tooltip-trigger': string } = {
      'data-cw-tooltip-trigger': 'true',
    }

    return (
      <CwPopup
        key={recreateKey}
        ref={popupRef}
        placement={placement}
        trigger={trigger}
        plugins={tooltipPlugins}
        showDelay={showDelay}
        hideDelay={hideDelay}
        closeOnClickOutside={resolvedCloseOnClickOutside}
        modelValue={value}
        popupClass={styles.popup}
        triggerClass={styles.root}
        className={className}
        onVisibleChange={handleVisibleChange}
        onUpdateModelValue={handleChange}
        onTriggerResize={onTriggerResize}
        triggerSlot={resolvedTrigger}
        {...rest}
        {...triggerAttrs}
        aria-describedby={tooltipId}
      >
        <div
          id={tooltipId}
          className={styles.content}
          aria-hidden={visible ? 'false' : 'true'}
          data-cw-tooltip-visible={visible ? 'true' : 'false'}
        >
          {resolvedContent}
        </div>
      </CwPopup>
    )
  },
)

export default CwTooltip
