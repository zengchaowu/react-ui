import {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useRef,
  type ChangeEvent,
  type FocusEvent,
  type PointerEvent,
} from 'react'
import CwDiv from '../CwDiv/CwDiv'
import type { CwTextareaHandle, CwTextareaProps } from './types'
import { textareaBase } from './styles'
import { defaultTexts } from './texts'
import { useTextareaAutosize } from './useTextareaAutosize'
import { useBrowserFocusVisible } from '../../hooks/useBrowserFocusVisible'

export const CwTextarea = forwardRef<CwTextareaHandle, CwTextareaProps>(function CwTextarea(
  {
    value: valueProp,
    placeholder,
    label,
    showLabel = false,
    disabled = false,
    readonly = false,
    maxlength,
    rows = 4,
    showCount = false,
    maxRows,
    minRows,
    size = 'medium',
    texts: textsProp,
    className,
    onChange,
    onInput,
    onFocus,
    onBlur,
    ...rest
  },
  ref,
) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const { isFocusVisible, handleFocus: handleFocusVisibleFocus, handleBlur: handleFocusVisibleBlur } =
    useBrowserFocusVisible()

  const styles = textareaBase
  const texts = useMemo(
    () => ({ ...defaultTexts, ...(textsProp ?? {}) }),
    [textsProp],
  )

  const sizeClass = (() => {
    const sizeMap = {
      small: styles.sizeSmall,
      medium: styles.sizeMedium,
      large: styles.sizeLarge,
    }
    return sizeMap[size || 'medium']
  })()

  const displayLabel = label ?? texts.label
  const displayPlaceholder = placeholder ?? texts.placeholder

  const value = valueProp ?? ''

  const currentLength = value.length

  const formattedCounter = (() => {
    if (!showCount) return ''
    const template = texts.counter ?? ''
    const templateToUse = template.length > 0 ? template : '{{length}}'
    const maxLengthValue = typeof maxlength === 'number' ? String(maxlength) : ''
    let result = templateToUse
      .replace('{{length}}', String(currentLength))
      .replace('{{maxlength}}', maxLengthValue)
      .replace(/\s{2,}/g, ' ')
      .trim()
    if (!maxLengthValue) {
      result = result.replace(/([\/\-\|,]\s*)$/, '').trim()
    }
    return result
  })()

  const showCounter = showCount && formattedCounter.length > 0

  const baseRows = Math.max(1, rows)
  const resolvedMinRows =
    typeof minRows === 'number' && minRows > 0 ? Math.max(1, minRows) : baseRows
  const resolvedMaxRows =
    typeof maxRows === 'number' && maxRows > 0
      ? Math.max(resolvedMinRows, maxRows)
      : undefined
  const textareaRows = resolvedMinRows

  useTextareaAutosize({
    textareaRef,
    minRows: resolvedMinRows,
    maxRows: resolvedMaxRows,
    value,
  })

  const handleInput = (event: ChangeEvent<HTMLTextAreaElement>) => {
    if (disabled || readonly) return
    const nextValue = event.target.value
    onChange?.(nextValue)
    onInput?.(nextValue)
  }

  const handleFocus = (event: FocusEvent<HTMLTextAreaElement>) => {
    if (disabled) return
    handleFocusVisibleFocus()
    onFocus?.(event.nativeEvent)
  }

  const handleBlur = (event: FocusEvent<HTMLTextAreaElement>) => {
    handleFocusVisibleBlur()
    onBlur?.(event.nativeEvent)
  }

  const handleWrapperPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (disabled) return
    const el = textareaRef.current
    if (!el) return
    const target = event.target as Node | null
    if (target && el.contains(target)) return
    // 点击到 wrapper（含滚动条/边框区域）时，兜底把焦点交给 textarea
    try {
      el.focus({ preventScroll: true })
    } catch {
      el.focus()
    }
  }

  useImperativeHandle(
    ref,
    () => ({
      focus: () => textareaRef.current?.focus(),
      blur: () => textareaRef.current?.blur(),
      select: () => textareaRef.current?.select(),
      get textareaRef() {
        return textareaRef.current
      },
    }),
    [],
  )

  return (
    <div
      {...rest}
      className={[
        styles.root,
        disabled
          ? styles.rootDisabled
          : readonly
            ? styles.rootReadonly
            : styles.rootNormal,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {showLabel && displayLabel && (
        <div
          className={[styles.label, disabled ? styles.labelDisabled : styles.labelNormal]
            .filter(Boolean)
            .join(' ')}
        >
          {displayLabel}
        </div>
      )}
      <CwDiv
        className={[
          styles.textareaWrapper,
          disabled
            ? styles.textareaWrapperDisabled
            : readonly
              ? styles.textareaWrapperReadonly
              : styles.textareaWrapperNormal,
          isFocusVisible && !disabled ? styles.textareaWrapperFocus : '',
        ]
          .filter(Boolean)
          .join(' ')}
        onPointerDown={handleWrapperPointerDown}
      >
        <textarea
          ref={textareaRef}
          value={value}
          rows={textareaRows}
          placeholder={displayPlaceholder}
          disabled={disabled}
          readOnly={readonly}
          maxLength={maxlength}
          aria-disabled={disabled ? 'true' : 'false'}
          aria-readonly={readonly ? 'true' : 'false'}
          aria-label={displayLabel ?? displayPlaceholder ?? undefined}
          className={[
            styles.textarea,
            sizeClass,
            disabled
              ? styles.textareaDisabled
              : readonly
                ? styles.textareaReadonly
                : styles.textareaNormal,
          ]
            .filter(Boolean)
            .join(' ')}
          onInput={handleInput}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
      </CwDiv>
      {showCounter && (
        <div
          className={[styles.counter, disabled ? styles.counterDisabled : styles.counterNormal]
            .filter(Boolean)
            .join(' ')}
        >
          {formattedCounter}
        </div>
      )}
    </div>
  )
})

export default CwTextarea
