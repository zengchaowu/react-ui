import { useEffect, useMemo, useRef, useState } from 'react'
import type {
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
} from 'react'
import { createPortal } from 'react-dom'
import type {
  CwChromeTabItem,
  CwChromeTabProps,
  CwChromeTabStyleSlots,
  CwChromeTabTexts,
} from './types'
import { appearanceStyles, chromeTabBase } from './styles'
import { defaultTexts } from './texts'
import {
  buildChromeTabContextMenuItems,
  resolveChromeTabCloseTargetIds,
  type ChromeTabContextAction,
  type ChromeTabContextMenuItem,
} from './chromeTabContextMenu'

const CONTEXT_MENU_PANEL_CLASS = [
  'cw-context-menu-panel pointer-events-auto w-max min-w-[var(--size-context-menu-min)] max-w-[18rem] overflow-hidden',
  'flex flex-col gap-1 rounded-xl border border-[color-mix(in_srgb,var(--border-color)_55%,transparent)]',
  'bg-[color-mix(in_srgb,var(--bg-color-container)_92%,transparent)]',
  'shadow-[0_2px_8px_color-mix(in_srgb,var(--scrim-base)_10%,transparent)] backdrop-blur-xl',
  'p-1 outline-none',
].join(' ')

const CONTEXT_MENU_ITEM_CLASS = [
  'flex items-center gap-2 whitespace-nowrap text-left',
  'scroll-my-1 box-border min-h-8 min-w-0 w-full rounded-md',
  'px-2.5 py-1.5 text-[0.8125rem] leading-snug',
  'text-[var(--text-color-primary)]',
  'hover:bg-[color-mix(in_srgb,var(--brand-color-6)_6%,transparent)]',
  'active:bg-[color-mix(in_srgb,var(--brand-color-6)_12%,transparent)]',
].join(' ')

const CONTEXT_MENU_ITEM_DISABLED_CLASS =
  'opacity-40 cursor-not-allowed pointer-events-none'

interface ChromeTabMenuState {
  x: number
  y: number
  tab: CwChromeTabItem
  index: number
  items: ChromeTabContextMenuItem[]
}

export function CwChromeTab({
  tabs,
  activeId = null,
  closable = false,
  addable = false,
  appearance = 'default',
  texts: textsProp,
  contextMenu = true,
  topRounded = '',
  tabIconSlot,
  className,
  onActiveIdChange,
  onClose,
  onCloseOthers,
  onCloseToTheRight,
  onCloseAll,
  onAdd,
  onChange,
  onReorder,
  ...rest
}: CwChromeTabProps) {
  const computedStyles = useMemo<CwChromeTabStyleSlots>(
    () => ({
      ...chromeTabBase,
      ...(appearanceStyles[appearance || 'default'] ?? {}),
    }),
    [appearance],
  )

  const computedTexts = useMemo<CwChromeTabTexts>(
    () => ({ ...defaultTexts, ...(textsProp ?? {}) }),
    [textsProp],
  )

  const topRoundedClass = topRounded ? `rounded-t-${topRounded}` : ''
  const rootClassList = [computedStyles.root, className].filter(Boolean).join(' ')
  const barClass = computedStyles.bar

  const tabRefs = useRef<Record<string | number, HTMLDivElement | null>>({})
  const tabsRef = useRef(tabs)
  tabsRef.current = tabs
  const handlersRef = useRef({ onActiveIdChange, onChange, onReorder })
  handlersRef.current = { onActiveIdChange, onChange, onReorder }

  const tabClosable = (tab: CwChromeTabItem): boolean => {
    if (!closable) return false
    if (tab.closable === false) return false
    return true
  }

  const tabClass = (tab: CwChromeTabItem): string => {
    const s = computedStyles
    const isActive = tab.id === activeId
    const classes = [s.tab, s.tabGap].filter(Boolean)
    if (tab.disabled) classes.push(s.tabDisabled)
    else if (isActive) classes.push(s.tabActive)
    else classes.push(s.tabInactive)
    if (tab.preview) classes.push('italic opacity-90')
    if (topRoundedClass) classes.push(topRoundedClass)
    return classes.join(' ')
  }

  const closeBtnClass = (tab: CwChromeTabItem): string => {
    const s = computedStyles
    const classes = [s.closeButton]
    if (tab.id === activeId) classes.push(s.closeButtonFocus)
    return classes.join(' ')
  }

  const handleTabClick = (tab: CwChromeTabItem, index: number) => {
    if (tab.disabled) return
    if (tab.id !== activeId) {
      onActiveIdChange?.(tab.id)
      onChange?.(tab.id, index, tab)
    }
  }

  const handleClose = (tab: CwChromeTabItem, index: number) => {
    if (tab.disabled) return
    onClose?.(tab.id, index)
  }

  const handleTabKeydown = (event: ReactKeyboardEvent<HTMLDivElement>, index: number) => {
    const len = tabs.length
    let nextIndex = index

    switch (event.key) {
      case 'ArrowRight':
        event.preventDefault()
        nextIndex = (index + 1) % len
        break
      case 'ArrowLeft':
        event.preventDefault()
        nextIndex = (index - 1 + len) % len
        break
      case 'Home':
        event.preventDefault()
        nextIndex = 0
        break
      case 'End':
        event.preventDefault()
        nextIndex = len - 1
        break
      case 'Delete':
      case 'Backspace':
        event.preventDefault()
        if (tabClosable(tabs[index])) {
          onClose?.(tabs[index].id, index)
        }
        return
      default:
        return
    }

    const nextTab = tabs[nextIndex]
    if (nextTab && !nextTab.disabled) {
      onActiveIdChange?.(nextTab.id)
      onChange?.(nextTab.id, nextIndex, nextTab)
      tabRefs.current[nextTab.id]?.focus()
    }
  }

  const onTabMouseDown = (
    event: ReactMouseEvent<HTMLDivElement>,
    tab: CwChromeTabItem,
    index: number,
  ) => {
    if (event.button !== 0) return
    if (tab.disabled) return
    if (tabsRef.current.length < 2) return
    event.preventDefault()

    const startX = event.clientX
    let moved = false
    let currentIndex = index

    const onMouseMove = (ev: MouseEvent) => {
      const dx = ev.clientX - startX
      if (Math.abs(dx) > 40) {
        moved = true
        const dir = dx > 0 ? 1 : -1
        const latest = tabsRef.current
        const newIndex = Math.min(Math.max(currentIndex + dir, 0), latest.length - 1)
        if (newIndex !== currentIndex) {
          const newTabs = [...latest]
          const [removed] = newTabs.splice(currentIndex, 1)
          newTabs.splice(newIndex, 0, removed)
          handlersRef.current.onReorder?.(newTabs, tab.id, currentIndex, newIndex)
          currentIndex = newIndex
        }
      }
    }

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
      if (moved) {
        const clickHandler = () => {
          document.removeEventListener('click', clickHandler, true)
        }
        document.addEventListener('click', clickHandler, true)
      }
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }

  const [menuState, setMenuState] = useState<ChromeTabMenuState | null>(null)
  const menuRef = useRef<HTMLDivElement | null>(null)

  const emitCloseTargets = (
    action: ChromeTabContextAction,
    tab: CwChromeTabItem,
    index: number,
  ) => {
    const ids = resolveChromeTabCloseTargetIds(action, tabs, index, closable)
    if (ids.length === 0) return
    if (action === 'close') {
      onClose?.(tab.id, index)
      return
    }
    if (action === 'close-others') {
      onCloseOthers?.(tab.id, ids)
      return
    }
    if (action === 'close-to-the-right') {
      onCloseToTheRight?.(tab.id, ids)
      return
    }
    onCloseAll?.(ids)
  }

  const onTabContextMenu = (
    event: ReactMouseEvent<HTMLDivElement>,
    tab: CwChromeTabItem,
    index: number,
  ) => {
    if (tab.disabled) return
    if (contextMenu === false) return
    event.preventDefault()
    event.stopPropagation()
    const items = buildChromeTabContextMenuItems(tabs, index, {
      closable,
      texts: computedTexts,
    })
    if (!items.length) return
    setMenuState({
      x: event.clientX,
      y: event.clientY,
      tab,
      index,
      items,
    })
  }

  const menuPosition = useMemo(() => {
    if (!menuState) return { left: 0, top: 0 }
    if (typeof window === 'undefined') return { left: menuState.x, top: menuState.y }
    const width = 192
    const height = menuState.items.length * 32 + 8
    return {
      left: Math.max(8, Math.min(menuState.x, window.innerWidth - width - 8)),
      top: Math.max(8, Math.min(menuState.y, window.innerHeight - height - 8)),
    }
  }, [menuState])

  useEffect(() => {
    if (!menuState) return
    const handlePointerDown = (event: MouseEvent) => {
      if (menuRef.current?.contains(event.target as Node)) return
      setMenuState(null)
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuState(null)
    }
    document.addEventListener('mousedown', handlePointerDown, true)
    document.addEventListener('keydown', handleKeyDown, true)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown, true)
      document.removeEventListener('keydown', handleKeyDown, true)
    }
  }, [menuState])

  useEffect(() => {
    if (tabs.length > 0 && (activeId == null || !tabs.some((tab) => tab.id === activeId))) {
      const first = tabs.find((tab) => !tab.disabled) || tabs[0]
      handlersRef.current.onActiveIdChange?.(first.id)
      handlersRef.current.onChange?.(first.id, tabs.indexOf(first), first)
    }
  }, [tabs, activeId])

  return (
    <>
      <div {...rest} className={rootClassList}>
        {/* 标签栏 */}
        <div className={barClass} role="tablist" aria-label={computedTexts.tablistLabel}>
          {tabs.map((tab, index) => (
            <div
              key={tab.id}
              ref={(el) => {
                tabRefs.current[tab.id] = el
              }}
              role="tab"
              aria-selected={tab.id === activeId}
              aria-disabled={tab.disabled || undefined}
              tabIndex={tab.id === activeId ? 0 : -1}
              className={tabClass(tab)}
              title={tab.label}
              data-cw-context-menu-anchor
              onClick={() => handleTabClick(tab, index)}
              onKeyDown={(event) => handleTabKeydown(event, index)}
              onMouseDown={(event) => onTabMouseDown(event, tab, index)}
              onContextMenu={(event) => onTabContextMenu(event, tab, index)}
            >
              {tab.icon ? (
                <span
                  className={computedStyles.tabIcon}
                  dangerouslySetInnerHTML={{ __html: tab.icon }}
                />
              ) : tabIconSlot ? (
                <span className={computedStyles.tabIconSlot}>
                  {tabIconSlot({ tab, index })}
                </span>
              ) : null}
              <span className={computedStyles.tabLabel}>{tab.label}</span>
              {tabClosable(tab) ? (
                <div
                  role="button"
                  tabIndex={-1}
                  className={[closeBtnClass(tab), 'cursor-pointer'].filter(Boolean).join(' ')}
                  aria-label={computedTexts.closeButtonLabel}
                  onClick={(event) => {
                    event.stopPropagation()
                    handleClose(tab, index)
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      event.stopPropagation()
                      handleClose(tab, index)
                    }
                  }}
                >
                  <svg
                    className={computedStyles.closeIcon}
                    viewBox="0 0 10 10"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.2}
                  >
                    <path d="M2 2l6 6M8 2l-6 6" />
                  </svg>
                </div>
              ) : null}
            </div>
          ))}

          {/* 添加按钮 */}
          {addable ? (
            <div
              role="button"
              tabIndex={0}
              className={[computedStyles.addButton, 'cursor-pointer'].filter(Boolean).join(' ')}
              aria-label={computedTexts.addButtonLabel}
              onClick={() => onAdd?.()}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  onAdd?.()
                }
              }}
            >
              <svg className={computedStyles.addIcon} viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth={2} fill="none" />
              </svg>
            </div>
          ) : null}
        </div>
      </div>

      {menuState && typeof document !== 'undefined'
        ? createPortal(
            <div
              ref={menuRef}
              className="fixed z-[var(--z-index-modal)]"
              style={menuPosition}
            >
              <div className={CONTEXT_MENU_PANEL_CLASS} role="menu">
                {menuState.items.map((item) => (
                  <div
                    key={item.key}
                    role="menuitem"
                    aria-disabled={item.disabled || undefined}
                    className={[
                      CONTEXT_MENU_ITEM_CLASS,
                      item.disabled ? CONTEXT_MENU_ITEM_DISABLED_CLASS : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    onClick={
                      item.disabled
                        ? undefined
                        : () => {
                            const current = menuState
                            setMenuState(null)
                            emitCloseTargets(item.key, current.tab, current.index)
                          }
                    }
                  >
                    {item.label}
                  </div>
                ))}
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  )
}

export default CwChromeTab
