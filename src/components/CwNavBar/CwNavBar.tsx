import { useMemo, type HTMLAttributes, type ReactNode } from 'react'
import type {
  CwNavBarAppearance,
  CwNavBarProps,
  CwNavBarStyles,
  CwNavBarTexts,
} from './types'
import { appearanceStyles, navBarBase, navBarInnerStructure } from './styles'
import { defaultTexts } from './texts'

export interface CwNavBarComponentProps
  extends CwNavBarProps,
    Omit<HTMLAttributes<HTMLElement>, 'title' | 'children' | 'className'> {
  className?: string
  /** `left` 具名插槽 */
  leftSlot?: ReactNode
  /** `title` 具名插槽 */
  titleSlot?: ReactNode
  /** `right` 具名插槽 */
  rightSlot?: ReactNode
}

export function CwNavBar({
  title = '',
  titleAlign = 'flow',
  size = 'compact',
  bordered = true,
  appearance = 'default',
  innerClass = '',
  texts: textsProp,
  leftSlot,
  titleSlot,
  rightSlot,
  className,
  ...rest
}: CwNavBarComponentProps) {
  const resolvedAppearance: CwNavBarAppearance = appearance || 'default'

  const styles = useMemo<CwNavBarStyles>(() => {
    const extra = appearanceStyles[resolvedAppearance] ?? {}
    const { innerExtra: _innerExtra, ...slotStyles } = extra
    return { ...navBarBase, ...slotStyles }
  }, [resolvedAppearance])

  const texts = useMemo<CwNavBarTexts>(
    () => ({ ...defaultTexts, ...(textsProp ?? {}) }),
    [textsProp],
  )

  const appearanceInnerExtra =
    appearanceStyles[resolvedAppearance]?.innerExtra ?? ''

  const innerClassList = [
    navBarInnerStructure,
    appearanceInnerExtra,
    innerClass,
    size === 'comfortable'
      ? styles.innerComfortable
      : styles.innerCompact,
  ]
    .filter(Boolean)
    .join(' ')

  const rootClassList = [
    styles.root,
    bordered ? styles.bordered : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const resolvedTitle =
    titleSlot !== undefined
      ? titleSlot
      : title
        ? <span className={styles.title}>{title}</span>
        : null

  return (
    <header {...rest} className={rootClassList} aria-label={texts.ariaLabel}>
      {titleAlign === 'absolute' ? (
        <div className={styles.titleOverlay}>{resolvedTitle}</div>
      ) : null}
      <div className={innerClassList}>
        <div className={styles.left}>{leftSlot}</div>
        {titleAlign === 'flow' ? (
          <div className={styles.center}>{resolvedTitle}</div>
        ) : null}
        <div className={styles.right}>{rightSlot}</div>
      </div>
    </header>
  )
}

export default CwNavBar
