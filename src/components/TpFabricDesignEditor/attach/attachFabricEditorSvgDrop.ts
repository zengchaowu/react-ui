import type { Canvas } from 'fabric'
import { hasExternalFileDrag } from '@zengchaowu/shared/functions/dom/fileDrag'

/**
 * 画布区域拖放 SVG：在 capture 阶段拦截，避免 Fabric canvas 子节点吞掉 drop。
 * 松开时把场景坐标一并交给导入逻辑，便于把内容左上角对齐到落点。
 */
export function attachFabricEditorSvgDrop(options: {
  getWrapEl: () => HTMLElement | undefined
  getCanvas: () => Canvas | undefined
  getReadonly: () => boolean
  onFilesDrop: (
    files: File[],
    placeAt?: { x: number; y: number },
  ) => void
}): () => void {
  function canAccept(dt: DataTransfer | null | undefined): boolean {
    if (options.getReadonly()) return false
    return hasExternalFileDrag(dt)
  }

  function onDragOver(e: DragEvent) {
    if (!canAccept(e.dataTransfer)) return
    e.preventDefault()
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy'
  }

  function onDrop(e: DragEvent) {
    if (!canAccept(e.dataTransfer)) return
    const list = e.dataTransfer?.files
    if (!list?.length) return
    e.preventDefault()
    e.stopPropagation()

    let placeAt: { x: number; y: number } | undefined
    const canvas = options.getCanvas()
    if (canvas) {
      const p = canvas.getScenePoint(e)
      placeAt = { x: p.x, y: p.y }
    }
    options.onFilesDrop(Array.from(list), placeAt)
  }

  const wrap = options.getWrapEl()
  if (!wrap) return () => {}

  wrap.addEventListener('dragover', onDragOver, { capture: true })
  wrap.addEventListener('drop', onDrop, { capture: true })

  return () => {
    wrap.removeEventListener('dragover', onDragOver, { capture: true })
    wrap.removeEventListener('drop', onDrop, { capture: true })
  }
}
