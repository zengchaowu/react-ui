import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ClipboardEvent as ReactClipboardEvent,
  type CSSProperties,
  type DragEvent as ReactDragEvent,
  type FormEvent,
  type FormHTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import { isRasterImageFile } from '@zengchaowu/shared/functions/file/isRasterImageFile'
import {
  IM_RICH_FILE_ATTR,
  IM_RICH_INLINE_IMAGE_ATTR,
  IM_RICH_LABEL_ATTR,
  IM_RICH_MENTION_ATTR,
  IM_RICH_USER_ID_ATTR,
  materializeImRichHtmlToPlainText,
  normalizeImRichEditorClipboardHtml,
  sanitizeImRichContentHtml,
} from '@zengchaowu/shared/functions/im/imRichContentHtml'
import {
  hasImRichClipboardPlainMarkers,
} from '@zengchaowu/shared/functions/im/imRichClipboardPlain'
import { getActiveMentionQuery } from '@zengchaowu/shared/functions/im/getActiveMentionQuery'
import { clampIndex } from '@zengchaowu/shared/functions/number/clampIndex'
import { usePublicAssetBaseUrl } from '../../utils/publicAssetBaseUrl'
import { getEmojionePngUrl, splitTextToEmojiParts } from '../CwChatMessageQuote/emojioneEmoji'
import { CwMessageInputMentionPanel } from '../CwMessageInputMentionPanel'
import type { CwMessageInputMentionPanelHandle } from '../CwMessageInputMentionPanel'
import { CwMessageInputMentionSheet } from '../CwMessageInputMentionSheet'
import { createEmojiElement } from './extensions/EmojiNode'
import { createFileRefElement } from './extensions/FileRefNode'
import { createImageClipElement } from './extensions/ImageClipNode'
import { createMentionElement } from './extensions/ImMentionNode'
import { resolveDroppedFilePath } from './functions/resolveDroppedFilePath'
import { readRasterFileDimensions } from './functions/readRasterFileDimensions'
import { fileToDataUrl } from './functions/fileToDataUrl'
import { isSingleEmojiGlyph } from './functions/isSingleEmojiGlyph'
import { buildEditorContentFromImRichPlainText } from './functions/buildEditorContentFromImRichPlain'
import { backfillInlineImageDimensions } from './functions/backfillInlineImageDimensions'
import {
  hasEditorClipboardHtmlMarkers,
  writeImRichClipboardData,
} from './functions/imRichEditorClipboard'
import {
  focusEditorWithKeyboardPolicy,
  syncEditorVirtualKeyboardPolicy,
} from './functions/focusEditorWithKeyboardPolicy'
import { resolveMessageInputLayoutClasses } from './styles'
import { defaultCwMessageInputTexts } from './texts'
import type {
  CwMessageInputAttachmentPreviewItem,
  CwMessageInputEditorHandle,
  CwMessageInputEmits,
  CwMessageInputExpose,
  CwMessageInputMentionItem,
  CwMessageInputProps,
  CwMessageInputTexts,
} from './types'

const COMPOSER_LINE_HEIGHT_REM = 1.5
const EDITOR_CLASS =
  'ProseMirror prose prose-sm max-w-none outline-none min-h-[var(--size-touch-target)] [&>*]:my-0 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0'
const CARET_MARKER_ATTR = 'data-cw-caret-marker'

function createEmptyParagraph(placeholder: string): HTMLParagraphElement {
  const p = document.createElement('p')
  p.className = 'is-editor-empty'
  p.setAttribute('data-placeholder', placeholder)
  p.appendChild(document.createElement('br'))
  return p
}

function isEditorEmpty(root: HTMLElement): boolean {
  const text = (root.textContent ?? '').replace(/\u200b/g, '').trim()
  if (text.length > 0) return false
  return !root.querySelector(
    `[data-emoji], [${IM_RICH_MENTION_ATTR}], [${IM_RICH_FILE_ATTR}], img[${IM_RICH_INLINE_IMAGE_ATTR}]`,
  )
}

function syncEmptyPlaceholder(root: HTMLElement, placeholder: string): void {
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

function getSelectionRange(root: HTMLElement): Range | null {
  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0) return null
  const range = selection.getRangeAt(0)
  if (!root.contains(range.commonAncestorContainer)) return null
  return range
}

function setSelectionRange(range: Range): void {
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

function insertNodesAtCaret(root: HTMLElement, nodes: Node[]): void {
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

function createCaretMarker(root: HTMLElement): HTMLElement | null {
  const range = getSelectionRange(root)
  if (!range || !range.collapsed) return null
  const marker = document.createElement('span')
  marker.setAttribute(CARET_MARKER_ATTR, '')
  const clone = range.cloneRange()
  clone.collapse(false)
  clone.insertNode(marker)
  return marker
}

function insertNodesAtMarker(
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

function restoreCaretFromMarker(root: HTMLElement, marker: HTMLElement | null): void {
  if (!marker || !root.contains(marker)) return
  const range = document.createRange()
  range.setStartBefore(marker)
  range.collapse(true)
  marker.remove()
  setSelectionRange(range)
}

function textToNodes(text: string): Node[] {
  const nodes: Node[] = []
  const parts = text.split('\n')
  parts.forEach((part, index) => {
    if (index > 0) nodes.push(document.createElement('br'))
    if (part) nodes.push(document.createTextNode(part))
  })
  return nodes
}

function deleteCharsBeforeCaret(root: HTMLElement, count: number): void {
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

function plainTextBeforeCaret(root: HTMLElement): string {
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

function isCaretAfterMention(root: HTMLElement): boolean {
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

function collectClipboardImageFiles(data: DataTransfer | null): File[] {
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

function buildFragmentFromHtml(html: string, placeholder: string): DocumentFragment {
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

function buildEditorContent(
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

export interface CwMessageInputComponentProps extends CwMessageInputProps, CwMessageInputEmits, Omit<
  FormHTMLAttributes<HTMLFormElement>,
  'children' | 'className' | 'onSubmit' | 'onInput' | 'onChange'
> {
  className?: string
}

export const CwMessageInput = forwardRef<
  CwMessageInputExpose,
  CwMessageInputComponentProps
>(function CwMessageInput(
  {
    placeholder,
    maxLength = Number.MAX_SAFE_INTEGER,
    disabled = false,
    fixedTextareaRows,
    textareaMinRows,
    textareaMaxRows,
    textareaFieldPadYRem,
    allowComposerAttachmentPipeline = false,
    pendingAttachmentCount = 0,
    mentionItems,
    mentionAvatarFallbackSrc,
    droppedFilePathResolver,
    fieldLayout = 'default',
    clearOnSubmit = true,
    suspendSubmit = false,
    texts: textsProp,
    value = '',
    onDroppedFiles,
    onAttachmentPreviewContextMenu,
    onInlineImagePreview,
    mentionPanelVariant = 'popup',
    suppressVirtualKeyboard = false,
    onSend,
    onInput,
    onSubmit,
    onChange,
    onEditorFocus,
    onEditorBlur,
    onEditorPointerDown,
    className,
    ...rest
  },
  ref,
) {
  const publicAssetBaseUrl = usePublicAssetBaseUrl()
  const fieldRef = useRef<HTMLDivElement | null>(null)
  const editorRef = useRef<HTMLDivElement | null>(null)
  const composingRef = useRef(false)
  const convertingEmojiRef = useRef(false)
  const lastRangeRef = useRef<Range | null>(null)
  const pickerOpenRef = useRef(false)
  const mentionPopupRef = useRef<CwMessageInputMentionPanelHandle | null>(null)

  const styles = useMemo(
    () => resolveMessageInputLayoutClasses(fieldLayout),
    [fieldLayout],
  )
  const texts = useMemo<CwMessageInputTexts>(
    () => ({ ...defaultCwMessageInputTexts, ...(textsProp ?? {}) }),
    [textsProp],
  )
  const placeholderResolved = placeholder ?? texts.placeholder

  const [mentionQuery, setMentionQuery] = useState<{
    atIndex: number
    filter: string
  } | null>(null)
  const [mentionHighlightIndex, setMentionHighlightIndex] = useState(0)
  const [mentionPanelMounted, setMentionPanelMounted] = useState(false)
  const [mentionSheetMounted, setMentionSheetMounted] = useState(false)
  const [mentionSheetSearch, setMentionSheetSearch] = useState('')

  const fieldStyle = useMemo<CSSProperties>(() => {
    const minR = textareaMinRows
    const maxR = textareaMaxRows
    if (
      minR != null &&
      maxR != null &&
      minR > 0 &&
      maxR >= minR &&
      (fixedTextareaRows == null || fixedTextareaRows <= 0)
    ) {
      const padY = textareaFieldPadYRem ?? 1.75
      return {
        minHeight: `${padY + COMPOSER_LINE_HEIGHT_REM * minR}rem`,
        maxHeight: `${padY + COMPOSER_LINE_HEIGHT_REM * maxR}rem`,
        overflowY: 'auto',
        flex: '0 0 auto',
      }
    }
    const n = fixedTextareaRows
    if (n == null || n <= 0) return {}
    const lineHRem = 1.25
    const padRem = 0.625
    const hRem = lineHRem * n + padRem + padRem
    return {
      minHeight: `${hRem}rem`,
      maxHeight: `${hRem}rem`,
      overflowY: 'auto',
      flex: '0 0 auto',
    }
  }, [fixedTextareaRows, textareaFieldPadYRem, textareaMaxRows, textareaMinRows])

  const getRoot = useCallback((): HTMLDivElement | null => editorRef.current, [])

  const getHTML = useCallback((): string => {
    const root = getRoot()
    return root ? sanitizeImRichContentHtml(root.innerHTML) : ''
  }, [getRoot])

  const getPlainText = useCallback((): string => {
    return materializeImRichHtmlToPlainText(getHTML())
  }, [getHTML])

  const emitContent = useCallback((): void => {
    const root = getRoot()
    if (!root) return
    syncEmptyPlaceholder(root, placeholderResolved)
    const html = sanitizeImRichContentHtml(root.innerHTML)
    const plain = materializeImRichHtmlToPlainText(html)
    onInput?.(plain)
    onChange?.(html)
  }, [getRoot, onChange, onInput, placeholderResolved])

  const scrollFieldCaretIntoView = useCallback((): void => {
    requestAnimationFrame(() => {
      const root = getRoot()
      const field = fieldRef.current
      if (!root || !field) return
      const range = getSelectionRange(root)
      if (!range) return
      const rect = range.getBoundingClientRect()
      const fieldRect = field.getBoundingClientRect()
      const margin = 6
      if (rect.bottom > fieldRect.bottom - margin) {
        field.scrollTop += rect.bottom - fieldRect.bottom + margin
      }
      if (rect.top < fieldRect.top + margin) {
        field.scrollTop -= fieldRect.top + margin - rect.top
      }
    })
  }, [getRoot])

  const isMentionInScope = useCallback(
    (uid: string): boolean => {
      const id = uid.trim()
      if (!id) return false
      const items = mentionItems
      if (!Array.isArray(items)) return false
      return items.some((item) => item.id === id)
    },
    [mentionItems],
  )

  const resolveMentionProfile = useCallback(
    (uid: string): { label: string; avatar?: string } => {
      const id = uid.trim()
      const item = mentionItems?.find((entry) => entry.id === id)
      if (item) {
        return {
          label: item.label,
          ...(item.avatar?.trim() ? { avatar: item.avatar.trim() } : {}),
        }
      }
      return { label: id }
    },
    [mentionItems],
  )

  const demoteOutOfScopeMentions = useCallback((): void => {
    const root = getRoot()
    if (!root) return
    const mentions = root.querySelectorAll<HTMLElement>(`[${IM_RICH_MENTION_ATTR}]`)
    mentions.forEach((chip) => {
      const uid = (chip.getAttribute(IM_RICH_USER_ID_ATTR) ?? '').trim()
      if (Array.isArray(mentionItems) && uid && isMentionInScope(uid)) return
      const label =
        (chip.getAttribute(IM_RICH_LABEL_ATTR) ?? '').trim() || uid
      const text = document.createElement('span')
      text.textContent = `@${label}`
      const wrap =
        chip.closest<HTMLElement>('[data-cw-mention-wrap]') ?? chip
      wrap.replaceWith(text)
    })
  }, [getRoot, isMentionInScope, mentionItems])

  const backfillInlineImages = useCallback((): void => {
    const root = getRoot()
    if (!root) return
    void backfillInlineImageDimensions(root).then((touched) => {
      if (touched) emitContent()
    })
  }, [emitContent, getRoot])

  const insertContentNodes = useCallback(
    (nodes: Node[]): void => {
      const root = getRoot()
      if (!root || nodes.length === 0) return
      insertNodesAtCaret(root, nodes)
      demoteOutOfScopeMentions()
      emitContent()
      scrollFieldCaretIntoView()
      backfillInlineImages()
    },
    [backfillInlineImages, demoteOutOfScopeMentions, emitContent, getRoot, scrollFieldCaretIntoView],
  )

  const insertWireHtml = useCallback(
    (html: string): void => {
      const normalized = sanitizeImRichContentHtml(html)
      if (!normalized) return
      const fragment = buildFragmentFromHtml(normalized, placeholderResolved)
      insertContentNodes(Array.from(fragment.childNodes))
    },
    [insertContentNodes, placeholderResolved],
  )

  const insertNodesFromRichContent = useCallback(
    (nodes: ReturnType<typeof buildEditorContentFromImRichPlainText>): void => {
      const domNodes: Node[] = []
      for (const node of nodes) {
        if (node.type === 'text') {
          domNodes.push(...textToNodes(node.text))
          continue
        }
        if (node.type === 'emoji') {
          domNodes.push(createEmojiElement(node.attrs, publicAssetBaseUrl))
          continue
        }
        if (node.type === 'imMention') {
          const profile = resolveMentionProfile(node.attrs.uid)
          domNodes.push(
            createMentionElement(node.attrs, {
              inScope: isMentionInScope(node.attrs.uid),
              displayLabel: profile.label,
            }),
          )
          continue
        }
        if (node.type === 'fileRef') {
          domNodes.push(
            createFileRefElement(
              { ...node.attrs, label: node.attrs.label },
              { removeAriaLabel: texts.fileRefDeleteTitle },
              publicAssetBaseUrl,
            ),
          )
          continue
        }
        domNodes.push(
          createImageClipElement(node.attrs, {
            removeAriaLabel: texts.fileRefDeleteTitle,
          }),
        )
      }
      insertContentNodes(domNodes)
    },
    [
      insertContentNodes,
      isMentionInScope,
      publicAssetBaseUrl,
      resolveMentionProfile,
      texts.fileRefDeleteTitle,
    ],
  )

  const convertEmojiCharsToNodes = useCallback((): void => {
    const root = getRoot()
    if (!root || convertingEmojiRef.current) return
    convertingEmojiRef.current = true
    const marker = createCaretMarker(root)
    try {
      const textNodes: Text[] = []
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
      let current = walker.nextNode()
      while (current) {
        const text = current as Text
        if (!text.parentElement?.closest('[data-emoji]')) textNodes.push(text)
        current = walker.nextNode()
      }
      for (const node of textNodes) {
        const parts = splitTextToEmojiParts(node.data, publicAssetBaseUrl)
        if (!parts.some((part) => part.type === 'emoji')) continue
        const fragment = document.createDocumentFragment()
        for (const part of parts) {
          if (part.type === 'text') {
            fragment.appendChild(document.createTextNode(part.text))
          } else {
            fragment.appendChild(
              createEmojiElement(
                {
                  src: part.src,
                  alt: part.emoji,
                  'data-emoji': part.emoji,
                },
                publicAssetBaseUrl,
              ),
            )
          }
        }
        node.parentNode?.replaceChild(fragment, node)
      }
    } finally {
      restoreCaretFromMarker(root, marker)
      convertingEmojiRef.current = false
    }
  }, [getRoot, publicAssetBaseUrl])

  const insertTextWithEmoji = useCallback(
    (text: string): void => {
      const root = getRoot()
      if (!root) return
      const parts = splitTextToEmojiParts(text, publicAssetBaseUrl)
      const nodes: Node[] = []
      for (const part of parts) {
        if (part.type === 'text') {
          nodes.push(...textToNodes(part.text))
        } else {
          nodes.push(
            createEmojiElement(
              { src: part.src, alt: part.emoji, 'data-emoji': part.emoji },
              publicAssetBaseUrl,
            ),
          )
        }
      }
      insertContentNodes(nodes)
    },
    [getRoot, insertContentNodes, publicAssetBaseUrl],
  )

  const insertText = useCallback(
    (text: string): void => {
      if (!text) return
      const root = getRoot()
      if (!root) return
      focusEditorWithKeyboardPolicy(root, suppressVirtualKeyboard)
      const saved = lastRangeRef.current
      if (saved && root.contains(saved.commonAncestorContainer)) {
        setSelectionRange(saved)
      }
      const glyph = isSingleEmojiGlyph(text, publicAssetBaseUrl)
      if (glyph) {
        const url = getEmojionePngUrl(glyph, publicAssetBaseUrl) ?? ''
        insertContentNodes([
          createEmojiElement(
            { src: url, alt: glyph, 'data-emoji': glyph },
            publicAssetBaseUrl,
          ),
        ])
        return
      }
      insertContentNodes(textToNodes(text))
    },
    [getRoot, insertContentNodes, publicAssetBaseUrl, suppressVirtualKeyboard],
  )

  const resolvePathForDroppedFile = useCallback(
    (file: File): string => {
      return droppedFilePathResolver?.(file) ?? resolveDroppedFilePath(file)
    },
    [droppedFilePathResolver],
  )

  const buildFileRefElements = useCallback(
    (files: File[]): HTMLElement[] => {
      const stamp = Date.now()
      return files.map((file, index) => {
        const path = resolvePathForDroppedFile(file)
        const id = `ref_${stamp}_${index}_${Math.random().toString(36).slice(2, 9)}`
        const label = file.name || path.split(/[/\\]/).pop() || path
        return createFileRefElement(
          { id, path, label },
          { removeAriaLabel: texts.fileRefDeleteTitle },
          publicAssetBaseUrl,
        )
      })
    },
    [publicAssetBaseUrl, resolvePathForDroppedFile, texts.fileRefDeleteTitle],
  )

  const buildImageClipElements = useCallback(
    async (files: File[]): Promise<HTMLElement[]> => {
      const elements = await Promise.all(
        files.map(async (file) => {
          let naturalWidth = 0
          let naturalHeight = 0
          try {
            const dim = await readRasterFileDimensions(file)
            naturalWidth = dim.width
            naturalHeight = dim.height
          } catch {
            /* CwImageFit onLoad 兜底 */
          }
          const previewSrc = await fileToDataUrl(file)
          return createImageClipElement(
            {
              previewSrc,
              name: file.name || 'image',
              naturalWidth,
              naturalHeight,
            },
            { removeAriaLabel: texts.fileRefDeleteTitle },
          )
        }),
      )
      return elements
    },
    [texts.fileRefDeleteTitle],
  )

  const insertImageClipsAt = useCallback(
    async (files: File[]): Promise<void> => {
      const root = getRoot()
      if (!root || files.length === 0) return
      const marker = createCaretMarker(root)
      const elements = await buildImageClipElements(files)
      if (marker && root.contains(marker)) {
        insertNodesAtMarker(root, marker, elements)
      } else {
        insertNodesAtCaret(root, elements)
      }
      demoteOutOfScopeMentions()
      emitContent()
      backfillInlineImages()
    },
    [
      backfillInlineImages,
      buildImageClipElements,
      demoteOutOfScopeMentions,
      emitContent,
      getRoot,
    ],
  )

  const insertDroppedFilesAt = useCallback(
    async (files: File[]): Promise<void> => {
      const root = getRoot()
      if (!root) return
      const raster: File[] = []
      const other: File[] = []
      for (const file of files) {
        if (!file.name.length) continue
        if (isRasterImageFile(file)) raster.push(file)
        else other.push(file)
      }
      if (raster.length === 0 && other.length === 0) return
      const marker = createCaretMarker(root)
      const images = raster.length > 0 ? await buildImageClipElements(raster) : []
      const refs = other.length > 0 ? buildFileRefElements(other) : []
      if (marker && root.contains(marker)) {
        insertNodesAtMarker(root, marker, [...images, ...refs])
      } else {
        insertNodesAtCaret(root, [...images, ...refs])
      }
      demoteOutOfScopeMentions()
      emitContent()
      backfillInlineImages()
    },
    [
      backfillInlineImages,
      buildFileRefElements,
      buildImageClipElements,
      demoteOutOfScopeMentions,
      emitContent,
      getRoot,
    ],
  )

  const dispatchDroppedFiles = useCallback(
    (files: File[]): void => {
      const list = Array.from(files).filter((file) => file.name.length > 0)
      if (list.length === 0) return
      onDroppedFiles?.(list)
    },
    [onDroppedFiles],
  )

  const ingestDroppedFiles = useCallback(
    (files: File[]): void => {
      if (disabled || !allowComposerAttachmentPipeline) return
      const root = getRoot()
      if (!root) return
      const list = Array.from(files).filter((file) => file.name.length > 0)
      if (list.length === 0) return
      focusEditorWithKeyboardPolicy(root, suppressVirtualKeyboard, 'end')
      void insertDroppedFilesAt(list)
    },
    [
      allowComposerAttachmentPipeline,
      disabled,
      getRoot,
      insertDroppedFilesAt,
      suppressVirtualKeyboard,
    ],
  )

  const insertFileRef = useCallback(
    (path: string, label?: string, lines?: string): void => {
      const root = getRoot()
      if (!root || !path) return
      focusEditorWithKeyboardPolicy(root, suppressVirtualKeyboard)
      const display = label || path.split('/').pop() || path
      const id = `ref_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
      insertContentNodes([
        createFileRefElement(
          { id, path, label: display, ...(lines ? { lines } : {}) },
          { removeAriaLabel: texts.fileRefDeleteTitle },
          publicAssetBaseUrl,
        ),
      ])
      root.focus({ preventScroll: true })
    },
    [
      getRoot,
      insertContentNodes,
      publicAssetBaseUrl,
      suppressVirtualKeyboard,
      texts.fileRefDeleteTitle,
    ],
  )

  // ---- 发送 ----
  const hasInlineImageClips = useCallback((): boolean => {
    const root = getRoot()
    if (!root) return false
    return !!root.querySelector(`img[${IM_RICH_INLINE_IMAGE_ATTR}]`)
  }, [getRoot])

  const canSend = useCallback((): boolean => {
    if (disabled || suspendSubmit) return false
    const plain = getPlainText()
    if (plain.length > maxLength) return false
    if (plain.trim().length > 0) return true
    if (pendingAttachmentCount > 0) return true
    return hasInlineImageClips()
  }, [
    disabled,
    getPlainText,
    hasInlineImageClips,
    maxLength,
    pendingAttachmentCount,
    suspendSubmit,
  ])

  const clearEditorContent = useCallback((): void => {
    const root = getRoot()
    if (!root) return
    root.innerHTML = ''
    root.appendChild(createEmptyParagraph(placeholderResolved))
    setMentionQuery(null)
    setMentionSheetSearch('')
  }, [getRoot, placeholderResolved])

  const handleSend = useCallback((): void => {
    if (mentionQuery != null && pickerOpenRef.current) return
    if (!canSend()) return
    demoteOutOfScopeMentions()
    const html = getHTML()
    onSubmit?.({ html, files: [] })
    onSend?.(html)
    if (clearOnSubmit) {
      clearEditorContent()
      emitContent()
    }
  }, [
    canSend,
    clearEditorContent,
    clearOnSubmit,
    demoteOutOfScopeMentions,
    emitContent,
    getHTML,
    mentionQuery,
    onSend,
    onSubmit,
  ])

  // ---- @提及 ----
  const mentionEnabled = Array.isArray(mentionItems)
  const filteredMentionItems = useMemo<CwMessageInputMentionItem[]>(() => {
    const items = mentionItems
    if (!Array.isArray(items) || items.length === 0) return []
    if (!mentionQuery) return []
    const raw = mentionQuery.filter.trim().toLowerCase()
    const isCodeRef = (item: CwMessageInputMentionItem): boolean =>
      item.kind === 'file' || item.kind === 'folder'
    if (!raw) {
      const users: CwMessageInputMentionItem[] = []
      const refs: CwMessageInputMentionItem[] = []
      for (const item of items) {
        if (isCodeRef(item)) refs.push(item)
        else users.push(item)
      }
      return [...users, ...refs.slice(0, 24)]
    }
    return items.filter((item) => {
      const label = item.label.toLowerCase()
      const id = (item.id ?? '').toLowerCase()
      const path = (item.path ?? '').toLowerCase()
      return label.includes(raw) || id.includes(raw) || path.includes(raw)
    })
  }, [mentionItems, mentionQuery])

  const mentionSheetItems = useMemo<CwMessageInputMentionItem[]>(
    () => (Array.isArray(mentionItems) ? mentionItems : []),
    [mentionItems],
  )

  const mentionUiActive =
    mentionEnabled &&
    !!mentionQuery &&
    Array.isArray(mentionItems) &&
    mentionItems.length > 0
  const mentionPopupVisible =
    mentionPanelVariant !== 'sheet' &&
    mentionUiActive &&
    filteredMentionItems.length > 0
  const mentionSheetVisible =
    mentionPanelVariant === 'sheet' && mentionUiActive
  const mentionPickerOpen = mentionPopupVisible || mentionSheetVisible

  const activeMentionCandidates = useMemo<CwMessageInputMentionItem[]>(() => {
    if (mentionPanelVariant === 'sheet') {
      const raw = mentionSheetSearch.trim().toLowerCase()
      if (!raw) return mentionSheetItems.slice()
      return mentionSheetItems.filter((item) => {
        const label = item.label.toLowerCase()
        const id = (item.id ?? '').toLowerCase()
        return label.includes(raw) || id.includes(raw)
      })
    }
    return filteredMentionItems
  }, [
    filteredMentionItems,
    mentionPanelVariant,
    mentionSheetItems,
    mentionSheetSearch,
  ])

  pickerOpenRef.current = mentionPickerOpen

  const cancelMention = useCallback((): void => {
    const query = mentionQuery
    const root = getRoot()
    if (!query || !root) return
    deleteCharsBeforeCaret(root, 1 + query.filter.length)
    emitContent()
    focusEditorWithKeyboardPolicy(root, suppressVirtualKeyboard)
    setMentionSheetSearch('')
  }, [emitContent, getRoot, mentionQuery, suppressVirtualKeyboard])

  const pickMention = useCallback(
    (item: CwMessageInputMentionItem): void => {
      const query = mentionQuery
      const root = getRoot()
      if (!query || !root) return
      const full = getPlainText()
      const afterPlain = full.slice(query.atIndex + 1 + query.filter.length)
      const spacer = /^\s/.test(afterPlain) ? '' : ' '
      focusEditorWithKeyboardPolicy(root, suppressVirtualKeyboard)
      deleteCharsBeforeCaret(root, 1 + query.filter.length)

      const kind =
        item.kind === 'file' || item.kind === 'folder' ? item.kind : 'user'
      if (kind === 'file' || kind === 'folder') {
        const path = String(item.path ?? '').trim()
        if (!path) return
        const display =
          String(item.label ?? '').trim() ||
          path.split(/[/\\]/).pop() ||
          path
        insertNodesAtCaret(root, [
          createFileRefElement(
            {
              id: `ref_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
              path,
              label: display,
            },
            { removeAriaLabel: texts.fileRefDeleteTitle },
            publicAssetBaseUrl,
          ),
        ])
      } else {
        const profile = resolveMentionProfile(item.id)
        insertNodesAtCaret(root, [
          createMentionElement(
            { uid: item.id, label: item.label },
            { inScope: true, displayLabel: profile.label },
          ),
        ])
      }
      if (spacer) insertNodesAtCaret(root, textToNodes(spacer))
      emitContent()
      root.focus({ preventScroll: true })
      setMentionSheetSearch('')
    },
    [
      emitContent,
      getPlainText,
      getRoot,
      mentionQuery,
      publicAssetBaseUrl,
      resolveMentionProfile,
      suppressVirtualKeyboard,
      texts.fileRefDeleteTitle,
    ],
  )

  const refreshMentionState = useCallback((): void => {
    const root = getRoot()
    if (!root || disabled || !Array.isArray(mentionItems)) {
      setMentionQuery((prev) => (prev === null ? prev : null))
      return
    }
    if (isCaretAfterMention(root)) {
      setMentionQuery((prev) => (prev === null ? prev : null))
      return
    }
    // 块级闭合标签会附带尾部换行；光标前文本不应包含末尾分隔符（对齐 Tiptap getTextBetween）
    const textBefore = plainTextBeforeCaret(root).replace(/\n+$/, '')
    const query = getActiveMentionQuery(textBefore, textBefore.length)
    if (!query) {
      setMentionQuery((prev) => (prev === null ? prev : null))
      return
    }
    setMentionQuery((prev) =>
      prev && prev.atIndex === query.atIndex && prev.filter === query.filter
        ? prev
        : { atIndex: query.atIndex, filter: query.filter },
    )
  }, [disabled, getRoot, mentionItems])

  useEffect(() => {
    if (mentionPopupVisible) {
      setMentionPanelMounted(true)
      setMentionHighlightIndex(0)
    }
  }, [mentionPopupVisible])

  useEffect(() => {
    if (mentionSheetVisible) {
      setMentionSheetMounted(true)
      setMentionHighlightIndex(0)
      setMentionSheetSearch(mentionQuery?.filter ?? '')
    }
  }, [mentionQuery?.filter, mentionSheetVisible])

  useEffect(() => {
    if (mentionHighlightIndex < activeMentionCandidates.length) return
    setMentionHighlightIndex(Math.max(0, activeMentionCandidates.length - 1))
  }, [activeMentionCandidates.length, mentionHighlightIndex])

  // 光标移动 / 输入时刷新浮层位置（等价 Vue `scheduleMentionReposition`）
  useEffect(() => {
    if (!mentionPickerOpen || mentionPanelVariant === 'sheet') return
    requestAnimationFrame(() => mentionPopupRef.current?.updatePosition())
  }, [mentionPickerOpen, mentionPanelVariant, mentionQuery])

  useEffect(() => {
    if (!mentionPickerOpen) return
    const id = activeMentionCandidates[
      Math.min(
        mentionHighlightIndex,
        Math.max(0, activeMentionCandidates.length - 1),
      )
    ]?.id
    if (!id) return
    requestAnimationFrame(() => {
      document
        .getElementById(`cw-message-input-mention-opt-${id}`)
        ?.scrollIntoView({ block: 'nearest' })
    })
  }, [activeMentionCandidates, mentionHighlightIndex, mentionPickerOpen])

  useEffect(() => {
    if (!mentionPickerOpen || mentionQuery == null || disabled) return
    function handler(event: KeyboardEvent): void {
      if (!pickerOpenRef.current || disabled) return
      const list = activeMentionCandidates
      const listLen = list.length
      const isNavKey =
        event.key === 'ArrowDown' ||
        event.key === 'ArrowUp' ||
        event.key === 'Home' ||
        event.key === 'End' ||
        event.key === 'Tab'
      if (listLen > 0 && isNavKey) {
        if (event.ctrlKey || event.metaKey) return
        event.preventDefault()
        event.stopPropagation()
        setMentionHighlightIndex((prev) => {
          if (event.key === 'ArrowDown') return (prev + 1) % listLen
          if (event.key === 'ArrowUp') return (prev - 1 + listLen) % listLen
          if (event.key === 'Home') return 0
          if (event.key === 'End') return listLen - 1
          return event.shiftKey
            ? (prev - 1 + listLen) % listLen
            : (prev + 1) % listLen
        })
        return
      }
      if (event.key === 'Escape') {
        event.preventDefault()
        event.stopPropagation()
        cancelMention()
        return
      }
      if (event.key === 'Enter' && !event.shiftKey) {
        if (event.isComposing || event.keyCode === 229) return
        event.preventDefault()
        event.stopPropagation()
        if (listLen > 0) {
          const index = Math.min(mentionHighlightIndex, listLen - 1)
          const item = list[index]
          if (item) pickMention(item)
        }
      }
    }
    window.addEventListener('keydown', handler, true)
    return () => window.removeEventListener('keydown', handler, true)
  }, [
    activeMentionCandidates,
    cancelMention,
    disabled,
    mentionHighlightIndex,
    mentionPickerOpen,
    mentionQuery,
    pickMention,
  ])

  const mentionVirtualRef = useMemo(
    () => ({
      getBoundingClientRect: (): DOMRect => {
        const root = getRoot()
        if (root) {
          const range = getSelectionRange(root)
          if (range) {
            const rect = range.getBoundingClientRect()
            return new DOMRect(rect.left, rect.bottom, 0, 0)
          }
        }
        const field = fieldRef.current
        if (field) {
          const rect = field.getBoundingClientRect()
          return new DOMRect(rect.left, rect.bottom, 0, 0)
        }
        return new DOMRect(0, 0, 0, 0)
      },
    }),
    [getRoot],
  )

  // ---- 初始化 / 外部同步 ----
  useLayoutEffect(() => {
    const root = editorRef.current
    if (!root) return
    buildEditorContent(root, value, placeholderResolved)
    // 仅初始化一次，等价 Vue `useEditor({ content })`
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useLayoutEffect(() => {
    const root = editorRef.current
    if (!root) return
    syncEmptyPlaceholder(root, placeholderResolved)
  }, [placeholderResolved])

  useEffect(() => {
    const root = getRoot()
    if (!root) return
    root.contentEditable = disabled ? 'false' : 'true'
    if (disabled) root.blur()
  }, [disabled, getRoot])

  useEffect(() => {
    const root = getRoot()
    if (!root) return
    syncEditorVirtualKeyboardPolicy(root, suppressVirtualKeyboard)
  }, [getRoot, suppressVirtualKeyboard])

  useEffect(() => {
    const root = getRoot()
    if (!root) return
    const onSelectionChange = (): void => {
      const range = getSelectionRange(root)
      if (!range) return
      lastRangeRef.current = range.cloneRange()
      refreshMentionState()
    }
    document.addEventListener('selectionchange', onSelectionChange)
    return () => document.removeEventListener('selectionchange', onSelectionChange)
  }, [getRoot, refreshMentionState])

  // 提及候选项切换会话后降级
  useEffect(() => {
    if (!mentionItems) return
    demoteOutOfScopeMentions()
  }, [demoteOutOfScopeMentions, mentionItems])

  // ---- 焦点 / 空区点击 ----
  function onFieldShellPointerDown(event: ReactMouseEvent<HTMLDivElement>): void {
    if (disabled) return
    const root = getRoot()
    if (!root) return
    const target = event.target as HTMLElement | null
    if (target?.closest('button, a, [role="button"], input, textarea, select')) {
      return
    }
    if (target?.closest('.ProseMirror')) return
    if (suppressVirtualKeyboard) {
      onEditorPointerDown?.()
      return
    }
    event.preventDefault()
    focusEditorWithKeyboardPolicy(root, false, 'end')
  }

  // ---- 编辑事件 ----
  function handleEditorInput(): void {
    emitContent()
    refreshMentionState()
    requestAnimationFrame(() => convertEmojiCharsToNodes())
    scrollFieldCaretIntoView()
  }

  function handleBeforeInput(event: FormEvent<HTMLDivElement>): void {
    const native = event.nativeEvent as InputEvent
    if (native.isComposing) return
    const data = native.data
    if (!data || !/[<>]/.test(data)) return
    if (
      native.inputType !== 'insertText' &&
      native.inputType !== 'insertReplacementText'
    ) {
      return
    }
    event.preventDefault()
    insertContentNodes(textToNodes(data))
  }

  function handleKeyDown(event: ReactKeyboardEvent<HTMLDivElement>): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      if (event.nativeEvent.isComposing || event.keyCode === 229) return
      if (mentionPickerOpen && mentionQuery != null) {
        event.preventDefault()
        return
      }
      event.preventDefault()
      handleSend()
      return
    }
    if (event.key === 'Enter' && event.shiftKey) {
      event.preventDefault()
      const root = getRoot()
      if (!root) return
      insertContentNodes([document.createElement('br')])
    }
  }

  function handlePaste(event: ReactClipboardEvent<HTMLDivElement>): void {
    const root = getRoot()
    if (!root) return
    const images = collectClipboardImageFiles(event.clipboardData)
    if (images.length > 0) {
      if (allowComposerAttachmentPipeline) {
        event.preventDefault()
        if (onDroppedFiles) {
          dispatchDroppedFiles(images)
        } else {
          void insertImageClipsAt(images)
        }
        return
      }
      return
    }
    if (pasteImRichFromClipboard(event)) return

    const text = event.clipboardData?.getData('text/plain') ?? ''
    const html = event.clipboardData?.getData('text/html') ?? ''
    const preferPlainForCodeLike =
      text.length > 0 &&
      /[<>]/.test(text) &&
      html.trim().length > 0 &&
      !html.includes('data-pm-slice') &&
      !hasEditorClipboardHtmlMarkers(html)
    const hasEmoji = splitTextToEmojiParts(text, publicAssetBaseUrl).some(
      (part) => part.type === 'emoji',
    )
    if (preferPlainForCodeLike || (text && hasEmoji)) {
      event.preventDefault()
      insertTextWithEmoji(text)
    }
  }

  function pasteImRichFromClipboard(event: ReactClipboardEvent<HTMLDivElement>): boolean {
    const rawHtml = event.clipboardData?.getData('text/html') ?? ''
    if (rawHtml.trim()) {
      const html = normalizeImRichEditorClipboardHtml(rawHtml)
      if (hasEditorClipboardHtmlMarkers(html)) {
        event.preventDefault()
        insertWireHtml(html)
        return true
      }
    }
    const text = event.clipboardData?.getData('text/plain') ?? ''
    if (text && hasImRichClipboardPlainMarkers(text)) {
      const nodes = buildEditorContentFromImRichPlainText(text, publicAssetBaseUrl)
      if (nodes.some((node) => node.type !== 'text')) {
        event.preventDefault()
        insertNodesFromRichContent(nodes)
        return true
      }
    }
    return false
  }

  function handleDrop(event: ReactDragEvent<HTMLDivElement>): void {
    const root = getRoot()
    if (!root) return
    if (disabled || !allowComposerAttachmentPipeline) return
    const dt = event.dataTransfer
    if (!dt?.files?.length) return
    const files = Array.from(dt.files).filter((file) => file.name.length > 0)
    if (files.length === 0) return
    event.preventDefault()
    event.stopPropagation()
    if (onDroppedFiles) {
      dispatchDroppedFiles(files)
      return
    }
    const rangeAtPoint = caretRangeFromPoint(event.clientX, event.clientY)
    if (rangeAtPoint && root.contains(rangeAtPoint.commonAncestorContainer)) {
      setSelectionRange(rangeAtPoint)
    }
    void insertDroppedFilesAt(files)
  }

  function handleCopy(event: ReactClipboardEvent<HTMLDivElement>): void {
    const root = getRoot()
    if (!root) return
    writeImRichClipboardData(root, event.nativeEvent)
  }

  function handleCut(event: ReactClipboardEvent<HTMLDivElement>): void {
    const root = getRoot()
    if (!root) return
    if (!writeImRichClipboardData(root, event.nativeEvent)) return
    const range = getSelectionRange(root)
    if (!range) return
    range.deleteContents()
    range.collapse(true)
    setSelectionRange(range)
    emitContent()
  }

  function caretRangeFromPoint(x: number, y: number): Range | null {
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

  // ---- 内联图片预览 ----
  const openInlineImagePreview = useCallback(
    (previewSrc: string): void => {
      if (disabled) return
      const root = getRoot()
      if (!root) return
      const items: CwMessageInputAttachmentPreviewItem[] = []
      const srcOrder: string[] = []
      root
        .querySelectorAll<HTMLImageElement>(`img[${IM_RICH_INLINE_IMAGE_ATTR}]`)
        .forEach((img) => {
          const wrap = img.closest<HTMLElement>('[data-cw-inline-image-wrap]')
          const src = (
            wrap?.getAttribute('data-preview-src') ||
            img.getAttribute('src') ||
            ''
          ).trim()
          if (!src || srcOrder.includes(src)) return
          const name =
            (wrap?.getAttribute('data-image-name') || img.getAttribute('alt') || '').trim() ||
            'image'
          srcOrder.push(src)
          items.push({
            key: src,
            file: new File([], name),
            kind: 'image',
            objectUrl: src,
          })
        })
      if (items.length === 0) return
      const index = srcOrder.indexOf(previewSrc.trim())
      onInlineImagePreview?.({
        items,
        startPosition: clampIndex(index >= 0 ? index : 0, items.length),
        ...(onAttachmentPreviewContextMenu
          ? { onContextMenu: onAttachmentPreviewContextMenu }
          : {}),
      })
    },
    [
      disabled,
      getRoot,
      onAttachmentPreviewContextMenu,
      onInlineImagePreview,
    ],
  )

  // 点击 chip（预览 / 关闭）走事件委托，避免 contenteditable 内的 React 子树
  function handleEditorClick(event: ReactMouseEvent<HTMLDivElement>): void {
    const target = event.target as HTMLElement | null
    if (!target) return
    const closeTarget = target.closest<HTMLElement>('[data-chip-close]')
    if (closeTarget) {
      event.preventDefault()
      event.stopPropagation()
      const kind = closeTarget.getAttribute('data-chip-close')
      const chip =
        closeTarget.closest<HTMLElement>(
          kind === 'image' ? '[data-cw-inline-image-wrap]' : '[data-cw-file-ref-wrap]',
        ) ?? closeTarget
      chip.remove()
      emitContent()
      return
    }
    const previewTarget = target.closest<HTMLElement>('[data-chip-preview="image"]')
    if (previewTarget) {
      event.preventDefault()
      event.stopPropagation()
      const wrap = previewTarget.closest<HTMLElement>('[data-cw-inline-image-wrap]')
      const src =
        wrap?.getAttribute('data-preview-src') ||
        previewTarget.querySelector('img')?.getAttribute('src') ||
        ''
      if (src) openInlineImagePreview(src)
    }
  }

  function handleEditorKeyDown(event: ReactKeyboardEvent<HTMLDivElement>): void {
    handleKeyDown(event)
  }

  function handleEditorFocus(): void {
    onEditorFocus?.()
  }

  function handleEditorBlur(): void {
    setMentionQuery((prev) => (prev === null ? prev : null))
    onEditorBlur?.()
  }

  function handleEditorPointerDown(event: ReactPointerEvent<HTMLDivElement>): void {
    if (event.nativeEvent.isTrusted) onEditorPointerDown?.()
  }

  function handleEditorCompositionStart(): void {
    composingRef.current = true
  }

  function handleEditorCompositionEnd(): void {
    composingRef.current = false
    emitContent()
    refreshMentionState()
    requestAnimationFrame(() => convertEmojiCharsToNodes())
  }

  const editorHandle = useMemo<CwMessageInputEditorHandle>(() => {
    return {
      get dom() {
        const root = getRoot()
        if (!root) throw new Error('CwMessageInput editor is not mounted')
        return root
      },
      commands: {
        focus: () => {
          const root = getRoot()
          if (root) focusEditorWithKeyboardPolicy(root, suppressVirtualKeyboard)
        },
        blur: () => getRoot()?.blur(),
        clearContent: () => {
          clearEditorContent()
          emitContent()
        },
      },
      getHTML,
      getText: getPlainText,
      isEmpty: () => {
        const root = getRoot()
        return root ? isEditorEmpty(root) : true
      },
    }
  }, [
    clearEditorContent,
    emitContent,
    getHTML,
    getPlainText,
    getRoot,
    suppressVirtualKeyboard,
  ])

  const actionsRef = useRef({
    insertText,
    getEditor: (): CwMessageInputEditorHandle | null =>
      getRoot() ? editorHandle : null,
    getHTML,
    getPlainText,
    insertFileRef,
    ingestDroppedFiles,
    canSubmit: canSend,
    submit: handleSend,
    focus: () => {
      const root = getRoot()
      if (root) focusEditorWithKeyboardPolicy(root, suppressVirtualKeyboard)
    },
    blur: () => getRoot()?.blur(),
    clear: () => {
      clearEditorContent()
      emitContent()
    },
  })
  actionsRef.current = {
    insertText,
    getEditor: () => (getRoot() ? editorHandle : null),
    getHTML,
    getPlainText,
    insertFileRef,
    ingestDroppedFiles,
    canSubmit: canSend,
    submit: handleSend,
    focus: () => {
      const root = getRoot()
      if (root) focusEditorWithKeyboardPolicy(root, suppressVirtualKeyboard)
    },
    blur: () => getRoot()?.blur(),
    clear: () => {
      clearEditorContent()
      emitContent()
    },
  }

  useImperativeHandle(
    ref,
    () => ({
      insertText: (text: string) => actionsRef.current.insertText(text),
      getEditor: () => actionsRef.current.getEditor(),
      getHTML: () => actionsRef.current.getHTML(),
      getPlainText: () => actionsRef.current.getPlainText(),
      insertFileRef: (path: string, label?: string, lines?: string) =>
        actionsRef.current.insertFileRef(path, label, lines),
      ingestDroppedFiles: (files: File[]) =>
        actionsRef.current.ingestDroppedFiles(files),
      canSubmit: () => actionsRef.current.canSubmit(),
      submit: () => actionsRef.current.submit(),
      focus: () => actionsRef.current.focus(),
      blur: () => actionsRef.current.blur(),
      clear: () => actionsRef.current.clear(),
    }),
    [],
  )

  return (
    <form
      {...rest}
      className={[styles.root, className].filter(Boolean).join(' ')}
      onSubmit={(event) => {
        event.preventDefault()
        handleSend()
      }}
    >
      {mentionPanelMounted && mentionPanelVariant !== 'sheet' && (
        <CwMessageInputMentionPanel
          ref={mentionPopupRef}
          value={mentionPopupVisible}
          virtualReference={mentionVirtualRef}
          items={filteredMentionItems}
          highlightIndex={mentionHighlightIndex}
          mentionAvatarFallbackSrc={mentionAvatarFallbackSrc}
          texts={{ mentionNoMatch: texts.mentionNoMatch }}
          onSelect={pickMention}
        />
      )}

      {mentionSheetMounted && mentionPanelVariant === 'sheet' && (
        <CwMessageInputMentionSheet
          value={mentionSheetVisible}
          searchQuery={mentionSheetSearch}
          items={mentionSheetItems}
          highlightIndex={mentionHighlightIndex}
          mentionAvatarFallbackSrc={mentionAvatarFallbackSrc}
          texts={{ mentionNoMatch: texts.mentionNoMatch }}
          onSearchQueryChange={setMentionSheetSearch}
          onSelect={pickMention}
          onDismiss={cancelMention}
        />
      )}

      <div
        className={styles.fieldShell}
        onMouseDown={onFieldShellPointerDown}
      >
        <div
          ref={fieldRef}
          className={[styles.field, disabled ? styles.fieldDisabled : '']
            .filter(Boolean)
            .join(' ')}
          style={fieldStyle}
        >
          <div
            ref={editorRef}
            className={EDITOR_CLASS}
            contentEditable={!disabled}
            suppressContentEditableWarning
            role="textbox"
            aria-multiline="true"
            aria-disabled={disabled ? 'true' : 'false'}
            aria-label={placeholderResolved || undefined}
            spellCheck
            onInput={handleEditorInput}
            onBeforeInput={handleBeforeInput}
            onKeyDown={handleEditorKeyDown}
            onKeyUp={refreshMentionState}
            onMouseUp={refreshMentionState}
            onPaste={handlePaste}
            onDrop={handleDrop}
            onCopy={handleCopy}
            onCut={handleCut}
            onClick={handleEditorClick}
            onFocus={handleEditorFocus}
            onBlur={handleEditorBlur}
            onPointerDown={handleEditorPointerDown}
            onCompositionStart={handleEditorCompositionStart}
            onCompositionEnd={handleEditorCompositionEnd}
          />
        </div>
      </div>
    </form>
  )
})

export default CwMessageInput
