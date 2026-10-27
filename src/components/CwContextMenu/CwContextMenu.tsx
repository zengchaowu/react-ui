import {
  Fragment,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react'
import type {
  HTMLAttributes,
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
  ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
import { CW_OVERLAY_MODAL_Z_CLASS } from '@zengchaowu/ui-shared/constants/cwOverlayZIndex'
import { mergeOverlayTailwindClass } from '@zengchaowu/ui-shared/functions/ui/mergeOverlayTailwindClass'
import type { Placement } from '@zengchaowu/shared/types/placement'
import { CwIcon } from '../CwIcon'
import { CwGrid } from '../CwGrid'
import { createCwPopup } from '../CwPopup/functions/createCwPopup'
import { PopupContainer } from '../CwPopup/functions/PopupContainer'
import type {
  PopupPluginFunction,
  VirtualElement,
} from '../CwPopup/types'
import { useBrowserFocusVisible } from '../../hooks/useBrowserFocusVisible'
import {
  createCwContextMenuPopupPlugins,
  CW_CONTEXT_MENU_DISMISS_GRACE_MS,
} from '@zengchaowu/ui-shared/components/CwContextMenu/contextMenuPopupPlugins'
import {
  CW_CHAT_MESSAGE_TOOLBAR_CELL_WIDTH_REM,
  CW_CHAT_MESSAGE_TOOLBAR_MAX_COLUMNS,
  defaultCwChatMessageToolbarMenuArrowClass,
} from '@zengchaowu/ui-shared/components/CwContextMenu/toolbarStyles'
import type {
  CwContextMenuHandle,
  CwContextMenuItem,
  CwContextMenuProps,
} from './types'
import { resolveCwContextMenuStyles } from '@zengchaowu/ui-shared/components/CwContextMenu/styles'
import { defaultCwContextMenuTexts } from '@zengchaowu/ui-shared/components/CwContextMenu/texts'

const SUBMENU_OPEN_ATTR = 'data-cw-context-submenu-open'
const SUBMENU_PANEL_ATTR = 'data-cw-context-menu-submenu'
/** 穿越主菜单 → 子菜单间隙时的关闭宽限（须覆盖 bridge 上的停留） */
const SUBMENU_HOVER_CLOSE_MS = 320
/** 子菜单相对父项的间距（px） */
const SUBMENU_ANCHOR_OFFSET_PX = 6

/** 项间距 + 面板等宽留白：挂在 role=menu 这层（CwPopup popup 根下有 pluginContainer 空 div，
 *  如果 popup 根是 flex-col + gap 会被撑开额外间距；留白挂 content 层和 Select/Cascader 对齐） */
const MENU_LIST_LAYOUT_CLASS = 'flex min-w-0 flex-col gap-1 p-1'

const EMPTY_ITEMS: CwContextMenuItem[] = []

export interface CwContextMenuComponentProps
  extends CwContextMenuProps,
    Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'className' | 'onSelect'> {
  /** 宿主节点额外 class */
  className?: string
}

interface SubmenuState {
  ownerKey: string
  items: CwContextMenuItem[]
  anchorEl: HTMLElement
}

type ItemActivationEvent =
  | ReactMouseEvent<HTMLElement>
  | ReactKeyboardEvent<HTMLElement>

interface SubmenuElements {
  popup: HTMLElement | null
  bridge: HTMLElement | null
}

interface CwContextSubmenuProps {
  ownerKey: string
  items: CwContextMenuItem[]
  anchorEl: HTMLElement
  panelClass: string
  plugins: PopupPluginFunction[]
  getMountContainer: () => HTMLElement | null
  renderList: (items: CwContextMenuItem[]) => ReactNode
  onVisibilityChange: (visible: boolean) => void
  onElementsReady: (ownerKey: string, elements: SubmenuElements) => void
}

/**
 * 子菜单浮层：内部独立 Popup 实例（placement right-start，不抢 click-outside）。
 */
function CwContextSubmenu({
  ownerKey,
  items,
  anchorEl,
  panelClass,
  plugins,
  getMountContainer,
  renderList,
  onVisibilityChange,
  onElementsReady,
}: CwContextSubmenuProps) {
  const anchorRef = useRef(anchorEl)
  anchorRef.current = anchorEl

  const onVisibilityChangeRef = useRef(onVisibilityChange)
  onVisibilityChangeRef.current = onVisibilityChange

  const onElementsReadyRef = useRef(onElementsReady)
  onElementsReadyRef.current = onElementsReady

  const getTriggerElement = useCallback(
    (): VirtualElement => ({
      getBoundingClientRect: () => anchorRef.current.getBoundingClientRect(),
    }),
    [],
  )

  const { instance, state, containerMounted, mountContainer, hostRef, popupElement, pluginElement, bridgeElement } =
    createCwPopup({
      placement: 'right-start',
      trigger: 'manual',
      plugins,
      // 点外侧时由主菜单层 dismiss；子菜单不抢第一下
      closeOnClickOutside: false,
      closeOnScroll: true,
      popupClass: panelClass,
      getMountContainer,
      getTriggerElement,
      onVisibleChange: (visible) => {
        if (!visible) onVisibilityChangeRef.current(false)
      },
    })

  useEffect(() => {
    let cancelled = false
    void instance.show().then(() => {
      if (cancelled) return
      onElementsReadyRef.current(ownerKey, {
        popup: instance.getPopupElement(),
        bridge: instance.getBridgeElement(),
      })
    })
    return () => {
      cancelled = true
      instance.destroy()
    }
  }, [instance, ownerKey])

  return (
    <>
      {containerMounted && mountContainer
        ? createPortal(
            <div ref={hostRef} className="pointer-events-none">
              <PopupContainer
                visible={state.visible}
                offsetX={state.position?.x ?? null}
                offsetY={state.position?.y ?? null}
                styleClass={panelClass}
                popupRef={popupElement}
                pluginRef={pluginElement}
                bridgeRef={bridgeElement}
              >
                {renderList(items)}
              </PopupContainer>
            </div>,
            mountContainer,
          )
        : null}
    </>
  )
}

/**
 * CwContextMenu - 右键菜单宿主（命令式 + 声明式）
 * 全屏透明 scrim 拦截页面点击，菜单面板基于 CwPopup 定位/翻转/溢出夹紧。
 */
export const CwContextMenu = forwardRef<
  CwContextMenuHandle,
  CwContextMenuComponentProps
>(function CwContextMenu(props, ref) {
  const {
    x,
    y,
    items = EMPTY_ITEMS,
    placement,
    layout = 'list',
    anchorRect = null,
    viewportPadding = 8,
    anchorOffset = 0,
    shadow = true,
    closeOnSelect = true,
    appearance = 'default',
    showArrow = false,
    flip = true,
    panelClass = '',
    onSelect,
    onRequestClose,
    className,
    ...rest
  } = props

  useBrowserFocusVisible()

  const hostRef = useRef<HTMLDivElement>(null)
  /** 首次 show 前已请求关闭（命令式 API 可能在 ref 就绪时立即 close） */
  const closeRequestedRef = useRef(false)
  const onSelectRef = useRef(onSelect)
  onSelectRef.current = onSelect
  const onRequestCloseRef = useRef(onRequestClose)
  onRequestCloseRef.current = onRequestClose

  const [submenu, setSubmenu] = useState<SubmenuState | null>(null)
  const submenuRef = useRef<SubmenuState | null>(null)
  const submenuPopupElRef = useRef<HTMLElement | null>(null)
  const submenuBridgeElRef = useRef<HTMLElement | null>(null)
  const submenuHoverZoneElsRef = useRef<HTMLElement[]>([])
  const submenuHoverCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const mergedStyles = useMemo(
    () => resolveCwContextMenuStyles(appearance ?? 'default'),
    [appearance],
  )

  const texts = defaultCwContextMenuTexts

  const resolvedPanelClass = useMemo(
    () =>
      mergeOverlayTailwindClass(
        [
          mergedStyles.panel,
          'pointer-events-auto',
          shadow === false && '!shadow-none',
        ]
          .filter(Boolean)
          .join(' '),
        panelClass,
      ),
    [mergedStyles, shadow, panelClass],
  )

  const contextMenuPopupPlugins = useMemo(() => {
    const useToolbarArrow = layout === 'toolbar' && anchorRect != null
    const useAnchorArrow = showArrow && anchorRect != null
    return createCwContextMenuPopupPlugins({
      viewportPadding,
      anchorOffset,
      flip: flip !== false,
      arrow:
        useToolbarArrow || useAnchorArrow
          ? {
              margin: useToolbarArrow ? 10 : 6,
              arrowClass: defaultCwChatMessageToolbarMenuArrowClass,
            }
          : undefined,
    })
  }, [layout, anchorRect, showArrow, viewportPadding, anchorOffset, flip])

  const submenuPopupPlugins = useMemo(
    () =>
      createCwContextMenuPopupPlugins({
        viewportPadding,
        anchorOffset: SUBMENU_ANCHOR_OFFSET_PX,
        flip: true,
      }),
    [viewportPadding],
  )

  const getTriggerElement = useCallback(
    (): VirtualElement => ({
      getBoundingClientRect: () => {
        const anchor = anchorRect
        if (anchor) {
          return new DOMRect(anchor.left, anchor.top, anchor.width, anchor.height)
        }
        return new DOMRect(x, y, 0, 0)
      },
    }),
    [anchorRect, x, y],
  )

  const getMountContainer = useCallback((): HTMLElement | null => {
    return hostRef.current?.parentElement ?? null
  }, [])

  const clearSubmenuHoverTimer = useCallback(() => {
    if (submenuHoverCloseTimerRef.current != null) {
      clearTimeout(submenuHoverCloseTimerRef.current)
      submenuHoverCloseTimerRef.current = null
    }
  }, [])

  const unbindSubmenuHoverZone = useCallback(() => {
    for (const el of submenuHoverZoneElsRef.current) {
      el.removeEventListener('mouseenter', clearSubmenuHoverTimer)
      el.removeEventListener('mouseleave', onSubmenuHoverZoneLeaveRef.current)
    }
    submenuHoverZoneElsRef.current = []
  }, [clearSubmenuHoverTimer])

  const destroySubmenu = useCallback(() => {
    clearSubmenuHoverTimer()
    unbindSubmenuHoverZone()
    submenuPopupElRef.current = null
    submenuBridgeElRef.current = null
    submenuRef.current = null
    setSubmenu(null)
  }, [clearSubmenuHoverTimer, unbindSubmenuHoverZone])

  const scheduleDestroySubmenu = useCallback(() => {
    clearSubmenuHoverTimer()
    submenuHoverCloseTimerRef.current = setTimeout(() => {
      destroySubmenu()
    }, SUBMENU_HOVER_CLOSE_MS)
  }, [clearSubmenuHoverTimer, destroySubmenu])

  const isNodeInSubmenuHoverZone = useCallback((node: Node | null): boolean => {
    if (!node) return false
    if (submenuRef.current?.anchorEl.contains(node)) return true
    return submenuHoverZoneElsRef.current.some((el) => el.contains(node))
  }, [])

  const onSubmenuHoverZoneLeave = useCallback(
    (event: MouseEvent) => {
      // bridge ↔ 面板 ↔ 父项 之间移动时 relatedTarget 仍在保活区内
      if (isNodeInSubmenuHoverZone(event.relatedTarget as Node | null)) {
        clearSubmenuHoverTimer()
        return
      }
      scheduleDestroySubmenu()
    },
    [clearSubmenuHoverTimer, isNodeInSubmenuHoverZone, scheduleDestroySubmenu],
  )

  const onSubmenuHoverZoneLeaveRef = useRef(onSubmenuHoverZoneLeave)
  onSubmenuHoverZoneLeaveRef.current = onSubmenuHoverZoneLeave

  const bindSubmenuHoverZone = useCallback(
    (els: Array<HTMLElement | null | undefined>) => {
      unbindSubmenuHoverZone()
      const unique: HTMLElement[] = []
      for (const el of els) {
        if (!el || unique.includes(el)) continue
        unique.push(el)
        el.addEventListener('mouseenter', clearSubmenuHoverTimer)
        el.addEventListener('mouseleave', onSubmenuHoverZoneLeaveRef.current)
      }
      submenuHoverZoneElsRef.current = unique
    },
    [clearSubmenuHoverTimer, unbindSubmenuHoverZone],
  )

  useEffect(() => {
    return () => {
      if (submenuHoverCloseTimerRef.current != null) {
        clearTimeout(submenuHoverCloseTimerRef.current)
        submenuHoverCloseTimerRef.current = null
      }
      for (const el of submenuHoverZoneElsRef.current) {
        el.removeEventListener('mouseenter', clearSubmenuHoverTimer)
        el.removeEventListener('mouseleave', onSubmenuHoverZoneLeaveRef.current)
      }
      submenuHoverZoneElsRef.current = []
    }
  }, [clearSubmenuHoverTimer])

  const findSubmenuPanelEl = useCallback((): HTMLElement | null => {
    const host = hostRef.current?.parentElement
    if (!host) return null
    return host.querySelector<HTMLElement>(`[${SUBMENU_PANEL_ATTR}="true"]`)
  }, [])

  const getExtraTraps = useCallback(
    () => [
      ...submenuHoverZoneElsRef.current,
      findSubmenuPanelEl(),
      submenuPopupElRef.current,
      submenuBridgeElRef.current,
    ],
    [findSubmenuPanelEl],
  )

  const handleVisibleChange = useCallback(
    (visible: boolean) => {
      if (!visible) {
        destroySubmenu()
        onRequestCloseRef.current()
      }
    },
    [destroySubmenu],
  )

  const resolvedPlacement: Placement =
    placement ?? (anchorRect ? 'top' : 'bottom-start')

  const {
    instance,
    state,
    containerMounted,
    mountContainer,
    hostRef: popupHostRef,
    popupElement,
    pluginElement,
    bridgeElement,
  } = createCwPopup({
    // 显式 placement 优先；仅有锚点未指定时默认向上（消息气泡等），否则向下
    placement: resolvedPlacement,
    trigger: 'manual',
    plugins: contextMenuPopupPlugins,
    closeOnClickOutside: true,
    dismissGraceMs: CW_CONTEXT_MENU_DISMISS_GRACE_MS,
    closeOnScroll: true,
    popupClass: resolvedPanelClass,
    getMountContainer,
    extraTraps: getExtraTraps,
    getTriggerElement,
    onVisibleChange: handleVisibleChange,
  })

  useEffect(() => {
    if (closeRequestedRef.current) {
      instance.hide()
    } else {
      void instance.show()
    }
    return () => {
      instance.destroy()
    }
  }, [instance])

  const close = useCallback(() => {
    closeRequestedRef.current = true
    destroySubmenu()
    instance.hide()
  }, [destroySubmenu, instance])

  useImperativeHandle(ref, () => ({ close }), [close])

  const onLeafSelect = useCallback(
    (item: CwContextMenuItem) => {
      onSelectRef.current?.(item.key, item)
      if (closeOnSelect !== false) {
        destroySubmenu()
        instance.hide()
      }
    },
    [closeOnSelect, destroySubmenu, instance],
  )

  const openSubmenuForItem = useCallback(
    (item: CwContextMenuItem, anchorEl: HTMLElement) => {
      if (!item.children?.length || item.disabled) return
      clearSubmenuHoverTimer()
      if (submenuRef.current?.ownerKey === item.key) return

      destroySubmenu()

      const next: SubmenuState = {
        ownerKey: item.key,
        items: item.children,
        anchorEl,
      }
      submenuRef.current = next
      setSubmenu(next)
    },
    [clearSubmenuHoverTimer, destroySubmenu],
  )

  const onItemClick = useCallback(
    (item: CwContextMenuItem, event?: ItemActivationEvent) => {
      event?.stopPropagation()
      if (item.disabled) return
      if (item.children?.length) {
        const el =
          (event?.currentTarget as HTMLElement | null | undefined) ??
          (event?.target instanceof HTMLElement
            ? event.target.closest('[role="menuitem"]')
            : null)
        if (el instanceof HTMLElement) openSubmenuForItem(item, el)
        return
      }
      onLeafSelect(item)
    },
    [onLeafSelect, openSubmenuForItem],
  )

  const onSubmenuVisibleChange = useCallback(
    (visible: boolean) => {
      if (!visible) destroySubmenu()
    },
    [destroySubmenu],
  )

  const onSubmenuElementsReady = useCallback(
    (ownerKey: string, elements: SubmenuElements) => {
      if (submenuRef.current?.ownerKey !== ownerKey) return
      submenuPopupElRef.current = elements.popup
      submenuBridgeElRef.current = elements.bridge
      // 只绑面板壳 + bridge（内容是壳的子树，勿重复绑，避免子项间误 leave）
      bindSubmenuHoverZone([elements.popup, elements.bridge])
    },
    [bindSubmenuHoverZone],
  )

  const isChecklist = appearance === 'checklist'
  /** plain：Cursor 式纯文本，即使 item 带了 icon 也不渲染 */
  const hideItemIcons = appearance === 'plain'
  const submenuOwnerKey = submenu?.ownerKey ?? null

  function itemClass(item: CwContextMenuItem) {
    const selected = !!item.selected
    const disabled = !!item.disabled
    return [
      mergedStyles.item,
      item.danger ? mergedStyles.itemDanger : '',
      disabled ? mergedStyles.itemDisabled : '',
      selected ? mergedStyles.itemSelected : '',
      // 未选中才挂 hover，避免与选中态 hover:16% 抢 Tailwind 样式
      !selected && !disabled ? mergedStyles.itemHover : '',
    ]
      .filter(Boolean)
      .join(' ')
  }

  function toolbarGridColumns(itemCount: number): number {
    if (itemCount <= 0) return 1
    return Math.min(CW_CHAT_MESSAGE_TOOLBAR_MAX_COLUMNS, itemCount)
  }

  function renderTrailingMeta(
    item: CwContextMenuItem,
    hasChildren: boolean,
    toolRail: boolean,
  ): ReactNode {
    if (toolRail && (item.shortcut || hasChildren)) {
      return (
        <span className="ml-auto inline-flex shrink-0 items-center gap-0.5 pl-2 text-[0.6875rem] text-[var(--text-color-placeholder)]">
          {item.shortcut ? (
            <span className="tabular-nums whitespace-nowrap">{item.shortcut}</span>
          ) : null}
          {hasChildren ? (
            <CwIcon
              name="common--dir--arrow-right-line"
              prefix="icon"
              size={0.625}
            />
          ) : null}
        </span>
      )
    }
    if (!toolRail && (item.shortcut || hasChildren)) {
      return (
        <span className="ml-auto inline-flex shrink-0 items-center gap-0.5 pl-2 text-[0.6875rem] text-[var(--text-color-placeholder)]">
          {item.shortcut ? (
            <span className="tabular-nums whitespace-nowrap">{item.shortcut}</span>
          ) : null}
          {hasChildren ? (
            <CwIcon
              name="common--dir--arrow-right-line"
              prefix="icon"
              size={0.75}
            />
          ) : null}
        </span>
      )
    }
    return null
  }

  function renderMenuItem(
    item: CwContextMenuItem,
    isToolbar: boolean,
    reserveCheckColumn = false,
    isSubmenu = false,
  ) {
    const toolRail = isChecklist
    const hasChildren = Boolean(item.children?.length)
    const isOpen = submenuOwnerKey === item.key

    return (
      <div
        role="menuitem"
        tabIndex={item.disabled ? undefined : 0}
        className={[itemClass(item), item.disabled ? '' : 'cursor-pointer']
          .filter(Boolean)
          .join(' ')}
        aria-disabled={item.disabled ? 'true' : 'false'}
        aria-checked={item.selected ? 'true' : undefined}
        aria-haspopup={hasChildren ? 'menu' : undefined}
        aria-expanded={hasChildren ? (isOpen ? 'true' : 'false') : undefined}
        data-cw-context-submenu-open={isOpen ? '' : undefined}
        onClick={(event) => onItemClick(item, event)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') onItemClick(item, event)
          if (event.key === 'ArrowRight' && hasChildren) onItemClick(item, event)
          if (event.key === 'ArrowLeft' && submenuOwnerKey) destroySubmenu()
        }}
        onMouseEnter={(event) => {
          if (isToolbar) return
          if (hasChildren) {
            const el = event.currentTarget
            if (el instanceof HTMLElement) openSubmenuForItem(item, el)
            return
          }
          // 仅主菜单叶子项会关闭子菜单；子菜单内项绝不能触发（否则一 hover 选项就关）
          if (!isSubmenu && submenuOwnerKey) scheduleDestroySubmenu()
        }}
        onMouseLeave={(event) => {
          if (isToolbar || !hasChildren) return
          // 移向子菜单/bridge 时不要启动关闭计时
          if (isNodeInSubmenuHoverZone(event.relatedTarget as Node | null)) {
            clearSubmenuHoverTimer()
            return
          }
          scheduleDestroySubmenu()
        }}
      >
        {toolRail && reserveCheckColumn ? (
          <span
            aria-hidden="true"
            className="inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center text-[var(--text-color-primary)]"
          >
            {item.selected ? (
              <CwIcon name="common--status--check-line" prefix="icon" size={0.75} />
            ) : null}
          </span>
        ) : null}
        {item.icon && !hideItemIcons ? (
          <span
            aria-hidden="true"
            className={
              isToolbar
                ? 'inline-flex shrink-0 items-center justify-center text-current text-[1.125rem] leading-none'
                : 'inline-flex shrink-0 items-center justify-center text-current text-[1em] leading-none'
            }
          >
            <CwIcon
              name={item.icon}
              prefix={item.iconPrefix ?? 'icon'}
              mode={item.iconMode ?? 'font'}
              size={toolRail ? 0.875 : 1}
            />
          </span>
        ) : toolRail ? (
          <span className="inline-block h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        ) : null}
        <span
          className={isToolbar ? 'min-w-0 text-center leading-tight' : 'min-w-0 flex-1'}
        >
          {item.label}
        </span>
        {isToolbar ? null : renderTrailingMeta(item, hasChildren, toolRail)}
      </div>
    )
  }

  function renderItemList(itemsToRender: CwContextMenuItem[], isSubmenu: boolean) {
    const reserveCheckColumn =
      isChecklist && itemsToRender.some((entry) => Boolean(entry.selected))

    return itemsToRender.map((item) => (
      <Fragment key={item.key}>
        {renderMenuItem(item, false, reserveCheckColumn, isSubmenu)}
        {item.dividerAfter ? <hr className={mergedStyles.divider} /> : null}
      </Fragment>
    ))
  }

  function renderSubmenuPanel(submenuItems: CwContextMenuItem[]) {
    return (
      <div
        role="menu"
        tabIndex={-1}
        className={MENU_LIST_LAYOUT_CLASS}
        data-cw-context-menu-panel="true"
        data-cw-context-menu-submenu="true"
        onContextMenu={(event) => event.preventDefault()}
      >
        {renderItemList(submenuItems, true)}
      </div>
    )
  }

  function renderMenu() {
    const menuItems = items ?? EMPTY_ITEMS
    const isToolbar = layout === 'toolbar'

    if (menuItems.length === 0) {
      return (
        <div
          role="menu"
          tabIndex={-1}
          data-cw-context-menu-panel="true"
          onContextMenu={(event) => event.preventDefault()}
        >
          <div className="px-3 py-2 text-xs text-[var(--text-color-secondary)]">
            {texts.emptyMenu}
          </div>
        </div>
      )
    }

    if (isToolbar) {
      const columns = toolbarGridColumns(menuItems.length)
      return (
        <div
          role="menu"
          tabIndex={-1}
          data-cw-context-menu-panel="true"
          className="min-w-0 max-w-full"
          onContextMenu={(event) => event.preventDefault()}
        >
          <div
            className="min-w-0 max-w-full"
            style={{
              width: `calc(${columns} * ${CW_CHAT_MESSAGE_TOOLBAR_CELL_WIDTH_REM}rem)`,
            }}
          >
            <CwGrid columns={columns} gutter={0} rowGap={0} wrap flushStart>
              {menuItems.map((item) => (
                <Fragment key={item.key}>{renderMenuItem(item, true)}</Fragment>
              ))}
            </CwGrid>
          </div>
        </div>
      )
    }

    return (
      <div
        role="menu"
        tabIndex={-1}
        className={MENU_LIST_LAYOUT_CLASS}
        data-cw-context-menu-panel="true"
        onContextMenu={(event) => event.preventDefault()}
      >
        {renderItemList(menuItems, false)}
      </div>
    )
  }

  const hostClass = [
    CW_OVERLAY_MODAL_Z_CLASS,
    'fixed inset-0 pointer-events-none',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <>
      {/* 宿主 pointer-events-none：子层 scrim 拦截页面点击，Popup 面板叠在上层可点 */}
      <div ref={hostRef} className={hostClass} {...rest}>
        <div
          className={[
            'absolute inset-0',
            layout === 'toolbar' ? 'pointer-events-none' : 'pointer-events-auto',
          ].join(' ')}
          aria-hidden="true"
          data-cw-context-menu-scrim="true"
        />
      </div>
      {containerMounted && mountContainer
        ? createPortal(
            <div ref={popupHostRef} className="pointer-events-none">
              <PopupContainer
                visible={state.visible}
                offsetX={state.position?.x ?? null}
                offsetY={state.position?.y ?? null}
                styleClass={resolvedPanelClass}
                popupRef={popupElement}
                pluginRef={pluginElement}
                bridgeRef={bridgeElement}
              >
                {renderMenu()}
              </PopupContainer>
            </div>,
            mountContainer,
          )
        : null}
      {submenu ? (
        <CwContextSubmenu
          key={submenu.ownerKey}
          ownerKey={submenu.ownerKey}
          items={submenu.items}
          anchorEl={submenu.anchorEl}
          panelClass={resolvedPanelClass}
          plugins={submenuPopupPlugins}
          getMountContainer={getMountContainer}
          renderList={renderSubmenuPanel}
          onVisibilityChange={onSubmenuVisibleChange}
          onElementsReady={onSubmenuElementsReady}
        />
      ) : null}
    </>
  )
})

export default CwContextMenu
