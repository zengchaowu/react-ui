import { Circle, IText, Group, Rect, type FabricObject } from 'fabric'
import { tokenSolidColors } from '../../../assets/tokens/tokenSolidColors'
import {
  listFabricContainerContentChildren,
  readFabricContainerContentBox,
  readFabricObjectLocalTopLeft,
} from '../layers/fabricContainerLayout.pure'
import {
  getFabricContainerClipContent,
  getFabricContainerCornerRadius,
  getFabricContainerFramePaint,
  getFabricContainerLayout,
  isFabricContainerObject,
  type FabricContainerObject,
} from '../tools/fabricContainerTool.pure'
import type {
  FabricDesignCircleNode,
  FabricDesignContainerNode,
  FabricDesignLayerNode,
  FabricDesignNode,
  FabricDesignRectNode,
  FabricDesignTextNode,
} from './fabricDesignDocument.types'

function round1(n: number): number {
  return Math.round(n * 10) / 10
}

function optionalName(obj: FabricObject): string | undefined {
  const n = String((obj as { name?: string }).name ?? '').trim()
  return n || undefined
}

function colorString(v: unknown): string | undefined {
  if (typeof v !== 'string') return undefined
  const t = v.trim()
  return t && t !== 'transparent' ? t : undefined
}

function serializeRect(obj: FabricObject): FabricDesignRectNode {
  const width = Math.max(1, Math.abs(obj.getScaledWidth()))
  const height = Math.max(1, Math.abs(obj.getScaledHeight()))
  const rxRaw = (obj as Rect).rx
  const rx =
    typeof rxRaw === 'number' && Number.isFinite(rxRaw)
      ? Math.max(0, rxRaw * Math.abs(obj.scaleX ?? 1))
      : undefined
  return {
    type: 'rect',
    name: optionalName(obj),
    width: round1(width),
    height: round1(height),
    fill: colorString(obj.fill),
    stroke: colorString(obj.stroke),
    strokeWidth:
      typeof obj.strokeWidth === 'number' && obj.strokeWidth > 0
        ? round1(obj.strokeWidth)
        : undefined,
    rx: rx != null && rx > 0 ? round1(rx) : undefined,
  }
}

function serializeCircle(obj: FabricObject): FabricDesignCircleNode {
  const diameter = Math.max(
    1,
    Math.min(Math.abs(obj.getScaledWidth()), Math.abs(obj.getScaledHeight())),
  )
  return {
    type: 'circle',
    name: optionalName(obj),
    diameter: round1(diameter),
    fill: colorString(obj.fill),
    stroke: colorString(obj.stroke),
    strokeWidth:
      typeof obj.strokeWidth === 'number' && obj.strokeWidth > 0
        ? round1(obj.strokeWidth)
        : undefined,
  }
}

function serializeText(obj: FabricObject): FabricDesignTextNode {
  const t = obj as IText
  const fontFamily = String(t.fontFamily ?? '').trim()
  return {
    type: 'text',
    name: optionalName(obj),
    text: String(t.text ?? ''),
    fontSize:
      typeof t.fontSize === 'number' && Number.isFinite(t.fontSize)
        ? round1(t.fontSize * Math.abs(obj.scaleY ?? 1))
        : undefined,
    fill: colorString(obj.fill),
    fontFamily: fontFamily || undefined,
  }
}

function serializeLayer(obj: FabricObject): FabricDesignLayerNode | null {
  const type = String(obj.type ?? '').toLowerCase()
  if (type === 'rect') return serializeRect(obj)
  if (type === 'circle') return serializeCircle(obj)
  if (type === 'text' || type === 'i-text' || type === 'textbox') {
    return serializeText(obj)
  }
  // ActiveSelection / 未知类型：退化为包围盒 rect
  return {
    type: 'rect',
    name: optionalName(obj) ?? (type || undefined),
    width: round1(Math.max(1, Math.abs(obj.getScaledWidth()))),
    height: round1(Math.max(1, Math.abs(obj.getScaledHeight()))),
    fill: colorString(obj.fill) ?? tokenSolidColors.fabricEditorFillMuted,
  }
}

function serializeContainer(
  container: FabricContainerObject,
): FabricDesignContainerNode {
  const box = readFabricContainerContentBox(container)
  const layout = getFabricContainerLayout(container)
  const pad = layout.padding ?? 0
  const contentOriginX = box.left + pad
  const contentOriginY = box.top + pad

  const children: FabricDesignNode[] = []
  for (const child of listFabricContainerContentChildren(container)) {
    const node = serializeFabricObjectToDesignNode(child)
    if (!node) continue
    const local = readFabricObjectLocalTopLeft(child)
    if (layout.mode === 'free') {
      node.left = round1(local.x - contentOriginX)
      node.top = round1(local.y - contentOriginY)
    } else {
      delete node.left
      delete node.top
    }
    children.push(node)
  }

  const presetId = String(container.tpFabricContainerPresetId ?? '').trim()
  const corner = getFabricContainerCornerRadius(container)
  const paint = getFabricContainerFramePaint(container)
  return {
    type: 'container',
    name: optionalName(container),
    presetId: presetId && presetId !== 'custom' ? presetId : undefined,
    width: round1(box.width),
    height: round1(box.height),
    layout: {
      mode: layout.mode,
      direction: layout.direction,
      gap: layout.gap,
      padding: layout.padding,
      align: layout.align,
      justify: layout.justify,
      columns: layout.columns,
    },
    clipContent: getFabricContainerClipContent(container) || undefined,
    cornerRadius: corner > 0 ? round1(corner) : undefined,
    fill: paint.fill,
    stroke: paint.stroke,
    strokeWidth:
      paint.strokeWidth != null && paint.strokeWidth > 0
        ? round1(paint.strokeWidth)
        : undefined,
    children: children.length ? children : undefined,
  }
}

/**
 * 将画布 Fabric 对象序列化为 Design Document 节点（hydrate 的近似逆过程）。
 */
export function serializeFabricObjectToDesignNode(
  obj: FabricObject,
): FabricDesignNode | null {
  if (!obj || obj.visible === false) return null
  if (isFabricContainerObject(obj)) return serializeContainer(obj)
  if (obj instanceof Group && !(obj as FabricContainerObject).tpFabricContainer) {
    // 普通编组：展平为 free 容器
    const kids = (obj.getObjects() as FabricObject[])
      .map((c) => serializeFabricObjectToDesignNode(c))
      .filter((n): n is FabricDesignNode => n != null)
    const w = Math.max(1, Math.abs(obj.getScaledWidth()))
    const h = Math.max(1, Math.abs(obj.getScaledHeight()))
    return {
      type: 'container',
      name: optionalName(obj),
      width: round1(w),
      height: round1(h),
      layout: { mode: 'free' },
      children: kids.length ? kids : undefined,
    }
  }
  return serializeLayer(obj)
}

export type FabricDesignSelectionContextPayload = {
  version: 1
  mode: 'selection' | 'empty'
  roots: FabricDesignNode[]
}

/** 选区 → 与 Design Document 同构的上下文（roots 可为 container 或图层，normalize 会 wrap） */
export function buildFabricDesignSelectionContext(
  selected: FabricObject[],
): FabricDesignSelectionContextPayload {
  if (!selected.length) {
    return { version: 1, mode: 'empty', roots: [] }
  }
  const roots = selected
    .map((o) => serializeFabricObjectToDesignNode(o))
    .filter((n): n is FabricDesignNode => n != null)
  return {
    version: 1,
    mode: roots.length ? 'selection' : 'empty',
    roots,
  }
}
