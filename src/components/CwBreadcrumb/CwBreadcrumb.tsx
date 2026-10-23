import type { MouseEvent as ReactMouseEvent } from 'react'
import type { CwBreadcrumbItem, CwBreadcrumbProps } from './types'
import {
  appearanceCurrentClass,
  appearanceItemClass,
  appearanceLinkClass,
  appearanceListClass,
  appearanceRootClass,
  appearanceSeparatorClass,
  breadcrumbBase,
} from './styles'
import { defaultTexts } from './texts'

function isLink(item: CwBreadcrumbItem): boolean {
  return !item.disabled && (item.to != null || item.href != null)
}

export function CwBreadcrumb({
  items = [],
  separator = '/',
  appearance = 'default',
  texts: textsProp,
  className,
  onSelect,
  ...rest
}: CwBreadcrumbProps) {
  const resolvedAppearance = appearance || 'default'
  const texts = { ...defaultTexts, ...(textsProp ?? {}) }

  const rootClassList = [
    breadcrumbBase.root,
    appearanceRootClass[resolvedAppearance],
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const listClassList = [breadcrumbBase.list, appearanceListClass[resolvedAppearance]]
    .filter(Boolean)
    .join(' ')

  const itemClassList = [breadcrumbBase.item, appearanceItemClass[resolvedAppearance]]
    .filter(Boolean)
    .join(' ')

  const linkClassList = [breadcrumbBase.link, appearanceLinkClass[resolvedAppearance]]
    .filter(Boolean)
    .join(' ')

  const currentClassList = [breadcrumbBase.current, appearanceCurrentClass[resolvedAppearance]]
    .filter(Boolean)
    .join(' ')

  const separatorClassList = [
    breadcrumbBase.separator,
    appearanceSeparatorClass[resolvedAppearance],
  ]
    .filter(Boolean)
    .join(' ')

  const isLast = (index: number) => index === items.length - 1

  const handleClick = (
    event: ReactMouseEvent<HTMLAnchorElement>,
    item: CwBreadcrumbItem,
    index: number,
  ) => {
    if (item.disabled) {
      event.preventDefault()
      return
    }
    if (item.to != null) event.preventDefault()
    onSelect?.(item, index)
  }

  return (
    <nav {...rest} className={rootClassList} aria-label={texts.ariaLabel}>
      <ol className={listClassList}>
        {items.map((item, index) => (
          <li key={index} className={itemClassList}>
            {index > 0 ? (
              <span className={separatorClassList} aria-hidden="true">
                {separator}
              </span>
            ) : null}
            {isLink(item) && !isLast(index) ? (
              <a
                href={item.to ?? item.href ?? '#'}
                className={[linkClassList, item.disabled ? 'pointer-events-none' : '']
                  .filter(Boolean)
                  .join(' ')}
                target={item.href ? '_blank' : undefined}
                rel={item.href ? 'noopener noreferrer' : undefined}
                onClick={(event) => handleClick(event, item, index)}
              >
                {item.label}
              </a>
            ) : (
              <span className={isLast(index) ? currentClassList : linkClassList}>
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

export default CwBreadcrumb
