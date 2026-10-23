const BLOCK_TAGS = new Set([
  'ADDRESS',
  'ARTICLE',
  'ASIDE',
  'BLOCKQUOTE',
  'DIV',
  'DL',
  'FIELDSET',
  'FIGCAPTION',
  'FIGURE',
  'FOOTER',
  'FORM',
  'H1',
  'H2',
  'H3',
  'H4',
  'H5',
  'H6',
  'HEADER',
  'HR',
  'LI',
  'MAIN',
  'NAV',
  'OL',
  'P',
  'PRE',
  'SECTION',
  'TABLE',
  'UL',
])

/** 外部 v-model 写入：去掉仅由尾部换行符产生的空行 */
export function splitComposerPlainText(value: string): string[] {
  const lines = value.replace(/\r\n/g, '\n').split('\n')
  while (lines.length > 1 && lines[lines.length - 1] === '') {
    lines.pop()
  }
  return lines
}

/** 粘贴纯文本：去掉 clipboard 尾部多余换行，避免插入幽灵空行 */
export function normalizeComposerPastePlainText(text: string): string {
  return text.replace(/\r\n/g, '\n').replace(/\n+$/, '')
}

export function escapeComposerHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

/** 纯文本 → contentEditable 内部 HTML（每行一个 paragraph，空行为 `<br>` 占位） */
export function buildComposerHtmlFromPlainText(text: string): string {
  const lines = splitComposerPlainText(text)
  if (lines.length === 0 || (lines.length === 1 && lines[0] === '')) {
    return '<p><br></p>'
  }
  return lines
    .map((line) => `<p>${line ? escapeComposerHtml(line) : '<br>'}</p>`)
    .join('')
}

function extractNodeText(node: Node): string {
  let out = ''
  node.childNodes.forEach((child) => {
    if (child.nodeType === 3) {
      out += child.textContent ?? ''
      return
    }
    if (child.nodeType !== 1) return
    const el = child as HTMLElement
    if (el.tagName === 'BR') {
      out += '\n'
      return
    }
    const inner = extractNodeText(el)
    out += BLOCK_TAGS.has(el.tagName) ? `${inner}\n` : inner
  })
  return out
}

/** 从 contentEditable 导出纯文本，忽略尾部幽灵空行 */
export function getComposerPlainTextFromElement(root: HTMLElement): string {
  const raw = extractNodeText(root).replace(/\r\n/g, '\n')
  const lines = raw.split('\n')
  while (lines.length > 1 && lines[lines.length - 1] === '') {
    lines.pop()
  }
  if (lines.length === 1 && lines[0] === '') return ''
  return lines.join('\n')
}

/** 光标移动到内容末尾 */
export function setComposerCaretToEnd(root: HTMLElement): void {
  const selection = window.getSelection()
  if (!selection) return
  const range = document.createRange()
  range.selectNodeContents(root)
  range.collapse(false)
  selection.removeAllRanges()
  selection.addRange(range)
}

/** 在光标处插入纯文本（换行转为 `<br>`） */
export function insertComposerPlainTextAtCaret(
  root: HTMLElement,
  text: string,
): void {
  if (!text) return
  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0) return
  const range = selection.getRangeAt(0)
  if (!root.contains(range.commonAncestorContainer)) return

  range.deleteContents()

  const fragment = document.createDocumentFragment()
  const lines = text.split('\n')
  lines.forEach((line, index) => {
    if (index > 0) fragment.appendChild(document.createElement('br'))
    if (line) fragment.appendChild(document.createTextNode(line))
  })

  const last = fragment.lastChild
  range.insertNode(fragment)

  if (last) {
    const nextRange = document.createRange()
    nextRange.setStartAfter(last)
    nextRange.collapse(true)
    selection.removeAllRanges()
    selection.addRange(nextRange)
  }
}
