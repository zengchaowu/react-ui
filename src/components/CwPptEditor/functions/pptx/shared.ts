export const P = 'http://schemas.openxmlformats.org/presentationml/2006/main'
export const A = 'http://schemas.openxmlformats.org/drawingml/2006/main'
export const PIC = 'http://schemas.openxmlformats.org/drawingml/2006/picture'
export const TABLE_URI = 'http://schemas.openxmlformats.org/drawingml/2006/table'
export const PPT_FONT_FALLBACK = '"Microsoft YaHei", "PingFang SC", "Segoe UI", sans-serif'
export const R = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'
export const RELS = 'http://schemas.openxmlformats.org/package/2006/relationships'
export const EMU_CX = 12192000
export const EMU_CY = 6858000
/** OOXML：1pt = 12700 EMU */
export const EMU_PER_PT = 12700

export function slideSizePt(slideCx: number, slideCy: number) {
  return {
    width: Math.round(slideCx / EMU_PER_PT) || 960,
    height: Math.round(slideCy / EMU_PER_PT) || 540,
  }
}

export interface Space {
  x: number
  y: number
  sx: number
  sy: number
}

export interface ZipRel {
  target: string
  type: string
}

export interface ThemeFonts {
  majorLatin: string
  majorEa: string
  minorLatin: string
  minorEa: string
}

export interface ThemeColors {
  colors: Record<string, string>
  fonts: ThemeFonts
  /** theme fmtScheme fillStyleLst 子节点，用于 fillRef@idx */
  fillStyles: Element[]
  /** theme tblStyleLst，styleId → a:tblStyle */
  tableStyles: Map<string, Element>
}

export interface MasterTextStyles {
  title: (Element | null)[]
  body: (Element | null)[]
  other: (Element | null)[]
  /** presentation.xml defaultTextStyle lvl1–9 defRPr */
  presentation: (Element | null)[]
}

export const EMPTY_MASTER_STYLES: MasterTextStyles = { title: [], body: [], other: [], presentation: [] }
