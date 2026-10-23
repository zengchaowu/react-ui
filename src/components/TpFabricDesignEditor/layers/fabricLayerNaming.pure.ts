import { ActiveSelection, Group, type Canvas, type FabricObject } from 'fabric'
import { isFabricArtboardGuide } from '../document/fabricArtboard'
import { isFabricContainerObject } from '../tools/fabricContainerTool.pure'
import { isFabricEditorPaintClone } from '../appearance/fabricEditorPaintLayers.pure'

/** 图层类型默认中文名（不含序号） */
export function fabricLayerTypeBaseLabel(o: FabricObject): string {
  if (isFabricContainerObject(o)) return '容器'

  const t = String(o.type ?? 'object').toLowerCase()
  if (t === 'i-text' || t === 'text' || t === 'textbox') return '文本'
  if (t === 'group') return '编组'

  const names: Record<string, string> = {
    rect: '矩形',
    circle: '圆形',
    ellipse: '椭圆',
    triangle: '三角形',
    line: '直线',
    polygon: '多边形',
    polyline: '折线',
    path: '矢量',
    image: '图片',
  }
  return names[t] ?? '图层'
}

function walkFabricSceneObjects(
  objects: FabricObject[],
  visit: (obj: FabricObject) => void,
): void {
  for (const obj of objects) {
    if (isFabricArtboardGuide(obj) || isFabricEditorPaintClone(obj)) continue
    visit(obj)
    if (obj instanceof Group && !(obj instanceof ActiveSelection)) {
      walkFabricSceneObjects(obj.getObjects() as FabricObject[], visit)
    }
  }
}

/** 收集画布上已占用的图层名（含编组内） */
export function collectFabricLayerNames(canvas: Canvas): Set<string> {
  const names = new Set<string>()
  walkFabricSceneObjects(canvas.getObjects(), (obj) => {
    const n = String((obj as { name?: unknown }).name ?? '').trim()
    if (n) names.add(n)
  })
  return names
}

/** 分配「类型 N」形式的唯一图层名 */
export function allocateFabricLayerName(
  occupied: Set<string>,
  baseLabel: string,
): string {
  const base = baseLabel.trim() || '图层'
  let i = 1
  while (occupied.has(`${base} ${i}`)) i += 1
  const name = `${base} ${i}`
  occupied.add(name)
  return name
}

/**
 * 优先使用 preferred 本身；冲突则「preferred 2」「preferred 3」…
 * 用于 SVG 导入根图层取文件名。
 */
export function allocateUniqueFabricLayerName(
  occupied: Set<string>,
  preferred: string,
): string {
  const base = preferred.trim() || '图层'
  if (!occupied.has(base)) {
    occupied.add(base)
    return base
  }
  let i = 2
  while (occupied.has(`${base} ${i}`)) i += 1
  const name = `${base} ${i}`
  occupied.add(name)
  return name
}

/** 从上传/拖放文件名得到图层名基底（去掉路径与常见扩展名） */
export function importLayerBaseNameFromFileName(
  fileName: string,
  fallback = '图层',
): string {
  const stem = fileName
    .replace(/^.*[/\\]/, '')
    .replace(/\.(svg|png|jpe?g|webp|gif)$/i, '')
    .trim()
  const cleaned = stem
    .replace(/\s+/g, ' ')
    .replace(/[/\\:*?"<>|\u0000-\u001f]/g, '_')
    .replace(/_+/g, '_')
    .trim()
  return cleaned || fallback
}

/** 为新建对象写入默认图层名（如「矩形 1」「矢量 2」） */
export function assignDefaultFabricLayerName(
  canvas: Canvas,
  obj: FabricObject,
): string {
  const prev = String((obj as { name?: unknown }).name ?? '').trim()
  // 已有名称（如容器预设「iPhone 16」）则保留
  if (prev) return prev

  const occupied = collectFabricLayerNames(canvas)
  const name = allocateFabricLayerName(occupied, fabricLayerTypeBaseLabel(obj))
  obj.set('name', name)
  return name
}

/** 为对象树（含编组子节点）重新分配不冲突的默认名，用于复制/粘贴 */
export function assignDefaultFabricLayerNamesDeep(
  canvas: Canvas,
  root: FabricObject,
): void {
  const occupied = collectFabricLayerNames(canvas)
  walkFabricSceneObjects([root], (obj) => {
    const prev = String((obj as { name?: unknown }).name ?? '').trim()
    if (prev) occupied.delete(prev)
    obj.set('name', '')
  })
  walkFabricSceneObjects([root], (obj) => {
    const name = allocateFabricLayerName(occupied, fabricLayerTypeBaseLabel(obj))
    obj.set('name', name)
  })
}

/**
 * 递归补图层名。
 * `rootBaseName`（通常为 SVG 文件名）会强制用于导入根节点；子节点仍按类型命名。
 */
export function ensureFabricLayerNamesInTree(
  canvas: Canvas,
  roots: FabricObject[],
  options?: { rootBaseName?: string },
): void {
  const occupied = collectFabricLayerNames(canvas)
  const rootBase = options?.rootBaseName?.trim()
  const rootSet = new Set(roots)

  walkFabricSceneObjects(roots, (obj) => {
    if (rootBase && rootSet.has(obj)) {
      const prev = String((obj as { name?: unknown }).name ?? '').trim()
      if (prev) occupied.delete(prev)
      obj.set('name', allocateUniqueFabricLayerName(occupied, rootBase))
      return
    }
    const prev = String((obj as { name?: unknown }).name ?? '').trim()
    if (prev) return
    const name = allocateFabricLayerName(occupied, fabricLayerTypeBaseLabel(obj))
    obj.set('name', name)
  })
}
