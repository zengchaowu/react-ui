import {
  FixedLayout,
  Group,
  LayoutManager,
  Rect,
  type FabricObject,
} from 'fabric'
import { tokenSolidColors } from '../../../assets/tokens/tokenSolidColors'
import type { FabricContainerPreset } from './fabricContainerPresets.pure'

export type FabricContainerObject = Group & {
  tpFabricContainer?: boolean
  tpFabricContainerPresetId?: string
  tpFabricContainerLayout?: FabricContainerLayout
  /** 超出画板裁剪内容（Group clipPath） */
  tpFabricContainerClipContent?: boolean
  /** 画板圆角（frame rx/ry + clip 同步） */
  tpFabricContainerCornerRadius?: number
}

export type FabricContainerFrameRect = Rect & {
  tpFabricContainerFrame?: boolean
}

/** 容器内容布局：free 自由；stack 单轴；grid 多列流式 */
export type FabricContainerLayoutMode = 'free' | 'stack' | 'grid'

export type FabricContainerLayoutAlign = 'start' | 'center' | 'end' | 'stretch'
export type FabricContainerLayoutJustify = 'start' | 'center' | 'end' | 'space-between'

export type FabricContainerLayout = {
  mode: FabricContainerLayoutMode
  /** stack：主轴方向 */
  direction?: 'horizontal' | 'vertical'
  gap?: number
  padding?: number
  /** 交叉轴对齐（stack）；格子内对齐（grid） */
  align?: FabricContainerLayoutAlign
  /** 主轴分布（stack） */
  justify?: FabricContainerLayoutJustify
  /** grid 列数 */
  columns?: number
}

export const DEFAULT_FABRIC_CONTAINER_LAYOUT: Readonly<FabricContainerLayout> =
  Object.freeze({
    mode: 'free' as const,
    direction: 'vertical' as const,
    gap: 8,
    padding: 8,
    align: 'start' as const,
    justify: 'start' as const,
    columns: 2,
  })

const CONTAINER_LAYOUT_OBJECT_KEYS = [
  'tpFabricContainer',
  'tpFabricContainerPresetId',
  'tpFabricContainerLayout',
  'tpFabricContainerClipContent',
  'tpFabricContainerCornerRadius',
] as const

const LEGACY_SIZE_LABEL_RE = /^\d+(\.\d+)?\s*[×x]\s*\d+(\.\d+)?$/i

export function isFabricContainerObject(
  obj: FabricObject,
): obj is FabricContainerObject {
  return Boolean((obj as FabricContainerObject).tpFabricContainer)
}

export function isFabricContainerFrame(obj: FabricObject): boolean {
  return Boolean((obj as FabricContainerFrameRect).tpFabricContainerFrame)
}

export function normalizeFabricContainerLayout(
  raw: unknown,
): FabricContainerLayout {
  const base = { ...DEFAULT_FABRIC_CONTAINER_LAYOUT }
  if (!raw || typeof raw !== 'object') return base
  const o = raw as Partial<FabricContainerLayout>
  const mode =
    o.mode === 'stack' || o.mode === 'grid' || o.mode === 'free'
      ? o.mode
      : 'free'
  const direction =
    o.direction === 'horizontal' || o.direction === 'vertical'
      ? o.direction
      : base.direction
  const align =
    o.align === 'start' ||
    o.align === 'center' ||
    o.align === 'end' ||
    o.align === 'stretch'
      ? o.align
      : base.align
  const justify =
    o.justify === 'start' ||
    o.justify === 'center' ||
    o.justify === 'end' ||
    o.justify === 'space-between'
      ? o.justify
      : base.justify
  const gap =
    typeof o.gap === 'number' && Number.isFinite(o.gap)
      ? Math.max(0, o.gap)
      : base.gap!
  const padding = normalizeLayoutPadding(o.padding, base.padding!)
  const columns =
    typeof o.columns === 'number' && Number.isFinite(o.columns)
      ? Math.max(1, Math.floor(o.columns))
      : base.columns!
  return { mode, direction, gap, padding, align, justify, columns }
}

/** padding 可为数字，或模型常给的 `{ left,right,top,bottom }`（取水平/垂直有效值） */
export function normalizeLayoutPadding(
  raw: unknown,
  fallback: number,
): number {
  if (typeof raw === 'number' && Number.isFinite(raw)) return Math.max(0, raw)
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    const o = raw as Record<string, unknown>
    const nums = (keys: string[]) =>
      keys
        .map((k) => o[k])
        .filter((v): v is number => typeof v === 'number' && Number.isFinite(v))
        .map((v) => Math.max(0, v))
    const horiz = nums(['left', 'right', 'paddingHorizontal', 'x', 'horizontal'])
    const vert = nums(['top', 'bottom', 'paddingVertical', 'y', 'vertical'])
    const all = nums(['padding', 'all', 'value'])
    if (horiz.length || vert.length) {
      const h = horiz.length ? Math.max(...horiz) : 0
      const v = vert.length ? Math.max(...vert) : 0
      return Math.max(h, v)
    }
    if (all.length) return Math.max(...all)
  }
  return fallback
}

export function getFabricContainerLayout(
  container: FabricContainerObject,
): FabricContainerLayout {
  return normalizeFabricContainerLayout(container.tpFabricContainerLayout)
}

export function setFabricContainerLayout(
  container: FabricContainerObject,
  patch: Partial<FabricContainerLayout>,
): FabricContainerLayout {
  const next = normalizeFabricContainerLayout({
    ...getFabricContainerLayout(container),
    ...patch,
  })
  container.tpFabricContainerLayout = next
  return next
}

export function getFabricContainerClipContent(
  container: FabricContainerObject,
): boolean {
  return container.tpFabricContainerClipContent === true
}

export function getFabricContainerCornerRadius(
  container: FabricContainerObject,
): number {
  const n = container.tpFabricContainerCornerRadius
  return typeof n === 'number' && Number.isFinite(n) ? Math.max(0, n) : 0
}

export function clampFabricContainerCornerRadius(
  radius: number,
  width: number,
  height: number,
): number {
  const cap = Math.min(Math.max(1, width), Math.max(1, height)) / 2
  return Math.max(0, Math.min(radius, cap))
}

function patchContainerToObject(group: FabricContainerObject) {
  const prev = group.toObject.bind(group) as (
    propertiesToInclude?: string[],
  ) => Record<string, unknown>
  ;(group as { toObject: (propertiesToInclude?: string[]) => Record<string, unknown> }).toObject =
    function toObjectWithContainerMeta(propertiesToInclude?: string[]) {
      const include = [
        ...(propertiesToInclude ?? []),
        ...CONTAINER_LAYOUT_OBJECT_KEYS,
      ]
      return {
        ...prev(include),
        tpFabricContainer: true,
        tpFabricContainerPresetId: group.tpFabricContainerPresetId,
        tpFabricContainerLayout: getFabricContainerLayout(group),
        tpFabricContainerClipContent: getFabricContainerClipContent(group),
        tpFabricContainerCornerRadius: getFabricContainerCornerRadius(group),
      }
    }
}

/**
 * 清理旧版嵌在 Group 内的标题/尺寸文字。
 * 名称与尺寸改由选中态 DOM 叠层显示，避免占用包围盒、缩放变形。
 */
export function stripFabricContainerLegacySizeLabels(obj: FabricObject): void {
  if (!isFabricContainerObject(obj)) return
  const group = obj as Group
  const victims = group.getObjects().filter((child) => {
    if (child.type !== 'text' && child.type !== 'i-text' && child.type !== 'textbox') {
      return false
    }
    const text = String((child as { text?: unknown }).text ?? '').trim()
    if (!text) return false
    if (LEGACY_SIZE_LABEL_RE.test(text)) return true
    if ((child.top ?? 0) < -1) return true
    return false
  })
  if (!victims.length) return
  for (const child of victims) {
    group.remove(child)
  }
  group.setCoords()
}

export function createFabricContainerObject(
  preset: FabricContainerPreset,
  center: { x: number; y: number },
): FabricContainerObject {
  const { width, height, label, id } = preset
  const left = center.x - width / 2
  const top = center.y - height / 2
  return createFabricContainerFromRect(
    { left, top, width, height },
    { label, presetId: id },
  )
}

/**
 * 容器内坐标相对 Group 中心：画板 Rect 用 center 原点锚在 (0,0)。
 * 不可用 left/top 原点的 (-w/2,-h/2)：strokeUniform 时 Fabric 会把变换中心外推
 * strokeWidth/2，导致可视画板相对 Group 选中框偏移。
 * 同时同步圆角与裁剪 clipPath。
 */
export function syncFabricContainerFrameLocalRect(
  container: FabricContainerObject,
  width: number,
  height: number,
): void {
  const w = Math.max(1, width)
  const h = Math.max(1, height)
  const radius = clampFabricContainerCornerRadius(
    getFabricContainerCornerRadius(container),
    w,
    h,
  )
  container.tpFabricContainerCornerRadius = radius

  const frame = (container.getObjects() as FabricObject[]).find((o) =>
    isFabricContainerFrame(o),
  ) as FabricContainerFrameRect | undefined
  if (frame) {
    frame.set({
      left: 0,
      top: 0,
      width: w,
      height: h,
      originX: 'center',
      originY: 'center',
      rx: radius,
      ry: radius,
    })
    frame.setCoords()
  }

  if (getFabricContainerClipContent(container)) {
    const clip = new Rect({
      left: 0,
      top: 0,
      width: w,
      height: h,
      originX: 'center',
      originY: 'center',
      rx: radius,
      ry: radius,
      absolutePositioned: false,
    })
    container.clipPath = clip
  } else {
    container.clipPath = undefined
  }

  container.set({ width: w, height: h })
  container.setCoords()
}

/** 更新裁剪开关并刷新画板 / clipPath。 */
export function setFabricContainerClipContent(
  container: FabricContainerObject,
  clipContent: boolean,
): void {
  container.tpFabricContainerClipContent = clipContent === true
  const w = Math.max(1, Number(container.width) || 1)
  const h = Math.max(1, Number(container.height) || 1)
  syncFabricContainerFrameLocalRect(container, w, h)
}

/** 更新圆角并刷新画板 / clipPath。 */
export function setFabricContainerCornerRadius(
  container: FabricContainerObject,
  radius: number,
): void {
  const w = Math.max(1, Number(container.width) || 1)
  const h = Math.max(1, Number(container.height) || 1)
  container.tpFabricContainerCornerRadius = clampFabricContainerCornerRadius(
    radius,
    w,
    h,
  )
  syncFabricContainerFrameLocalRect(container, w, h)
}

/** 读写容器画板（frame）的填充 / 描边。 */
export function getFabricContainerFramePaint(container: FabricContainerObject): {
  fill?: string
  stroke?: string
  strokeWidth?: number
} {
  const frame = (container.getObjects() as FabricObject[]).find((o) =>
    isFabricContainerFrame(o),
  )
  if (!frame) return {}
  const fill =
    typeof frame.fill === 'string' && frame.fill.trim()
      ? frame.fill.trim()
      : undefined
  const stroke =
    typeof frame.stroke === 'string' && frame.stroke.trim()
      ? frame.stroke.trim()
      : undefined
  const sw = frame.strokeWidth
  return {
    fill,
    stroke,
    strokeWidth:
      typeof sw === 'number' && Number.isFinite(sw) ? Math.max(0, sw) : undefined,
  }
}

export function setFabricContainerFramePaint(
  container: FabricContainerObject,
  paint: { fill?: string; stroke?: string; strokeWidth?: number },
): void {
  const frame = (container.getObjects() as FabricObject[]).find((o) =>
    isFabricContainerFrame(o),
  )
  if (!frame) return
  const next: Record<string, unknown> = {}
  if (paint.fill !== undefined) {
    const t = String(paint.fill ?? '').trim()
    next.fill = t || tokenSolidColors.white
  }
  if (paint.stroke !== undefined) {
    const t = String(paint.stroke ?? '').trim()
    if (!t || t === 'transparent' || t === 'none') {
      next.stroke = ''
      next.strokeWidth = 0
    } else {
      next.stroke = t
    }
  }
  if (paint.strokeWidth !== undefined) {
    const n = Number(paint.strokeWidth)
    next.strokeWidth = Number.isFinite(n) ? Math.max(0, n) : 0
    if ((next.strokeWidth as number) <= 0) {
      next.stroke = ''
    }
  }
  frame.set(next)
  frame.setCoords()
}

/** 按场景矩形创建容器图层（左上角定位，Figma Frame 式）。 */
export function createFabricContainerFromRect(
  box: { left: number; top: number; width: number; height: number },
  options?: { label?: string; presetId?: string },
): FabricContainerObject {
  const width = Math.max(1, box.width)
  const height = Math.max(1, box.height)
  const label = options?.label ?? '容器'
  const presetId = options?.presetId ?? 'frame'

  const frame = new Rect({
    left: 0,
    top: 0,
    width,
    height,
    originX: 'center',
    originY: 'center',
    fill: tokenSolidColors.white,
    stroke: tokenSolidColors.brandColor6,
    strokeWidth: 1,
    strokeUniform: true,
    objectCaching: false,
    selectable: false,
    evented: false,
    hasControls: false,
    hasBorders: false,
    lockMovementX: true,
    lockMovementY: true,
    lockScalingX: true,
    lockScalingY: true,
    lockRotation: true,
  }) as FabricContainerFrameRect
  frame.tpFabricContainerFrame = true
  frame.set('name', '画板')

  const group = new Group([frame], {
    left: box.left,
    top: box.top,
    width,
    height,
    originX: 'left',
    originY: 'top',
    layoutManager: new LayoutManager(new FixedLayout()),
    subTargetCheck: true,
    objectCaching: false,
  }) as FabricContainerObject

  group.tpFabricContainer = true
  group.tpFabricContainerPresetId = presetId
  group.tpFabricContainerLayout = { ...DEFAULT_FABRIC_CONTAINER_LAYOUT }
  group.tpFabricContainerClipContent = false
  group.tpFabricContainerCornerRadius = 0
  group.set('name', label)
  patchContainerToObject(group)
  // FixedLayout 可能按描边微调子项；强制画板贴合 Group 中心（center 原点）
  syncFabricContainerFrameLocalRect(group, width, height)
  group.set({ left: box.left, top: box.top })
  group.setCoords()
  return group
}

/** 更新容器场景矩形（拖拽绘制预览用）。 */
export function setFabricContainerSceneRect(
  container: FabricContainerObject,
  box: { left: number; top: number; width: number; height: number },
): void {
  const width = Math.max(1, box.width)
  const height = Math.max(1, box.height)
  syncFabricContainerFrameLocalRect(container, width, height)
  container.set({
    left: box.left,
    top: box.top,
  })
  container.setCoords()
}

/** 加载/克隆后补齐布局默认值与 toObject 序列化。 */
export function ensureFabricContainerLayoutMeta(obj: FabricObject): void {
  if (!isFabricContainerObject(obj)) return
  obj.tpFabricContainerLayout = getFabricContainerLayout(obj)
  obj.tpFabricContainerClipContent = getFabricContainerClipContent(obj)
  obj.tpFabricContainerCornerRadius = getFabricContainerCornerRadius(obj)
  obj.set({ subTargetCheck: true })
  patchContainerToObject(obj)
  for (const child of (obj as Group).getObjects() as FabricObject[]) {
    if (!isFabricContainerFrame(child)) continue
    child.set({
      selectable: false,
      evented: false,
      hasControls: false,
      hasBorders: false,
      lockMovementX: true,
      lockMovementY: true,
      lockScalingX: true,
      lockScalingY: true,
      lockRotation: true,
    })
    ;(child as FabricContainerFrameRect).tpFabricContainerFrame = true
  }
  const w = Math.max(1, Number(obj.width) || 1)
  const h = Math.max(1, Number(obj.height) || 1)
  // 纠偏旧会话里 left/top=(-w/2) 相对描边的半像素偏移，并重建 clip/圆角
  syncFabricContainerFrameLocalRect(obj, w, h)
}
