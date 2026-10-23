import { Group, type Canvas, type FabricObject } from 'fabric'
import {
  paintToPickerHexAlpha,
  rgbaStringFromHexAndOpacityPercent,
} from '../document/fabricDesignEditorPure'
import { tokenSolidColors } from '../../../assets/tokens/tokenSolidColors'

export type FabricStrokeAlign = 'inside' | 'center' | 'outside'

export type FabricFillPaintLayer = {
  id: string
  visible: boolean
  hex: string
  opacity: number
  unsupported?: boolean
}

export type FabricStrokePaintLayer = {
  id: string
  visible: boolean
  hex: string
  opacity: number
  unsupported?: boolean
}

export type FabricPaintStackMeta = {
  ownerId: string
  role: 'fill' | 'stroke'
  index: number
}

const OWNER_KEY = 'editorPaintOwnerId'
const CLONE_KEY = 'editorPaintClone'
const FILLS_KEY = 'editorFillLayers'
const STROKES_KEY = 'editorStrokeLayers'
const STROKE_ALIGN_KEY = 'editorStrokeAlign'

let paintOwnerSeq = 0

export function createPaintLayerId(): string {
  return `paint_${++paintOwnerSeq}`
}

function ensureOwnerId(obj: FabricObject): string {
  const cur = (obj as FabricObject & { [OWNER_KEY]?: string })[OWNER_KEY]
  if (cur) return cur
  const id = createPaintLayerId()
  obj.set(OWNER_KEY as keyof FabricObject, id as never)
  return id
}

export function isPaintClone(obj: FabricObject): boolean {
  return Boolean((obj as FabricObject & { [CLONE_KEY]?: FabricPaintStackMeta })[CLONE_KEY])
}

export function isFabricEditorPaintClone(obj: FabricObject): boolean {
  return isPaintClone(obj)
}

export function readFillLayers(obj: FabricObject): FabricFillPaintLayer[] {
  const stored = (obj as FabricObject & { [FILLS_KEY]?: FabricFillPaintLayer[] })[
    FILLS_KEY
  ]
  if (Array.isArray(stored)) return stored.map((l) => ({ ...l }))

  const fillUi = paintToPickerHexAlpha(obj.fill)
  return [
    {
      id: createPaintLayerId(),
      visible: fillUi.alpha > 0 && obj.fill !== 'transparent' && obj.fill !== '',
      hex: fillUi.hex,
      opacity: Math.round(fillUi.alpha * 100),
      unsupported: fillUi.unsupported,
    },
  ]
}

export function readStrokeLayers(obj: FabricObject): FabricStrokePaintLayer[] {
  const stored = (obj as FabricObject & { [STROKES_KEY]?: FabricStrokePaintLayer[] })[
    STROKES_KEY
  ]
  if (Array.isArray(stored)) return stored.map((l) => ({ ...l }))

  const strokeRaw = obj.stroke
  const hasStroke = strokeRaw != null && strokeRaw !== ''
  const strokeUi = paintToPickerHexAlpha(
    hasStroke ? strokeRaw : tokenSolidColors.grayColor15,
  )
  return [
    {
      id: createPaintLayerId(),
      visible: hasStroke && (obj.strokeWidth ?? 0) > 0,
      hex: strokeUi.hex,
      opacity: Math.round(strokeUi.alpha * 100),
      unsupported:
        hasStroke && strokeRaw != null && typeof strokeRaw !== 'string',
    },
  ]
}

export function readStrokeAlign(obj: FabricObject): FabricStrokeAlign {
  const v = (obj as FabricObject & { [STROKE_ALIGN_KEY]?: FabricStrokeAlign })[
    STROKE_ALIGN_KEY
  ]
  return v === 'inside' || v === 'outside' ? v : 'center'
}

export function forEachAppearanceLeaf(
  root: FabricObject,
  fn: (leaf: FabricObject) => void,
): void {
  if (root instanceof Group) {
    for (const child of root.getObjects()) {
      forEachAppearanceLeaf(child as FabricObject, fn)
    }
    return
  }
  fn(root)
}

function removePaintClonesForOwner(canvas: Canvas, ownerId: string): void {
  const toRemove = canvas
    .getObjects()
    .filter((o) => {
      const meta = (o as FabricObject & { [CLONE_KEY]?: FabricPaintStackMeta })[CLONE_KEY]
      return meta?.ownerId === ownerId
    })
  if (toRemove.length) canvas.remove(...toRemove)
}

function placeCloneNearHost(canvas: Canvas, host: FabricObject, clone: FabricObject) {
  const objs = canvas.getObjects()
  const hostIndex = objs.indexOf(host)
  if (hostIndex < 0) {
    canvas.add(clone)
    return
  }
  canvas.insertAt(hostIndex, clone)
}

async function createPaintClone(
  host: FabricObject,
  meta: FabricPaintStackMeta,
): Promise<FabricObject> {
  const clone = await host.clone()
  clone.set({
    selectable: false,
    evented: false,
    hasControls: false,
    [CLONE_KEY]: meta,
  } as object)
  return clone
}

function copyHostTransform(host: FabricObject, target: FabricObject) {
  target.set({
    left: host.left,
    top: host.top,
    scaleX: host.scaleX,
    scaleY: host.scaleY,
    angle: host.angle,
    skewX: host.skewX,
    skewY: host.skewY,
    flipX: host.flipX,
    flipY: host.flipY,
    originX: host.originX,
    originY: host.originY,
  })
  target.setCoords()
}

export async function applyPaintLayersToObject(
  canvas: Canvas,
  host: FabricObject,
  fills: FabricFillPaintLayer[],
  strokes: FabricStrokePaintLayer[],
  strokeWidth: number,
  strokeAlign: FabricStrokeAlign,
): Promise<void> {
  if (host instanceof Group) return

  const ownerId = ensureOwnerId(host)
  host.set({
    [FILLS_KEY]: fills.map((l) => ({ ...l })),
    [STROKES_KEY]: strokes.map((l) => ({ ...l })),
    [STROKE_ALIGN_KEY]: strokeAlign,
  } as object)

  removePaintClonesForOwner(canvas, ownerId)

  const visibleFills = fills.filter((l) => l.visible && !l.unsupported)
  const visibleStrokes = strokes.filter((l) => l.visible && !l.unsupported)

  const topFill = visibleFills[visibleFills.length - 1]
  const topStroke = visibleStrokes[visibleStrokes.length - 1]

  host.set({
    fill: topFill
      ? rgbaStringFromHexAndOpacityPercent(topFill.hex, topFill.opacity)
      : 'transparent',
    stroke: topStroke
      ? rgbaStringFromHexAndOpacityPercent(topStroke.hex, topStroke.opacity)
      : '',
    strokeWidth: topStroke && strokeWidth > 0 ? strokeWidth : 0,
    strokeUniform: true,
  })

  for (let i = 0; i < visibleFills.length - 1; i++) {
    const layer = visibleFills[i]!
    const clone = await createPaintClone(host, {
      ownerId,
      role: 'fill',
      index: i,
    })
    clone.set({
      fill: rgbaStringFromHexAndOpacityPercent(layer.hex, layer.opacity),
      stroke: '',
      strokeWidth: 0,
    })
    copyHostTransform(host, clone)
    placeCloneNearHost(canvas, host, clone)
  }

  for (let i = 0; i < visibleStrokes.length - 1; i++) {
    const layer = visibleStrokes[i]!
    const clone = await createPaintClone(host, {
      ownerId,
      role: 'stroke',
      index: i,
    })
    clone.set({
      fill: 'transparent',
      stroke: rgbaStringFromHexAndOpacityPercent(layer.hex, layer.opacity),
      strokeWidth: strokeWidth > 0 ? strokeWidth : 1,
      strokeUniform: true,
    })
    copyHostTransform(host, clone)
    const hostIndex = canvas.getObjects().indexOf(host)
    if (hostIndex >= 0) {
      canvas.insertAt(hostIndex + 1 + i, clone)
    } else {
      canvas.add(clone)
    }
  }

  host.setCoords()
  canvas.requestRenderAll()
}

export function syncPaintCloneTransforms(host: FabricObject): void {
  const canvas = host.canvas
  if (!canvas || host instanceof Group) return
  const ownerId = (host as FabricObject & { [OWNER_KEY]?: string })[OWNER_KEY]
  if (!ownerId) return

  for (const obj of canvas.getObjects()) {
    const meta = (obj as FabricObject & { [CLONE_KEY]?: FabricPaintStackMeta })[CLONE_KEY]
    if (meta?.ownerId !== ownerId || isPaintClone(obj) === false) continue
    copyHostTransform(host, obj)
  }
  canvas.requestRenderAll()
}

export function removePaintClonesForObject(canvas: Canvas, host: FabricObject): void {
  const ownerId = (host as FabricObject & { [OWNER_KEY]?: string })[OWNER_KEY]
  if (!ownerId) return
  removePaintClonesForOwner(canvas, ownerId)
}

export function defaultFillLayer(): FabricFillPaintLayer {
  return {
    id: createPaintLayerId(),
    visible: true,
    hex: tokenSolidColors.grayColor15,
    opacity: 100,
  }
}

export function defaultStrokeLayer(): FabricStrokePaintLayer {
  return {
    id: createPaintLayerId(),
    visible: true,
    hex: tokenSolidColors.grayColor15,
    opacity: 100,
  }
}
