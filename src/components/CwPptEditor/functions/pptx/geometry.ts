import type { Space } from './shared'
import { readPair } from './xml'

export function enterGroup(parent: Space, xfrm: Element): Space {
  const off = readPair(xfrm, 'off')
  const ext = readPair(xfrm, 'ext')
  const chOff = readPair(xfrm, 'chOff')
  const chExt = readPair(xfrm, 'chExt')
  return {
    x: parent.x + (off.x - chOff.x) * parent.sx,
    y: parent.y + (off.y - chOff.y) * parent.sy,
    sx: chExt.x ? (ext.x / chExt.x) * parent.sx : parent.sx,
    sy: chExt.y ? (ext.y / chExt.y) * parent.sy : parent.sy,
  }
}

export const LINE_MIN_NORM = 0.0008

export function frameRaw(xfrm: Element, space: Space, slideCx: number, slideCy: number) {
  const off = readPair(xfrm, 'off')
  const ext = readPair(xfrm, 'ext')
  return {
    x: (space.x + off.x * space.sx) / slideCx,
    y: (space.y + off.y * space.sy) / slideCy,
    w: (ext.x * space.sx) / slideCx,
    h: (ext.y * space.sy) / slideCy,
  }
}

export function frameOf(xfrm: Element, space: Space, slideCx: number, slideCy: number) {
  const raw = frameRaw(xfrm, space, slideCx, slideCy)
  return {
    x: raw.x,
    y: raw.y,
    w: raw.w || 0.2,
    h: raw.h || 0.1,
  }
}

export function frameOfLine(xfrm: Element, space: Space, slideCx: number, slideCy: number) {
  const raw = frameRaw(xfrm, space, slideCx, slideCy)
  return {
    x: raw.x,
    y: raw.y,
    w: raw.w > 0 ? raw.w : LINE_MIN_NORM,
    h: raw.h > 0 ? raw.h : LINE_MIN_NORM,
  }
}

/** 文字/色块：零宽或零高时保持细条，避免被当成 20% 宽色块 */
export function frameOfBox(xfrm: Element, space: Space, slideCx: number, slideCy: number) {
  return frameOfLine(xfrm, space, slideCx, slideCy)
}
