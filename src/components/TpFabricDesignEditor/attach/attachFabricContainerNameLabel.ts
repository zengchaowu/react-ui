import { ActiveSelection, Group, type Canvas, type FabricObject } from 'fabric'
import { tokenSolidColors } from '../../../assets/tokens/tokenSolidColors'
import { collectFabricContainersDeep } from '../layers/fabricContainerContainment.pure'
import { layerLabelForFabricObject } from '../layers/fabricDesignEditorLayerTree.pure'
import { readFabricSelectionOverlayLayout } from '../transform/fabricSelectionOverlayLayout.pure'
import { isFabricSelectionDragHiding } from './attachFabricSelectionPathHighlight'
import { hasFabricPathEditSession } from '../tools/penTool'
import {
  getFabricEditorHoverTarget,
  setFabricEditorNameLabels,
  type FabricEditorNameLabelHitEntry,
} from './fabricEditorHoverState'

const NAME_GAP_PX = 10

const NAME_COLOR_IDLE = tokenSolidColors.textColorMuted
const NAME_COLOR_ACTIVE = tokenSolidColors.brandColor6

function resolveBadgeHost(canvas: Canvas): HTMLElement | null {
  const upper = canvas.upperCanvasEl
  const host = upper?.parentElement
  if (!host) return null
  const style = getComputedStyle(host)
  if (style.position === 'static') {
    host.style.position = 'relative'
  }
  return host
}

/** 画布根级容器（未挂在其它 Group/容器下）才视为「最外层」 */
function isOutermostContainer(obj: FabricObject): boolean {
  let g: Group | undefined = obj.group as Group | undefined
  while (g instanceof ActiveSelection) {
    g = (g as FabricObject).group as Group | undefined
  }
  return !g
}

function collectContainerSubjects(canvas: Canvas): FabricObject[] {
  return collectFabricContainersDeep(canvas.getObjects()).filter(
    (obj) =>
      !(obj instanceof ActiveSelection) &&
      obj.visible !== false &&
      isOutermostContainer(obj),
  )
}

function isNameHighlighted(canvas: Canvas, obj: FabricObject): boolean {
  if (getFabricEditorHoverTarget(canvas) === obj) return true
  const active = canvas.getActiveObject()
  return (
    active === obj &&
    canvas.getActiveObjects().length === 1
  )
}

function createNameLabelEl(): HTMLElement {
  const el = document.createElement('div')
  el.setAttribute('data-tp-fabric-container-name', '')
  el.style.cssText = [
    'position:absolute',
    'left:0',
    'top:0',
    'z-index:var(--z-index-above-high)',
    'display:none',
    'pointer-events:none',
    'box-sizing:border-box',
    `color:${NAME_COLOR_IDLE}`,
    'font:12px system-ui, -apple-system, sans-serif',
    'line-height:1.2',
    'white-space:nowrap',
    'user-select:none',
    'transform-origin:left bottom',
  ].join(';')
  return el
}

/**
 * 最外层容器名称叠层：默认常显（弱色）；悬停/单选时高亮色。
 * 嵌套在其它容器/编组内的容器不显示名称。
 * 命中由 hover 几何判定，不依赖 pointer-events。
 */
export function attachFabricContainerNameLabel(canvas: Canvas): () => void {
  const hostEl = resolveBadgeHost(canvas)
  if (!hostEl) return () => {}
  const host: HTMLElement = hostEl

  const pool: HTMLElement[] = []
  const lastKeys = new Map<HTMLElement, string>()

  function ensureEl(index: number): HTMLElement {
    while (pool.length <= index) {
      const el = createNameLabelEl()
      host.appendChild(el)
      pool.push(el)
    }
    return pool[index]!
  }

  function hideEl(el: HTMLElement) {
    el.style.display = 'none'
    lastKeys.delete(el)
  }

  function update() {
    if (hasFabricPathEditSession(canvas) || isFabricSelectionDragHiding(canvas)) {
      for (const el of pool) hideEl(el)
      setFabricEditorNameLabels(canvas, [])
      return
    }

    const subjects = collectContainerSubjects(canvas)
    const hits: FabricEditorNameLabelHitEntry[] = []

    for (let i = 0; i < subjects.length; i += 1) {
      const subject = subjects[i]!
      const layout = readFabricSelectionOverlayLayout(canvas, subject, {
        nameGapPx: NAME_GAP_PX,
        sizeGapPx: 0,
      })
      const el = ensureEl(i)
      if (!layout) {
        hideEl(el)
        continue
      }

      const label = layerLabelForFabricObject(subject)
      const active = isNameHighlighted(canvas, subject)
      el.style.color = active ? NAME_COLOR_ACTIVE : NAME_COLOR_IDLE

      const key = [
        label,
        layout.nameAnchorCanvas.x.toFixed(2),
        layout.nameAnchorCanvas.y.toFixed(2),
        layout.edgeAngleDeg.toFixed(2),
      ].join('|')

      el.style.display = 'block'
      if (lastKeys.get(el) !== key) {
        lastKeys.set(el, key)
        el.textContent = label
        el.style.transform = 'none'
        const h = el.offsetHeight || 14
        el.style.left = `${layout.nameAnchorCanvas.x}px`
        el.style.top = `${layout.nameAnchorCanvas.y - h}px`
        el.style.transform = `rotate(${layout.edgeAngleDeg}deg)`
        el.style.transformOrigin = 'left bottom'
      }

      hits.push({ el, subject })
    }

    for (let i = subjects.length; i < pool.length; i += 1) {
      hideEl(pool[i]!)
    }

    setFabricEditorNameLabels(canvas, hits)
  }

  canvas.on('after:render', update)
  canvas.on('selection:cleared', update)
  canvas.on('selection:created', update)
  canvas.on('selection:updated', update)
  canvas.on('object:added', update)
  canvas.on('object:removed', update)

  return () => {
    setFabricEditorNameLabels(canvas, [])
    canvas.off('after:render', update)
    canvas.off('selection:cleared', update)
    canvas.off('selection:created', update)
    canvas.off('selection:updated', update)
    canvas.off('object:added', update)
    canvas.off('object:removed', update)
    for (const el of pool) el.remove()
    pool.length = 0
    lastKeys.clear()
  }
}
