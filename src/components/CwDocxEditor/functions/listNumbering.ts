import type { CwDocxBlock, CwDocxParagraph } from '../types'

type NumFormat = string

interface LevelDef {
  numFmt: NumFormat
  lvlText: string
  start: number
}

function parseXml(xml: string) {
  const doc = new DOMParser().parseFromString(xml, 'application/xml')
  if (doc.querySelector('parsererror')) return null
  return doc
}

const W = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'

function attr(el: Element | undefined, name: string) {
  if (!el) return ''
  return el.getAttributeNS(W, name) || el.getAttribute(`w:${name}`) || el.getAttribute(name) || ''
}

function buildNumberingMaps(xml: string) {
  const doc = parseXml(xml)
  if (!doc) return new Map<number, LevelDef[]>()

  const abstractLevels = new Map<string, LevelDef[]>()
  for (const abstractNum of doc.getElementsByTagNameNS(W, 'abstractNum')) {
    const abstractId = attr(abstractNum, 'abstractNumId')
    if (!abstractId) continue
    const levels: LevelDef[] = []
    for (const lvl of abstractNum.getElementsByTagNameNS(W, 'lvl')) {
      const ilvl = Number(attr(lvl, 'ilvl'))
      if (Number.isNaN(ilvl)) continue
      const numFmt = attr(lvl.getElementsByTagNameNS(W, 'numFmt')[0], 'val') || 'decimal'
      const lvlText = attr(lvl.getElementsByTagNameNS(W, 'lvlText')[0], 'val') || '%1.'
      const start = Number(attr(lvl.getElementsByTagNameNS(W, 'start')[0], 'val')) || 1
      levels[ilvl] = { numFmt, lvlText, start }
    }
    abstractLevels.set(abstractId, levels)
  }

  const numToAbstract = new Map<number, LevelDef[]>()
  for (const num of doc.getElementsByTagNameNS(W, 'num')) {
    const numId = Number(attr(num, 'numId'))
    const abstractId = attr(num.getElementsByTagNameNS(W, 'abstractNumId')[0], 'val')
    if (Number.isNaN(numId) || !abstractId) continue
    const levels = abstractLevels.get(abstractId)
    if (levels) numToAbstract.set(numId, levels)
  }
  return numToAbstract
}

function formatCounter(value: number, numFmt: NumFormat) {
  if (numFmt === 'decimal') return String(value)
  if (numFmt === 'lowerLetter') return String.fromCharCode(96 + value)
  if (numFmt === 'upperLetter') return String.fromCharCode(64 + value)
  if (numFmt === 'lowerRoman') return toRoman(value).toLowerCase()
  if (numFmt === 'upperRoman') return toRoman(value)
  if (numFmt === 'chineseCounting' || numFmt === 'chineseCountingThousand') return chineseCounting(value)
  return String(value)
}

function toRoman(value: number) {
  const pairs = [
    [1000, 'M'],
    [900, 'CM'],
    [500, 'D'],
    [400, 'CD'],
    [100, 'C'],
    [90, 'XC'],
    [50, 'L'],
    [40, 'XL'],
    [10, 'X'],
    [9, 'IX'],
    [5, 'V'],
    [4, 'IV'],
    [1, 'I'],
  ] as const
  let n = value
  let out = ''
  for (const [num, sym] of pairs) {
    while (n >= num) {
      out += sym
      n -= num
    }
  }
  return out
}

const CHINESE_DIGITS = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九']

function chineseCounting(value: number) {
  if (value <= 0) return String(value)
  if (value < 10) return CHINESE_DIGITS[value]
  if (value === 10) return '十'
  if (value < 20) return `十${CHINESE_DIGITS[value - 10]}`
  if (value < 100) {
    const tens = Math.floor(value / 10)
    const ones = value % 10
    return `${CHINESE_DIGITS[tens]}十${ones ? CHINESE_DIGITS[ones] : ''}`
  }
  return String(value)
}

function renderLabel(template: string, levels: number[], defs: LevelDef[]) {
  return template.replace(/%(\d+)/g, (_, levelIndex: string) => {
    const ilvl = Number(levelIndex) - 1
    const def = defs[ilvl]
    const counter = levels[ilvl] ?? def?.start ?? 1
    return formatCounter(counter, def?.numFmt || 'decimal')
  })
}

/** 按文档顺序为带 numPr 的段落计算列表前缀。 */
export function listLabelsForBlocks(blocks: CwDocxBlock[], numberingXml?: string) {
  const labels = new Map<string, string>()
  if (!numberingXml) return labels

  const defsByNum = buildNumberingMaps(numberingXml)
  const counters = new Map<number, number[]>()

  for (const block of blocks) {
    if (block.kind !== 'paragraph') continue
    const para = block as CwDocxParagraph
    if (para.numId == null || para.ilvl == null) continue
    const defs = defsByNum.get(para.numId)
    if (!defs) continue

    const levels = counters.get(para.numId) || defs.map((def) => def.start - 1)
    const ilvl = para.ilvl
    levels[ilvl] = (levels[ilvl] ?? defs[ilvl]?.start - 1) + 1
    for (let index = ilvl + 1; index < levels.length; index += 1) levels[index] = defs[index]?.start - 1
    counters.set(para.numId, levels)

    const def = defs[ilvl]
    if (!def) continue
    const label = renderLabel(def.lvlText, levels, defs)
    labels.set(para.id, label)
  }

  return labels
}
