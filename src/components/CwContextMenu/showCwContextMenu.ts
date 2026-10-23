import { createElement } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { CW_OVERLAY_LEAVE_MS } from '@zengchaowu/ui-shared/constants/cwOverlayZIndex'
import type { Placement } from '@zengchaowu/shared/types/placement'
import { scheduleBringOverlayHostToFront } from '../../constants/cwOverlayStack'
import CwContextMenu from './CwContextMenu'
import type {
  CwContextMenuAnchorRect,
  CwContextMenuAppearance,
  CwContextMenuHandle,
  CwContextMenuItem,
  CwContextMenuLayout,
} from './types'
import {
  applyCwContextMenuAnchorHighlight,
  CW_CONTEXT_MENU_ANCHOR_ACTIVE_CLASS,
} from './contextMenuAnchorHighlight'
import { resolveCwContextMenuAnchorElements } from './resolveCwContextMenuAnchorElements'

export interface ShowCwContextMenuOptions {
  x: number
  y: number
  items: CwContextMenuItem[]
  placement?: Placement
  /**
   * 外观变体（替代 styles 预设）。
   * `toolbar` 时若未传 `layout`，默认 `layout: 'toolbar'`。
   */
  appearance?: CwContextMenuAppearance
  /** 列表竖排（默认）或移动端消息工具条横排 */
  layout?: CwContextMenuLayout
  /** 传入时菜单相对该矩形定位（如消息气泡），优先于 x/y 点定位 */
  anchorRect?: CwContextMenuAnchorRect
  /** 菜单与 anchorRect 间距（px），默认 0 */
  anchorOffset?: number
  /** 相对锚点显示小三角（需配合 anchorRect） */
  showArrow?: boolean
  /**
   * 是否允许主轴翻转（默认 true）。
   * 下拉菜单传 false，避免下方空间不足时翻到锚点上方。
   */
  flip?: boolean
  /** 追加到面板 class（如收窄 min-width） */
  panelClass?: string
  viewportPadding?: number
  shadow?: boolean
  closeOnSelect?: boolean
  /**
   * 菜单打开期间高亮锚点元素（默认 `true`）。
   * 传 `anchorEl` / `anchorElements` / `anchorIds` + DOM 标记，或 `event` 自动解析。
   */
  highlightAnchor?: boolean
  /** 锚点元素（单个） */
  anchorEl?: Element | null
  /** 锚点元素（多个，如多选行） */
  anchorElements?: readonly Element[]
  /** 按 `data-cw-context-menu-anchor-id` 批量解析锚点 */
  anchorIds?: readonly string[]
  anchorQueryRoot?: ParentNode
  /** 从 contextmenu 事件解析锚点（向上找 `[data-cw-context-menu-anchor]`） */
  event?: Event | null
  /** 锚点高亮 class，默认 `cw-context-menu-anchor-active` */
  anchorActiveClass?: string
  onSelect?: (key: string, item: CwContextMenuItem) => void
  onClose?: () => void
}

export interface ShowCwContextMenuReturn {
  close: () => void
}

/**
 * 命令式右键菜单：body 挂载 + 全屏透明 scrim + Popup 面板；每次打开独立实例。
 */
export function showCwContextMenu(
  options: ShowCwContextMenuOptions,
): ShowCwContextMenuReturn {
  if (!options.items?.length) {
    return { close: () => {} }
  }

  const appearance = options.appearance ?? 'glass-frosted'
  const layout =
    options.layout ?? (appearance === 'toolbar' ? 'toolbar' : 'list')

  const container = document.createElement('div')
  container.className = 'cw-context-menu-host'
  document.body.appendChild(container)
  scheduleBringOverlayHostToFront(container)

  let root: Root | null = null
  let handle: CwContextMenuHandle | null = null
  let teardownScheduled = false
  let pendingClose = false
  const userOnClose = options.onClose

  const highlightAnchor = options.highlightAnchor !== false
  const anchorActiveClass =
    options.anchorActiveClass?.trim() || CW_CONTEXT_MENU_ANCHOR_ACTIVE_CLASS
  let removeAnchorHighlight: (() => void) | null = null

  if (highlightAnchor) {
    const anchorElements = resolveCwContextMenuAnchorElements({
      anchorEl: options.anchorEl,
      anchorElements: options.anchorElements,
      anchorIds: options.anchorIds,
      anchorQueryRoot: options.anchorQueryRoot,
      event: options.event,
    })
    if (anchorElements.length) {
      removeAnchorHighlight = applyCwContextMenuAnchorHighlight(
        anchorElements,
        anchorActiveClass,
      )
    }
  }

  const cleanup = () => {
    removeAnchorHighlight?.()
    removeAnchorHighlight = null
    if (root) {
      root.unmount()
      root = null
    }
    container.remove()
    handle = null
  }

  const scheduleCleanup = () => {
    if (teardownScheduled) return
    teardownScheduled = true
    removeAnchorHighlight?.()
    removeAnchorHighlight = null
    userOnClose?.()
    setTimeout(cleanup, CW_OVERLAY_LEAVE_MS)
  }

  root = createRoot(container)
  root.render(
    createElement(CwContextMenu, {
      x: options.x,
      y: options.y,
      items: options.items,
      placement: options.placement,
      appearance,
      layout,
      anchorRect: options.anchorRect,
      anchorOffset: options.anchorOffset,
      showArrow: options.showArrow,
      flip: options.flip,
      panelClass: options.panelClass,
      viewportPadding: options.viewportPadding,
      shadow: options.shadow,
      closeOnSelect: options.closeOnSelect,
      onSelect: options.onSelect,
      onRequestClose: scheduleCleanup,
      ref: (instance: CwContextMenuHandle | null) => {
        handle = instance
        if (instance && pendingClose) {
          pendingClose = false
          instance.close()
        }
      },
    }),
  )

  return {
    close: () => {
      if (handle) handle.close()
      else pendingClose = true
    },
  }
}
