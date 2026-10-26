import type { CwPptDeck, CwPptSlide } from '../../types'
import { tokenSolidColors } from '../../../../assets/tokens/tokenSolidColors'
import { custGeomPolyline100, isAxisAlignedStrokeBox } from '../connectorGeometry'
import type { PptxArchivePayload } from '../archiveEntries'
import {
  A,
  EMU_CX,
  EMU_CY,
  P,
  PIC,
  R,
  TABLE_URI,
  type MasterTextStyles,
  type Space,
  type ThemeColors,
  type ZipRel,
} from './shared'
import { childEl, parseXml, readRels, relByType, resolveTarget, shapeXfrm, spPrHasNoFill } from './xml'
import { enterGroup, frameOfBox, frameOfLine, frameRaw } from './geometry'
import { blankSlide, createId, slideSizePt } from './model'
import {
  defaultClrMap,
  loadTheme,
  paintColorWithAlpha,
  readBackground,
  readClrMap,
  readClrOverride,
  readMasterTextStyles,
  readPresentationTextStyles,
  resolveShapeFill,
} from './color'
import { readTextBodyMeta, shapeText, textAlign, textColor } from './text'
import { walkTable } from './table'
import {
  barFillPaint,
  connectorStrokePaint,
  isConnectorShape,
  isLineLike,
  isPlaceholder,
  isThinBar,
  normalizeSlideStacking,
  pushAxisAlignedStrokeLine,
  pushConnectorLine,
  pushThinBarBox,
  shapeBorderFields,
  shapeStroke,
} from './shapes'
import { boxGeomFromSp, lineGeomPreset, lnDashStyle, presetName, xfrmFlip, xfrmRotDeg } from './shapeGeom'
import { blipEmbed, blipFillOn, pushBackgroundBlip, pushPicture, readImage, readSrcRectCrop } from './images'
import { collectUsedFontFamilies, readEmbeddedFonts } from './fonts'
import { loadPptxArchive } from './unzip'

export async function walk(
  container: Element,
  space: Space,
  slide: CwPptSlide,
  rels: Map<string, ZipRel>,
  zip: PptxArchivePayload,
  slidePath: string,
  slideCx: number,
  slideCy: number,
  theme: ThemeColors,
  clrMap: ReturnType<typeof defaultClrMap>,
  includePlaceholders: boolean,
  masterStyles: MasterTextStyles,
) {
  for (const child of [...container.children]) {
    if (child.localName === 'AlternateContent') {
      const content =
        [...child.children].find((node) => node.localName === 'Choice') ||
        [...child.children].find((node) => node.localName === 'Fallback')
      if (content) {
        await walk(content, space, slide, rels, zip, slidePath, slideCx, slideCy, theme, clrMap, includePlaceholders, masterStyles)
      }
      continue
    }
    if (child.localName === 'grpSp') {
      const xfrm = shapeXfrm(child)
      await walk(child, xfrm ? enterGroup(space, xfrm) : space, slide, rels, zip, slidePath, slideCx, slideCy, theme, clrMap, includePlaceholders, masterStyles)
      continue
    }
    if (child.localName === 'graphicFrame') {
      const graphicData = child.getElementsByTagNameNS(A, 'graphicData')[0]
      const uri = graphicData?.getAttribute('uri') || ''
      if (graphicData && uri === TABLE_URI) {
        walkTable(child, graphicData, space, slide, slideCx, slideCy, theme, clrMap, masterStyles)
        continue
      }
      const pic = child.getElementsByTagNameNS(PIC, 'pic')[0]
      if (pic) {
        const fill = blipFillOn(pic)
        const embed = blipEmbed(fill)
        await pushPicture(child, slide, space, rels, zip, slidePath, slideCx, slideCy, embed, fill)
      }
      continue
    }
    if (child.localName !== 'sp' && child.localName !== 'pic' && child.localName !== 'cxnSp') continue
    const xfrm = shapeXfrm(child)
    if (!xfrm) continue
    const rawFrame = frameRaw(xfrm, space, slideCx, slideCy)
    const frame = frameOfBox(xfrm, space, slideCx, slideCy)
    const z = slide.boxes.length + slide.images.length + (slide.lines?.length ?? 0)
    if (child.localName === 'sp' || child.localName === 'cxnSp') {
      if (child.localName === 'sp' && !includePlaceholders && isPlaceholder(child)) continue
      const spPr = childEl(child, 'spPr')
      const pictureEmbed = blipEmbed(spPr)
      const text = shapeText(child, theme, clrMap, masterStyles)
      const { fill, fillOpacity } = resolveShapeFill(child, theme, clrMap)
      const stroke =
        shapeStroke(child, theme, clrMap) ||
        (isLineLike(child, rawFrame) && !text?.text.trim() ? { color: tokenSolidColors.docInk, widthPt: 1 } : null)
      const custPoly = custGeomPolyline100(spPr)
      if (isConnectorShape(child, Boolean(text?.text.trim()), rawFrame)) {
        const lineStroke = connectorStrokePaint(child, theme, clrMap, stroke, fill, fillOpacity)
        pushConnectorLine(
          slide,
          child,
          xfrm,
          space,
          slideCx,
          slideCy,
          lineStroke,
          z,
          custPoly,
        )
        continue
      }
      if (isLineLike(child, rawFrame) && !text?.text.trim()) {
        if (lineGeomPreset(child) && stroke && isAxisAlignedStrokeBox(rawFrame)) {
          pushAxisAlignedStrokeLine(slide, child, xfrm, space, slideCx, slideCy, stroke, z)
          continue
        }
        const bar = barFillPaint(child, theme, clrMap, fill, fillOpacity, stroke)
        if (bar) {
          pushThinBarBox(slide, frame, bar.fill, bar.fillOpacity, z)
          continue
        }
        if (stroke) {
          const flip = xfrmFlip(xfrm)
          const rot = xfrmRotDeg(xfrm)
          const solid = childEl(spPr ?? null, 'solidFill')
          const solidPaint = solid && spPr && !spPrHasNoFill(spPr)
            ? paintColorWithAlpha(solid, theme, clrMap, child)
            : null
          slide.lines.push({
            id: createId('line'),
            ...frameOfLine(xfrm, space, slideCx, slideCy),
            color: lineGeomPreset(child) ? stroke.color : solidPaint?.color || stroke.color,
            widthPt: stroke.widthPt,
            strokeOpacity: solidPaint?.opacity ?? stroke.strokeOpacity,
            flipH: flip.flipH,
            flipV: flip.flipV,
            rot: rot || undefined,
            z,
          })
          continue
        }
      }
      if (!isLineLike(child, rawFrame) && isThinBar(rawFrame) && !text?.text.trim()) {
        const bar = barFillPaint(child, theme, clrMap, fill, fillOpacity, stroke)
        if (bar) {
          pushThinBarBox(slide, frame, bar.fill, bar.fillOpacity, z)
          continue
        }
      }
      if (pictureEmbed && !text?.text.trim()) {
        const dataUrl = await readImage(zip, slidePath, pictureEmbed, rels)
        if (dataUrl) {
          const fill = blipFillOn(spPr ?? child)
          slide.images.push({
            id: createId('image'),
            ...frame,
            dataUrl,
            crop: readSrcRectCrop(fill),
            z,
          })
        }
        continue
      }
      const outlinePreset = presetName(child)
      const outlineGeom =
        outlinePreset === 'rect' ||
        outlinePreset === 'ellipse' ||
        outlinePreset === 'roundRect' ||
        outlinePreset === 'hexagon'
      if (
        !text?.text.trim() &&
        !fill &&
        stroke &&
        spPr &&
        spPrHasNoFill(spPr) &&
        outlineGeom &&
        !isLineLike(child, rawFrame) &&
        !isThinBar(rawFrame)
      ) {
        const ln = childEl(spPr, 'ln')
        const outlineRot = xfrmRotDeg(xfrm)
        slide.boxes.push({
          id: createId('box'),
          ...frame,
          text: '',
          fontSize: 18,
          color: tokenSolidColors.docInk,
          fill: '',
          ...boxGeomFromSp(child),
          borderColor: stroke.color,
          borderWidthPt: stroke.widthPt,
          borderOpacity: stroke.strokeOpacity,
          borderDash: lnDashStyle(ln),
          align: 'left',
          rot: outlineRot || undefined,
          z,
        })
        continue
      }
      if (!text?.text.trim() && !fill) continue
      const bodyMeta = readTextBodyMeta(child, slideCx, slideCy)
      const shapeRot = xfrmRotDeg(xfrm)
      slide.boxes.push({
        id: createId('box'),
        ...frame,
        text: text?.text || '',
        fontSize: text?.fontSize || 18,
        color: text?.paragraphs?.[0]?.color || textColor(child, theme, clrMap, masterStyles),
        fill,
        fillOpacity,
        ...boxGeomFromSp(child),
        ...shapeBorderFields(child, theme, clrMap, stroke),
        align: text?.paragraphs?.[0]?.align || textAlign(child),
        textFit: bodyMeta.textFit,
        padding: bodyMeta.padding,
        vAnchor: bodyMeta.vAnchor,
        paragraphs: text?.paragraphs,
        bold: text?.paragraphs?.[0]?.bold,
        fontFamily: text?.paragraphs?.[0]?.fontFamily,
        rot: shapeRot || undefined,
        z,
      })
    } else {
      const fill = blipFillOn(child)
      const embed = blipEmbed(fill)
      await pushPicture(child, slide, space, rels, zip, slidePath, slideCx, slideCy, embed, fill)
    }
  }
}

export async function parsePptx(buffer: ArrayBuffer): Promise<CwPptDeck> {
  // 解压（pako）+ 图片 base64 都在 Worker 里完成，主线程只做 XML 解析和建 deck
  const zip = await loadPptxArchive(buffer)
  const presentation = zip.text['ppt/presentation.xml']
  const presRelsXml = zip.text['ppt/_rels/presentation.xml.rels']
  if (!presentation || !presRelsXml) throw new Error('pptx')
  const pres = parseXml(presentation)
  const presRels = readRels(presRelsXml)
  const theme = await loadTheme(zip)
  const size = pres.getElementsByTagNameNS(P, 'sldSz')[0]
  const slideCx = Number(size?.getAttribute('cx') || EMU_CX)
  const slideCy = Number(size?.getAttribute('cy') || EMU_CY)
  const slides: CwPptSlide[] = []
  const slideIds = [...pres.getElementsByTagNameNS(P, 'sldId')]
  const space = { x: 0, y: 0, sx: 1, sy: 1 }
  const presentationDefLevels = readPresentationTextStyles(pres)
  for (const [index, slideId] of slideIds.entries()) {
    const relId = slideId.getAttributeNS(R, 'id') || slideId.getAttribute('r:id') || ''
    const target = presRels.get(relId)?.target
    if (!target) continue
    const slidePath = resolveTarget('ppt/presentation.xml', target)
    const xml = zip.text[slidePath]
    if (!xml) continue
    const relsXml = zip.text[slidePath.replace(/([^/]+)$/, '_rels/$1.rels')]
    const rels = relsXml ? readRels(relsXml) : new Map<string, ZipRel>()
    const doc = parseXml(xml)
    const cSld = doc.getElementsByTagNameNS(P, 'cSld')[0]
    const slide: CwPptSlide = {
      name: cSld?.getAttribute('name') || `幻灯片 ${index + 1}`,
      background: tokenSolidColors.white,
      boxes: [],
      images: [],
      lines: [],
    }
    const showLayout = doc.documentElement.getAttribute('showMasterSp') !== '0'
    const layoutTarget = relByType(rels, 'slideLayout')
    const layoutPath = layoutTarget ? resolveTarget(slidePath, layoutTarget) : ''
    const layoutXml = layoutPath ? zip.text[layoutPath] : ''
    const layoutDoc = layoutXml ? parseXml(layoutXml) : null
    const layoutRelsXml = layoutPath ? zip.text[layoutPath.replace(/([^/]+)$/, '_rels/$1.rels')] : ''
    const layoutRels = layoutRelsXml ? readRels(layoutRelsXml) : new Map<string, ZipRel>()
    const masterTarget = relByType(layoutRels, 'slideMaster')
    const masterPath = masterTarget && layoutPath ? resolveTarget(layoutPath, masterTarget) : ''
    const masterXml = masterPath ? zip.text[masterPath] : ''
    const masterDoc = masterXml ? parseXml(masterXml) : null
    const showMaster = showLayout && layoutDoc?.documentElement.getAttribute('showMasterSp') !== '0'
    const masterStyles = readMasterTextStyles(masterDoc)
    masterStyles.presentation = presentationDefLevels
    let clrMap = masterDoc ? readClrMap(masterDoc) : defaultClrMap()
    clrMap = readClrOverride(doc, clrMap)
    if (masterDoc) slide.background = readBackground(masterDoc, theme, clrMap, slide.background)
    if (layoutDoc) slide.background = readBackground(layoutDoc, theme, clrMap, slide.background)
    slide.background = readBackground(doc, theme, clrMap, slide.background)
    let masterRels = new Map<string, ZipRel>()
    if (showMaster && masterDoc && masterPath) {
      const masterRelsXml = zip.text[masterPath.replace(/([^/]+)$/, '_rels/$1.rels')]
      masterRels = masterRelsXml ? readRels(masterRelsXml) : new Map<string, ZipRel>()
      await pushBackgroundBlip(slide, masterDoc, masterPath, masterRels, zip)
    }
    if (showLayout && layoutDoc && layoutPath) {
      await pushBackgroundBlip(slide, layoutDoc, layoutPath, layoutRels, zip)
    }
    await pushBackgroundBlip(slide, doc, slidePath, rels, zip)
    if (showMaster && masterDoc && masterPath) {
      const masterTree = masterDoc.getElementsByTagNameNS(P, 'spTree')[0]
      if (masterTree) await walk(masterTree, space, slide, masterRels, zip, masterPath, slideCx, slideCy, theme, clrMap, false, masterStyles)
    }
    if (showLayout && layoutDoc && layoutPath) {
      const layoutTree = layoutDoc.getElementsByTagNameNS(P, 'spTree')[0]
      if (layoutTree) await walk(layoutTree, space, slide, layoutRels, zip, layoutPath, slideCx, slideCy, theme, clrMap, false, masterStyles)
    }
    const spTree = doc.getElementsByTagNameNS(P, 'spTree')[0]
    if (spTree) await walk(spTree, space, slide, rels, zip, slidePath, slideCx, slideCy, theme, clrMap, true, masterStyles)
    normalizeSlideStacking(slide)
    slides.push(slide)
  }
  const sizePt = slideSizePt(slideCx, slideCy)
  const fonts = await readEmbeddedFonts(zip, pres, presRels, collectUsedFontFamilies(slides))
  const result: CwPptDeck = {
    width: sizePt.width,
    height: sizePt.height,
    slideCx,
    slideCy,
    slides: slides.length ? slides : [blankSlide(1)],
    fonts: fonts.length ? fonts : undefined,
  }
  logDeckFontUsage(result)
  return result
}

/** 诊断日志：列出文稿中实际会应用到 CSS 的字体栈及出现次数 */
export function logDeckFontUsage(deck: CwPptDeck) {
  const usage = new Map<string, number>()
  const bump = (value?: string) => {
    if (!value) return
    usage.set(value, (usage.get(value) ?? 0) + 1)
  }
  for (const slide of deck.slides) {
    for (const box of slide.boxes) {
      bump(box.fontFamily)
      for (const para of box.paragraphs ?? []) {
        bump(para.fontFamily)
        for (const run of para.runs ?? []) bump(run.fontFamily)
      }
    }
  }
  const rows = [...usage.entries()].sort((a, b) => b[1] - a[1]).map(([stack, count]) => `${count}× ${stack}`)
  console.log(`[CwPptEditor] 文稿共 ${deck.slides.length} 页，实际用到的字体栈：\n  ${rows.join('\n  ')}`)
}
