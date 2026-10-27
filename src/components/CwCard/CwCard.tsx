import { useMemo, useState } from 'react'
import type { KeyboardEvent as ReactKeyboardEvent } from 'react'
import type { CwCardProps } from './types'
import { resolveCardStyles } from '@zengchaowu/ui-shared/components/CwCard/cardAppearance'
import { defaultTexts } from './texts'

export function CwCard({
  collapsible = false,
  defaultExpanded = true,
  showHeaderDivider = true,
  appearance = 'default',
  texts: textsProp,
  headerLeftSlot,
  headerRightSlot,
  children,
  className,
  onExpandChange,
  ...rest
}: CwCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  const styles = useMemo(
    () => resolveCardStyles(appearance ?? 'default'),
    [appearance],
  )
  const texts = useMemo(
    () => ({ ...defaultTexts, ...(textsProp ?? {}) }),
    [textsProp],
  )

  const hasHeaderSlot = Boolean(headerLeftSlot || headerRightSlot)
  const showBody = !collapsible || isExpanded
  const expandAriaLabel = texts.expandAriaLabel?.(isExpanded)

  const headerClassList = [
    styles.header,
    showHeaderDivider && styles.headerDivider && (!collapsible || isExpanded)
      ? styles.headerDivider
      : '',
    collapsible && styles.headerClickable ? styles.headerClickable : '',
  ]
    .filter(Boolean)
    .join(' ')

  const rootClassList = [styles.root, className].filter(Boolean).join(' ')

  const handleToggle = () => {
    if (!collapsible) return
    const nextExpanded = !isExpanded
    setIsExpanded(nextExpanded)
    onExpandChange?.(nextExpanded)
  }

  const handleHeaderClick = () => {
    if (collapsible) handleToggle()
  }

  const handleHeaderKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (!collapsible) return
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleToggle()
    }
  }

  return (
    <div {...rest} className={rootClassList}>
      {hasHeaderSlot ? (
        <div
          className={headerClassList}
          role={collapsible ? 'button' : undefined}
          tabIndex={collapsible ? 0 : undefined}
          aria-label={collapsible ? expandAriaLabel : undefined}
          aria-expanded={collapsible ? (isExpanded ? 'true' : 'false') : undefined}
          onClick={handleHeaderClick}
          onKeyDown={handleHeaderKeyDown}
        >
          <div className={styles.headerLeft}>{headerLeftSlot}</div>
          <div className={styles.headerRight}>{headerRightSlot}</div>
        </div>
      ) : null}

      {showBody ? <div className={styles.body}>{children}</div> : null}
    </div>
  )
}

export default CwCard
