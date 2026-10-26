import {
  IM_RICH_FILE_ATTR,
  IM_RICH_INLINE_IMAGE_ATTR,
  IM_RICH_LABEL_ATTR,
  IM_RICH_MENTION_ATTR,
  IM_RICH_USER_ID_ATTR,
  sanitizeImRichContentHtml,
} from '@zengchaowu/shared/functions/im/imRichContentHtml'
import { createEmojiElement } from '../extensions/EmojiNode'
import { createFileRefElement } from '../extensions/FileRefNode'
import { createImageClipElement } from '../extensions/ImageClipNode'
import { createMentionElement } from '../extensions/ImMentionNode'
import { defaultCwMessageInputTexts } from '../texts'

const CARET_MARKER_ATTR = 'data-cw-caret-marker'

export function createEmptyParagraph(placeholder: string): HTMLParagraphElement {
  const p = document.createElement('p')
  p.className = 'is-editor-empty'
  p.setAttribute('data-placeholder', placeholder)
  p.appendChild(document.createElement('br'))
  return p
}

export function isEditorEmpty(root: HTMLElement): boolean {
  const text = (root.textContent ?? '').replace(/\u200b/g, '').trim()
  if (text.length > 0) return false
  return !root.querySelector(
    `[data-emoji], [${IM_RICH_MENTION_ATTR}], [${IM_RICH_FILE_ATTR}], img[${IM_RICH_INLINE_IMAGE_ATTR}]`,
  )
}

export function syncEmptyPlaceholder(root: HTMLElement, placeholder: string): void {
  let first = root.querySelector('p')
  if (!first) {
    first = createEmptyParagraph(placeholder)
    root.appendChild(first)
  }
  const empty = isEditorEmpty(root)
  root.querySelectorAll('p.is-editor-empty').forEach((p) => {
    p.classList.remove('is-editor-empty')
  })
  if (empty) {
    first.classList.add('is-editor-empty')
    first.setAttribute('data-placeholder', placeholder)
  }
}

export function getSelectionRange(root: HTMLElement): Range | null {
  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0) return null
  const range = selection.getRangeAt(0)
  if (!root.contains(range.commonAncestorContainer)) return null
  return range
}

/** 取节点在光标一侧的矩形（文本节点按首/尾，元素节点按左/右边缘） */
function caretRectAt(node: Node, atEnd: boolean): DOMRect | null {
  if (node.nodeType === Node.TEXT_NODE) {
    const probe = document.createRange()
    const length = node.textContent?.length ?? 0
    probe.setStart(node, atEnd ? length : 0)
    probe.collapse(true)
    const rect = probe.getBoundingClientRect()
    return rect.width > 0 || rect.height > 0 ? rect : null
  }
  const rect = (node as Element).getBoundingClientRect()
  if (rect.width === 0 && rect.height === 0) return null
  return new DOMRect(atEnd ? rect.right : rect.left, rect.top, 0, rect.height)
}

/**
 * 计算折叠 Range 的光标矩形。
 * Chrome 在 startContainer 是元素节点（如 `<p>@</p>` 里选区落在 `P#1`）时会返回
 * 全 0 的矩形，此时需下钻到相邻文本节点测量，才能与 ProseMirror `coordsAtPos` 一致。
 */
export function getCaretRect(range: Range): DOMRect | null {
  const direct = range.getBoundingClientRect()
  if (direct.width > 0 || direct.height > 0) return direct
  if (!range.collapsed) return null
  const container = range.startContainer
  if (container.nodeType === Node.TEXT_NODE) return null
  const children = container.childNodes
  const offset = range.startOffset
  for (let index = offset - 1; index >= 0; index -= 1) {
    const rect = caretRectAt(children[index], true)
    if (rect) return rect
  }
  for (let index = offset; index < children.length; index += 1) {
    const rect = caretRectAt(children[index], false)
    if (rect) return rect
  }
  const own = (container as Element).getBoundingClientRect()
  return own.width > 0 || own.height > 0
    ? new DOMRect(own.left, own.top, 0, own.height)
    : null
}

export function setSelectionRange(range: Range): void {
  const selection = window.getSelection()
  if (!selection) return
  selection.removeAllRanges()
  selection.addRange(range)
}

function ensureInsertionRange(root: HTMLElement): Range {
  const current = getSelectionRange(root)
  if (current) return current
  const range = document.createRange()
  range.selectNodeContents(root)
  range.collapse(false)
  return range
}

export function insertNodesAtCaret(root: HTMLElement, nodes: Node[]): void {
  if (nodes.length === 0) return
  const range = ensureInsertionRange(root)
  range.deleteContents()
  for (const node of nodes) {
    range.insertNode(node)
    range.setStartAfter(node)
    range.collapse(true)
  }
  setSelectionRange(range)
}

export function createCaretMarker(root: HTMLElement): HTMLElement | null {
  const range = getSelectionRange(root)
  if (!range || !range.collapsed) return null
  const marker = document.createElement('span')
  marker.setAttribute(CARET_MARKER_ATTR, '')
  const clone = range.cloneRange()
  clone.collapse(false)
  clone.insertNode(marker)
  return marker
}

export function insertNodesAtMarker(
  root: HTMLElement,
  marker: HTMLElement | null,
  nodes: Node[],
): void {
  if (nodes.length === 0) {
    marker?.remove()
    return
  }
  if (!marker || !marker.parentNode) {
    insertNodesAtCaret(root, nodes)
    return
  }
  const parent = marker.parentNode
  for (const node of nodes) {
    parent.insertBefore(node, marker)
  }
  const range = document.createRange()
  range.setStartAfter(nodes[nodes.length - 1]!)
  range.collapse(true)
  marker.remove()
  setSelectionRange(range)
}

export function restoreCaretFromMarker(root: HTMLElement, marker: HTMLElement | null): void {
  if (!marker || !root.contains(marker)) return
  const range = document.createRange()
  range.setStartBefore(marker)
  range.collapse(true)
  marker.remove()
  setSelectionRange(range)
}

export function textToNodes(text: string): Node[] {
  const nodes: Node[] = []
  const parts = text.split('\n')
  parts.forEach((part, index) => {
    if (index > 0) nodes.push(document.createElement('br'))
    if (part) nodes.push(document.createTextNode(part))
  })
  return nodes
}

export function deleteCharsBeforeCaret(root: HTMLElement, count: number): void {
  if (count <= 0) return
  const range = getSelectionRange(root)
  if (!range || !range.collapsed) return
  const textNodes: Text[] = []
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  let current = walker.nextNode()
  while (current) {
    textNodes.push(current as Text)
    current = walker.nextNode()
  }
  const endNode =
    range.startContainer.nodeType === Node.TEXT_NODE
      ? (range.startContainer as Text)
      : null
  const endOffset =
    endNode && endNode === range.startContainer ? range.startOffset : 0
  let index = endNode ? textNodes.indexOf(endNode) : -1
  if (index < 0) {
    index = textNodes.length - 1
  }
  let remaining = count
  let startNode: Text | null = null
  let startOffset = 0
  for (let i = index; i >= 0; i -= 1) {
    const node = textNodes[i]!
    const available = i === index && node === endNode ? endOffset : node.data.length
    if (remaining <= available) {
      startNode = node
      startOffset = available - remaining
      remaining = 0
      break
    }
    remaining -= available
  }
  if (!startNode) {
    if (textNodes.length === 0) return
    startNode = textNodes[0]!
    startOffset = 0
  }
  const delRange = document.createRange()
  delRange.setStart(startNode, startOffset)
  if (endNode) {
    delRange.setEnd(endNode, endOffset)
  } else {
    delRange.setEnd(range.startContainer, range.startOffset)
  }
  delRange.deleteContents()
  delRange.collapse(true)
  setSelectionRange(delRange)
}

function nodePlainText(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) return (node as Text).data
  if (node.nodeType !== Node.ELEMENT_NODE) return ''
  const el = node as HTMLElement
  const tag = el.tagName
  if (tag === 'BR') return '\n'
  if (el.hasAttribute('data-emoji')) {
    return el.getAttribute('data-emoji') ?? ''
  }
  if (el.hasAttribute(IM_RICH_MENTION_ATTR)) {
    const label =
      el.getAttribute(IM_RICH_LABEL_ATTR)?.trim() ||
      el.getAttribute(IM_RICH_USER_ID_ATTR)?.trim() ||
      ''
    return label ? `@${label}` : '@'
  }
  if (el.hasAttribute(IM_RICH_FILE_ATTR)) {
    const label = el.getAttribute(IM_RICH_LABEL_ATTR) ?? ''
    return `[文件] ${label}`
  }
  if (el.tagName === 'IMG') return '[图片]'
  let out = ''
  el.childNodes.forEach((child) => {
    out += nodePlainText(child)
  })
  if (tag === 'P' || tag === 'DIV') out += '\n'
  return out
}

export function plainTextBeforeCaret(root: HTMLElement): string {
  const range = getSelectionRange(root)
  if (!range) return ''
  const pre = document.createRange()
  pre.selectNodeContents(root)
  pre.setEnd(range.startContainer, range.startOffset)
  const fragment = pre.cloneContents()
  let out = ''
  fragment.childNodes.forEach((child) => {
    out += nodePlainText(child)
  })
  return out
}

function previousNodeWithin(node: Node, root: HTMLElement): Node | null {
  if (node.previousSibling) return node.previousSibling
  let parent = node.parentNode
  while (parent && parent !== root) {
    if (parent.previousSibling) return parent.previousSibling
    parent = parent.parentNode
  }
  return null
}

export function isCaretAfterMention(root: HTMLElement): boolean {
  const range = getSelectionRange(root)
  if (!range || !range.collapsed) return false
  let node: Node | null = null
  const container = range.startContainer
  const offset = range.startOffset
  if (container.nodeType === Node.TEXT_NODE) {
    const text = (container as Text).data.slice(0, offset)
    if (/\S/.test(text)) return false
    node = text ? container : previousNodeWithin(container, root)
  } else {
    node = container.childNodes[offset - 1] ?? null
    if (!node) node = previousNodeWithin(container, root)
  }
  let cursor = node
  let guard = 0
  while (cursor && guard < 200) {
    guard += 1
    if (cursor.nodeType === Node.TEXT_NODE) {
      if (/\S/.test((cursor as Text).data)) return false
    } else if (cursor.nodeType === Node.ELEMENT_NODE) {
      const el = cursor as HTMLElement
      if (el.hasAttribute(IM_RICH_MENTION_ATTR) || el.hasAttribute('data-cw-mention-wrap')) {
        return true
      }
      if (
        el.hasAttribute(IM_RICH_FILE_ATTR) ||
        el.hasAttribute('data-emoji') ||
        el.tagName === 'IMG' ||
        el.tagName === 'BR'
      ) {
        return false
      }
    }
    cursor = previousNodeWithin(cursor, root)
  }
  return false
}

export function collectClipboardImageFiles(data: DataTransfer | null): File[] {
  const files: File[] = []
  if (!data) return files
  for (const item of Array.from(data.items ?? [])) {
    if (item.kind !== 'file') continue
    const file = item.getAsFile()
    if (!file) continue
    if (!file.type || !file.type.startsWith('image/')) continue
    files.push(file)
  }
  return files
}

export function buildFragmentFromHtml(html: string, placeholder: string): DocumentFragment {
  const fragment = document.createDocumentFragment()
  const template = document.createElement('template')
  template.innerHTML = html
  template.content.childNodes.forEach((child) => {
    appendWireNode(fragment, child, placeholder)
  })
  return fragment
}

/** 将 wire HTML 节点重建为编辑器内可交互的 chip / emoji DOM */
function appendWireNode(
  parent: Node,
  node: Node,
  placeholder: string,
): void {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = (node as Text).data
    const parts = text.split('\n')
    parts.forEach((part, index) => {
      if (index > 0) parent.appendChild(document.createElement('br'))
      if (part) parent.appendChild(document.createTextNode(part))
    })
    return
  }
  if (node.nodeType !== Node.ELEMENT_NODE) return
  const el = node as HTMLElement
  if (el.tagName === 'BR') {
    parent.appendChild(document.createElement('br'))
    return
  }
  if (el.hasAttribute('data-emoji')) {
    parent.appendChild(
      createEmojiElement({
        src: el.querySelector('img')?.getAttribute('src') ?? el.getAttribute('data-src') ?? '',
        alt: el.querySelector('img')?.getAttribute('alt') ?? el.getAttribute('data-alt') ?? '',
        'data-emoji': el.getAttribute('data-emoji') ?? '',
      }),
    )
    return
  }
  if (el.hasAttribute(IM_RICH_MENTION_ATTR)) {
    parent.appendChild(
      createMentionElement(
        {
          uid: el.getAttribute(IM_RICH_USER_ID_ATTR) ?? '',
          label: el.getAttribute(IM_RICH_LABEL_ATTR) ?? '',
        },
        { inScope: true },
      ),
    )
    return
  }
  if (el.hasAttribute(IM_RICH_FILE_ATTR)) {
    parent.appendChild(
      createFileRefElement(
        {
          path: el.getAttribute('data-path') ?? '',
          label: el.getAttribute(IM_RICH_LABEL_ATTR) ?? '',
          lines: el.getAttribute('data-lines') ?? '',
        },
        { removeAriaLabel: defaultCwMessageInputTexts.fileRefDeleteTitle },
        '/',
      ),
    )
    return
  }
  if (el.tagName === 'IMG' && el.hasAttribute(IM_RICH_INLINE_IMAGE_ATTR)) {
    parent.appendChild(
      createImageClipElement(
        {
          previewSrc: el.getAttribute('src') ?? '',
          name: el.getAttribute('alt') ?? '',
          naturalWidth: Number(el.getAttribute('width')) || 0,
          naturalHeight: Number(el.getAttribute('height')) || 0,
        },
        {},
      ),
    )
    return
  }
  el.childNodes.forEach((child) => {
    appendWireNode(parent, child, placeholder)
  })
}

export function buildEditorContent(
  root: HTMLElement,
  html: string,
  placeholder: string,
): void {
  root.innerHTML = ''
  const wire = sanitizeImRichContentHtml(html).trim()
  if (!wire) {
    root.appendChild(createEmptyParagraph(placeholder))
    return
  }
  const paragraph = document.createElement('p')
  const fragment = buildFragmentFromHtml(wire, placeholder)
  paragraph.appendChild(fragment)
  root.appendChild(paragraph)
  syncEmptyPlaceholder(root, placeholder)
}

export function caretRangeFromPoint(x: number, y: number): Range | null {
  const doc = document as Document & {
    caretRangeFromPoint?: (clientX: number, clientY: number) => Range | null
    caretPositionFromPoint?: (
      clientX: number,
      clientY: number,
    ) => { offsetNode: Node; offset: number } | null
  }
  if (typeof doc.caretRangeFromPoint === 'function') {
    return doc.caretRangeFromPoint(x, y)
  }
  if (typeof doc.caretPositionFromPoint === 'function') {
    const pos = doc.caretPositionFromPoint(x, y)
    if (!pos) return null
    const range = document.createRange()
    range.setStart(pos.offsetNode, pos.offset)
    range.collapse(true)
    return range
  }
  return null
}
