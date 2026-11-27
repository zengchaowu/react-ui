import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from 'react'
import './cw-input-plain.css'
import CwIcon from '../CwIcon/CwIcon'
import type { CwInputHandle, CwInputProps, CwInputSlotContent, CwInputSlotProps } from './types'
import type { CwInputAppearance } from '@zengchaowu/ui-shared/components/CwInput/types'
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
  resolveCwInputDisplayClass,
} from '@zengchaowu/ui-shared/components/CwInput/styles'
import { defaultTexts } from '@zengchaowu/ui-shared/components/CwInput/texts'
import { cwClearIconSize } from '@zengchaowu/ui-shared/functions/ui/cwClearIconSize'
import { useBrowserFocusVisible } from '../../hooks/useBrowserFocusVisible'
import { useCwInputDisplayPrefix } from './useCwInputDisplayPrefix'

export const CwInput = forwardRef<CwInputHandle, CwInputProps>(function CwInput(
  {
    value,
    placeholder,
    type,
    maxLength,
    disabled = false,
    readonly = false,
    clearable = true,
    label,
    showLabel = false,
    prefix,
    align = 'left',
    size = 'medium',
    appearance: appearanceProp = 'default',
    spellcheck,
    texts: textsProp,
    iconSlot,
    clearSlot,
    suffixSlot,
    displaySlot,
    suffix,
    className,
    onChange,
    onInput,
    onFocus,
    onBlur,
    onClear,
    onKeyDown,
    ...rest
  },
  ref,
) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const [wrapperHovered, setWrapperHovered] = useState(false)
  const [inputFocused, setInputFocused] = useState(false)
  const { isFocusVisible, handleFocus: handleFocusVisibleFocus, handleBlur: handleFocusVisibleBlur } =
    useBrowserFocusVisible()

  const appearance: CwInputAppearance = appearanceProp || 'default'

  const texts = useMemo(
    () => ({ ...defaultTexts, ...(textsProp ?? {}) }),
    [textsProp],
  )

  const clearIconSize = cwClearIconSize(size)

  const sizeClass = (() => {
    if (appearanceSkipsSize.has(appearance)) return ''
    const sizeMap = {
      small: inputBase.sizeSmall,
      medium: inputBase.sizeMedium,
      large: inputBase.sizeLarge,
    }
    return sizeMap[size || 'medium']
  })()

  const hasIcon = iconSlot != null
  const hasSuffix = suffixSlot != null || suffix != null
  /** 展示区插槽存在时不渲染原生 input，改由插槽内容承担展示 */
  const hasDisplaySlot = displaySlot != null

  const slotProps: CwInputSlotProps = { disabled, readonly }
  const renderSlot = (slot: CwInputSlotContent): ReactNode =>
    typeof slot === 'function' ? slot(slotProps) : slot

  const {
    enabled: hasDisplayPrefix,
    displayValue,
    handlePrefixInput,
    handlePrefixKeydown,
    guardPrefixSelection,
    handlePrefixFocus,
  } = useCwInputDisplayPrefix({
    prefix,
    value,
    inputRef,
    onValueChange: (nextValue, kind) => {
      if (disabled || readonly) return
      onChange?.(nextValue)
      if (kind === 'input') onInput?.(nextValue)
    },
  })

  const boundValue = hasDisplayPrefix ? displayValue : String(value ?? '')

  const rootClassList = [
    appearance === 'plain' ? 'cw-input cw-input--plain' : inputBase.root,
    disabled
      ? inputBase.rootDisabled
      : readonly
        ? inputBase.rootReadonly
        : inputBase.rootNormal,
    appearanceRootClass[appearance],
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const skipChrome = appearanceSkipsWrapperChrome.has(appearance)
  const wrapperClassList = [
    'flex min-w-0 items-center',
    inputBase.inputWrapper,
    skipChrome ? '' : inputBase.inputWrapperChrome,
    skipChrome
      ? ''
      : disabled
        ? inputBase.inputWrapperDisabled
        : readonly
          ? inputBase.inputWrapperReadonly
          : inputBase.inputWrapperNormal,
    appearanceWrapperClass[appearance],
    isFocusVisible &&
    !disabled &&
    !appearanceSkipsWrapperFocus.has(appearance)
      ? inputBase.inputWrapperFocus
      : '',
  ]
    .filter(Boolean)
    .join(' ')

  const iconClassList = [
    inputBase.icon,
    disabled ? inputBase.iconDisabled : inputBase.iconNormal,
    appearanceIconClass[appearance],
  ]
    .filter(Boolean)
    .join(' ')

  const labelClassList = [
    inputBase.label,
    disabled ? inputBase.labelDisabled : inputBase.labelNormal,
  ]
    .filter(Boolean)
    .join(' ')

  const inputMainClassList = [
    appearance === 'plain'
      ? 'flex min-w-0 w-auto items-center'
      : appearance === 'embedded'
        ? 'flex min-w-0 w-full flex-1 items-center min-h-0'
        : 'flex min-w-0 w-full flex-1 items-center',
    inputBase.inputMain,
    align === 'right'
      ? inputBase.inputMainAlignRight
      : align === 'center'
        ? inputBase.inputMainAlignCenter
        : inputBase.inputMainAlignLeft,
    hasDisplayPrefix && !hasIcon && !showLabel ? inputBase.inputMainPadStart : '',
  ]
    .filter(Boolean)
    .join(' ')

  const inputStateClass = disabled
    ? inputBase.inputDisabled
    : readonly
      ? inputBase.inputReadonly
      : inputBase.inputNormal

  const inputAlignClass =
    align === 'right'
      ? inputBase.inputRight
      : align === 'center'
        ? inputBase.inputCenter
        : inputBase.inputLeft

  const inputClassList = [
    'min-w-0 flex-1 w-full border-0 bg-transparent outline-none focus:outline-none',
    appearance === 'plain' ? '' : inputBase.input,
    sizeClass,
    inputStateClass,
    hasDisplayPrefix ? inputBase.inputWithDisplayPrefix : '',
    appearanceInputClass[appearance],
    // align 放在 appearance 之后并用 !，避免 surface-* 等皮肤覆盖对齐
    inputAlignClass,
    // type=search 自带原生清除钮，与 clearable 重叠时隐藏原生
    clearable
      ? '[&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden'
      : '',
  ]
    .filter(Boolean)
    .join(' ')

  const suffixClassList = [
    inputBase.suffix,
    appearanceSuffixClass[appearance],
  ]
    .filter(Boolean)
    .join(' ')

  /** displaySlot 内容的排版：统一走 ui-shared 的内容盒契约（居中 / 省略 / 尺寸） */
  const displayClassList = resolveCwInputDisplayClass({
    appearance,
    sizeClass,
    stateClass: inputStateClass,
    appearanceInputClass: appearanceInputClass[appearance],
    alignClass: inputAlignClass,
  })

  const displayLabel = label ?? texts.label
  const displayPlaceholder = placeholder ?? texts.placeholder

  const showClearButton =
    appearance !== 'plain' &&
    clearable &&
    !!value &&
    !disabled &&
    !readonly &&
    (inputFocused || wrapperHovered)

  const focusInput = useCallback(() => {
    if (disabled) return
    if (hasDisplaySlot) {
      wrapperRef.current?.focus()
      return
    }
    inputRef.current?.focus()
  }, [disabled, hasDisplaySlot])

  const handleInput = () => {
    if (disabled || readonly) return
    if (hasDisplayPrefix) {
      handlePrefixInput()
      return
    }
    const nextValue = inputRef.current?.value ?? ''
    onChange?.(nextValue)
    onInput?.(nextValue)
  }

  const handleKeydown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (hasDisplayPrefix) handlePrefixKeydown(event.nativeEvent)
    onKeyDown?.(event.nativeEvent)
  }

  const handlePointerSelection = () => {
    if (hasDisplayPrefix) guardPrefixSelection()
  }

  const handleInputFocus = (event: FocusEvent<HTMLInputElement>) => {
    if (disabled) return
    setInputFocused(true)
    handleFocusVisibleFocus()
    handlePrefixFocus()
    onFocus?.(event.nativeEvent)
  }

  const handleInputBlur = (event: FocusEvent<HTMLInputElement>) => {
    setInputFocused(false)
    handleFocusVisibleBlur()
    onBlur?.(event.nativeEvent)
  }

  /** displaySlot 模式下焦点落在 wrapper 上，事件语义与原生 input 保持一致 */
  const handleWrapperFocus = (event: FocusEvent<HTMLDivElement>) => {
    if (!hasDisplaySlot || disabled) return
    setInputFocused(true)
    handleFocusVisibleFocus()
    onFocus?.(event.nativeEvent)
  }

  const handleWrapperBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!hasDisplaySlot) return
    setInputFocused(false)
    handleFocusVisibleBlur()
    onBlur?.(event.nativeEvent)
  }

  // React 的合成 onSelect 不在原生 select 事件上派发（要等 keyup / selectionchange），
  // Ctrl+A 全选时 prefix 会在按住按键期间保持选中，与 vue-ui 的 @select 行为不一致。
  // 这里直接监听原生 select，与 vue-ui 同时机收拢选区。
  useEffect(() => {
    if (!hasDisplayPrefix) return
    const el = inputRef.current
    if (!el) return
    el.addEventListener('select', guardPrefixSelection)
    return () => el.removeEventListener('select', guardPrefixSelection)
  }, [guardPrefixSelection, hasDisplayPrefix])

  const handleClear = () => {
    if (disabled || readonly) return
    onChange?.('')
    onClear?.()
  }

  useImperativeHandle(
    ref,
    () => ({
      focus: focusInput,
      get inputRef() {
        return inputRef.current
      },
    }),
    [focusInput],
  )

  return (
    <div {...rest} className={rootClassList}>
      <div
        ref={wrapperRef}
        className={wrapperClassList}
        tabIndex={hasDisplaySlot && !disabled ? 0 : undefined}
        role={hasDisplaySlot ? 'textbox' : undefined}
        aria-label={hasDisplaySlot ? displayLabel ?? displayPlaceholder : undefined}
        aria-readonly={hasDisplaySlot ? readonly : undefined}
        aria-disabled={hasDisplaySlot ? disabled : undefined}
        onClick={focusInput}
        onMouseEnter={() => setWrapperHovered(true)}
        onMouseLeave={() => setWrapperHovered(false)}
        onFocus={handleWrapperFocus}
        onBlur={handleWrapperBlur}
      >
        {iconSlot != null && (
          <div className={iconClassList}>{renderSlot(iconSlot)}</div>
        )}

        {showLabel && <div className={labelClassList}>{displayLabel}</div>}

        <div className={inputMainClassList}>
          {displaySlot != null ? (
            <div className={displayClassList}>{renderSlot(displaySlot)}</div>
          ) : (
            <input
              ref={inputRef}
              type={type || 'text'}
              value={boundValue}
              maxLength={maxLength}
              placeholder={displayPlaceholder}
              disabled={disabled}
              readOnly={readonly}
              aria-readonly={readonly}
              aria-disabled={disabled}
              aria-label={displayLabel ?? displayPlaceholder}
              spellCheck={spellcheck}
              className={inputClassList}
              onInput={handleInput}
              onKeyDown={handleKeydown}
              onClick={handlePointerSelection}
              onKeyUp={handlePointerSelection}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
            />
          )}
        </div>

        {showClearButton && (
          <div
            className={inputBase.clearButton}
            aria-label={texts.clear}
            role="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={(event) => {
              event.stopPropagation()
              handleClear()
            }}
          >
            {clearSlot != null ? (
              renderSlot(clearSlot)
            ) : (
              <CwIcon
                name="common--status--close-circle-filled"
                prefix="icon"
                size={clearIconSize}
                className={inputBase.clearIconClass}
              />
            )}
          </div>
        )}

        {hasSuffix && (
          <div className={suffixClassList}>
            {suffixSlot != null ? renderSlot(suffixSlot) : suffix}
          </div>
        )}
      </div>
    </div>
  )
})

export default CwInput
