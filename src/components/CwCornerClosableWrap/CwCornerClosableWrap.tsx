import { useMemo, type MouseEvent, type PointerEvent } from 'react'
import CwIcon from '../CwIcon/CwIcon'
import type { CwCornerClosableWrapProps } from './types'
import {
  CW_CORNER_CLOSABLE_WRAP_CLOSE_ICON_STYLES,
  cornerClosableWrapBase,
} from '@zengchaowu/ui-shared/components/CwCornerClosableWrap/styles'
import { defaultCwCornerClosableWrapTexts } from '@zengchaowu/ui-shared/components/CwCornerClosableWrap/texts'

export function CwCornerClosableWrap({
  closable = true,
  disabled = false,
  rounded = true,
  texts = defaultCwCornerClosableWrapTexts,
  onClose,
  className,
  children,
  ...rest
}: CwCornerClosableWrapProps) {
  const resolvedTexts = useMemo(
    () => ({ ...defaultCwCornerClosableWrapTexts, ...texts }),
    [texts],
  )

  const handleClose = (event: MouseEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
    if (!disabled) onClose?.(event)
  }

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
  }

  return (
    <div
      {...rest}
      className={[
        cornerClosableWrapBase.root,
        rounded ? cornerClosableWrapBase.rootRounded : cornerClosableWrapBase.rootSquare,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
      {closable && (
        <div
          className={[
            cornerClosableWrapBase.closeWrap,
            disabled && cornerClosableWrapBase.closeWrapDisabled,
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <div
            role="button"
            tabIndex={-1}
            className={[
              cornerClosableWrapBase.closeCircle,
              disabled && cornerClosableWrapBase.closeCircleDisabled,
            ]
              .filter(Boolean)
              .join(' ')}
            aria-label={resolvedTexts.closeLabel}
            aria-disabled={disabled ? 'true' : undefined}
            onPointerDown={handlePointerDown}
            onClick={handleClose}
          >
            <CwIcon
              name="common--status--close-line"
              size={CW_CORNER_CLOSABLE_WRAP_CLOSE_ICON_STYLES.size ?? 1}
              className={CW_CORNER_CLOSABLE_WRAP_CLOSE_ICON_STYLES.class}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default CwCornerClosableWrap
