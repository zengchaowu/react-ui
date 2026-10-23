import { useMemo } from 'react'
import type { CwSlotProps } from './types'
import { slotBase } from './styles'
import { defaultTexts } from './texts'

export function CwSlot({
  block = false,
  texts = defaultTexts,
  className,
  ...rest
}: CwSlotProps) {
  const resolvedTexts = useMemo(
    () => ({ ...defaultTexts, ...(texts ?? {}) }),
    [texts],
  )

  if (block) {
    return (
      <div
        className={[slotBase.blockWrap, className].filter(Boolean).join(' ')}
        role="presentation"
        aria-hidden="true"
        {...rest}
      >
        <div className={slotBase.root}>
          <span className={slotBase.label}>{resolvedTexts.defaultLabel}</span>
        </div>
      </div>
    )
  }

  return (
    <div
      className={[slotBase.root, className].filter(Boolean).join(' ')}
      role="presentation"
      aria-hidden="true"
      {...rest}
    >
      <span className={slotBase.label}>{resolvedTexts.defaultLabel}</span>
    </div>
  )
}

export default CwSlot
