import { Fragment, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type {
  CwDesignToolRailGroupConfig,
  CwDesignToolRailItemConfig,
  CwDesignToolRailItemSlotProps,
  CwDesignToolRailProps,
} from './types'
import { designToolRailSideBase, designToolRailTopBase } from './styles'
import { defaultCwDesignToolRailTexts } from './texts'
import CwDesignToolRailItem from './CwDesignToolRailItem'

export function CwDesignToolRail({
  groups = [],
  activeKey,
  disabled,
  placement = 'top',
  dropdownCaretSize,
  texts: textsProp,
  leadingSlot,
  itemSlots,
  className,
  onItemClick,
}: CwDesignToolRailProps) {
  const railBase =
    placement === 'top' ? designToolRailTopBase : designToolRailSideBase

  /** 顶栏按钮略放大 */
  const itemIconSize = placement === 'top' ? 1.125 : 1

  const tooltipPlacement: 'bottom' | 'right' =
    placement === 'top' ? 'bottom' : 'right'

  const texts = useMemo(
    () => ({ ...defaultCwDesignToolRailTexts, ...(textsProp ?? {}) }),
    [textsProp],
  )
  void texts

  const topGroups = useMemo(
    () => (groups ?? []).filter((g) => g.align !== 'bottom'),
    [groups],
  )

  const bottomGroups = useMemo(
    () => (groups ?? []).filter((g) => g.align === 'bottom'),
    [groups],
  )

  const [openDropdownKey, setOpenDropdownKey] = useState<string | null>(null)

  function itemDisabled(item: CwDesignToolRailItemConfig): boolean {
    return Boolean(disabled || item.disabled)
  }

  function isMenuBranchActive(
    items: CwDesignToolRailItemConfig[] | undefined,
  ): boolean {
    if (!items?.length || !activeKey) return false
    return items.some((child) => {
      if (child.toggle && activeKey === child.key) return true
      return isMenuBranchActive(child.menuItems)
    })
  }

  function isItemActive(item: CwDesignToolRailItemConfig) {
    if (item.toggle && activeKey === item.key) return true
    return isMenuBranchActive(item.menuItems)
  }

  function emitItemClick(item: CwDesignToolRailItemConfig) {
    if (itemDisabled(item)) return
    onItemClick?.(item)
  }

  function onMenuItemClick(item: CwDesignToolRailItemConfig) {
    if (itemDisabled(item)) return
    setOpenDropdownKey(null)
    onItemClick?.(item)
  }

  function onDropdownOpenChange(key: string, open: boolean) {
    setOpenDropdownKey(open ? key : null)
  }

  function renderItem(item: CwDesignToolRailItemConfig): ReactNode {
    const scope: CwDesignToolRailItemSlotProps = {
      item,
      active: isItemActive(item),
      disabled: itemDisabled(item),
      onClick: () => emitItemClick(item),
    }
    const slot = itemSlots?.[item.key]
    if (slot != null) {
      return typeof slot === 'function' ? slot(scope) : slot
    }
    return (
      <CwDesignToolRailItem
        item={item}
        active={scope.active}
        disabled={scope.disabled}
        base={railBase}
        tooltipPlacement={tooltipPlacement}
        activeKey={activeKey}
        iconSize={itemIconSize}
        dropdownCaretSize={dropdownCaretSize}
        open={openDropdownKey === item.key}
        onClick={() => emitItemClick(item)}
        onMenuItemClick={onMenuItemClick}
        onDropdownOpenChange={(open) => onDropdownOpenChange(item.key, open)}
      />
    )
  }

  function renderGroup(group: CwDesignToolRailGroupConfig) {
    return (
      <div
        className={railBase.group}
        role="group"
        aria-label={group.ariaLabel ?? group.id}
      >
        {group.items.map((item) => (
          <Fragment key={item.key}>{renderItem(item)}</Fragment>
        ))}
      </div>
    )
  }

  const RootTag = placement === 'top' ? 'header' : 'aside'

  return (
    <RootTag
      className={[railBase.root, className].filter(Boolean).join(' ')}
      aria-label="工具栏"
    >
      {leadingSlot != null && (
        <div className={railBase.leading}>{leadingSlot}</div>
      )}
      {leadingSlot != null && placement !== 'top' && topGroups.length > 0 && (
        <div className={railBase.divider} aria-hidden="true" />
      )}
      <div className={placement === 'top' ? railBase.center : railBase.scroll}>
        {topGroups.map((group, groupIndex) => (
          <Fragment key={group.id}>
            {renderGroup(group)}
            {groupIndex < topGroups.length - 1 && (
              <div className={railBase.divider} aria-hidden="true" />
            )}
          </Fragment>
        ))}
      </div>

      {bottomGroups.length > 0 && (
        <div className={railBase.footer}>
          {bottomGroups.map((group, groupIndex) => (
            <Fragment key={group.id}>
              {renderGroup(group)}
              {groupIndex < bottomGroups.length - 1 && (
                <div className={railBase.divider} aria-hidden="true" />
              )}
            </Fragment>
          ))}
        </div>
      )}
    </RootTag>
  )
}

export default CwDesignToolRail
