import { Circle, IText, Rect, type FabricObject } from 'fabric'
import { tokenSolidColors } from '../../../assets/tokens/tokenSolidColors'
import {
  applyFabricContainerLayout,
  listFabricContainerContentChildren,
  readFabricObjectLocalTopLeft,
  writeFabricObjectLocalTopLeft,
} from '../layers/fabricContainerLayout.pure'
import {
  createFabricContainerFromRect,
  normalizeFabricContainerLayout,
  setFabricContainerClipContent,
  setFabricContainerCornerRadius,
  setFabricContainerFramePaint,
  setFabricContainerLayout,
  syncFabricContainerFrameLocalRect,
  type FabricContainerObject,
} from '../tools/fabricContainerTool.pure'
import { resolveFabricContainerPreset } from '../tools/fabricContainerPresets.pure'
import type {
  FabricDesignCircleNode,
  FabricDesignContainerNode,
  FabricDesignDocumentV1,
  FabricDesignLayerNode,
  FabricDesignNode,
  FabricDesignRectNode,
  FabricDesignTextNode,
} from './fabricDesignDocument.types'

export type ExtractDesignDocumentResult =
  | { ok: true; doc: FabricDesignDocumentV1 }
  | { ok: false; error: string }

function asRecord(v: unknown): Record<string, unknown> | null {
  if (v && typeof v === 'object' && !Array.isArray(v)) {
    return v as Record<string, unknown>
  }
  return null
}

function finiteNumber(v: unknown, fallback: number): number {
  return typeof v === 'number' && Number.isFinite(v) ? v : fallback
}

function coerceFinite(v: unknown): number | undefined {
  if (typeof v === 'number' && Number.isFinite(v)) return v
  if (typeof v === 'string' && v.trim()) {
    const n = Number(v.trim())
    if (Number.isFinite(n)) return n
  }
  return undefined
}

function optionalFinite(v: unknown): number | undefined {
  return coerceFinite(v)
}

function optionalString(v: unknown): string | undefined {
  if (typeof v !== 'string') return undefined
  const t = v.trim()
  return t || undefined
}

function nodeTypeKey(raw: unknown): string {
  const o = asRecord(raw)
  if (!o) return ''
  return String(o.type ?? '')
    .trim()
    .toLowerCase()
}

/** 模型常把 frame/page/group 当成画板 */
function isContainerTypeAlias(type: string): boolean {
  return (
    type === 'container' ||
    type === 'frame' ||
    type === 'artboard' ||
    type === 'page' ||
    type === 'group'
  )
}

function resolveLayerType(
  type: string,
): 'rect' | 'circle' | 'text' | null {
  if (type === 'rect' || type === 'rectangle' || type === 'box') return 'rect'
  if (type === 'circle' || type === 'ellipse' || type === 'oval') return 'circle'
  if (type === 'text' || type === 'label' || type === 'title') return 'text'
  return null
}

function stripJsonFence(raw: string): string {
  const trimmed = raw.trim()
  const fence = /^```(?:json|js|javascript)?\s*\n?([\s\S]*?)```$/im.exec(trimmed)
  if (fence?.[1]) return fence[1].trim()
  return trimmed
}

/** 从模型输出中抠出最可能的 JSON 对象/数组文本 */
export function extractJsonObjectTextFromAiResponse(raw: string): string {
  const stripped = stripJsonFence(raw)
  if (!stripped) return ''
  try {
    JSON.parse(stripped)
    return stripped
  } catch {
    /* continue */
  }
  const startObj = stripped.indexOf('{')
  const startArr = stripped.indexOf('[')
  const preferObj =
    startObj >= 0 && (startArr < 0 || startObj <= startArr)
  if (preferObj) {
    const end = stripped.lastIndexOf('}')
    if (end > startObj) return stripped.slice(startObj, end + 1)
  }
  if (startArr >= 0) {
    const end = stripped.lastIndexOf(']')
    if (end > startArr) return stripped.slice(startArr, end + 1)
  }
  return stripped
}

function normalizeLayout(raw: unknown) {
  if (!raw || typeof raw !== 'object') return undefined
  return normalizeFabricContainerLayout(raw)
}

function normalizeLayer(raw: unknown): FabricDesignLayerNode | null {
  const o = asRecord(raw)
  if (!o) return null
  const type = resolveLayerType(nodeTypeKey(o))
  // 无 type 但明显是文字 / 方块时兜底
  const inferred: 'rect' | 'circle' | 'text' | null =
    type ??
    (typeof o.text === 'string'
      ? 'text'
      : optionalFinite(o.width) != null && optionalFinite(o.height) != null
        ? 'rect'
        : null)
  if (inferred === 'rect') {
    const node: FabricDesignRectNode = {
      type: 'rect',
      name: optionalString(o.name),
      width: optionalFinite(o.width),
      height: optionalFinite(o.height),
      fill: optionalString(o.fill),
      stroke: optionalString(o.stroke),
      strokeWidth: optionalFinite(o.strokeWidth),
      rx: optionalFinite(o.rx),
      left: optionalFinite(o.left),
      top: optionalFinite(o.top),
    }
    return node
  }
  if (inferred === 'circle') {
    const node: FabricDesignCircleNode = {
      type: 'circle',
      name: optionalString(o.name),
      diameter: optionalFinite(o.diameter),
      width: optionalFinite(o.width),
      height: optionalFinite(o.height),
      fill: optionalString(o.fill),
      stroke: optionalString(o.stroke),
      strokeWidth: optionalFinite(o.strokeWidth),
      left: optionalFinite(o.left),
      top: optionalFinite(o.top),
    }
    return node
  }
  if (inferred === 'text') {
    const node: FabricDesignTextNode = {
      type: 'text',
      name: optionalString(o.name),
      text: typeof o.text === 'string' ? o.text : optionalString(o.text),
      fontSize: optionalFinite(o.fontSize),
      fill: optionalString(o.fill),
      fontFamily: optionalString(o.fontFamily),
      left: optionalFinite(o.left),
      top: optionalFinite(o.top),
    }
    return node
  }
  return null
}

function childListFromNode(o: Record<string, unknown>): unknown[] {
  for (const key of ['children', 'nodes', 'elements', 'layers', 'items']) {
    if (Array.isArray(o[key])) return o[key] as unknown[]
  }
  return []
}

function normalizeContainer(raw: unknown): FabricDesignContainerNode | null {
  const o = asRecord(raw)
  if (!o) return null
  const type = nodeTypeKey(o)
  const looksLikeContainer =
    isContainerTypeAlias(type) ||
    (!type && childListFromNode(o).length > 0)
  if (!looksLikeContainer) return null
  const children = childListFromNode(o)
    .map(normalizeNode)
    .filter((n): n is FabricDesignNode => n != null)
  return {
    type: 'container',
    name: optionalString(o.name),
    presetId: optionalString(o.presetId),
    width: optionalFinite(o.width),
    height: optionalFinite(o.height),
    layout: normalizeLayout(o.layout),
    clipContent: typeof o.clipContent === 'boolean' ? o.clipContent : undefined,
    cornerRadius: optionalFinite(o.cornerRadius),
    fill: optionalString(o.fill),
    stroke: optionalString(o.stroke),
    strokeWidth: optionalFinite(o.strokeWidth),
    children,
    left: optionalFinite(o.left),
    top: optionalFinite(o.top),
  }
}

function normalizeNode(raw: unknown): FabricDesignNode | null {
  const o = asRecord(raw)
  if (!o) return null
  const type = nodeTypeKey(o)
  if (isContainerTypeAlias(type) || (!type && childListFromNode(o).length > 0)) {
    return normalizeContainer(raw)
  }
  return normalizeLayer(raw)
}

/** 解开模型外层包装：`{ data:{...} }` / 纯数组等 */
function unwrapDesignDocumentPayload(raw: unknown, depth = 0): unknown {
  if (depth > 4) return raw
  if (Array.isArray(raw)) {
    return { version: 1, roots: raw }
  }
  const o = asRecord(raw)
  if (!o) return raw

  for (const key of [
    'document',
    'designDocument',
    'design_document',
    'design',
    'data',
    'result',
    'payload',
    'json',
    'output',
  ]) {
    if (!(key in o)) continue
    const inner = o[key]
    if (Array.isArray(inner)) {
      return unwrapDesignDocumentPayload(inner, depth + 1)
    }
    const ir = asRecord(inner)
    if (
      ir &&
      (Array.isArray(ir.roots) ||
        Array.isArray(ir.pages) ||
        Array.isArray(ir.frames) ||
        Array.isArray(ir.containers) ||
        Array.isArray(ir.children) ||
        Array.isArray(ir.nodes))
    ) {
      return unwrapDesignDocumentPayload(inner, depth + 1)
    }
  }
  return o
}

function pickRootsArray(o: Record<string, unknown>): unknown[] | null {
  for (const key of [
    'roots',
    'pages',
    'frames',
    'containers',
    'nodes',
    'children',
    'elements',
  ]) {
    const v = o[key]
    if (Array.isArray(v) && v.length > 0) return v
  }
  // 单根 container 写在顶层（无 roots）
  if (isContainerTypeAlias(nodeTypeKey(o)) || childListFromNode(o).length > 0) {
    return [o]
  }
  return null
}

function describeNormalizeFailure(parsed: unknown): string {
  const unwrapped = unwrapDesignDocumentPayload(parsed)
  if (Array.isArray(unwrapped)) {
    return `得到数组（长度 ${unwrapped.length}），但未能识别为节点列表`
  }
  const o = asRecord(unwrapped)
  if (!o) return '顶层不是 JSON 对象'
  const keys = Object.keys(o).slice(0, 12).join(', ')
  const version = o.version
  const roots = pickRootsArray(o)
  if (version != null && version !== 1 && version !== '1') {
    return `version=${String(version)}（仅支持 1）；顶层键: ${keys || '(无)'}`
  }
  if (!roots) {
    return `缺少非空 roots/pages/frames；顶层键: ${keys || '(无)'}`
  }
  const types = roots
    .slice(0, 8)
    .map((n) => nodeTypeKey(n) || '(无type)')
    .join(', ')
  return `roots 有 ${roots.length} 项，但无一可识别为 container/图层（type: ${types}）`
}

/** 将散落在根上的图层包进 free 布局容器，保证 document.roots 全为 container */
function wrapLayerAsFreeContainer(
  layer: FabricDesignLayerNode,
): FabricDesignContainerNode {
  return {
    type: 'container',
    name: layer.name,
    layout: { mode: 'free' },
    children: [{ ...layer, left: layer.left ?? 0, top: layer.top ?? 0 }],
    left: layer.left,
    top: layer.top,
  }
}

function coerceRootToContainer(node: FabricDesignNode): FabricDesignContainerNode {
  if (node.type === 'container') return node
  return wrapLayerAsFreeContainer(node)
}

/**
 * 整稿 roots 全是图层时：合并进一个 free 容器；
 * 混排时：每个非 container 根各自包一层 free 容器。
 */
function coerceDocumentRoots(
  nodes: FabricDesignNode[],
): FabricDesignContainerNode[] {
  if (!nodes.length) return []
  const allLayers = nodes.every((n) => n.type !== 'container')
  if (allLayers) {
    return [
      {
        type: 'container',
        layout: { mode: 'free' },
        children: nodes.map((layer) => ({
          ...layer,
          left: layer.left ?? 0,
          top: layer.top ?? 0,
        })),
      },
    ]
  }
  return nodes.map(coerceRootToContainer)
}

export function normalizeFabricDesignDocument(
  raw: unknown,
): FabricDesignDocumentV1 | null {
  const unwrapped = unwrapDesignDocumentPayload(raw)
  const o = asRecord(unwrapped)
  if (!o) return null

  // 缺省 version 视为 1；显式非 1 才拒绝
  if (o.version != null && o.version !== 1 && o.version !== '1') return null

  const rootsRaw = pickRootsArray(o)
  if (!rootsRaw) return null
  const nodes = rootsRaw
    .map(normalizeNode)
    .filter((n): n is FabricDesignNode => n != null)
  if (!nodes.length) return null
  const roots = coerceDocumentRoots(nodes)
  if (!roots.length) return null
  return { version: 1, roots }
}

export function extractDesignDocumentFromAiResponse(
  raw: string,
): ExtractDesignDocumentResult {
  const text = extractJsonObjectTextFromAiResponse(raw)
  if (!text.trim()) {
    return { ok: false, error: '模型返回为空' }
  }
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    // 模型偶发尾逗号：`{"a":1,}`
    try {
      parsed = JSON.parse(text.replace(/,\s*([}\]])/g, '$1'))
    } catch {
      return {
        ok: false,
        error: '未能解析为 JSON（需输出 Design Document）',
      }
    }
  }
  const doc = normalizeFabricDesignDocument(parsed)
  if (!doc) {
    return {
      ok: false,
      error: `JSON 不是合法的 Design Document：${describeNormalizeFailure(parsed)}`,
    }
  }
  return { ok: true, doc }
}

function applyLeafName(obj: FabricObject, name?: string) {
  if (name?.trim()) obj.set('name', name.trim())
}

function hydrateRect(node: FabricDesignRectNode): FabricObject {
  const width = Math.max(1, finiteNumber(node.width, 120))
  const height = Math.max(1, finiteNumber(node.height, 40))
  const rx = Math.max(0, finiteNumber(node.rx, 0))
  const obj = new Rect({
    left: 0,
    top: 0,
    width,
    height,
    rx,
    ry: rx,
    fill: node.fill ?? tokenSolidColors.fabricEditorFillPink,
    stroke: node.stroke ?? tokenSolidColors.grayColor15,
    strokeWidth: Math.max(0, finiteNumber(node.strokeWidth, 0)),
    strokeUniform: true,
    objectCaching: false,
    originX: 'left',
    originY: 'top',
  })
  applyLeafName(obj, node.name)
  return obj
}

function hydrateCircle(node: FabricDesignCircleNode): FabricObject {
  const diameter =
    optionalFinite(node.diameter) ??
    Math.min(
      Math.max(1, finiteNumber(node.width, 56)),
      Math.max(1, finiteNumber(node.height, 56)),
    )
  const radius = Math.max(1, diameter / 2)
  const obj = new Circle({
    left: 0,
    top: 0,
    radius,
    fill: node.fill ?? tokenSolidColors.fabricEditorFillCyan,
    stroke: node.stroke ?? tokenSolidColors.grayColor15,
    strokeWidth: Math.max(0, finiteNumber(node.strokeWidth, 0)),
    strokeUniform: true,
    objectCaching: false,
    originX: 'left',
    originY: 'top',
  })
  applyLeafName(obj, node.name)
  return obj
}

function hydrateText(node: FabricDesignTextNode): FabricObject {
  // 须用 IText：FabricText 不可双击编辑，落稿后会像「死」的 SVG 文字
  const obj = new IText(node.text?.trim() || '文本', {
    left: 0,
    top: 0,
    fill: node.fill ?? tokenSolidColors.grayColor15,
    fontSize: Math.max(8, finiteNumber(node.fontSize, 16)),
    fontFamily: node.fontFamily ?? 'system-ui, -apple-system, sans-serif',
    objectCaching: false,
    originX: 'left',
    originY: 'top',
    editable: true,
  })
  applyLeafName(obj, node.name)
  return obj
}

function hydrateLayer(node: FabricDesignLayerNode): FabricObject {
  if (node.type === 'rect') return hydrateRect(node)
  if (node.type === 'circle') return hydrateCircle(node)
  return hydrateText(node)
}

type ContainerSlotHint = { width: number; height: number }

/**
 * 解析容器尺寸。
 * - 根节点：可用 preset；缺省宽高落回 393×852
 * - 嵌套：缺宽/高时继承父级内容区 slot，禁止再回落到整机尺寸（否则子树会撑破父容器）
 */
function resolveContainerSize(
  node: FabricDesignContainerNode,
  parentSlot?: ContainerSlotHint,
): {
  width: number
  height: number
  label: string
  presetId: string
  /** 高度是否由文档显式给出（否则 hydrate 后可按子树收缩） */
  heightExplicit: boolean
  widthExplicit: boolean
} {
  const preset = node.presetId
    ? resolveFabricContainerPreset(node.presetId)
    : undefined
  const label = node.name?.trim() || preset?.label || '容器'
  const presetId = preset?.id || node.presetId?.trim() || 'custom'
  const widthExplicit = optionalFinite(node.width) != null || Boolean(preset && !parentSlot)
  const heightExplicit = optionalFinite(node.height) != null || Boolean(preset && !parentSlot)

  if (preset && !parentSlot) {
    return {
      width: preset.width,
      height: preset.height,
      label,
      presetId: preset.id,
      widthExplicit: true,
      heightExplicit: true,
    }
  }

  if (!parentSlot) {
    return {
      width: Math.max(1, finiteNumber(node.width, preset?.width ?? 393)),
      height: Math.max(1, finiteNumber(node.height, preset?.height ?? 852)),
      label,
      presetId,
      widthExplicit: optionalFinite(node.width) != null || Boolean(preset),
      heightExplicit: optionalFinite(node.height) != null || Boolean(preset),
    }
  }

  return {
    width: Math.max(
      1,
      optionalFinite(node.width) ?? preset?.width ?? parentSlot.width,
    ),
    height: Math.max(
      1,
      optionalFinite(node.height) ??
        preset?.height ??
        Math.min(parentSlot.height, 48),
    ),
    label,
    presetId,
    widthExplicit: optionalFinite(node.width) != null || Boolean(preset),
    heightExplicit: optionalFinite(node.height) != null || Boolean(preset),
  }
}

function measureContainerContentExtent(
  container: FabricContainerObject,
  layoutMode: string,
  direction: string | undefined,
  gap: number,
  pad: number,
): { width: number; height: number } {
  const kids = listFabricContainerContentChildren(container)
  if (!kids.length) {
    return { width: pad * 2 + 1, height: pad * 2 + 1 }
  }
  if (layoutMode === 'stack' && direction === 'horizontal') {
    let w = pad * 2
    let h = 0
    kids.forEach((k, i) => {
      w += Math.abs(k.getScaledWidth()) + (i > 0 ? gap : 0)
      h = Math.max(h, Math.abs(k.getScaledHeight()))
    })
    return { width: Math.max(1, w), height: Math.max(1, h + pad * 2) }
  }
  if (layoutMode === 'stack') {
    let h = pad * 2
    let w = 0
    kids.forEach((k, i) => {
      h += Math.abs(k.getScaledHeight()) + (i > 0 ? gap : 0)
      w = Math.max(w, Math.abs(k.getScaledWidth()))
    })
    return { width: Math.max(1, w + pad * 2), height: Math.max(1, h) }
  }
  // free / grid：用包围盒
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (const k of kids) {
    const tl = readFabricObjectLocalTopLeft(k)
    const ww = Math.abs(k.getScaledWidth())
    const hh = Math.abs(k.getScaledHeight())
    minX = Math.min(minX, tl.x)
    minY = Math.min(minY, tl.y)
    maxX = Math.max(maxX, tl.x + ww)
    maxY = Math.max(maxY, tl.y + hh)
  }
  return {
    width: Math.max(1, maxX - minX + pad * 2),
    height: Math.max(1, maxY - minY + pad * 2),
  }
}

function hydrateContainer(
  node: FabricDesignContainerNode,
  sceneOrigin: { left: number; top: number },
  parentSlot?: ContainerSlotHint,
): FabricContainerObject {
  const size = resolveContainerSize(node, parentSlot)
  const container = createFabricContainerFromRect(
    {
      left: sceneOrigin.left,
      top: sceneOrigin.top,
      width: size.width,
      height: size.height,
    },
    { label: size.label, presetId: size.presetId },
  )
  if (node.layout) {
    setFabricContainerLayout(container, node.layout)
  }
  // 默认对设计稿容器开启裁剪，避免模型偶发越界子项露馅；显式 false 才关闭
  if (node.clipContent !== false) {
    setFabricContainerClipContent(container, true)
  }
  if (typeof node.cornerRadius === 'number' && Number.isFinite(node.cornerRadius)) {
    setFabricContainerCornerRadius(container, node.cornerRadius)
  }
  if (
    node.fill !== undefined ||
    node.stroke !== undefined ||
    node.strokeWidth !== undefined
  ) {
    setFabricContainerFramePaint(container, {
      fill: node.fill,
      stroke: node.stroke,
      strokeWidth: node.strokeWidth,
    })
  }

  const layout = normalizeFabricContainerLayout(container.tpFabricContainerLayout)
  const pad = layout.padding ?? 0
  let width = size.width
  let height = size.height
  const frameLeft = -width / 2
  const frameTop = -height / 2
  const contentOriginX = frameLeft + pad
  const contentOriginY = frameTop + pad
  const childSlot: ContainerSlotHint = {
    width: Math.max(1, width - pad * 2),
    height: Math.max(1, height - pad * 2),
  }

  const children = node.children ?? []
  for (const childNode of children) {
    const child =
      childNode.type === 'container'
        ? hydrateContainer(childNode, { left: 0, top: 0 }, childSlot)
        : hydrateLayer(childNode)
    container.add(child)
    const objs = container.getObjects()
    const idx = objs.indexOf(child)
    if (idx >= 0 && idx !== objs.length - 1) {
      container.moveObjectTo(child, objs.length - 1)
    }
    const lx = contentOriginX + finiteNumber(childNode.left, 0)
    const ly = contentOriginY + finiteNumber(childNode.top, 0)
    writeFabricObjectLocalTopLeft(child, lx, ly)
  }

  // 嵌套且未写死高度：按子树量收缩，避免默认大高度溢出父级
  if (parentSlot && !size.heightExplicit) {
    const measured = measureContainerContentExtent(
      container,
      layout.mode,
      layout.direction,
      layout.gap ?? 0,
      pad,
    )
    height = Math.max(1, Math.min(parentSlot.height, measured.height))
    syncFabricContainerFrameLocalRect(container, width, height)
  }
  if (parentSlot && !size.widthExplicit && layout.mode === 'stack' && layout.direction === 'horizontal') {
    const measured = measureContainerContentExtent(
      container,
      layout.mode,
      layout.direction,
      layout.gap ?? 0,
      pad,
    )
    width = Math.max(1, Math.min(parentSlot.width, measured.width))
    syncFabricContainerFrameLocalRect(container, width, height)
  }

  applyFabricContainerLayout(container)
  container.setCoords()
  return container
}

/**
 * 将单个 Design 节点 hydrate 为 Fabric 对象（容器含完整子树）。
 * @param sceneOrigin 根节点场景坐标；嵌套时忽略，改由父级定位
 */
export function hydrateFabricDesignNode(
  node: FabricDesignNode,
  sceneOrigin: { left: number; top: number } = { left: 40, top: 40 },
): FabricObject {
  if (node.type === 'container') return hydrateContainer(node, sceneOrigin)
  return hydrateLayer(node)
}

/** 将整份 Design Document hydrate 为画布根对象列表（根皆为容器） */
export function hydrateFabricDesignDocument(
  doc: FabricDesignDocumentV1,
  options?: { origin?: { left: number; top: number }; gap?: number },
): FabricObject[] {
  const origin = options?.origin ?? { left: 40, top: 40 }
  const gap = options?.gap ?? 48
  const roots: FabricObject[] = []
  let cursorX = origin.left
  for (const rootNode of doc.roots) {
    const obj = hydrateContainer(rootNode, {
      left: cursorX,
      top: origin.top,
    })
    roots.push(obj)
    const size = resolveContainerSize(rootNode)
    cursorX += size.width + gap
  }
  return roots
}

export function isFabricContainerRoot(
  obj: FabricObject,
): obj is FabricContainerObject {
  return Boolean((obj as FabricContainerObject).tpFabricContainer)
}
