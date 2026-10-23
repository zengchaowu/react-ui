import {
  normalizeCwContextMenuAnchorElements,
  queryCwContextMenuAnchorsByIds,
  resolveCwContextMenuAnchorFromEvent,
} from './contextMenuAnchorHighlight'

export interface ResolveCwContextMenuAnchorElementsOptions {
  anchorEl?: Element | null
  anchorElements?: readonly Element[]
  /** 从 contextmenu 等事件向上查找 `[data-cw-context-menu-anchor]` */
  event?: Event | null
  /** 多选时按 id 批量解析锚点（需 DOM 上带 `data-cw-context-menu-anchor-id`） */
  anchorIds?: readonly string[]
  /** 查询 anchorIds 的根节点，默认 `document` */
  anchorQueryRoot?: ParentNode
}

/**
 * 解析右键菜单锚点元素列表。
 * 优先级：`anchorElements` / `anchorEl` → `anchorIds` → `event`。
 */
export function resolveCwContextMenuAnchorElements(
  options: ResolveCwContextMenuAnchorElementsOptions = {},
): Element[] {
  const explicit = normalizeCwContextMenuAnchorElements(options)
  if (explicit.length) return explicit

  const ids = options.anchorIds ?? []
  if (ids.length) {
    const root = options.anchorQueryRoot ?? document
    const fromIds = queryCwContextMenuAnchorsByIds(root, ids)
    if (fromIds.length) return fromIds
  }

  if (options.event) {
    const fromEvent = resolveCwContextMenuAnchorFromEvent(options.event)
    if (fromEvent) return [fromEvent]
  }

  return []
}
