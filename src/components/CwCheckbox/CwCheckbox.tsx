import { useRef } from 'react'
import type { KeyboardEvent as ReactKeyboardEvent } from 'react'
import type { CwCheckboxAppearance, CwCheckboxProps } from './types'
import { appearanceStyles, checkboxBase } from './styles'
import CwIcon from '../CwIcon/CwIcon'
import { designPxToRemNum } from '@zengchaowu/ui-shared/functions/ui/cwRemSize'
import { useBrowserFocusVisible } from '../../hooks/useBrowserFocusVisible'

export function CwCheckbox({
  value = false,
  disabled = false,
  readonly = false,
  size = 'medium',
  appearance = 'default',
  texts: _texts,
  children,
  className,
  onChange,
  ...rest
}: CwCheckboxProps) {
  const styles = {
    ...checkboxBase,
    ...(appearanceStyles[(appearance || 'default') as CwCheckboxAppearance] ?? {}),
  }

  const checkboxRef = useRef<HTMLDivElement | null>(null)

  const { isFocusVisible, handleFocus: handleFocusVisibleFocus, handleBlur: handleFocusVisibleBlur } =
    useBrowserFocusVisible()

  const isChecked = value === true
  const isIndeterminate = value === 'indeterminate'

  const checkboxSizeMap = {
    small: styles.sizeSmall,
    medium: styles.sizeMedium,
    large: styles.sizeLarge,
  }
  const checkboxSizeClass = checkboxSizeMap[size || 'medium'] ?? ''

  const labelSizeMap = {
    small: styles.labelSizeSmall,
    medium: styles.labelSizeMedium,
    large: styles.labelSizeLarge,
  }
  const labelSizeClass = labelSizeMap[size || 'medium'] ?? ''

  /** 方框内边距约 2px，勾尺寸按 inner 区域适配，避免被 border-2 裁切 */
  const checkIconSizeMap = {
    small: designPxToRemNum(10),
    medium: designPxToRemNum(12),
    large: designPxToRemNum(14),
  }
  const checkIconSize = checkIconSizeMap[size || 'medium'] ?? designPxToRemNum(12)

  const ariaChecked = isIndeterminate ? 'mixed' : isChecked
  const tabindex = disabled ? undefined : 0

  const rootClassList = [
    styles.root,
    disabled ? styles.rootDisabled : readonly ? styles.rootReadonly : styles.rootNormal,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const checkboxClassList = [
    styles.checkbox,
    checkboxSizeClass,
    disabled
      ? styles.checkboxDisabled
      : readonly
        ? isChecked || isIndeterminate
          ? styles.checkboxReadonlyChecked
          : styles.checkboxReadonlyNormal
        : isChecked || isIndeterminate
          ? styles.checkboxChecked
          : styles.checkboxNormal,
    isFocusVisible && !disabled ? styles.checkboxFocused : '',
  ]
    .filter(Boolean)
    .join(' ')

  const indeterminateSizeClass =
    size === 'small' ? 'w-1.5 h-1.5' : size === 'large' ? 'w-2.5 h-2.5' : 'w-2 h-2'

  const handleFocus = () => {
    if (disabled) return
    handleFocusVisibleFocus()
  }

  const handleBlur = () => {
    handleFocusVisibleBlur()
  }

  const handleToggle = () => {
    if (disabled || readonly) return
    const newValue: boolean | 'indeterminate' = isIndeterminate
      ? true // 半选中 -> 选中
      : !isChecked // 选中 <-> 未选中
    onChange?.(newValue)
  }

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (disabled) return
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleToggle()
    }
  }

  // 点击根节点（含标签文案）时聚焦并切换，与 CwRadio 一致
  const handleRootClick = () => {
    if (disabled) return
    checkboxRef.current?.focus()
    if (readonly) return
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
      {/* Checkbox 框 */}
      <div
        ref={checkboxRef}
        className={checkboxClassList}
        role="checkbox"
        aria-checked={ariaChecked}
        aria-disabled={disabled ? 'true' : 'false'}
        aria-readonly={readonly ? 'true' : 'false'}
        tabIndex={tabindex}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
      >
        {/* 选中状态：显示对勾 */}
        {isChecked ? (
          <CwIcon
            name="common--status--check-line"
            prefix="icon"
            size={checkIconSize}
            className={[styles.checkIconStyle, styles.icon].filter(Boolean).join(' ')}
          />
        ) : isIndeterminate ? (
          /* 半选中状态：显示横线 */
          <div
            className={[
              styles.iconIndeterminate,
              indeterminateSizeClass,
              disabled ? styles.iconIndeterminateDisabled : styles.iconIndeterminateNormal,
            ]
              .filter(Boolean)
              .join(' ')}
          />
        ) : null}
      </div>

      {/* 标签文本 */}
      {labelContent != null ? (
        <span
          className={[
            styles.label,
            labelSizeClass,
            disabled ? styles.labelDisabled : styles.labelNormal,
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {labelContent}
        </span>
      ) : null}
    </div>
  )
}

export default CwCheckbox
