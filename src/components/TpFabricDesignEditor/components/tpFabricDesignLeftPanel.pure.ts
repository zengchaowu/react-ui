import type { CwTabsStripItem } from '../../CwTabsStrip/types'
import type { FabricEditorComponent, FabricEditorPage } from '../document/fabricEditorPages.pure'

export type TpFabricDesignLeftTab = 'layers' | 'components' | 'assets' | 'ai'

export const TP_FABRIC_DESIGN_LEFT_TABS: CwTabsStripItem[] = [
  { value: 'layers', label: '图层' },
  { value: 'components', label: '组件' },
  { value: 'assets', label: '资源' },
  { value: 'ai', label: 'AI' },
]

export function filterFabricEditorComponents(
  components: readonly FabricEditorComponent[],
  query: string,
): FabricEditorComponent[] {
  const q = query.trim().toLowerCase()
  if (!q) return [...components]
  return components.filter((c) => c.name.toLowerCase().includes(q))
}

export function filterFabricEditorPages(
  pages: readonly FabricEditorPage[],
  query: string,
): FabricEditorPage[] {
  const q = query.trim().toLowerCase()
  if (!q) return [...pages]
  return pages.filter((p) => p.name.toLowerCase().includes(q))
}
