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
import {
  buildEditorContent,
  buildFragmentFromHtml,
  caretRangeFromPoint,
  collectClipboardImageFiles,
  createCaretMarker,
  createEmptyParagraph,
  getSelectionRange,
  insertNodesAtCaret,
  insertNodesAtMarker,
  isEditorEmpty,
  restoreCaretFromMarker,
  setSelectionRange,
  syncEmptyPlaceholder,
  textToNodes,
} from './functions/editorDom'
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
import { useMentionPicker } from './hooks/useMentionPicker'
import { resolveMessageInputLayoutClasses } from './styles'
import { defaultCwMessageInputTexts } from './texts'
import type {
  CwMessageInputAttachmentPreviewItem,
  CwMessageInputEditorHandle,
  CwMessageInputEmits,
  CwMessageInputExpose,
  CwMessageInputProps,
  CwMessageInputTexts,
} from './types'

const COMPOSER_LINE_HEIGHT_REM = 1.5
const EDITOR_CLASS =
  'ProseMirror prose prose-sm max-w-none outline-none min-h-[var(--size-touch-target)] [&>*]:my-0 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0'

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

  const {
    mentionQuery,
    setMentionQuery,
    mentionHighlightIndex,
    mentionPanelMounted,
    mentionSheetMounted,
    mentionSheetSearch,
    setMentionSheetSearch,
    filteredMentionItems,
    mentionSheetItems,
    mentionPopupVisible,
    mentionSheetVisible,
    mentionPickerOpen,
    pickerOpenRef,
    cancelMention,
    pickMention,
    refreshMentionState,
    mentionVirtualRef,
  } = useMentionPicker({
    mentionItems,
    mentionPanelVariant,
    disabled,
    fieldRef,
    getRoot,
    getPlainText,
    emitContent,
    resolveMentionProfile,
    publicAssetBaseUrl,
    suppressVirtualKeyboard,
    fileRefDeleteTitle: texts.fileRefDeleteTitle,
    mentionPopupRef,
  })

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
