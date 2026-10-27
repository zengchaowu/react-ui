import {
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type CompositionEvent,
  type FocusEvent as ReactFocusEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from 'react'
import '../CwInput/cw-input-plain.css'
import { CwIcon } from '../CwIcon/CwIcon'
import type { CwNumberInputProps } from './types'
import type { CwNumberInputStyles } from '@zengchaowu/ui-shared/components/CwNumberInput/types'
import { numberInputBase } from '@zengchaowu/ui-shared/components/CwNumberInput/styles'
import {
  appearanceIconClass,
  appearanceInputClass,
  appearanceRootClass,
  appearanceSkipsSize,
  appearanceSkipsWrapperChrome,
  appearanceSkipsWrapperFocus,
  appearanceSuffixClass,
  appearanceWrapperClass,
  inputBase,
} from '@zengchaowu/ui-shared/components/CwInput/styles'
import { defaultTexts } from '@zengchaowu/ui-shared/components/CwNumberInput/texts'
import { stepNumber } from '@zengchaowu/ui-shared/components/CwNumberInput/functions/stepNumber'
import { useBrowserFocusVisible } from '../../hooks/useBrowserFocusVisible'
import { cwClearIconSize } from '@zengchaowu/ui-shared/functions/ui/cwClearIconSize'
import type { CwInputSlotContent, CwInputSlotProps } from '../CwInput/types'

const inputWrapperLayoutClass = 'flex min-w-0 items-center'
const inputLayoutClass = 'min-w-0 flex-1 w-full border-0 bg-transparent outline-none focus:outline-none'

export function CwNumberInput({
  value,
  placeholder,
  min,
  max,
  step = 1,
  allowDecimal = true,
  disabled = false,
  readonly = false,
  clearable = true,
  label,
  showLabel = false,
  align = 'left',
  size = 'medium',
  appearance: appearanceProp = 'default',
  texts: textsProp,
  iconSlot,
  clearSlot,
  suffixSlot,
  className,
  onChange,
  onInput,
  onFocus,
  onBlur,
  onClear,
  ...rest
}: CwNumberInputProps) {
  const styles: CwNumberInputStyles = numberInputBase
  const texts = useMemo(
    () => ({ ...defaultTexts, ...(textsProp ?? {}) }),
    [textsProp],
  )
  const appearance = appearanceProp || 'default'

  const { isFocusVisible, handleFocus: handleFocusVisibleFocus, handleBlur: handleFocusVisibleBlur } =
    useBrowserFocusVisible()
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [wrapperHovered, setWrapperHovered] = useState(false)
  const [inputFocused, setInputFocused] = useState(false)

  // IME 输入状态（用于拦截中文输入）
  const isComposingRef = useRef(false)
  const lastValidValueRef = useRef('')

  const rootClassList = (() => {
    const rootClass =
      appearance === 'plain'
        ? 'cw-number-input cw-input--plain'
        : appearance === 'compact'
          ? 'cw-number-input'
          : styles.root
    return [
      rootClass,
      disabled
        ? styles.rootDisabled
        : readonly
          ? styles.rootReadonly
          : styles.rootNormal,
      appearanceRootClass[appearance],
      className,
    ]
      .filter(Boolean)
      .join(' ')
  })()

  const clearIconStylesResolved = {
    ...numberInputBase.clearIconStyles,
    ...styles.clearIconStyles,
    size: cwClearIconSize(size),
  }

  const wrapperClassList = (() => {
    const skipChrome = appearanceSkipsWrapperChrome.has(appearance)
    return [
      inputWrapperLayoutClass,
      styles.inputWrapper,
      skipChrome ? '' : inputBase.inputWrapperChrome,
      skipChrome
        ? ''
        : disabled
          ? inputBase.inputWrapperDisabled
          : readonly
            ? inputBase.inputWrapperReadonly
            : inputBase.inputWrapperNormal,
      appearanceWrapperClass[appearance],
      'relative',
      isFocusVisible && !disabled && !appearanceSkipsWrapperFocus.has(appearance)
        ? styles.inputWrapperFocus
        : '',
    ]
      .filter(Boolean)
      .join(' ')
  })()

  const iconClassList = [
    styles.icon,
    disabled ? styles.iconDisabled : styles.iconNormal,
    appearanceIconClass[appearance],
  ]
    .filter(Boolean)
    .join(' ')

  const suffixClassList = [
    styles.suffix,
    appearanceSuffixClass[appearance],
  ]
    .filter(Boolean)
    .join(' ')

  const sizeClass = (() => {
    if (appearanceSkipsSize.has(appearance)) return ''
    const sizeMap = {
      small: styles.sizeSmall,
      medium: styles.sizeMedium,
      large: styles.sizeLarge,
    }
    return sizeMap[size || 'medium']
  })()

  const inputMainClassList = [
    appearance === 'plain'
      ? 'flex min-w-0 w-auto items-center'
      : 'flex min-w-0 w-full flex-1 items-center',
    styles.inputMain,
    align === 'right'
      ? styles.inputMainAlignRight
      : align === 'center'
        ? styles.inputMainAlignCenter
        : styles.inputMainAlignLeft,
  ]
    .filter(Boolean)
    .join(' ')

  const skipsInputBasePadding = appearance === 'plain' || appearance === 'compact'

  const hasIcon = iconSlot != null
  const hasSuffix = suffixSlot != null

  const displayValue = (() => {
    if (value === null || value === undefined || value === '') return ''
    return String(value)
  })()

  const displayLabel = label ?? texts.label
  const displayPlaceholder = placeholder ?? texts.placeholder

  const showClearButton =
    clearable &&
    !!displayValue &&
    !disabled &&
    !readonly &&
    (inputFocused || wrapperHovered)

  /** 有值且可清除时预留右侧空间，清除钮用绝对定位叠放 */
  const clearSlotReserved =
    clearable &&
    !!displayValue &&
    !disabled &&
    !readonly

  const clearReserveClass = (() => {
    if (!clearSlotReserved) return ''
    return appearance === 'compact'
      ? styles.inputClearReserveCompact ?? ''
      : styles.inputClearReserve ?? ''
  })()

  const inputStateClass = disabled
    ? inputBase.inputDisabled
    : readonly
      ? inputBase.inputReadonly
      : inputBase.inputNormal

  const inputClassList = [
    inputLayoutClass,
    skipsInputBasePadding ? '' : styles.input,
    sizeClass,
    inputStateClass,
    align === 'right'
      ? styles.inputRight
      : align === 'center'
        ? styles.inputCenter
        : styles.inputLeft,
    appearanceInputClass[appearance],
    clearReserveClass,
  ]
    .filter(Boolean)
    .join(' ')

  const slotProps: CwInputSlotProps = { disabled, readonly }
  const renderSlot = (slot: CwInputSlotContent): ReactNode =>
    typeof slot === 'function' ? slot(slotProps) : slot

  // 将焦点转移到 input 元素（disabled 时不处理）
  const focusInput = () => {
    if (disabled) return
    inputRef.current?.focus()
  }

  // 验证是否为有效数字
  const isValidNumber = (rawValue: string): boolean => {
    if (rawValue === '' || rawValue === '-') return true // 允许空值和负号输入中
    const num = Number(rawValue)
    if (Number.isNaN(num)) return false

    // 检查是否允许小数
    if (!allowDecimal && rawValue.includes('.')) return false

    // 检查范围
    if (min !== undefined && num < min) return false
    if (max !== undefined && num > max) return false

    return true
  }

  // 处理过滤后的值
  const processFilteredValue = (rawFiltered: string) => {
    let filtered = rawFiltered

    // 只允许一个小数点
    const parts = filtered.split('.')
    if (parts.length > 2) {
      filtered = parts[0] + '.' + parts.slice(1).join('')
    }

    // 只允许一个负号，且必须在开头
    if (filtered.includes('-')) {
      const minusCount = (filtered.match(/-/g) || []).length
      if (minusCount > 1 || !filtered.startsWith('-')) {
        filtered = filtered.replace(/-/g, '')
        if (lastValidValueRef.current.startsWith('-')) {
          filtered = '-' + filtered
        }
      }
    }

    // 验证数字
    if (filtered !== '' && filtered !== '-' && !isValidNumber(filtered)) {
      // 无效数字，恢复之前的值
      if (inputRef.current) {
        inputRef.current.value = lastValidValueRef.current
      }
      return
    }

    // 如果为空，返回空字符串
    if (filtered === '' || filtered === '-') {
      onChange?.('')
      onInput?.('')
      lastValidValueRef.current = filtered
      return
    }

    // 转换为数字或保持字符串（如果包含小数点但未完成输入）
    const num = Number(filtered)
    if (!Number.isNaN(num)) {
      onChange?.(num)
      onInput?.(num)
      lastValidValueRef.current = filtered
    } else {
      onChange?.(filtered)
      onInput?.(filtered)
      lastValidValueRef.current = filtered
    }
  }

  // 处理 IME 输入开始
  const handleCompositionStart = () => {
    isComposingRef.current = true
    if (inputRef.current) {
      lastValidValueRef.current = inputRef.current.value
    }
  }

  // 处理 IME 输入结束
  const handleCompositionEnd = (event: CompositionEvent<HTMLInputElement>) => {
    isComposingRef.current = false
    // IME 输入结束后，立即过滤非数字字符
    const currentValue = event.currentTarget.value
    // 过滤非数字字符（允许负号、小数点）
    const filtered = currentValue.replace(/[^\d.-]/g, '')

    // 如果过滤后的值不等于原值，说明输入了非数字字符，恢复之前的值
    if (filtered !== currentValue) {
      event.currentTarget.value = lastValidValueRef.current
      return
    }

    // 继续处理过滤后的值
    processFilteredValue(filtered)
  }

  // 处理输入
  const handleInput = (event: ChangeEvent<HTMLInputElement>) => {
    if (disabled || readonly) return

    // 如果正在使用 IME 输入，不处理（等 compositionend 事件处理）
    if (isComposingRef.current) {
      return
    }

    const currentValue = event.currentTarget.value

    // 过滤非数字字符（允许负号、小数点）
    const filtered = currentValue.replace(/[^\d.-]/g, '')

    // 如果过滤后的值不等于原值，说明输入了非数字字符，恢复之前的值
    if (filtered !== currentValue) {
      event.currentTarget.value = lastValidValueRef.current
      return
    }

    // 继续处理过滤后的值
    processFilteredValue(filtered)
  }

  // 处理键盘按下（阻止非数字字符）
  const handleKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (disabled || readonly) return

    const key = event.key
    const input = event.currentTarget

    // 允许的控制键
    const allowedKeys = [
      'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
      'ArrowLeft', 'ArrowRight', 'Home', 'End',
    ]

    if (allowedKeys.includes(key)) {
      return // 允许控制键
    }

    // 处理上下箭头键（步进功能）
    if (key === 'ArrowUp' || key === 'ArrowDown') {
      event.preventDefault()
      const currentValue = input.value
      let num = currentValue === '' || currentValue === '-' ? 0 : Number(currentValue)

      if (Number.isNaN(num)) {
        num = min !== undefined ? min : 0
      }

      const resolvedStep = step || 1
      num = stepNumber(num, resolvedStep, key === 'ArrowUp' ? 1 : -1)

      // 应用范围限制
      if (min !== undefined && num < min) {
        num = min
      }
      if (max !== undefined && num > max) {
        num = max
      }

      // 如果不允许小数，取整
      if (!allowDecimal) {
        num = Math.floor(num)
      }

      // 更新值
      onChange?.(num)
      onInput?.(num)
      if (inputRef.current) {
        inputRef.current.value = String(num)
        lastValidValueRef.current = String(num)
      }
      return
    }

    // 允许 Ctrl/Cmd + A/C/V/X
    if (event.ctrlKey || event.metaKey) {
      if (['a', 'c', 'v', 'x'].includes(key.toLowerCase())) {
        return
      }
    }

    // 允许数字
    if (/^\d$/.test(key)) {
      return
    }

    // 允许负号（仅在开头）
    if (key === '-' && !input.value) {
      return
    }

    // 允许小数点（如果允许小数）
    if (key === '.' && allowDecimal) {
      const currentValue = input.value
      if (!currentValue.includes('.')) {
        return
      }
    }

    // 阻止其他字符
    event.preventDefault()
  }

  // 处理键盘按下（额外验证）
  const handleKeyPress = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (disabled || readonly) return

    const key = event.key

    // 允许数字、负号、小数点
    if (/^\d$/.test(key) || key === '-' || (key === '.' && allowDecimal)) {
      return
    }

    // 阻止其他字符
    event.preventDefault()
  }

  // input 聚焦/失焦时更新状态 - 只在键盘导航时显示 focus 样式
  const handleInputFocus = (event: ReactFocusEvent<HTMLInputElement>) => {
    if (disabled) return
    setInputFocused(true)
    handleFocusVisibleFocus()
    // 记录当前值作为最后有效值
    if (inputRef.current) {
      lastValidValueRef.current = inputRef.current.value
    }
    onFocus?.(event.nativeEvent)
  }

  const handleInputBlur = (event: ReactFocusEvent<HTMLInputElement>) => {
    setInputFocused(false)
    handleFocusVisibleBlur()

    // 失焦时验证和规范化值
    const currentValue = event.currentTarget.value
    if (currentValue === '' || currentValue === '-') {
      onChange?.('')
      onBlur?.(event.nativeEvent)
      return
    }

    const num = Number(currentValue)
    if (Number.isNaN(num)) {
      // 无效数字，重置为空或最小值
      const finalValue = min !== undefined ? min : ''
      onChange?.(finalValue)
      onBlur?.(event.nativeEvent)
      return
    }

    // 应用范围限制
    let finalNum = num
    if (min !== undefined && finalNum < min) {
      finalNum = min
    }
    if (max !== undefined && finalNum > max) {
      finalNum = max
    }

    // 如果不允许小数，取整
    if (!allowDecimal) {
      finalNum = Math.floor(finalNum)
    }

    onChange?.(finalNum)
    onBlur?.(event.nativeEvent)
  }

  // 处理清除
  const handleClear = (event: ReactMouseEvent<HTMLDivElement>) => {
    event.stopPropagation()
    onChange?.('')
    onClear?.()
  }

  return (
    <div {...rest} className={rootClassList}>
      {/* Input Wrapper */}
      <div
        className={wrapperClassList}
        onClick={focusInput}
        onMouseEnter={() => setWrapperHovered(true)}
        onMouseLeave={() => setWrapperHovered(false)}
      >
        {/* Icon Slot */}
        {hasIcon ? (
          <div className={iconClassList}>
            {renderSlot(iconSlot as CwInputSlotContent)}
          </div>
        ) : null}

        {/* Label */}
        {showLabel ? (
          <div
            className={[
              styles.label,
              disabled ? styles.labelDisabled : styles.labelNormal,
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {displayLabel}
          </div>
        ) : null}

        <div className={inputMainClassList}>
          <input
            ref={inputRef}
            type="text"
            value={displayValue}
            placeholder={displayPlaceholder}
            disabled={disabled}
            readOnly={readonly}
            aria-readonly={readonly}
            aria-disabled={disabled}
            aria-label={displayLabel ?? displayPlaceholder}
            className={inputClassList}
            onInput={handleInput}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            onKeyDown={handleKeyDown}
            onKeyPress={handleKeyPress}
            onCompositionStart={handleCompositionStart}
            onCompositionEnd={handleCompositionEnd}
          />
        </div>

        {/* Clear Button（绝对定位 + 预留右侧内边距，避免 hover 挤动数字） */}
        {clearSlotReserved ? (
          <div
            className={[
              styles.clearButton,
              styles.clearButtonOverlay ?? '',
              showClearButton ? styles.clearButtonVisible ?? '' : styles.clearButtonHidden ?? '',
            ]
              .filter(Boolean)
              .join(' ')}
            aria-hidden={showClearButton ? undefined : 'true'}
            aria-label={texts.clear}
            role="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={handleClear}
          >
            {clearSlot != null ? (
              renderSlot(clearSlot)
            ) : (
              <CwIcon
                name="common--status--close-circle-filled"
                prefix="icon"
                size={clearIconStylesResolved.size ?? 1}
                className={clearIconStylesResolved.class}
              />
            )}
          </div>
        ) : null}

        {/* Suffix Slot (right side) */}
        {hasSuffix ? (
          <div className={suffixClassList}>
            {renderSlot(suffixSlot as CwInputSlotContent)}
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default CwNumberInput
