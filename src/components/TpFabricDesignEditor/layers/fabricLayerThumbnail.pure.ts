import type { FabricObject } from 'fabric'
import { tokenSolidColors } from '../../../assets/tokens/tokenSolidColors'

const THUMB_CSS_PX = 16
const thumbCache = new WeakMap<FabricObject, { sig: string; url: string }>()

function thumbnailSignature(obj: FabricObject): string {
  const path = (obj as FabricObject & { path?: unknown }).path
  const pathLen = Array.isArray(path) ? path.length : 0
  const src =
    typeof (obj as FabricObject & { getSrc?: () => string }).getSrc === 'function'
      ? String((obj as FabricObject & { getSrc: () => string }).getSrc() ?? '').slice(
          0,
          64,
        )
      : ''
  return [
    obj.type,
    Math.round(obj.width ?? 0),
    Math.round(obj.height ?? 0),
    Math.round(obj.scaleX ?? 1),
    Math.round(obj.scaleY ?? 1),
    Math.round(obj.angle ?? 0),
    String(obj.fill ?? ''),
    String(obj.stroke ?? ''),
    Math.round(Number(obj.strokeWidth ?? 0) * 10),
    pathLen,
    src,
    obj.visible === false ? 0 : 1,
  ].join('|')
}

/**
 * 生成图层面板用的小缩略图（data URL）。失败时返回 undefined。
 */
export function fabricObjectLayerThumbnailUrl(
  obj: FabricObject,
): string | undefined {
  const sig = thumbnailSignature(obj)
  const cached = thumbCache.get(obj)
  if (cached?.sig === sig) return cached.url

  try {
    const w = Math.max(1, obj.getScaledWidth?.() ?? obj.width ?? 1)
    const h = Math.max(1, obj.getScaledHeight?.() ?? obj.height ?? 1)
    const multiplier = Math.min(THUMB_CSS_PX / w, THUMB_CSS_PX / h, 2)
    const url = obj.toDataURL({
      format: 'png',
      multiplier: Math.max(0.05, multiplier),
      enableRetinaScaling: false,
    })
    if (!url || url === 'data:,') return undefined
    thumbCache.set(obj, { sig, url })
    return url
  } catch {
    return undefined
  }
}

/** 画笔光标：按描边宽度显示圆环 */
export function createFabricBrushCursor(
  strokeWidth: number,
  strokeColor: string,
): string {
  const diameter = Math.max(4, Math.min(48, Math.round(strokeWidth)))
  const r = diameter / 2
  const size = diameter + 2
  const cx = size / 2
  const stroke = encodeURIComponent(
    strokeColor || tokenSolidColors.grayColor15,
  )
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><circle cx="${cx}" cy="${cx}" r="${Math.max(1, r - 0.5)}" fill="none" stroke="${stroke}" stroke-width="1"/></svg>`
  return `url("data:image/svg+xml;charset=utf-8,${svg}") ${cx} ${cx}, crosshair`
}
