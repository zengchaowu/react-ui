import type { KeyboardEvent as ReactKeyboardEvent } from 'react'
import type { CwSwitchProps } from './types'
import { switchBase } from './styles'
import { useBrowserFocusVisible } from '../../hooks/useBrowserFocusVisible'

export function CwSwitch({
  value = false,
  disabled = false,
  readonly = false,
  size = 'medium',
  texts: _texts,
  children,
  className,
  onChange,
  ...rest
}: CwSwitchProps) {
  const styles = switchBase
  const isChecked = !!value

  const { isFocusVisible, handleFocus: handleFocusVisibleFocus, handleBlur: handleFocusVisibleBlur } =
    useBrowserFocusVisible()

  const tabindex = disabled ? undefined : 0

  const sizeMap = {
    small: styles.sizeSmall,
    medium: styles.sizeMedium,
    large: styles.sizeLarge,
  }
  const sizeClass = sizeMap[size || 'medium']

  const rootClassList = [
    styles.root,
    disabled ? styles.rootDisabled : readonly ? styles.rootReadonly : styles.rootNormal,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const trackClassList = [
    styles.track,
    sizeClass,
    disabled
      ? styles.trackDisabled
      : readonly
        ? isChecked
          ? styles.trackReadonlyChecked
          : styles.trackReadonlyNormal
        : isChecked
          ? styles.trackChecked
          : styles.trackNormal,
    isFocusVisible && !disabled ? styles.trackFocused : '',
  ]
    .filter(Boolean)
    .join(' ')

  const thumbSizeClass =
    size === 'small' ? 'w-3 h-3 left-0.5' : size === 'large' ? 'w-5 h-5 left-0.5' : 'w-4 h-4 left-0.5'
  const thumbCheckedClass = isChecked
    ? size === 'small'
      ? 'left-[calc(100%-0.875rem)]'
      : size === 'large'
        ? 'left-[calc(100%-1.375rem)]'
        : 'left-[calc(100%-1.125rem)]'
    : ''

  const thumbClassList = [
    styles.thumb,
    thumbSizeClass,
    disabled ? styles.thumbDisabled : styles.thumbNormal,
    thumbCheckedClass,
  ]
    .filter(Boolean)
    .join(' ')

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

  const handleClick = () => {
    if (disabled || readonly) return
    handleToggle()
  }

  const labelContent =
    children != null
      ? typeof children === 'function'
        ? children({ disabled, readonly })
        : children
      : null

  return (
    <div {...rest} className={rootClassList}>
      {/* 轨道（可聚焦元素） */}
      <div
        className={trackClassList}
        role="switch"
        aria-checked={isChecked}
        aria-disabled={disabled}
        aria-readonly={readonly}
        tabIndex={tabindex}
        onClick={handleClick}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
      >
        {/* 滑块 */}
        <div className={thumbClassList} />
      </div>

      {/* 标签 */}
      {labelContent != null ? (
        <span
          className={[styles.label, disabled ? styles.labelDisabled : styles.labelNormal]
            .filter(Boolean)
            .join(' ')}
        >
          {labelContent}
        </span>
      ) : null}
    </div>
  )
}

export default CwSwitch
