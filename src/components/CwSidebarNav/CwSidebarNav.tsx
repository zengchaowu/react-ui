import { useEffect, useMemo, useState } from 'react'
import type {
  CwSidebarNavItem,
  CwSidebarNavItemKey,
  CwSidebarNavProps,
  CwSidebarNavSection,
} from './types'
import { resolveSidebarNavStyles } from './styles'
import { defaultCwSidebarNavTexts } from './texts'
import CwButton from '../CwButton/CwButton'
import CwDiv from '../CwDiv/CwDiv'
import CwIcon from '../CwIcon/CwIcon'

function sectionStateKey(section: CwSidebarNavSection, index: number): string {
  return section.key?.trim() || `idx-${index}`
}

export function CwSidebarNav({
  value = null,
  sections,
  items,
  iconSize,
  iconPrefix = 'icon',
  ariaLabel,
  appearance = 'default',
  texts: textsProp,
  headerSlot,
  footerSlot,
  sectionLabelSlot,
  itemSlot,
  iconSlot,
  trailingSlot,
  className,
  onChange,
  onSelect,
  ...rest
}: CwSidebarNavProps) {
  const styles = useMemo(() => resolveSidebarNavStyles(appearance), [appearance])
  const texts = useMemo(
    () => ({ ...defaultCwSidebarNavTexts, ...(textsProp ?? {}) }),
    [textsProp],
  )

  const resolvedAriaLabel = ariaLabel?.trim() || '侧边栏导航'
  /** explorer 侧栏用 Windows 多色图标，略大于线标即可，过大易抢文案 */
  const resolvedIconSize = iconSize != null ? iconSize : appearance === 'explorer' ? 1.125 : 1
  const iconWrapStyle = { width: `${resolvedIconSize}rem`, height: `${resolvedIconSize}rem` }

  const resolvedSections = useMemo<CwSidebarNavSection[]>(() => {
    if (sections?.length) return sections
    if (items?.length) return [{ items }]
    return []
  }, [sections, items])

  const [expandedMap, setExpandedMap] = useState<Record<string, boolean>>({})

  useEffect(() => {
    setExpandedMap((prev) => {
      let next = prev
      resolvedSections.forEach((section, index) => {
        if (!section.collapsible) return
        const key = sectionStateKey(section, index)
        if (key in next) return
        if (next === prev) next = { ...prev }
        next[key] = section.defaultExpanded !== false
      })
      return next
    })
  }, [resolvedSections])

  const isSectionExpanded = (section: CwSidebarNavSection, index: number): boolean => {
    if (!section.collapsible) return true
    const key = sectionStateKey(section, index)
    if (key in expandedMap) return expandedMap[key]
    return section.defaultExpanded !== false
  }

  const toggleSection = (section: CwSidebarNavSection, index: number) => {
    if (!section.collapsible) return
    const key = sectionStateKey(section, index)
    const expanded = isSectionExpanded(section, index)
    setExpandedMap((prev) => ({ ...prev, [key]: !expanded }))
  }

  const isSelected = (key: CwSidebarNavItemKey): boolean => {
    if (value == null || value === '') return false
    return String(value) === String(key)
  }

  const handleSelect = (item: CwSidebarNavItem, section: CwSidebarNavSection) => {
    if (item.disabled) return
    onChange?.(item.key)
    const hasSectionMeta = section.key != null || section.label != null
    onSelect?.(item, hasSectionMeta ? section : null)
  }

  return (
    <CwDiv
      {...rest}
      role="navigation"
      aria-label={resolvedAriaLabel}
      className={[styles.root, className].filter(Boolean).join(' ')}
    >
      {headerSlot}

      {resolvedSections.map((section, sectionIndex) => {
        const expanded = isSectionExpanded(section, sectionIndex)
        return (
          <div
            key={section.key || `section-${sectionIndex}`}
            className={styles.section}
            data-section-key={section.key || undefined}
          >
            {section.label ? (
              section.collapsible ? (
                <button
                  type="button"
                  className={[styles.sectionLabel, styles.sectionLabelButton]
                    .filter(Boolean)
                    .join(' ')}
                  aria-expanded={expanded}
                  onClick={() => toggleSection(section, sectionIndex)}
                >
                  {sectionLabelSlot ? (
                    sectionLabelSlot({ section, expanded })
                  ) : (
                    <>
                      <span>{section.label}</span>
                      <CwIcon
                        name={
                          expanded
                            ? 'common--dir--arrow-down-line'
                            : 'common--dir--arrow-right-line'
                        }
                        prefix={iconPrefix}
                        size={0.75}
                        className={styles.sectionChevron}
                      />
                    </>
                  )}
                </button>
              ) : (
                <div className={styles.sectionLabel}>
                  {sectionLabelSlot ? (
                    sectionLabelSlot({ section, expanded: true })
                  ) : (
                    <span>{section.label}</span>
                  )}
                </div>
              )
            ) : null}

            {expanded ? (
              !section.items.length && section.emptyText ? (
                <p className={styles.empty}>{section.emptyText}</p>
              ) : (
                section.items.map((item) => {
                  const selected = isSelected(item.key)
                  return (
                    <CwButton
                      key={item.key}
                      {...(item.dataAttrs ?? {})}
                      appearance="list-item"
                      variant="text"
                      selected={selected}
                      disabled={item.disabled}
                      onClick={() => handleSelect(item, section)}
                    >
                      {itemSlot ? (
                        itemSlot({ item, selected, section })
                      ) : (
                        <>
                          {item.icon || iconSlot ? (
                            <span
                              className={styles.itemIcon}
                              style={iconWrapStyle}
                              aria-hidden="true"
                            >
                              {iconSlot ? (
                                iconSlot({ item, section })
                              ) : item.icon ? (
                                <CwIcon
                                  mode={item.iconMode || 'symbol'}
                                  name={item.icon}
                                  prefix={iconPrefix}
                                  size={resolvedIconSize}
                                />
                              ) : null}
                            </span>
                          ) : null}
                          <span className={styles.itemLabel}>{item.label}</span>
                          {trailingSlot ? (
                            trailingSlot({ item, section })
                          ) : item.pinned ? (
                            <span
                              className={styles.pin}
                              title={texts.pinTitle}
                              aria-hidden="true"
                            />
                          ) : null}
                        </>
                      )}
                    </CwButton>
                  )
                })
              )
            ) : null}
          </div>
        )
      })}

      {footerSlot}
    </CwDiv>
  )
}

export default CwSidebarNav
