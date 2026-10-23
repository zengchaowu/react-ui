import { useReactiveRef } from './reactivity'
import {
  allocateFabricEditorPageName,
  createDefaultFabricEditorPage,
  createFabricEditorPageId,
  removeFabricEditorPage,
  renameFabricEditorPage,
  snapshotPageSvg,
  type FabricEditorPage,
} from '../document/fabricEditorPages.pure'

export function useFabricEditorPages(options: {
  getReadonly: () => boolean
  /** 页面快照用完整画布 SVG（勿用图标导出专用 getSvgString） */
  getSvgString: () => string
  loadPageSvg: (svg: string) => Promise<void>
  clearCanvas: () => void
}) {
  const initial = createDefaultFabricEditorPage()
  const pages = useReactiveRef<FabricEditorPage[]>([initial])
  const activePageId = useReactiveRef(initial.id)
  const switching = useReactiveRef(false)

  function snapshotActivePage() {
    pages.value = snapshotPageSvg(
      pages.value,
      activePageId.value,
      options.getSvgString(),
    )
  }

  async function applyPageContent(page: FabricEditorPage) {
    // 先清空，避免 load 解析出空对象时残留上一页
    options.clearCanvas()
    if (!page.svg.trim()) return
    await options.loadPageSvg(page.svg)
  }

  async function selectPage(pageId: string) {
    if (options.getReadonly() || switching.value) return
    if (pageId === activePageId.value) return
    const target = pages.value.find((p) => p.id === pageId)
    if (!target) return

    const prevId = activePageId.value
    switching.value = true
    try {
      snapshotActivePage()
      activePageId.value = pageId
      const next = pages.value.find((p) => p.id === pageId) ?? target
      await applyPageContent(next)
    } catch {
      // 加载失败：画布可能已清空，仍停留在目标页，并尝试恢复上一页快照
      const prev = pages.value.find((p) => p.id === prevId)
      if (prev?.svg.trim()) {
        try {
          activePageId.value = prevId
          await applyPageContent(prev)
        } catch {
          activePageId.value = pageId
        }
      }
    } finally {
      switching.value = false
    }
  }

  async function addPage() {
    if (options.getReadonly() || switching.value) return
    switching.value = true
    try {
      snapshotActivePage()
      const page: FabricEditorPage = {
        id: createFabricEditorPageId(),
        name: allocateFabricEditorPageName(pages.value),
        svg: '',
      }
      pages.value = [...pages.value, page]
      activePageId.value = page.id
      options.clearCanvas()
    } finally {
      switching.value = false
    }
  }

  function renamePage(pageId: string, name: string) {
    if (options.getReadonly()) return
    pages.value = renameFabricEditorPage(pages.value, pageId, name)
  }

  async function deletePage(pageId: string) {
    if (options.getReadonly() || switching.value) return
    const { pages: next, removed } = removeFabricEditorPage(
      pages.value,
      pageId,
    )
    if (!removed) return

    const deletingActive = pageId === activePageId.value
    if (deletingActive) {
      snapshotActivePage()
    }
    pages.value = next
    if (!deletingActive) return

    const fallback = next[0]!
    switching.value = true
    try {
      activePageId.value = fallback.id
      await applyPageContent(fallback)
    } catch {
      /* 保持 fallback 为活动页 */
    } finally {
      switching.value = false
    }
  }

  /** 卸载前把当前画布写回活动页，便于外部读取完整文档。 */
  function flushActivePage() {
    snapshotActivePage()
  }

  return {
    pages,
    activePageId,
    switching,
    selectPage,
    addPage,
    renamePage,
    deletePage,
    flushActivePage,
    snapshotActivePage,
  }
}
