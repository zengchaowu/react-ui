import { useRef, useState } from 'react'
import type { ReactNode } from 'react'
import CwTooltip from '../CwTooltip/CwTooltip'

export interface CwDataTableCellOverflowProps {
  text?: string
  children?: ReactNode
}

export function CwDataTableCellOverflow({ text, children }: CwDataTableCellOverflowProps) {
  const elRef = useRef<HTMLDivElement | null>(null)
  const [tip, setTip] = useState<string | undefined>(undefined)

  const measure = () => {
    const el = elRef.current
    if (!el) {
      setTip(undefined)
      return
    }
    const overflowing = el.scrollWidth > el.clientWidth + 1
    if (!overflowing) {
      setTip(undefined)
      return
    }
    // 自定义 cellRender 展示文案可能与 column.key 字段不一致；优先用 DOM 文案
    const raw = (el.textContent || text || '').replace(/\s+/g, ' ').trim()
    setTip(raw || undefined)
  }

  const trigger = (
    <div
      ref={elRef}
      className="min-w-0 w-full max-w-full truncate"
      onMouseEnter={measure}
    >
      {children}
    </div>
  )

  if (tip) {
    return (
      <CwTooltip
        content={tip}
        placement="top"
        appearance="default"
        className="block min-w-0 w-full max-w-full"
        triggerSlot={trigger}
      />
    )
  }

  return trigger
}

export default CwDataTableCellOverflow
