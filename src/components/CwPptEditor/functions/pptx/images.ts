import type { CwPptSlide } from '../../types'
import type { PptxArchivePayload } from '../archiveEntries'
import { A, P, R, type Space, type ZipRel } from './shared'
import { childEl, resolveTarget, shapeXfrm } from './xml'
import { frameOfBox } from './geometry'
import { createId } from './model'

export function blipFillOn(host: Element) {
  return childEl(host, 'blipFill') ?? host.getElementsByTagNameNS(A, 'blipFill')[0] ?? null
}

export const SRC_RECT_SCALE = 100000

export function readSrcRectCrop(blipFill: Element | null) {
  const rect = blipFill ? childEl(blipFill, 'srcRect') : null
  if (!rect) return undefined
  const left = Number(rect.getAttribute('l') || 0) / SRC_RECT_SCALE
  const top = Number(rect.getAttribute('t') || 0) / SRC_RECT_SCALE
  const right = Number(rect.getAttribute('r') || 0) / SRC_RECT_SCALE
  const bottom = Number(rect.getAttribute('b') || 0) / SRC_RECT_SCALE
  if (!left && !top && !right && !bottom) return undefined
  return { left, top, right, bottom }
}

export function blipEmbed(node: Element | null) {
  if (!node) return ''
  const blipFill =
    node.localName === 'blipFill' ? node : blipFillOn(node) ?? node.getElementsByTagNameNS(A, 'blipFill')[0]
  if (!blipFill) return ''
  const blip = childEl(blipFill, 'blip') ?? blipFill.getElementsByTagNameNS(A, 'blip')[0]
  if (!blip) return ''
  return blip.getAttributeNS(R, 'embed') || blip.getAttribute('r:embed') || ''
}

/** 图片在 Worker 里已按路径编码成 dataUrl，这里只解析 rels 目标并查表 */
export async function readImage(zip: PptxArchivePayload, slidePath: string, embed: string, rels: Map<string, ZipRel>): Promise<string> {
  const target = rels.get(embed)?.target
  if (!target) return ''
  const path = resolveTarget(slidePath, target)
  return zip.media[path] ?? ''
}

export async function pushPicture(
  host: Element,
  slide: CwPptSlide,
  space: Space,
  rels: Map<string, ZipRel>,
  zip: PptxArchivePayload,
  slidePath: string,
  slideCx: number,
  slideCy: number,
  embed: string,
  blipFill?: Element | null,
) {
  const xfrm = shapeXfrm(host)
  if (!xfrm || !embed) return
  const frame = frameOfBox(xfrm, space, slideCx, slideCy)
  const dataUrl = await readImage(zip, slidePath, embed, rels)
  if (!dataUrl) return
  const fill = blipFill ?? blipFillOn(host)
  const crop = readSrcRectCrop(fill)
  const z = slide.boxes.length + slide.images.length + (slide.lines?.length ?? 0)
  slide.images.push({ id: createId('image'), ...frame, dataUrl, crop, z })
}

export async function pushBackgroundBlip(
  slide: CwPptSlide,
  doc: Document,
  partPath: string,
  rels: Map<string, ZipRel>,
  zip: PptxArchivePayload,
) {
  const bg = doc.getElementsByTagNameNS(P, 'bg')[0]
  const bgPr = bg ? childEl(bg, 'bgPr') : null
  if (!bgPr || childEl(bgPr, 'noFill')) return
  const embed = blipEmbed(bgPr)
  if (!embed) return
  const dataUrl = await readImage(zip, partPath, embed, rels)
  if (!dataUrl) return
  // 须为非负 z：负 z-index 会落到幻灯片容器 background 之下而不可见
  const z = slide.images.length
  slide.images.push({ id: createId('image'), x: 0, y: 0, w: 1, h: 1, dataUrl, z })
}
