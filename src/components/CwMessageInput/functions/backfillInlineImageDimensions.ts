import type { Editor } from '@tiptap/core'
import { preloadRasterImageUrl } from '../../CwImageFit/functions/preloadRasterImageUrl'

/** 粘贴后补齐缺失的 naturalWidth/Height（跨应用复制或旧 wire HTML 无尺寸时） */
export async function backfillInlineImageDimensions(ed: Editor): Promise<void> {
  const pending: { pos: number; src: string; name: string }[] = []
  ed.state.doc.descendants((node, pos) => {
    if (node.type.name !== 'inlineImage') return
    const w = Number(node.attrs.naturalWidth) || 0
    const h = Number(node.attrs.naturalHeight) || 0
    if (w > 0 && h > 0) return
    const src = String(node.attrs.previewSrc ?? '').trim()
    if (!src) return
    pending.push({
      pos,
      src,
      name: String(node.attrs.name ?? '图片'),
    })
  })
  if (pending.length === 0) return

  const sized = await Promise.all(
    pending.map(async (item) => {
      try {
        const dim = await preloadRasterImageUrl(item.src)
        if (dim.width > 0 && dim.height > 0) return { ...item, ...dim }
      } catch {
        /* CwImageFit onLoad 兜底 */
      }
      return null
    }),
  )

  let tr = ed.state.tr
  let touched = false
  for (const hit of sized) {
    if (!hit) continue
    const node = ed.state.doc.nodeAt(hit.pos)
    if (!node || node.type.name !== 'inlineImage') continue
    tr = tr.setNodeMarkup(hit.pos, undefined, {
      ...node.attrs,
      previewSrc: hit.src,
      name: hit.name,
      naturalWidth: hit.width,
      naturalHeight: hit.height,
    })
    touched = true
  }
  if (touched) ed.view.dispatch(tr)
}
