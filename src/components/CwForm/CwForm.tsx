import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type HTMLAttributes,
} from 'react'
import CwFormItem from '../CwFormItem/CwFormItem'
import CwCol from '../CwRow/CwCol'
import CwWrapRow from '../CwRow/CwWrapRow'
import {
  CwGridMeasuredLayoutContext,
  type CwGridMeasuredLayout,
} from '../CwRow/keys'
import {
  GRID_SPAN_TOTAL,
  resolveColSpanFromContainerWidth,
} from '@zengchaowu/ui-shared/components/CwRow/layout'
import {
  findBreakpointConfig,
  getCurrentBreakpoint,
  type Breakpoint,
} from '@zengchaowu/ui-shared/components/CwRow/utils/breakpoint'
import {
  resolveItemsPerRowFromColProps,
  resolveMaxVisibleItems,
  slotHasContent,
} from '../CwRow/functions/wrapRowSlotUtils'
import type { CwWrapRowProps } from '../CwRow/types'
import type { CwColProps } from '@zengchaowu/ui-shared/components/CwRow/types'
import type { CwFormItemConfigInForm, CwFormContextValue, CwFormExposed, CwFormProps } from './types'
import type { CwFormTexts } from '@zengchaowu/ui-shared/components/CwForm/types'
import type { ValidationResult } from '../CwFormItem/types'
import { formBase } from '@zengchaowu/ui-shared/components/CwForm/styles'
import { defaultTexts } from '@zengchaowu/ui-shared/components/CwForm/texts'

/** CwForm → CwFormItem 的上下文（对应 Vue provide/inject） */
export const CwFormContext = createContext<CwFormContextValue | null>(null)

export function useCwFormContext(): CwFormContextValue | null {
  return useContext(CwFormContext)
}

export type CwFormComponentProps = CwFormProps &
  Omit<HTMLAttributes<HTMLFormElement>, 'children' | 'className' | 'onChange' | 'onSubmit'>

const CwForm = forwardRef<CwFormExposed, CwFormComponentProps>(function CwForm(
  {
    config,
    value,
    disabled = false,
    readonly = false,
    texts: textsProp,
    onChange,
    onFieldChange,
    onSubmit,
    collapseControlsSlot,
    className,
    ...rest
  },
  ref,
) {
  const texts = useMemo<CwFormTexts>(
    () => ({ ...defaultTexts, ...(textsProp ?? {}) }),
    [textsProp],
  )

  // 表单数据
  const [formData, setFormData] = useState<Record<string, unknown>>(() => ({
    ...value,
  }))
  const formDataRef = useRef<Record<string, unknown>>({ ...value })

  /** 已交互过的字段：blur 后才展示该项错误 */
  const [touchedFields, setTouchedFields] = useState<Record<string, true>>({})
  /** 调用 validate() 后展示全部错误 */
  const [showAllErrors, setShowAllErrors] = useState(false)
  /** blur 延迟标记，避免 Select 点选项时 input 先 blur 导致闪错 */
  const touchTimers = useRef(new Map<string, ReturnType<typeof setTimeout>>())

  const layoutConfig = useMemo(() => {
    const layout = config.layout || {}
    return {
      maxRows: layout.maxRows ?? 999,
      grid: layout.grid || {},
      native: layout.native === true,
    }
  }, [config.layout])

  const useNativeForm = layoutConfig.native

  const defaultColProps = useMemo<CwColProps>(
    () => config.item?.col ?? { xs: 12, sm: 8, md: 6 },
    [config.item?.col],
  )

  const measureRef = useRef<HTMLDivElement | null>(null)
  const [containerWidth, setContainerWidth] = useState(0)
  const gutter = layoutConfig.grid.gutter ?? 0

  useLayoutEffect(() => {
    const element = measureRef.current
    if (!element || typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width
      if (width != null) setContainerWidth(width)
    })
    observer.observe(element)
    setContainerWidth(element.getBoundingClientRect().width)
    return () => observer.disconnect()
  }, [])

  const measuredLayout = useMemo<CwGridMeasuredLayout | undefined>(() => {
    if (containerWidth <= 0) return undefined
    const span = resolveColSpanFromContainerWidth(containerWidth, defaultColProps)
    return {
      columns: Math.max(1, Math.floor(GRID_SPAN_TOTAL / span)),
      gutter,
    }
  }, [containerWidth, defaultColProps, gutter])

  const rootClassName = [
    formBase.root,
    className,
    useNativeForm ? 'relative' : '',
    disabled
      ? formBase.rootDisabled
      : readonly
        ? formBase.rootReadonly
        : formBase.rootNormal,
  ]
    .filter(Boolean)
    .join(' ')

  const wrapRowProps: CwWrapRowProps = {
    ...layoutConfig.grid,
    wrap: true,
    maxRows: layoutConfig.maxRows,
    colPros: defaultColProps,
  }

  const getColProps = (item: CwFormItemConfigInForm): CwColProps =>
    item.col ?? defaultColProps

  const getItemConfig = (item: CwFormItemConfigInForm) => ({
    ...item,
    appearance: item.appearance ?? config.item?.appearance ?? 'default',
    disabled: disabled || item.disabled,
    readonly: readonly || item.readonly,
  })

  const getFormItemTexts = (): { requiredMessage?: string } => ({
    requiredMessage: texts.requiredMessage,
  })

  const computeValidationResult = (
    item: CwFormItemConfigInForm,
  ): ValidationResult => {
    if (item.validate) {
      return item.validate(formDataRef.current)
    }

    if (item.required) {
      const fieldValue = formDataRef.current[item.prop]
      const isEmpty =
        fieldValue === undefined ||
        fieldValue === null ||
        fieldValue === '' ||
        (Array.isArray(fieldValue) && fieldValue.length === 0)
      if (isEmpty) {
        return { valid: false, message: texts.requiredMessage }
      }
    }

    return { valid: true }
  }

  /** 仅在字段已交互或整表 validate 后把错误传给 FormItem 展示 */
  const getDisplayedValidationResult = (
    item: CwFormItemConfigInForm,
  ): ValidationResult => {
    const result = computeValidationResult(item)
    if (result.valid) return result
    if (showAllErrors || touchedFields[item.prop]) return result
    return { valid: true }
  }

  const markFieldTouched = useCallback((field: string) => {
    setTouchedFields((prev) => (prev[field] ? prev : { ...prev, [field]: true }))
  }, [])

  const clearTouchTimers = useCallback(() => {
    for (const timer of touchTimers.current.values()) clearTimeout(timer)
    touchTimers.current.clear()
  }, [])

  const scheduleFieldTouched = useCallback(
    (field: string) => {
      const prev = touchTimers.current.get(field)
      if (prev) clearTimeout(prev)
      touchTimers.current.set(
        field,
        setTimeout(() => {
          touchTimers.current.delete(field)
          markFieldTouched(field)
        }, 120),
      )
    },
    [markFieldTouched],
  )

  const validate = useCallback((): boolean => {
    clearTouchTimers()
    setShowAllErrors(true)
    return config.items.every((item) => computeValidationResult(item).valid)
  }, [clearTouchTimers, config.items, texts.requiredMessage])

  const clearValidate = useCallback(() => {
    clearTouchTimers()
    setShowAllErrors(false)
    setTouchedFields({})
  }, [clearTouchTimers])

  const initialValueRef = useRef<Record<string, unknown>>({ ...value })

  const resetFields = useCallback(() => {
    clearTouchTimers()
    setShowAllErrors(false)
    setTouchedFields({})
    const next = { ...initialValueRef.current }
    formDataRef.current = next
    setFormData(next)
    onChange?.(next)
  }, [clearTouchTimers, onChange])

  useEffect(() => {
    const next = { ...value }
    formDataRef.current = next
    setFormData(next)
  }, [value])

  useEffect(() => () => clearTouchTimers(), [clearTouchTimers])

  const [currentBreakpoint, setCurrentBreakpoint] = useState<Breakpoint>(() =>
    typeof window !== 'undefined' ? getCurrentBreakpoint() : 'lg',
  )

  useEffect(() => {
    const updateBreakpoint = () => setCurrentBreakpoint(getCurrentBreakpoint())
    updateBreakpoint()
    window.addEventListener('resize', updateBreakpoint)
    return () => window.removeEventListener('resize', updateBreakpoint)
  }, [])

  const isCollapsed = useMemo(() => {
    const itemsPerRow = (() => {
      if (measuredLayout && measuredLayout.columns > 0) {
        return measuredLayout.columns
      }
      const matched = findBreakpointConfig(defaultColProps, currentBreakpoint)
      return resolveItemsPerRowFromColProps(matched ?? defaultColProps.xs)
    })()
    const maxVisible = resolveMaxVisibleItems(
      layoutConfig.maxRows,
      itemsPerRow,
      slotHasContent(collapseControlsSlot),
    )
    return config.items.length > maxVisible
  }, [measuredLayout, defaultColProps, currentBreakpoint, layoutConfig.maxRows, collapseControlsSlot, config.items.length])

  const handleFieldChange = (field: string, fieldValue: unknown) => {
    if (disabled || readonly) return
    const next = { ...formDataRef.current, [field]: fieldValue }
    formDataRef.current = next
    setFormData(next)
    onChange?.(next)
    onFieldChange?.(field, fieldValue)
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!useNativeForm || disabled || readonly) return
    onSubmit?.({ ...formDataRef.current })
  }

  useImperativeHandle(
    ref,
    () => ({
      formData,
      isCollapsed,
      validate,
      clearValidate,
      resetFields,
    }),
    [formData, isCollapsed, validate, clearValidate, resetFields],
  )

  const contextValue = useMemo<CwFormContextValue>(
    () => ({
      formData,
      disabled,
      readonly,
      texts,
      markFieldTouched,
    }),
    [formData, disabled, readonly, texts, markFieldTouched],
  )

  return (
    <CwFormContext.Provider value={contextValue}>
      <CwGridMeasuredLayoutContext.Provider value={measuredLayout}>
        <form
          {...rest}
          className={rootClassName}
          aria-disabled={disabled ? 'true' : 'false'}
          aria-readonly={readonly ? 'true' : 'false'}
          onSubmit={handleSubmit}
        >
          {/* layout.native 时提供默认提交钮，多字段回车才能触发 submit */}
          {useNativeForm ? (
            <button
              type="submit"
              tabIndex={-1}
              aria-hidden="true"
              className={formBase.nativeSubmitTrigger}
            />
          ) : null}
          <div ref={measureRef} className="min-w-0 w-full">
            <CwWrapRow
              {...wrapRowProps}
              controlsSlot={
                slotHasContent(collapseControlsSlot)
                  ? collapseControlsSlot
                  : undefined
              }
            >
              {config.items.map((item) => (
                <CwCol key={item.prop} {...getColProps(item)}>
                  <CwFormItem
                    config={getItemConfig(item)}
                    validationResult={getDisplayedValidationResult(item)}
                    value={formData[item.prop]}
                    texts={getFormItemTexts()}
                    onChange={(nextValue) =>
                      handleFieldChange(item.prop, nextValue)
                    }
                    onBlur={() => scheduleFieldTouched(item.prop)}
                  />
                </CwCol>
              ))}
            </CwWrapRow>
          </div>
        </form>
      </CwGridMeasuredLayoutContext.Provider>
    </CwFormContext.Provider>
  )
})

export { CwForm }
export default CwForm
