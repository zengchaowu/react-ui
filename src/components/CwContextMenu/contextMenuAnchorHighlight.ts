/** 标记可被右键菜单锚定高亮的元素 */
export const CW_CONTEXT_MENU_ANCHOR_ATTR = 'data-cw-context-menu-anchor'

/** 与业务 id 对应，便于多选时批量高亮 */
export const CW_CONTEXT_MENU_ANCHOR_ID_ATTR = 'data-cw-context-menu-anchor-id'

/** 菜单打开期间加在锚点元素上的 class（可由业务覆盖样式） */
export const CW_CONTEXT_MENU_ANCHOR_ACTIVE_CLASS = 'cw-context-menu-anchor-active'

export function resolveCwContextMenuAnchorFromEvent(
  event: Event,
  closest = `[${CW_CONTEXT_MENU_ANCHOR_ATTR}]`,
): Element | null {
  const target = event.target
  if (!(target instanceof Element)) return null
  return target.closest(closest)
}

export function queryCwContextMenuAnchorsByIds(
  root: ParentNode,
  ids: readonly string[],
): Element[] {
  const unique = [...new Set(ids.map((id) => id.trim()).filter(Boolean))]
  if (!unique.length) return []
  const found: Element[] = []
  const seen = new Set<Element>()
  for (const id of unique) {
    const matches = root.querySelectorAll(
      `[${CW_CONTEXT_MENU_ANCHOR_ID_ATTR}="${CSS.escape(id)}"]`,
    )
    matches.forEach((el) => {
      if (seen.has(el)) return
      seen.add(el)
      found.push(el)
    })
  }
  return found
}

export function normalizeCwContextMenuAnchorElements(input: {
  anchorEl?: Element | null
  anchorElements?: readonly Element[]
}): Element[] {
  const fromList = (input.anchorElements ?? []).filter(
    (el): el is Element => el instanceof Element && el.isConnected,
  )
  if (fromList.length) return fromList
  const single = input.anchorEl
  if (single instanceof Element && single.isConnected) return [single]
  return []
}

/** 应用锚点高亮，返回 teardown */
export function applyCwContextMenuAnchorHighlight(
  elements: readonly Element[],
  className = CW_CONTEXT_MENU_ANCHOR_ACTIVE_CLASS,
): () => void {
  const applied = elements.filter((el) => el instanceof Element && el.isConnected)
  for (const el of applied) {
    el.classList.add(className)
  }
  return () => {
    for (const el of applied) {
      try {
        el.classList.remove(className)
      } catch {
        /* 节点可能已被卸载 */
      }
    }
  }
}
