import type { CSSProperties, HTMLAttributes } from 'react'
import type { CwButtonGroupProps } from './types'
import type { CwButtonGroupButton } from '@zengchaowu/ui-shared/components/CwButtonGroup/types'
import type { CwButtonType, CwButtonVariant } from '../CwButton/types'
import { buttonGroupBase } from '@zengchaowu/ui-shared/components/CwButtonGroup/styles'
import CwButton from '../CwButton/CwButton'

export interface CwButtonGroupComponentProps
  extends CwButtonGroupProps,
    Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'className'> {
  className?: string
  style?: CSSProperties
}

/** 预设 variant 映射到 CwButton 的 type */
function getCwButtonType(button: CwButtonGroupButton): CwButtonType {
  const v = button.variant
  if (v === 'brand' || v === 'brandOutline') return 'primary'
  return 'default'
}

/** 预设 variant 映射到 CwButton 的 variant：default→outline, secondary→solid, brand→text, brandOutline→outline */
function getCwButtonVariant(button: CwButtonGroupButton): CwButtonVariant {
  const v = button.variant
  if (v === 'secondary') return 'solid'
  if (v === 'brand') return 'text'
  if (v === 'brandOutline') return 'outline'
  return 'outline'
}

export function CwButtonGroup({
  buttons = [],
  reverse = true,
  gap = 8,
  equalWidth = false,
  fillRemainingSpace = false,
  buttonSize = 'medium',
  buttonShape = 'rounded',
  texts,
  className,
  style,
  ...rest
}: CwButtonGroupComponentProps) {
  void texts

  const styles = buttonGroupBase

  const rootClassName = [
    styles.root,
    equalWidth ? 'w-full' : '',
    fillRemainingSpace ? 'flex-1 min-w-0 w-full flex-nowrap' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const displayButtons = reverse ? [...buttons].reverse() : buttons

  const gapStyle = typeof gap === 'number' ? `${gap}px` : gap

  const buttonWrapperClass = [
    equalWidth ? 'flex-1 min-w-0' : '',
    equalWidth ? 'text-center' : '',
    fillRemainingSpace ? 'flex-1 min-w-0' : '',
    fillRemainingSpace ? 'text-center' : '',
    fillRemainingSpace ? 'overflow-hidden' : '',
    fillRemainingSpace ? 'text-ellipsis' : '',
    fillRemainingSpace ? 'whitespace-nowrap' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      {...rest}
      className={rootClassName}
      style={{ gap: gapStyle, ...style }}
    >
      {displayButtons.map((button) => (
        <div key={button.id} className={buttonWrapperClass}>
          <CwButton
            type={getCwButtonType(button)}
            variant={getCwButtonVariant(button)}
            size={buttonSize}
            shape={buttonShape}
            onClick={button.onClick}
          >
            {button.label}
          </CwButton>
        </div>
      ))}
    </div>
  )
}

export default CwButtonGroup
