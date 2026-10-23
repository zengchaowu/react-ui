import type { CwDocxRun } from '../types'

function readRunFromElement(el: HTMLElement): CwDocxRun | null {
  const text = el.textContent || ''
  if (!text) return null
  const bold =
    el.style.fontWeight === 'bold'
    || el.style.fontWeight === '600'
    || el.style.fontWeight === '700'
    || Number(el.style.fontWeight) >= 600
  const italic = el.style.fontStyle === 'italic'
  const fontSizeMatch = /^([\d.]+)pt$/.exec(el.style.fontSize)
  const fontSize = fontSizeMatch ? Math.round(Number(fontSizeMatch[1]) * 2) : undefined
  return {
    text,
    bold: bold || undefined,
    italic: italic || undefined,
    fontSize,
  }
}

/** 从 contenteditable 段落根节点还原 run 列表（依赖 span 上的 inline style）。 */
export function runsFromEditableRoot(root: HTMLElement): CwDocxRun[] {
  const runs: CwDocxRun[] = []
  for (const node of root.childNodes) {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent || ''
      if (text) runs.push({ text })
      continue
    }
    if (!(node instanceof HTMLElement)) continue
    const run = readRunFromElement(node)
    if (run) runs.push(run)
  }
  if (!runs.length) runs.push({ text: '' })
  return runs
}
