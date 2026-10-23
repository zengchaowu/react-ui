import { useEffect, useMemo, useRef } from 'react'
import type { ComponentType } from 'react'
import CwIcon from '../CwIcon/CwIcon'
import CwTooltip from '../CwTooltip/CwTooltip'
import {
  showCwContextMenu,
  type ShowCwContextMenuReturn,
} from '../CwContextMenu/showCwContextMenu'
import type { CwContextMenuItem } from '../CwContextMenu/types'
import type { CwDesignToolRailItemConfig, CwDesignToolRailStyles } from './types'

export interface CwDesignToolRailItemProps {
  item: CwDesignToolRailItemConfig
  active: boolean
  disabled: boolean
  base: CwDesignToolRailStyles
  tooltipPlacement: 'bottom' | 'right' | 'top' | 'left'
  open: boolean
  /** 当前工具 key；下拉项选中时用于切换触发器图标 */
  activeKey?: string
  /** 图标尺寸（rem）；顶栏略大于侧栏 */
  iconSize?: number
  /** 下拉箭头尺寸（rem）；未传时约为图标尺寸一半 */
  dropdownCaretSize?: number
  onClick?: () => void
  onMenuItemClick?: (item: CwDesignToolRailItemConfig) => void
  onDropdownOpenChange?: (open: boolean) => void
}

function iconAsComponent(
  icon: string | ComponentType | undefined,
): ComponentType | null {
  if (icon && typeof icon !== 'string') return icon
  return null
}

export function CwDesignToolRailItem({
  item,
  active,
  disabled,
  base,
  tooltipPlacement,
  open,
  activeKey,
  iconSize = 1,
  dropdownCaretSize,
  onClick,
  onMenuItemClick,
  onDropdownOpenChange,
}: CwDesignToolRailItemProps) {
  const caretSize = useMemo(() => {
    if (dropdownCaretSize != null && dropdownCaretSize > 0) {
      return dropdownCaretSize
    }
    return Math.max(0.5, iconSize * 0.5)
  }, [dropdownCaretSize, iconSize])

  const triggerRef = useRef<HTMLDivElement | null>(null)
  const menuHandleRef = useRef<ShowCwContextMenuReturn | null>(null)
  /** 打开嵌套子菜单时忽略父菜单 onClose，避免误关 */
  const suppressMenuCloseEmitRef = useRef(false)

  // 回调闭包内读取最新 props
  const propsRef = useRef({ item, disabled, activeKey, open })
  propsRef.current = { item, disabled, activeKey, open }
  const onMenuItemClickRef = useRef(onMenuItemClick)
  onMenuItemClickRef.current = onMenuItemClick
  const onDropdownOpenChangeRef = useRef(onDropdownOpenChange)
  onDropdownOpenChangeRef.current = onDropdownOpenChange

  const hasMenu = (item.menuItems?.length ?? 0) > 0

  /** 下拉子项（含一层嵌套）激活时，触发器显示该子项图标 */
  const activeMenuChild = useMemo(() => {
    const key = activeKey
    if (!key || !item.menuItems?.length) return null
    const direct = item.menuItems.find(
      (child) => child.toggle && child.key === key,
    )
    if (direct) return direct
    for (const child of item.menuItems) {
      const nested = child.menuItems?.find((c) => c.toggle && c.key === key)
      if (nested) return nested
    }
    return null
  }, [activeKey, item])

  const displayIcon = activeMenuChild?.icon ?? item.icon

  const displayIconPrefix =
    activeMenuChild?.iconPrefix ?? item.iconPrefix ?? 'icon'

  const itemClass = [
    base.item,
    active ? base.itemActive : '',
    item.danger ? base.itemDanger : '',
    hasMenu ? 'w-auto gap-0.5 px-1.5' : '',
  ]
    .filter(Boolean)
    .join(' ')

  const tooltipContent = useMemo(() => {
    const activeChild = activeMenuChild
    if (activeChild) {
      const shortcut = activeChild.shortcut?.trim()
      if (shortcut) return `${activeChild.label} (${shortcut})`
      return activeChild.label
    }
    const shortcut = item.shortcut?.trim()
    if (shortcut) return `${item.label} (${shortcut})`
    return item.label
  }, [activeMenuChild, item])

  function toContextMenuItem(child: CwDesignToolRailItemConfig): CwContextMenuItem {
    const currentActiveKey = propsRef.current.activeKey
    const icon = typeof child.icon === 'string' ? child.icon : undefined
    const nested = child.menuItems?.length
      ? child.menuItems.map((c) => toContextMenuItem(c))
      : undefined
    return {
      key: child.key,
      label: child.label,
      icon,
      iconPrefix: child.iconPrefix ?? 'icon',
      shortcut: child.shortcut?.trim() || undefined,
      disabled: Boolean(propsRef.current.disabled || child.disabled),
      danger: child.danger,
      selected: Boolean(child.toggle && currentActiveKey === child.key),
      dividerAfter: child.dividerAfter,
      children: nested,
    }
  }

  function findMenuChild(
    items: CwDesignToolRailItemConfig[],
    key: string,
  ): CwDesignToolRailItemConfig | null {
    for (const menuItem of items) {
      if (menuItem.key === key) return menuItem
      const nested = menuItem.menuItems
        ? findMenuChild(menuItem.menuItems, key)
        : null
      if (nested) return nested
    }
    return null
  }

  function closeMenu() {
    menuHandleRef.current?.close()
    menuHandleRef.current = null
  }

  function openMenuWithItems(
    items: CwDesignToolRailItemConfig[],
    clientX: number,
    clientY: number,
    anchorRect?: DOMRect,
  ) {
    if (menuHandleRef.current) {
      suppressMenuCloseEmitRef.current = true
      menuHandleRef.current.close()
      menuHandleRef.current = null
    }
    menuHandleRef.current = showCwContextMenu({
      x: clientX,
      y: clientY,
      anchorRect: anchorRect ?? undefined,
      anchorOffset: anchorRect ? 6 : 0,
      placement: 'bottom-start',
      appearance: 'checklist',
      highlightAnchor: false,
      closeOnSelect: false,
      items: items.map((child) => toContextMenuItem(child)),
      onSelect: (key) => {
        const child = findMenuChild(items, key)
        if (!child || child.disabled) return
        if (child.menuItems?.length) {
          const el = triggerRef.current
          const rect = el?.getBoundingClientRect()
          openMenuWithItems(
            child.menuItems,
            rect ? rect.right + 4 : clientX + 160,
            rect ? rect.top : clientY,
          )
          return
        }
        closeMenu()
        onMenuItemClickRef.current?.(child)
      },
      onClose: () => {
        menuHandleRef.current = null
        if (suppressMenuCloseEmitRef.current) {
          suppressMenuCloseEmitRef.current = false
          return
        }
        onDropdownOpenChangeRef.current?.(false)
      },
    })
    onDropdownOpenChangeRef.current?.(true)
  }

  function openMenu() {
    const el = triggerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    openMenuWithItems(item.menuItems ?? [], rect.left, rect.bottom, rect)
  }

  function toggleDropdown() {
    if (disabled) return
    // 带菜单的 toggle 工具（如容器）：点击主按钮同时激活工具
    if (item.toggle) onClick?.()
    if (open) {
      closeMenu()
      onDropdownOpenChange?.(false)
      return
    }
    openMenu()
  }

  // 等价 Vue watch(() => props.open)：外部关闭时收起菜单
  useEffect(() => {
    if (!open) closeMenu()
  }, [open])

  useEffect(() => {
    return () => {
      closeMenu()
    }
  }, [])

  function onTriggerKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      toggleDropdown()
    }
  }

  function onPlainKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onClick?.()
    }
  }

  if (hasMenu) {
    const DisplayIconComp = iconAsComponent(displayIcon)
    return (
      <div
        ref={triggerRef}
        role="button"
        tabIndex={0}
        aria-label={item.label}
        title={tooltipContent}
        aria-haspopup={true}
        aria-expanded={open ? 'true' : 'false'}
        aria-disabled={disabled ? 'true' : 'false'}
        className={itemClass}
        onClick={(event) => {
          event.stopPropagation()
          toggleDropdown()
        }}
        onKeyDown={onTriggerKeyDown}
      >
        {displayIcon != null && !DisplayIconComp && (
          <CwIcon
            name={String(displayIcon)}
            prefix={displayIconPrefix}
            size={iconSize}
          />
        )}
        {DisplayIconComp && <DisplayIconComp />}
        <span className={base.dropdownCaret} aria-hidden="true">
          <CwIcon
            name="common--dir--arrow-down-line"
            prefix="icon"
            size={caretSize}
          />
        </span>
      </div>
    )
  }

  const ItemIconComp = iconAsComponent(item.icon)
  return (
    <CwTooltip
      content={tooltipContent}
      placement={tooltipPlacement}
      appearance="inline"
      triggerSlot={
        <div
          role="button"
          tabIndex={0}
          aria-label={item.label}
          aria-pressed={item.toggle ? active : undefined}
          aria-disabled={disabled ? 'true' : 'false'}
          className={itemClass}
          onClick={() => onClick?.()}
          onKeyDown={onPlainKeyDown}
        >
          {ItemIconComp ? (
            <ItemIconComp />
          ) : item.icon ? (
            <CwIcon
              name={String(item.icon)}
              prefix={item.iconPrefix ?? 'icon'}
              size={iconSize}
            />
          ) : null}
        </div>
      }
    />
  )
}

export default CwDesignToolRailItem
