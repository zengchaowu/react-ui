import {
  FixedLayout,
  Group,
  LayoutManager,
  Point,
  util,
  type FabricObject,
} from 'fabric'
import {
  normalizeSvgImportedInteractionTree,
  sanitizeSvgGroupOptionsForFabric,
} from '../document/fabricDesignEditorPure'

export const FABRIC_EDITOR_APPEND_STAGGER_PX = 40

function readPositiveDim(value: unknown): number | null {
  const n = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(n) && n > 0 ? n : null
}

function createFixedSizeSvgGroup(
  items: FabricObject[],
  docW: number,
  docH: number,
  svgOpts: Record<string, unknown>,
): Group {
  const options = sanitizeSvgGroupOptionsForFabric(svgOpts)
  return new Group(items, {
    ...options,
    width: docW,
    height: docH,
    // 默认 fit-content 会按 path 包围盒重算尺寸，丢掉声明的 width/height
    layoutManager: new LayoutManager(new FixedLayout()),
  })
}

/**
 * Fabric `groupSVGElements` 在仅 1 个元素时会丢掉 options（含 width/height），
 * 导致声明为 200×200 的 SVG 仍按 path 包围盒（还可能带小数）显示。
 */
function materializeGroupedSvgRoot(
  items: FabricObject[],
  svgOpts: Record<string, unknown>,
): FabricObject {
  const docW = readPositiveDim(svgOpts.width)
  const docH = readPositiveDim(svgOpts.height)

  if (docW != null && docH != null) {
    return createFixedSizeSvgGroup(items, docW, docH, svgOpts)
  }

  return util.groupSVGElements(
    items,
    sanitizeSvgGroupOptionsForFabric(svgOpts),
  )
}

export function materializeSvgImportRoots(
  items: FabricObject[],
  svgOpts: Record<string, unknown>,
  groupElements: boolean,
): FabricObject[] {
  if (groupElements) {
    const grouped = materializeGroupedSvgRoot(items, svgOpts)
    normalizeSvgImportedInteractionTree(grouped)
    return [grouped]
  }

  const docW = readPositiveDim(svgOpts.width)
  const docH = readPositiveDim(svgOpts.height)
  // 单 path + 声明尺寸：固定为文档宽高（如 200×200），避免选中态变成 ~1023 或带小数的 path 盒
  if (items.length === 1 && docW != null && docH != null) {
    const grouped = createFixedSizeSvgGroup(items, docW, docH, svgOpts)
    normalizeSvgImportedInteractionTree(grouped)
    return [grouped]
  }

  return items.map((item) => {
    normalizeSvgImportedInteractionTree(item)
    return item
  })
}

export function offsetSvgImportRootsForAppend(
  roots: FabricObject[],
  staggerIndex: number,
): void {
  const dx = staggerIndex * FABRIC_EDITOR_APPEND_STAGGER_PX
  const dy = staggerIndex * FABRIC_EDITOR_APPEND_STAGGER_PX
  for (const root of roots) {
    root.set({
      left: (root.left ?? 0) + dx,
      top: (root.top ?? 0) + dy,
    })
    root.setCoords()
  }
}

/** 将导入根节点整体平移，使包围盒左上角落在场景坐标 point */
export function placeSvgImportRootsAtScenePoint(
  roots: FabricObject[],
  point: { x: number; y: number },
): void {
  if (!roots.length) return

  if (roots.length === 1) {
    const root = roots[0]!
    root.setPositionByOrigin(new Point(point.x, point.y), 'left', 'top')
    root.setCoords()
    return
  }

  for (const root of roots) root.setCoords()
  let minL = Infinity
  let minT = Infinity
  for (const root of roots) {
    const r = root.getBoundingRect()
    minL = Math.min(minL, r.left)
    minT = Math.min(minT, r.top)
  }
  if (!Number.isFinite(minL) || !Number.isFinite(minT)) return

  const dx = point.x - minL
  const dy = point.y - minT
  for (const root of roots) {
    root.set({
      left: (root.left ?? 0) + dx,
      top: (root.top ?? 0) + dy,
    })
    root.setCoords()
  }
}

export function triggerSvgFileDownload(svg: string, filenameBase: string) {
  const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${filenameBase}.svg`
  a.click()
  URL.revokeObjectURL(url)
}
