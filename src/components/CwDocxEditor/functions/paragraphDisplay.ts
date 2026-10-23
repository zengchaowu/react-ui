import type { CwDocxInlineParagraph, CwDocxParagraph, CwDocxRun } from '../types'

/** twips → CSS px（96dpi，1440 twips = 1 inch）。 */
export function twipsToPx(twips: number) {
  return `${Math.round((twips * 96) / 1440)}px`
}

export function paragraphText(block: CwDocxInlineParagraph | CwDocxParagraph) {
  return block.runs.map((run) => run.text).join('')
}

export function paragraphLayoutStyle(block: CwDocxInlineParagraph | CwDocxParagraph): Record<string, string> {
  const style: Record<string, string> = {}
  if (block.align && block.align !== 'left') {
    style.textAlign = block.align === 'both' ? 'justify' : block.align
  }
  if (block.indentLeft) style.paddingLeft = twipsToPx(block.indentLeft)
  if (block.indentFirstLine) style.textIndent = twipsToPx(block.indentFirstLine)
  if (block.spaceBefore) style.marginTop = twipsToPx(block.spaceBefore)
  if (block.spaceAfter) style.marginBottom = twipsToPx(block.spaceAfter)
  if (block.line) {
    if (block.lineRule === 'exact' || block.lineRule === 'atLeast') {
      style.lineHeight = twipsToPx(block.line)
    } else {
      style.lineHeight = String(block.line / 240)
    }
  }
  return style
}

export function runLayoutStyle(run: CwDocxRun): Record<string, string> {
  const style: Record<string, string> = {}
  if (run.bold) style.fontWeight = '600'
  if (run.italic) style.fontStyle = 'italic'
  if (run.fontSize) style.fontSize = `${run.fontSize / 2}pt`
  return style
}
