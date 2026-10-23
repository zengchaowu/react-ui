import type { ReactNode } from 'react'
import CwIcon from '../CwIcon/CwIcon'
import type { CwDataTableStyles, CwDataTableTexts, CwDataTableTreeRowMeta } from './types'
import { defaultTexts } from './texts'

export interface CwDataTableTreeIndentProps {
  meta: CwDataTableTreeRowMeta
  indentSize: number
  tableStyles: CwDataTableStyles
  texts?: Partial<CwDataTableTexts>
  onToggle?: () => void
  children?: ReactNode
}

export function CwDataTableTreeIndent({
  meta,
  indentSize,
  tableStyles,
  texts: textsProp,
  onToggle,
  children,
}: CwDataTableTreeIndentProps) {
  const treeStyles = tableStyles
  const texts = { ...defaultTexts, ...(textsProp ?? {}) }

  const iconStyles = treeStyles.treeSwitcherIconStyles ?? {}
  const rotationClass = meta.expanded
    ? treeStyles.treeSwitcherExpanded
    : treeStyles.treeSwitcherCollapsed
  const switcherIconClass = [iconStyles.class ?? '', rotationClass]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={treeStyles.treeIndentRoot}>
      <span
        className={treeStyles.treeIndentSpacer}
        style={{ width: `${meta.depth * indentSize}px` }}
        aria-hidden="true"
      />
      {meta.hasChildren ? (
        <button
          type="button"
          className={treeStyles.treeSwitcher}
          aria-expanded={meta.expanded ? 'true' : 'false'}
          aria-label={meta.expanded ? texts.treeCollapseAriaLabel : texts.treeExpandAriaLabel}
          onClick={(event) => {
            event.stopPropagation()
            onToggle?.()
          }}
        >
          <CwIcon
            name="common--dir--arrow-down-filled"
            prefix="icon"
            size={iconStyles.size ?? 1}
            className={switcherIconClass}
          />
        </button>
      ) : (
        <span className={treeStyles.treeSwitcherPlaceholder} aria-hidden="true" />
      )}
      <div className={treeStyles.treeIndentContent}>{children}</div>
    </div>
  )
}

export default CwDataTableTreeIndent
