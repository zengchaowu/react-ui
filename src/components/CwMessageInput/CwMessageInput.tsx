import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  type FormHTMLAttributes,
  type MouseEvent as ReactMouseEvent,
} from 'react'
import type { Editor } from '@tiptap/core'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import type { EditorView } from '@tiptap/pm/view'
import type { Slice } from '@tiptap/pm/model'
import {
  materializeImRichHtmlToPlainText,
  normalizeImRichEditorClipboardHtml,
  sanitizeImRichContentHtml,
} from '@zengchaowu/shared/functions/im/imRichContentHtml'
import { usePublicAssetBaseUrl } from '../../utils/publicAssetBaseUrl'
import { splitTextToEmojiParts } from '../../utils/emojioneEmoji'
import { CwMessageInputMentionPanel } from '../CwMessageInputMentionPanel'
import { CwMessageInputMentionSheet } from '../CwMessageInputMentionSheet'
import { EmojiNode } from './extensions/EmojiNode'
import { FileRefNode } from './extensions/FileRefNode'
import { ImageClipNode } from './extensions/ImageClipNode'
import { ImMentionNode } from './extensions/ImMentionNode'
import { clipboardImageFiles } from './functions/clipboardImageFiles'
import {
  hasEditorClipboardHtmlMarkers,
  restorablePlainFromEditorSlice,
  writeImRichClipboardData,
} from './functions/imRichEditorClipboard'
import {
  focusEditorWithKeyboardPolicy,
  syncEditorVirtualKeyboardPolicy,
} from './functions/focusEditorWithKeyboardPolicy'
import { useComposerLayout } from './hooks/useComposerLayout'
import { useComposerSelection } from './hooks/useComposerSelection'
import { useEmojiComposer } from './hooks/useEmojiComposer'
import { useImRichPaste } from './hooks/useImRichPaste'
import { useInlineImageClips } from './hooks/useInlineImageClips'
import { useMentions } from './hooks/useMentions'
import type {
  CwMessageInputEditorHandle,
  CwMessageInputEmits,
  CwMessageInputExpose,
  CwMessageInputProps,
} from './types'

const EDITOR_CLASS =
  'prose prose-sm max-w-none outline-none min-h-[var(--size-touch-target)] [&>*]:my-0 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0'

/** 编辑器事件经由 ref 读取最新处理器，避免 Tiptap 配置闭包过期 */
interface CompositorEventHandlers {
  onUpdate?: (args: { editor: Editor }) => void
  onSelectionUpdate?: (args: { editor: Editor }) => void
  onFocus?: () => void
  onBlur?: () => void
  onPointerDown?: () => void
  handleKeyDown?: (view: EditorView, event: KeyboardEvent) => boolean
  handlePaste?: (view: EditorView, event: ClipboardEvent) => boolean
  handleDrop?: (
    view: EditorView,
    event: DragEvent,
    slice: Slice,
    moved: boolean,
  ) => boolean
  handleCopy?: (view: EditorView, event: ClipboardEvent) => boolean
  handleCut?: (view: EditorView, event: ClipboardEvent) => boolean
  onImagePreview?: (previewSrc: string) => void
  onImageRemove?: (previewSrc?: string) => void
  resolveMentionProfile?: (uid: string) => { label: string; avatar?: string }
  isMentionInScope?: (uid: string) => boolean
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
  const editorRef = useRef<Editor | null>(null)
  const handlersRef = useRef<CompositorEventHandlers>({})

  const { styles, texts, placeholderResolved, fieldStyle } = useComposerLayout({
    fieldLayout,
    texts: textsProp,
    placeholder,
    fixedTextareaRows,
    textareaMinRows,
    textareaMaxRows,
    textareaFieldPadYRem,
  })

  const getEditor = useCallback((): Editor | null => editorRef.current, [])

  const getHTML = useCallback((): string => {
    const ed = editorRef.current
    return ed ? sanitizeImRichContentHtml(ed.getHTML()) : ''
  }, [])

  const getPlainText = useCallback((): string => {
    return materializeImRichHtmlToPlainText(getHTML())
  }, [getHTML])

  const emitContent = useCallback((): void => {
    onInput?.(getPlainText())
    onChange?.(getHTML())
  }, [getHTML, getPlainText, onChange, onInput])

  // ---- 扩展配置 ----
  const extensions = useMemo(
    () => [
      StarterKit.configure({
        heading: false,
        horizontalRule: false,
        blockquote: false,
        codeBlock: false,
        code: false,
        bulletList: false,
        orderedList: false,
        bold: false,
        italic: false,
        strike: false,
      }),
      EmojiNode.configure({ publicAssetBaseUrl }),
      Placeholder.configure({
        placeholder: placeholderResolved || undefined,
        emptyEditorClass: 'is-editor-empty',
        emptyNodeClass: 'is-editor-empty',
      }),
      FileRefNode.configure({
        removeAriaLabel: texts.fileRefDeleteTitle,
      }),
      ImageClipNode.configure({
        removeAriaLabel: texts.fileRefDeleteTitle,
        onPreview: (previewSrc) => handlersRef.current.onImagePreview?.(previewSrc),
        onRemove: ({ previewSrc }) => handlersRef.current.onImageRemove?.(previewSrc),
      }),
      ImMentionNode.configure({
        resolveMentionProfile: (uid) =>
          handlersRef.current.resolveMentionProfile?.(uid) ?? { label: uid },
        isMentionInScope: (uid) =>
          handlersRef.current.isMentionInScope?.(uid) ?? false,
      }),
    ],
    [placeholderResolved, publicAssetBaseUrl, texts.fileRefDeleteTitle],
  )

  const editorProps = useMemo(
    () => ({
      attributes: {
        class: EDITOR_CLASS,
        role: 'textbox',
        'aria-multiline': 'true',
        'aria-label': placeholderResolved || '',
        spellcheck: 'true',
      },
      transformPastedHTML(html: string) {
        if (html.includes('data-pm-slice')) return html
        return normalizeImRichEditorClipboardHtml(html)
      },
      clipboardTextSerializer(slice: Slice) {
        const ed = editorRef.current
        if (!ed) return ''
        return restorablePlainFromEditorSlice(slice, ed.schema)
      },
      handleDOMEvents: {
        mousedown(_view: EditorView, event: MouseEvent) {
          if (event.isTrusted) handlersRef.current.onPointerDown?.()
          return false
        },
        touchstart(_view: EditorView, event: TouchEvent) {
          if (event.isTrusted) handlersRef.current.onPointerDown?.()
          return false
        },
        /**
         * 阻止 contenteditable 把 `<script>` 等当成真实 HTML 节点解析（否则只剩内部文本）。
         * 改由 ProseMirror 以纯 text node 插入，发送后仍由 sanitizeImRichContentHtml 消毒。
         */
        beforeinput(view: EditorView, event: Event) {
          const inputEvent = event as InputEvent
          if (inputEvent.isComposing) return false
          const data = inputEvent.data
          if (!data || !/[<>]/.test(data)) return false
          if (
            inputEvent.inputType !== 'insertText' &&
            inputEvent.inputType !== 'insertReplacementText'
          ) {
            return false
          }
          event.preventDefault()
          const { from, to } = view.state.selection
          view.dispatch(view.state.tr.insertText(data, from, to))
          return true
        },
        copy(view: EditorView, event: ClipboardEvent) {
          return handlersRef.current.handleCopy?.(view, event) ?? false
        },
        cut(view: EditorView, event: ClipboardEvent) {
          return handlersRef.current.handleCut?.(view, event) ?? false
        },
      },
      handleKeyDown: (view: EditorView, event: KeyboardEvent) =>
        handlersRef.current.handleKeyDown?.(view, event) ?? false,
      handlePaste: (view: EditorView, event: ClipboardEvent) =>
        handlersRef.current.handlePaste?.(view, event) ?? false,
      handleDrop: (
        view: EditorView,
        event: DragEvent,
        slice: Slice,
        moved: boolean,
      ) => handlersRef.current.handleDrop?.(view, event, slice, moved) ?? false,
    }),
    [placeholderResolved],
  )

  const editorEvents = useMemo(
    () => ({
      onUpdate: (args: { editor: Editor }) => {
        handlersRef.current.onUpdate?.(args)
      },
      onSelectionUpdate: (args: { editor: Editor }) => {
        handlersRef.current.onSelectionUpdate?.(args)
      },
      onFocus: () => handlersRef.current.onFocus?.(),
      onBlur: () => handlersRef.current.onBlur?.(),
    }),
    [],
  )

  const editor = useEditor({
    content: value || '',
    editable: !disabled,
    extensions,
    editorProps,
    immediatelyRender: true,
    ...editorEvents,
  })

  editorRef.current = editor

  // ---- hooks ----
  const {
    rememberComposerSelection,
    restoreComposerSelectionBeforeInsert,
    scrollFieldCaretIntoView,
  } = useComposerSelection({ getEditor, fieldRef })

  const {
    mentionPopupRef,
    mentionHighlightIndex,
    mentionSheetSearch,
    setMentionSheetSearch,
    mentionQuery,
    filteredMentionItems,
    mentionSheetItems,
    mentionPopupVisible,
    mentionSheetVisible,
    mentionPickerOpen,
    mentionVirtualRef,
    scheduleMentionReposition,
    demoteOutOfScopeMentions,
    isMentionInScope,
    cancelMention,
    pickMention,
  } = useMentions({
    editor,
    fieldRef,
    mentionItems,
    mentionPanelVariant,
    disabled,
    getPlainText,
    notifyContentChanged: emitContent,
  })

  const { insertText, handleTextPasteWithEmoji, convertEmojiCharsToNodes } =
    useEmojiComposer({
      getEditor,
      publicAssetBaseUrl,
      suppressVirtualKeyboard,
      notifyContentChanged: emitContent,
      rememberComposerSelection,
      restoreComposerSelectionBeforeInsert,
      scrollFieldCaretIntoView,
    })

  const {
    insertImageClipsAt,
    editorHasInlineImageClips,
    openInlineImageClipPreview,
    dispatchDroppedFiles,
    ingestDroppedFiles,
    insertFileRef,
    insertDroppedFilesAt,
  } = useInlineImageClips({
    getEditor,
    disabled,
    allowComposerAttachmentPipeline,
    droppedFilePathResolver,
    onDroppedFiles,
    onAttachmentPreviewContextMenu,
    onInlineImagePreview,
    notifyContentChanged: emitContent,
  })

  const { pasteImRichFromClipboard } = useImRichPaste({
    getEditor,
    publicAssetBaseUrl,
    notifyContentChanged: emitContent,
    demoteOutOfScopeMentions,
    scrollFieldCaretIntoView,
  })

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

  // ---- 发送 ----
  function canSend(): boolean {
    if (disabled || suspendSubmit) return false
    const plain = getPlainText()
    if (plain.length > maxLength) return false
    if (plain.trim().length > 0) return true
    if (pendingAttachmentCount > 0) return true
    return editorHasInlineImageClips()
  }

  function handleSend(): void {
    if (mentionPickerOpen && mentionQuery != null) return
    if (!canSend()) return
    demoteOutOfScopeMentions()
    const html = getHTML()
    onSubmit?.({ html, files: [] })
    onSend?.(html)
    if (clearOnSubmit) {
      getEditor()?.commands.clearContent(true)
      emitContent()
    }
  }

  // ---- 键盘 / 剪贴板 / 拖拽 ----
  function handleEditorKeyDown(_view: EditorView, event: KeyboardEvent): boolean {
    const inMentionUi = mentionPickerOpen && mentionQuery != null
    if (event.key === 'Enter' && !event.shiftKey) {
      if (event.isComposing || event.keyCode === 229) return false
      if (inMentionUi) {
        event.preventDefault()
        return true
      }
      event.preventDefault()
      handleSend()
      return true
    }
    return false
  }

  function handleEditorPaste(_view: EditorView, event: ClipboardEvent): boolean {
    const images = clipboardImageFiles(event)
    if (images.length > 0) {
      if (allowComposerAttachmentPipeline) {
        event.preventDefault()
        if (onDroppedFiles) {
          dispatchDroppedFiles(images)
        } else {
          const ed = getEditor()
          if (ed) void insertImageClipsAt(ed.state.selection.anchor, images)
        }
        return true
      }
      return false
    }
    if (pasteImRichFromClipboard(event)) return true

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
      handleTextPasteWithEmoji(text)
      return true
    }
    return false
  }

  function handleEditorDrop(
    view: EditorView,
    event: DragEvent,
    _slice: Slice,
    moved: boolean,
  ): boolean {
    if (disabled || !allowComposerAttachmentPipeline || moved) return false
    const dt = event.dataTransfer
    if (!dt?.files?.length) return false
    const files = Array.from(dt.files).filter((file) => file.name.length > 0)
    if (files.length === 0) return false
    if (onDroppedFiles) {
      event.preventDefault()
      event.stopPropagation()
      dispatchDroppedFiles(files)
      return true
    }
    const hit = view.posAtCoords({ left: event.clientX, top: event.clientY })
    if (hit == null) return false
    event.preventDefault()
    event.stopPropagation()
    void insertDroppedFilesAt(hit.pos, files)
    return true
  }

  function handleEditorCopy(view: EditorView, event: ClipboardEvent): boolean {
    return writeImRichClipboardData(view, event)
  }

  function handleEditorCut(view: EditorView, event: ClipboardEvent): boolean {
    if (!writeImRichClipboardData(view, event)) return false
    view.dispatch(view.state.tr.deleteSelection())
    return true
  }

  // ---- 同步最新处理器给 Tiptap ----
  handlersRef.current = {
    onUpdate: () => {
      void convertEmojiCharsToNodes()
      emitContent()
      scrollFieldCaretIntoView()
      if (mentionPopupVisible) scheduleMentionReposition()
    },
    onSelectionUpdate: ({ editor: ed }) => {
      rememberComposerSelection(ed)
      scrollFieldCaretIntoView()
    },
    onFocus: () => onEditorFocus?.(),
    onBlur: () => onEditorBlur?.(),
    onPointerDown: () => onEditorPointerDown?.(),
    handleKeyDown: handleEditorKeyDown,
    handlePaste: handleEditorPaste,
    handleDrop: handleEditorDrop,
    handleCopy: handleEditorCopy,
    handleCut: handleEditorCut,
    onImagePreview: (previewSrc) => openInlineImageClipPreview(previewSrc),
    onImageRemove: (previewSrc) => {
      if (previewSrc?.startsWith('blob:')) {
        try {
          URL.revokeObjectURL(previewSrc)
        } catch {
          /* ignore */
        }
      }
    },
    resolveMentionProfile,
    isMentionInScope,
  }

  // ---- 焦点 / 空区点击 ----
  function onFieldShellPointerDown(event: ReactMouseEvent<HTMLDivElement>): void {
    if (disabled) return
    const ed = getEditor()
    if (!ed) return
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
    ed.chain().focus('end').run()
  }

  // ---- 外部状态同步 ----
  useEffect(() => {
    const ed = editorRef.current
    if (!ed) return
    ed.setEditable(!disabled)
    if (disabled) (ed.view.dom as HTMLElement).blur()
  }, [disabled])

  useEffect(() => {
    syncEditorVirtualKeyboardPolicy(editorRef.current, suppressVirtualKeyboard)
  }, [suppressVirtualKeyboard])

  // 提及候选项切换会话后降级
  useEffect(() => {
    if (!mentionItems) return
    demoteOutOfScopeMentions()
  }, [demoteOutOfScopeMentions, mentionItems])

  function getEditorHandle(): CwMessageInputEditorHandle | null {
    const ed = getEditor()
    if (!ed) return null
    return {
      dom: ed.view.dom as HTMLElement,
      commands: {
        focus: () => focusEditorWithKeyboardPolicy(ed, suppressVirtualKeyboard),
        blur: () => (ed.view.dom as HTMLElement).blur(),
        clearContent: () => {
          ed.commands.clearContent(true)
          emitContent()
        },
      },
      getHTML,
      getText: getPlainText,
      isEmpty: () => ed.isEmpty,
    }
  }

  function focusEditor(): void {
    const ed = getEditor()
    if (ed) focusEditorWithKeyboardPolicy(ed, suppressVirtualKeyboard)
  }

  function blurEditor(): void {
    const ed = getEditor()
    if (ed) (ed.view.dom as HTMLElement).blur()
  }

  function clearEditor(): void {
    getEditor()?.commands.clearContent(true)
    emitContent()
  }

  const actionsRef = useRef({
    insertText,
    getEditor: getEditorHandle,
    getHTML,
    getPlainText,
    insertFileRef,
    ingestDroppedFiles,
    canSubmit: canSend,
    submit: handleSend,
    focus: focusEditor,
    blur: blurEditor,
    clear: clearEditor,
  })
  actionsRef.current = {
    insertText,
    getEditor: getEditorHandle,
    getHTML,
    getPlainText,
    insertFileRef,
    ingestDroppedFiles,
    canSubmit: canSend,
    submit: handleSend,
    focus: focusEditor,
    blur: blurEditor,
    clear: clearEditor,
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
      {mentionPopupVisible && mentionPanelVariant !== 'sheet' && (
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

      {mentionSheetVisible && mentionPanelVariant === 'sheet' && (
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

      <div className={styles.fieldShell} onMouseDown={onFieldShellPointerDown}>
        <div
          ref={fieldRef}
          className={[styles.field, disabled ? styles.fieldDisabled : '']
            .filter(Boolean)
            .join(' ')}
          style={fieldStyle}
        >
          <EditorContent editor={editor} />
        </div>
      </div>
    </form>
  )
})

export default CwMessageInput
