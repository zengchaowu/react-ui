import type {
  CwPptAlign,
  CwPptBorderSide,
  CwPptCellBorders,
  CwPptSlide,
  CwPptTextPadding,
} from '../../types'
import { tokenSolidColors } from '../../../../assets/tokens/tokenSolidColors'
import { A, EMU_PER_PT, type MasterTextStyles, type Space, type ThemeColors } from './shared'
import { childEl, shapeXfrm, spPrHasNoFill } from './xml'
import { frameOfBox } from './geometry'
import { paintColorWithAlpha } from './color'
import type { defaultClrMap } from './color'
import { mapAlgn, shapeParagraphsFromTxBody } from './text'
import { lnDashStyle } from './shapeGeom'
import { createId } from './model'

export function tcFill(tc: Element, theme: ThemeColors, clrMap: ReturnType<typeof defaultClrMap>) {
  const tcPr = childEl(tc, 'tcPr')
  if (!tcPr || spPrHasNoFill(tcPr)) return { fill: '', fillOpacity: undefined }
  const solid = childEl(tcPr, 'solidFill')
  const painted = solid ? paintColorWithAlpha(solid, theme, clrMap) : paintColorWithAlpha(tcPr, theme, clrMap)
  if (!painted) return { fill: '', fillOpacity: undefined }
  return {
    fill: painted.color,
    fillOpacity: painted.opacity < 0.999 ? painted.opacity : undefined,
  }
}

export function tcPadding(tc: Element, slideCx: number, slideCy: number): CwPptTextPadding | undefined {
  const tcPr = childEl(tc, 'tcPr')
  if (!tcPr) return undefined
  const marL = Number(tcPr.getAttribute('marL') || 0)
  const marR = Number(tcPr.getAttribute('marR') || 0)
  const marT = Number(tcPr.getAttribute('marT') || 0)
  const marB = Number(tcPr.getAttribute('marB') || 0)
  if (!marL && !marR && !marT && !marB) return undefined
  return {
    left: marL / slideCx,
    right: marR / slideCx,
    top: marT / slideCy,
    bottom: marB / slideCy,
  }
}

export function lnBorderSide(
  ln: Element | null,
  theme: ThemeColors,
  clrMap: ReturnType<typeof defaultClrMap>,
  defaultWidthEmu = EMU_PER_PT,
): CwPptBorderSide | null {
  if (!ln || childEl(ln, 'noFill')) return null
  const painted = paintColorWithAlpha(ln, theme, clrMap)
  if (!painted) return null
  const widthPt = Math.max(0.25, Number(ln.getAttribute('w') || defaultWidthEmu) / EMU_PER_PT)
  return {
    color: painted.color,
    widthPt,
    opacity: painted.opacity < 0.999 ? painted.opacity : undefined,
    dash: lnDashStyle(ln),
  }
}

export function tcBdrRaw(tcBdr: Element, theme: ThemeColors, clrMap: ReturnType<typeof defaultClrMap>) {
  const raw: Record<string, CwPptBorderSide | undefined> = {}
  for (const key of ['left', 'right', 'top', 'bottom', 'insideH', 'insideV']) {
    const wrapper = childEl(tcBdr, key)
    if (!wrapper) continue
    const ln = childEl(wrapper, 'ln') || (wrapper.localName === 'ln' ? wrapper : null)
    const side = lnBorderSide(ln, theme, clrMap, 9525)
    if (side) raw[key] = side
  }
  return raw
}

export function tcBdrForCellPosition(
  raw: Record<string, CwPptBorderSide | undefined>,
  rowIndex: number,
  colIndex: number,
  rowCount: number,
  colCount: number,
): CwPptCellBorders {
  const top = rowIndex === 0 ? raw.top : raw.insideH
  const bottom = rowIndex === rowCount - 1 ? raw.bottom : raw.insideH
  const left = colIndex === 0 ? raw.left : raw.insideV
  const right = colIndex === colCount - 1 ? raw.right : raw.insideV
  const borders: CwPptCellBorders = {}
  if (top) borders.top = top
  if (right) borders.right = right
  if (bottom) borders.bottom = bottom
  if (left) borders.left = left
  return borders
}

export function mergeCellBorders(base: CwPptCellBorders, overlay: CwPptCellBorders): CwPptCellBorders {
  return {
    top: overlay.top ?? base.top,
    right: overlay.right ?? base.right,
    bottom: overlay.bottom ?? base.bottom,
    left: overlay.left ?? base.left,
  }
}

/** 相邻单元格共享的 inside 线只画一次，避免双边框叠成粗线 */
export function collapseTableCellBorders(
  borders: CwPptCellBorders,
  rowIndex: number,
  colIndex: number,
  span: number,
  rowCount: number,
): CwPptCellBorders {
  const out: CwPptCellBorders = {}
  if (borders.top) out.top = borders.top
  if (rowIndex === rowCount - 1 && borders.bottom) out.bottom = borders.bottom
  if (colIndex === 0 && borders.left) out.left = borders.left
  if (borders.right) out.right = borders.right
  return out
}

export function bordersFromStylePart(
  part: Element | null,
  theme: ThemeColors,
  clrMap: ReturnType<typeof defaultClrMap>,
  rowIndex: number,
  colIndex: number,
  rowCount: number,
  colCount: number,
): CwPptCellBorders {
  if (!part) return {}
  const tcStyle = childEl(part, 'tcStyle')
  const tcBdr = tcStyle ? childEl(tcStyle, 'tcBdr') : null
  if (!tcBdr) return {}
  return tcBdrForCellPosition(tcBdrRaw(tcBdr, theme, clrMap), rowIndex, colIndex, rowCount, colCount)
}

export function tableStyleParts(
  tbl: Element,
  styleRoot: Element,
  rowIndex: number,
  colIndex: number,
  rowCount: number,
  colCount: number,
) {
  const tblPr = childEl(tbl, 'tblPr')
  const firstRow = tblPr?.getAttribute('firstRow') === '1'
  const lastRow = tblPr?.getAttribute('lastRow') === '1'
  const firstCol = tblPr?.getAttribute('firstCol') === '1'
  const lastCol = tblPr?.getAttribute('lastCol') === '1'
  const bandRow = tblPr?.getAttribute('bandRow') === '1'
  const bandCol = tblPr?.getAttribute('bandCol') === '1'
  const parts: Element[] = []
  const whole = childEl(styleRoot, 'wholeTbl')
  if (whole) parts.push(whole)
  if (bandRow && rowIndex > 0) {
    const band = rowIndex % 2 === 1 ? childEl(styleRoot, 'band1H') : childEl(styleRoot, 'band2H')
    if (band) parts.push(band)
  }
  if (bandCol && colIndex > 0) {
    const band = colIndex % 2 === 1 ? childEl(styleRoot, 'band1V') : childEl(styleRoot, 'band2V')
    if (band) parts.push(band)
  }
  if (firstRow && rowIndex === 0) {
    const part = childEl(styleRoot, 'firstRow')
    if (part) parts.push(part)
  }
  if (lastRow && rowIndex === rowCount - 1) {
    const part = childEl(styleRoot, 'lastRow')
    if (part) parts.push(part)
  }
  if (firstCol && colIndex === 0) {
    const part = childEl(styleRoot, 'firstCol')
    if (part) parts.push(part)
  }
  if (lastCol && colIndex === colCount - 1) {
    const part = childEl(styleRoot, 'lastCol')
    if (part) parts.push(part)
  }
  const corner =
    rowIndex === 0 && colIndex === 0
      ? 'nwCell'
      : rowIndex === 0 && colIndex === colCount - 1
        ? 'neCell'
        : rowIndex === rowCount - 1 && colIndex === 0
          ? 'swCell'
          : rowIndex === rowCount - 1 && colIndex === colCount - 1
            ? 'seCell'
            : ''
  if (corner) {
    const part = childEl(styleRoot, corner)
    if (part) parts.push(part)
  }
  return parts
}

export function alignFromTableStylePart(part: Element | null): CwPptAlign | undefined {
  if (!part) return undefined
  let tcTx = childEl(part, 'tcTxStyle')
  if (!tcTx) {
    const tcStyle = childEl(part, 'tcStyle')
    tcTx = tcStyle ? childEl(tcStyle, 'tcTxStyle') : null
  }
  if (!tcTx) return undefined
  const fromPPr = mapAlgn(childEl(tcTx, 'pPr')?.getAttribute('algn'))
  if (fromPPr) return fromPPr
  return undefined
}

export function resolveTableStyleAlign(
  tbl: Element,
  theme: ThemeColors,
  rowIndex: number,
  colIndex: number,
  rowCount: number,
  colCount: number,
): CwPptAlign | undefined {
  const tblPr = childEl(tbl, 'tblPr')
  const styleId = childEl(tblPr, 'tableStyleId')?.textContent?.trim()
  if (!styleId) return undefined
  const styleRoot = theme.tableStyles.get(styleId)
  if (!styleRoot) return undefined
  let align: CwPptAlign | undefined
  for (const part of tableStyleParts(tbl, styleRoot, rowIndex, colIndex, rowCount, colCount)) {
    const next = alignFromTableStylePart(part)
    if (next) align = next
  }
  return align
}

export function readTcTextMeta(tc: Element, slideCx: number, slideCy: number) {
  const txBody = childEl(tc, 'txBody')
  const bodyPr = txBody ? childEl(txBody, 'bodyPr') : null
  const tcPr = childEl(tc, 'tcPr')
  let padding = tcPadding(tc, slideCx, slideCy)
  if (bodyPr) {
    const fromBody: CwPptTextPadding = {
      left: Number(bodyPr.getAttribute('lIns') || 0) / slideCx,
      right: Number(bodyPr.getAttribute('rIns') || 0) / slideCx,
      top: Number(bodyPr.getAttribute('tIns') || 0) / slideCy,
      bottom: Number(bodyPr.getAttribute('bIns') || 0) / slideCy,
    }
    if (fromBody.left || fromBody.right || fromBody.top || fromBody.bottom) {
      padding = padding
        ? {
            left: padding.left || fromBody.left,
            right: padding.right || fromBody.right,
            top: padding.top || fromBody.top,
            bottom: padding.bottom || fromBody.bottom,
          }
        : fromBody
    }
  }
  const anchor = tcPr?.getAttribute('anchor') || bodyPr?.getAttribute('anchor') || 't'
  const vAnchor = anchor === 'ctr' ? 'center' : anchor === 'b' ? 'bottom' : 'top'
  return { padding, vAnchor: vAnchor as 'top' | 'center' | 'bottom' }
}

export function resolveTableStyleBorders(
  tbl: Element,
  theme: ThemeColors,
  clrMap: ReturnType<typeof defaultClrMap>,
  rowIndex: number,
  colIndex: number,
  rowCount: number,
  colCount: number,
): CwPptCellBorders {
  const tblPr = childEl(tbl, 'tblPr')
  const styleId = childEl(tblPr, 'tableStyleId')?.textContent?.trim()
  if (!styleId) return {}
  const styleRoot = theme.tableStyles.get(styleId)
  if (!styleRoot) return {}
  let merged: CwPptCellBorders = {}
  for (const part of tableStyleParts(tbl, styleRoot, rowIndex, colIndex, rowCount, colCount)) {
    merged = mergeCellBorders(
      merged,
      bordersFromStylePart(part, theme, clrMap, rowIndex, colIndex, rowCount, colCount),
    )
  }
  return merged
}

export function tcPrDirectBorders(
  tcPr: Element | null,
  theme: ThemeColors,
  clrMap: ReturnType<typeof defaultClrMap>,
): CwPptCellBorders {
  if (!tcPr) return {}
  const borders: CwPptCellBorders = {}
  const direct: Record<keyof CwPptCellBorders, string> = {
    left: 'lnL',
    right: 'lnR',
    top: 'lnT',
    bottom: 'lnB',
  }
  const tableBorderDefault = 9525
  for (const [side, tag] of Object.entries(direct) as [keyof CwPptCellBorders, string][]) {
    const painted = lnBorderSide(childEl(tcPr, tag), theme, clrMap, tableBorderDefault)
    if (painted) borders[side] = painted
  }
  const tcBdr = childEl(tcPr, 'tcBdr')
  if (tcBdr) {
    for (const [side, tag] of Object.entries(direct) as [keyof CwPptCellBorders, string][]) {
      const wrapper = childEl(tcBdr, tag)
      if (!wrapper) continue
      const painted = lnBorderSide(childEl(wrapper, 'ln') || wrapper, theme, clrMap, tableBorderDefault)
      if (painted) borders[side] = painted
    }
  }
  return borders
}

export function cellHasBorders(borders: CwPptCellBorders) {
  return Boolean(borders.top || borders.right || borders.bottom || borders.left)
}

export function walkTable(
  frameHost: Element,
  graphicData: Element,
  space: Space,
  slide: CwPptSlide,
  slideCx: number,
  slideCy: number,
  theme: ThemeColors,
  clrMap: ReturnType<typeof defaultClrMap>,
  masterStyles: MasterTextStyles,
) {
  const tbl = graphicData.getElementsByTagNameNS(A, 'tbl')[0]
  if (!tbl) return
  const xfrm = shapeXfrm(frameHost)
  if (!xfrm) return
  const tableFrame = frameOfBox(xfrm, space, slideCx, slideCy)
  const colWidths = [...tbl.getElementsByTagNameNS(A, 'gridCol')].map((col) => Number(col.getAttribute('w') || 0))
  const totalW = colWidths.reduce((sum, width) => sum + width, 0) || slideCx
  const rows = [...tbl.getElementsByTagNameNS(A, 'tr')]
  const rowHeights = rows.map((tr) => Number(tr.getAttribute('h') || 0))
  const totalH = rowHeights.reduce((sum, height) => sum + height, 0) || slideCy
  const rowCount = rows.length
  const colCount = colWidths.length
  let rowTop = 0
  for (const [rowIndex, tr] of rows.entries()) {
    const rowH = rowHeights[rowIndex] || 0
    let colLeft = 0
    let colIndex = 0
    for (const tc of [...tr.children].filter((child) => child.localName === 'tc')) {
      const tcPr = childEl(tc, 'tcPr')
      if (tcPr && childEl(tcPr, 'hMerge')) continue
      const span = Number(childEl(tcPr, 'gridSpan')?.getAttribute('val') || 1)
      let cellW = 0
      for (let i = 0; i < span; i += 1) cellW += colWidths[colIndex + i] || 0
      if (tcPr && childEl(tcPr, 'vMerge')) {
        colIndex += span
        colLeft += cellW
        continue
      }
      const txBody = childEl(tc, 'txBody')
      const tableStyleAlign = resolveTableStyleAlign(tbl, theme, rowIndex, colIndex, rowCount, colCount)
      const tcMeta = readTcTextMeta(tc, slideCx, slideCy)
      const paragraphs = txBody
        ? shapeParagraphsFromTxBody(txBody, theme, clrMap, masterStyles, null, tokenSolidColors.docInk, tableStyleAlign)
        : []
      const text = paragraphs.map((paragraph) => paragraph.text).join('\n')
      const { fill, fillOpacity } = tcFill(tc, theme, clrMap)
      const styleBorders = resolveTableStyleBorders(tbl, theme, clrMap, rowIndex, colIndex, rowCount, colCount)
      const merged = mergeCellBorders(styleBorders, tcPrDirectBorders(tcPr, theme, clrMap))
      const borders = collapseTableCellBorders(merged, rowIndex, colIndex, span, rowCount)
      if (!text.trim() && !fill && !cellHasBorders(borders)) {
        colIndex += span
        colLeft += cellW
        continue
      }
      const z = slide.boxes.length + slide.images.length + (slide.lines?.length ?? 0)
      slide.boxes.push({
        id: createId('box'),
        x: tableFrame.x + (colLeft / totalW) * tableFrame.w,
        y: tableFrame.y + (rowTop / totalH) * tableFrame.h,
        w: (cellW / totalW) * tableFrame.w,
        h: (rowH / totalH) * tableFrame.h,
        text,
        fontSize: paragraphs[0]?.fontSize || 18,
        color: paragraphs[0]?.color || tokenSolidColors.docInk,
        fill,
        fillOpacity,
        borders: cellHasBorders(borders) ? borders : undefined,
        align: paragraphs[0]?.align || tableStyleAlign || 'left',
        padding: tcMeta.padding,
        vAnchor: tcMeta.vAnchor,
        paragraphs: paragraphs.length ? paragraphs : undefined,
        bold: paragraphs[0]?.bold,
        fontFamily: paragraphs[0]?.fontFamily,
        z,
      })
      colIndex += span
      colLeft += cellW
    }
    rowTop += rowH
  }
}
