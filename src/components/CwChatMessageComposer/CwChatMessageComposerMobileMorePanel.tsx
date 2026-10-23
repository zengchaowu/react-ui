import CwGrid from '../CwGrid/CwGrid'
import CwIcon from '../CwIcon/CwIcon'
import type { CwChatMessageComposerMobileMoreItem } from './types'
import { mobileMorePanelBase } from './mobileMorePanelStyles'

export interface CwChatMessageComposerMobileMorePanelProps {
  items: CwChatMessageComposerMobileMoreItem[]
  columns?: number
  gutter?: number
  rowGap?: number
  /** 等价 Vue `@select` */
  onSelect?: (key: string) => void
}

export function CwChatMessageComposerMobileMorePanel({
  items,
  columns = 4,
  gutter = 12,
  rowGap = 16,
  onSelect,
}: CwChatMessageComposerMobileMorePanelProps) {
  return (
    <div className={mobileMorePanelBase.root}>
      <CwGrid
        columns={columns}
        gutter={gutter}
        rowGap={rowGap}
        align="top"
        justify="start"
      >
        {items.map((item) => (
          <button
            key={item.key}
            type="button"
            className={mobileMorePanelBase.cell}
            aria-label={item.label}
            onClick={() => onSelect?.(item.key)}
          >
            <span className={mobileMorePanelBase.iconWrap}>
              <CwIcon
                name={item.icon}
                prefix="icon"
                size={1.5}
                className="text-[var(--text-color-primary)]"
              />
            </span>
            <span className={mobileMorePanelBase.label}>{item.label}</span>
          </button>
        ))}
      </CwGrid>
    </div>
  )
}

export default CwChatMessageComposerMobileMorePanel
