import {
  createContext,
  useContext,
  useMemo,
  type FocusEvent,
  type HTMLAttributes,
  type ReactNode,
} from 'react'
import type { CwFormItemErrorSlotScope, CwFormItemLabelSlotScope, CwFormItemProps, CwFormItemSlotContent, ValidationResult } from './types'
import type { CwFormItemTexts } from '@zengchaowu/ui-shared/components/CwFormItem/types'
import { resolveFormItemStyles } from '@zengchaowu/ui-shared/components/CwFormItem/formItemAppearance'
import { defaultTexts } from '@zengchaowu/ui-shared/components/CwFormItem/texts'
import CwTooltip from '../CwTooltip/CwTooltip'
import { CwIcon } from '../CwIcon'

export interface CwFormItemComponentProps
  extends CwFormItemProps,
    Omit<
      HTMLAttributes<HTMLDivElement>,
      'children' | 'className' | 'onChange' | 'onFocus' | 'onBlur'
    > {}

/** CwFormItem → 内部渲染的上下文（对应 Vue 作用域插槽参数） */
export interface CwFormItemContextValue {
  componentId: string
  labelId: string
  errorId: string
  validationResult?: ValidationResult
  texts: CwFormItemTexts
  hasError: boolean
}

export const CwFormItemContext = createContext<CwFormItemContextValue | null>(null)

export function useCwFormItemContext(): CwFormItemContextValue | null {
  return useContext(CwFormItemContext)
}

function renderSlot<T>(
  slot: CwFormItemSlotContent<T> | undefined,
  scope: T,
): ReactNode {
  return typeof slot === 'function' ? slot(scope) : slot
}

export function CwFormItem({
  config,
  validationResult,
  value,
  onChange,
  onFocus,
  onBlur,
  onChangeEvent,
  texts: textsProp,
  labelSlot,
  errorSlot,
  className,
  ...rest
}: CwFormItemComponentProps) {
  const styles = useMemo(
    () => resolveFormItemStyles(config.appearance ?? 'default'),
    [config.appearance],
  )
  const texts = useMemo<CwFormItemTexts>(
    () => ({ ...defaultTexts, ...(textsProp ?? {}) }),
    [textsProp],
  )

  const componentId = `cw-form-item-${config.prop}`
  const labelId = `${componentId}-label`
  const errorId = `${componentId}-error`

  const hasError = Boolean(
    validationResult &&
      validationResult.valid === false &&
      validationResult.message,
  )

  const hasLabelSlot = labelSlot != null
  const hasErrorSlot = errorSlot != null

  const componentConfig = config.componentConfig
  const Component = componentConfig?.component ?? null

  const isDisabled = config.disabled ?? false
  const isReadonly = config.readonly ?? false

  const componentProps = useMemo<Record<string, unknown>>(() => {
    if (!componentConfig) return {}
    const merged: Record<string, unknown> = {
      ...(componentConfig.defaultProps ?? {}),
      ...(config.props ?? {}),
    }
    // FormItem 级别的 disabled 和 readonly 优先级最高
    merged.disabled = isDisabled
    merged.readonly = isReadonly
    return merged
  }, [componentConfig, config.props, isDisabled, isReadonly])

  const labelInlineStyle = useMemo(() => {
    const lw = config.labelWidth
    let width: string | undefined
    if (typeof lw === 'function') {
      width = lw(config)
    } else if (typeof lw === 'string') {
      width = lw
    }
    return width ? { width } : undefined
  }, [config])

  const handleFocus = (event: FocusEvent) => {
    onFocus?.(event)
  }

  const handleBlur = (event: FocusEvent) => {
    onBlur?.(event)
  }

  const handleChange = (payload: unknown) => {
    onChange?.(payload)
    if (payload instanceof Event) onChangeEvent?.(payload)
  }

  const contextValue = useMemo<CwFormItemContextValue>(
    () => ({
      componentId,
      labelId,
      errorId,
      validationResult,
      texts,
      hasError,
    }),
    [componentId, labelId, errorId, validationResult, texts, hasError],
  )

  const rootClassName = [
    styles.root,
    className,
    isDisabled
      ? styles.rootDisabled
      : isReadonly
        ? styles.rootReadonly
        : styles.rootNormal,
  ]
    .filter(Boolean)
    .join(' ')

  const labelClassName = [
    styles.label,
    isDisabled
      ? styles.labelDisabled
      : isReadonly
        ? styles.labelReadonly
        : styles.labelNormal,
  ]
    .filter(Boolean)
    .join(' ')

  const requiredClassName = [
    styles.labelRequired,
    isDisabled
      ? styles.labelRequiredDisabled
      : isReadonly
        ? styles.labelRequiredReadonly
        : styles.labelRequiredNormal,
  ]
    .filter(Boolean)
    .join(' ')

  const labelScope: CwFormItemLabelSlotScope = { config }
  const errorScope: CwFormItemErrorSlotScope = {
    validationResult,
    config,
    texts,
    errorId,
  }

  return (
    <CwFormItemContext.Provider value={contextValue}>
      <div
        {...rest}
        className={rootClassName}
        role="group"
        aria-disabled={isDisabled ? 'true' : 'false'}
      >
        {hasLabelSlot || config.label ? (
          <div
            id={labelId}
            className={labelClassName}
            style={labelInlineStyle}
          >
            {hasLabelSlot ? (
              renderSlot(labelSlot, labelScope)
            ) : (
              <span className="inline-flex items-center gap-0.5">
                <span className={styles.labelText}>{config.label}</span>
                {config.required ? (
                  <span aria-hidden="true" className={requiredClassName}>
                    *
                  </span>
                ) : null}
                {config.labelTip ? (
                  <CwTooltip
                    content={config.labelTip}
                    placement="top"
                    trigger="hover"
                    showDelay={120}
                    appearance="inline"
                    className="inline-flex shrink-0 items-center"
                    triggerSlot={
                      <button
                        type="button"
                        className={styles.labelTipTrigger}
                        aria-label={`${config.label ?? ''}说明`}
                        tabIndex={0}
                        onClick={(event) => event.preventDefault()}
                      >
                        <CwIcon
                          name="common--status--info-line"
                          prefix="icon"
                          size={0.875}
                        />
                      </button>
                    }
                  />
                ) : null}
              </span>
            )}
          </div>
        ) : null}

        <div className={styles.content}>
          {Component ? (
            <div className={styles.component}>
              <Component
                id={componentId}
                {...componentProps}
                value={value}
                onChange={handleChange}
                aria-labelledby={
                  hasLabelSlot || config.label ? labelId : undefined
                }
                aria-describedby={hasError ? errorId : undefined}
                aria-invalid={hasError ? 'true' : undefined}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
            </div>
          ) : null}

          {hasErrorSlot ? (
            renderSlot(errorSlot, errorScope)
          ) : hasError && validationResult?.message ? (
            <div id={errorId} role="alert" className={styles.error}>
              {validationResult.message}
            </div>
          ) : null}
        </div>
      </div>
    </CwFormItemContext.Provider>
  )
}

export default CwFormItem
