import { useRef } from 'react'
import type { KeyboardEvent as ReactKeyboardEvent } from 'react'
import type { CwRadioProps } from './types'
import { radioBase } from './styles'
import { useBrowserFocusVisible } from '../../hooks/useBrowserFocusVisible'

export function CwRadio({
  value = false,
  disabled = false,
  readonly = false,
  border = false,
  highlightSelected = false,
  size = 'medium',
  texts: _texts,
  children,
  className,
  onChange,
  ...rest
}: CwRadioProps) {
  const styles = radioBase
  const isChecked = !!value

  const radioRef = useRef<HTMLDivElement | null>(null)

  const { isFocusVisible, handleFocus: handleFocusVisibleFocus, handleBlur: handleFocusVisibleBlur } =
    useBrowserFocusVisible()

  const sizeMap = {
    small: styles.sizeSmall,
    medium: styles.sizeMedium,
    large: styles.sizeLarge,
  }
  const sizeClass = sizeMap[size || 'medium']

  const rootClassList = [
    styles.root,
    disabled ? styles.rootDisabled : readonly ? styles.rootReadonly : styles.rootNormal,
    border
      ? [
          styles.rootBorder,
          disabled
            ? styles.rootBorderDisabled
            : readonly
              ? highlightSelected && isChecked
                ? styles.rootBorderChecked
                : styles.rootBorderReadonly
              : highlightSelected && isChecked
                ? styles.rootBorderChecked
                : styles.rootBorderNormal,
        ]
          .filter(Boolean)
          .join(' ')
      : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const labelClassList = [
    styles.label,
    disabled
      ? styles.labelDisabled
      : highlightSelected && isChecked
        ? styles.labelChecked
        : styles.labelNormal,
  ]
    .filter(Boolean)
    .join(' ')

  const radioClassList = [
    styles.radio,
    sizeClass,
    disabled
      ? styles.radioDisabled
      : readonly
        ? isChecked
          ? styles.radioReadonlyChecked
          : styles.radioReadonlyNormal
        : isChecked
          ? styles.radioChecked
          : styles.radioNormal,
    isFocusVisible && !disabled ? styles.radioFocused : '',
  ]
    .filter(Boolean)
    .join(' ')

  const iconSizeClass =
    size === 'small' ? 'w-2 h-2' : size === 'large' ? 'w-3 h-3' : 'w-2.5 h-2.5'

  const tabindex = disabled ? undefined : 0

  const handleFocus = () => {
    if (disabled) return
    handleFocusVisibleFocus()
  }

  const handleBlur = () => {
    handleFocusVisibleBlur()
  }

  const handleToggle = () => {
    if (disabled || readonly) return
    onChange?.(!isChecked)
  }

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (disabled) return
    if (readonly) {
      // Readonly 可聚焦但不允许切换
      if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault()
      }
      return
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleToggle()
    }
  }

  const handleRootClick = () => {
    if (disabled || readonly) return
    radioRef.current?.focus()
    handleToggle()
  }

  const labelContent =
    children != null
      ? typeof children === 'function'
        ? children({ disabled, readonly })
        : children
      : null

  return (
    <div {...rest} className={rootClassList} onClick={handleRootClick}>
      {/* Radio 圆框（内部元素可聚焦） */}
      <div
        ref={radioRef}
        className={radioClassList}
        role="radio"
        aria-checked={isChecked}
        aria-disabled={disabled}
        aria-readonly={readonly}
        tabIndex={tabindex}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
      >
        {/* 选中状态：显示内圆点 */}
        {isChecked ? (
          <div
            className={[
              styles.icon,
              iconSizeClass,
              disabled ? styles.iconDisabled : styles.iconNormal,
            ]
              .filter(Boolean)
              .join(' ')}
          />
        ) : null}
      </div>

      {/* 标签文本 */}
      {labelContent != null ? <span className={labelClassList}>{labelContent}</span> : null}
    </div>
  )
}

export default CwRadio
