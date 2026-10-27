import { useMemo, useRef } from 'react'
import type {
  FocusEvent as ReactFocusEvent,
  FormEvent,
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
} from 'react'
import CwIcon from '../CwIcon/CwIcon'
import type { CwSearchBarProps } from './types'
import { searchBarBase } from '@zengchaowu/ui-shared/components/CwSearchBar/styles'
import { defaultTexts } from './texts'
import { useBrowserFocusVisible } from '../../hooks/useBrowserFocusVisible'

export function CwSearchBar({
  value = '',
  placeholder = '',
  buttonText = '',
  disabled = false,
  readonly = false,
  size = 'medium',
  showButton = true,
  texts: textsProp,
  className,
  onChange,
  onInput,
  onSearch,
  onFocus,
  onBlur,
  ...rest
}: CwSearchBarProps) {
  const styles = searchBarBase
  const texts = useMemo(
    () => ({ ...defaultTexts, ...(textsProp ?? {}) }),
    [textsProp],
  )

  const {
    isFocusVisible,
    handleFocus: handleFocusVisibleFocus,
    handleBlur: handleFocusVisibleBlur,
  } = useBrowserFocusVisible()
  const {
    isFocusVisible: isButtonFocusVisible,
    handleFocus: handleButtonFocusVisibleFocus,
    handleBlur: handleButtonFocusVisibleBlur,
  } = useBrowserFocusVisible()

  const inputRef = useRef<HTMLInputElement | null>(null)

  const sizeKey = size || 'medium'

  const containerSizeClass = {
    small: styles.sizeSmall,
    medium: styles.sizeMedium,
    large: styles.sizeLarge,
  }[sizeKey]

  const inputSizeClass = {
    small: styles.inputSizeSmall,
    medium: styles.inputSizeMedium,
    large: styles.inputSizeLarge,
  }[sizeKey]

  const buttonSizeClass = {
    small: styles.buttonSizeSmall,
    medium: styles.buttonSizeMedium,
    large: styles.buttonSizeLarge,
  }[sizeKey]

  const searchIconSizeClass = {
    small: styles.searchIconSizeSmall,
    medium: styles.searchIconSizeMedium,
    large: styles.searchIconSizeLarge,
  }[sizeKey]

  const searchIconStyles = useMemo(() => {
    const iconSizeByBar: Record<NonNullable<CwSearchBarProps['size']>, number> = {
      small: 0.75,
      medium: 0.875,
      large: 1,
    }
    return {
      ...(styles.searchIconStyles ?? {}),
      size: iconSizeByBar[sizeKey],
    }
  }, [styles, sizeKey])

  const displayPlaceholder = placeholder || texts.placeholder
  const displayButtonText = buttonText || texts.buttonText

  const rootClassList = [
    styles.root,
    disabled ? styles.rootDisabled : readonly ? styles.rootReadonly : styles.rootNormal,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const containerClassList = [
    styles.container,
    disabled
      ? styles.containerDisabled
      : readonly
        ? styles.containerReadonly
        : styles.containerNormal,
    isFocusVisible && !disabled ? styles.containerFocus : '',
    containerSizeClass,
  ]
    .filter(Boolean)
    .join(' ')

  const searchIconClassList = [
    styles.searchIcon,
    searchIconSizeClass,
    disabled ? styles.searchIconDisabled : styles.searchIconNormal,
  ]
    .filter(Boolean)
    .join(' ')

  const inputClassList = [
    styles.input,
    inputSizeClass,
    disabled ? styles.inputDisabled : readonly ? styles.inputReadonly : styles.inputNormal,
  ]
    .filter(Boolean)
    .join(' ')

  const buttonClassList = [
    styles.button,
    buttonSizeClass,
    disabled ? styles.buttonDisabled : styles.buttonNormal,
    isButtonFocusVisible && !disabled ? styles.buttonFocused : '',
    'cursor-pointer',
  ]
    .filter(Boolean)
    .join(' ')

  const buttonTextClassList = [
    styles.buttonText,
    disabled ? styles.buttonTextDisabled : styles.buttonTextNormal,
  ]
    .filter(Boolean)
    .join(' ')

  const focusInput = () => {
    if (disabled || readonly) return
    inputRef.current?.focus()
  }

  const handleInput = (event: FormEvent<HTMLInputElement>) => {
    const nextValue = event.currentTarget.value
    onChange?.(nextValue)
    onInput?.(nextValue)
  }

  const handleInputFocus = (event: ReactFocusEvent<HTMLInputElement>) => {
    if (disabled) return
    handleFocusVisibleFocus()
    onFocus?.(event.nativeEvent)
  }

  const handleInputBlur = (event: ReactFocusEvent<HTMLInputElement>) => {
    handleFocusVisibleBlur()
    onBlur?.(event.nativeEvent)
  }

  const handleButtonFocus = () => {
    if (disabled) return
    handleButtonFocusVisibleFocus()
  }

  const handleButtonBlur = () => {
    handleButtonFocusVisibleBlur()
  }

  const handleSearch = () => {
    if (disabled) return
    const currentValue = value || ''
    onSearch?.(currentValue)
  }

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      handleSearch()
    }
  }

  const handleButtonClick = (event: ReactMouseEvent<HTMLDivElement>) => {
    event.stopPropagation()
    handleSearch()
  }

  const handleButtonKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      event.stopPropagation()
      handleSearch()
    }
  }

  return (
    <div {...rest} className={rootClassList}>
      {/* 整体容器 */}
      <div className={containerClassList} onClick={focusInput}>
        {/* 搜索图标 */}
        <div className={searchIconClassList}>
          <CwIcon
            name="common--action--search-line"
            prefix="icon"
            size={searchIconStyles.size ?? 1}
            className={searchIconStyles.class}
          />
        </div>

        {/* 输入框 */}
        <input
          ref={inputRef}
          type="text"
          value={value}
          placeholder={displayPlaceholder}
          disabled={disabled}
          readOnly={readonly}
          aria-readonly={readonly}
          aria-disabled={disabled}
          aria-label={displayPlaceholder}
          className={inputClassList}
          onChange={handleInput}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
        />

        {/* 查询按钮 */}
        {showButton ? (
          <div
            role="button"
            tabIndex={disabled ? -1 : 0}
            className={buttonClassList}
            aria-disabled={disabled ? 'true' : 'false'}
            aria-label={displayButtonText}
            onClick={handleButtonClick}
            onFocus={handleButtonFocus}
            onBlur={handleButtonBlur}
            onKeyDown={handleButtonKeyDown}
          >
            <span className={buttonTextClassList}>{displayButtonText}</span>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default CwSearchBar
