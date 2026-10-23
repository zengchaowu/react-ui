export type FabricEditorPage = {
  id: string
  name: string
  /** 页面文档 SVG；空字符串表示空白页 */
  svg: string
}

export type FabricEditorComponent = {
  id: string
  name: string
  svg: string
}

let pageSeq = 0
let componentSeq = 0

export function createFabricEditorPageId(): string {
  pageSeq += 1
  return `page_${Date.now().toString(36)}_${pageSeq}`
}

export function createFabricEditorComponentId(): string {
  componentSeq += 1
  return `comp_${Date.now().toString(36)}_${componentSeq}`
}

export function createDefaultFabricEditorPage(
  name = '页面 1',
): FabricEditorPage {
  return {
    id: createFabricEditorPageId(),
    name,
    svg: '',
  }
}

export function allocateFabricEditorPageName(
  pages: readonly FabricEditorPage[],
): string {
  let i = 1
  const occupied = new Set(pages.map((p) => p.name))
  while (occupied.has(`页面 ${i}`)) i += 1
  return `页面 ${i}`
}

export function allocateFabricEditorComponentName(
  components: readonly FabricEditorComponent[],
  preferred?: string,
): string {
  const base = preferred?.trim() || '组件'
  const occupied = new Set(components.map((c) => c.name))
  if (!occupied.has(base)) return base
  let i = 2
  while (occupied.has(`${base} ${i}`)) i += 1
  return `${base} ${i}`
}

export function snapshotPageSvg(
  pages: readonly FabricEditorPage[],
  activePageId: string,
  svg: string,
): FabricEditorPage[] {
  return pages.map((p) =>
    p.id === activePageId ? { ...p, svg } : p,
  )
}

export function renameFabricEditorPage(
  pages: readonly FabricEditorPage[],
  pageId: string,
  name: string,
): FabricEditorPage[] {
  const next = name.trim()
  if (!next) return [...pages]
  return pages.map((p) => (p.id === pageId ? { ...p, name: next } : p))
}

export function removeFabricEditorPage(
  pages: readonly FabricEditorPage[],
  pageId: string,
): { pages: FabricEditorPage[]; removed: boolean } {
  if (pages.length <= 1) return { pages: [...pages], removed: false }
  const next = pages.filter((p) => p.id !== pageId)
  if (next.length === pages.length) return { pages: [...pages], removed: false }
  return { pages: next, removed: true }
}

export function renameFabricEditorComponent(
  components: readonly FabricEditorComponent[],
  componentId: string,
  name: string,
): FabricEditorComponent[] {
  const next = name.trim()
  if (!next) return [...components]
  return components.map((c) =>
    c.id === componentId ? { ...c, name: next } : c,
  )
}

export function removeFabricEditorComponent(
  components: readonly FabricEditorComponent[],
  componentId: string,
): FabricEditorComponent[] {
  return components.filter((c) => c.id !== componentId)
}
