import './cw-chat-message-composer.css'
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type DragEvent as ReactDragEvent,
  type HTMLAttributes,
} from 'react'
import CwChatToolbar from '../CwChatToolbar/CwChatToolbar'
import CwMessageInput from '../CwMessageInput/CwMessageInput'
import CwChatMessageQuote from '../CwChatMessageQuote/CwChatMessageQuote'
import {
  CHAT_CARD_BUBBLE_BODY_INNER_CLASS,
  chatCardBubbleWrapperMaxWidthStyle,
} from '../CwChatMessageCell/chatMessageBubbleLayout'
import { defaultCwChatToolbarTexts } from '../CwChatToolbar/texts'
import { defaultCwMessageInputTexts } from '../CwMessageInput/texts'
import { CW_TREE_NODE_DRAG_MIME } from '../CwTree/treeDragMime'
import type {
  CwChatToolbarActionPayload,
  CwChatToolbarItemConfig,
} from '../CwChatToolbar/types'
import type {
  CwMessageInputExpose,
  CwMessageInputInlineImagePreviewPayload,
} from '../CwMessageInput/types'
import type {
  CwChatMessageComposerEmits,
  CwChatMessageComposerHandle,
  CwChatMessageComposerMobileAccessoryPanel,
  CwChatMessageComposerMobileMoreItem,
  CwChatMessageComposerMobileShellHandle,
  CwChatMessageComposerProps,
} from './types'
import CwChatMessageComposerMobileShell from './CwChatMessageComposerMobileShell'
import CwChatToolbarExpressionPanel from '../CwChatToolbar/CwChatToolbarExpressionPanel'
import CwChatToolbarEmojiPanel from '../CwChatToolbar/CwChatToolbarEmojiPanel'
import CwChatMessageComposerMobileMorePanel from './CwChatMessageComposerMobileMorePanel'
import CwChatMessageComposerWorkspaceFooter from './CwChatMessageComposerWorkspaceFooter'
import CwPendingComposerAttachments from '../CwPendingComposerAttachments/CwPendingComposerAttachments'
import type { CwPendingComposerAttachmentsHandle } from '../CwPendingComposerAttachments/types'
import type { CwPendingAttachmentPreviewRequest } from '../CwPendingComposerAttachments/types'
import { showCwAttachmentPreview } from '../CwAttachmentPreview/showCwAttachmentPreview'
import type { AttachmentPreviewContextMenuEvent } from '../CwAttachmentPreview/types'
import type { CwAttachmentGalleryItem } from '../CwAttachmentGallery/types'
import { composerBase, resolveComposerRootClass } from './styles'
import { defaultCwChatMessageComposerTexts } from './texts'
import { syncVirtualKeyboardOpenState } from '../../lib/virtualKeyboard'
import { absolutePathFromTreeDrop } from './functions/absolutePathFromTreeDrop'
import { useChatToolbarFilePick } from './functions/useChatToolbarFilePick'
import {
  CwPublicAssetBaseUrlContext,
  resolveDefaultPublicAssetBaseUrl,
} from '../../utils/publicAssetBaseUrl'

/** 待传附件工具栏项 key；`toolbar-files-picked` 不在 Composer 内向上透传该 key */
const CW_CHAT_COMPOSER_PENDING_ATTACHMENT_TOOLBAR_KEY =
  '__cw_composer_pending_attachment__'

const WORKSPACE_TEXTAREA_MIN_ROWS = 1
const WORKSPACE_TEXTAREA_MAX_ROWS = 8
const WORKSPACE_TEXTAREA_FIELD_PAD_Y_REM = 1

export interface CwChatMessageComposerComponentProps
  extends CwChatMessageComposerProps,
    CwChatMessageComposerEmits,
    Omit<
      HTMLAttributes<HTMLDivElement>,
      | 'children'
      | 'className'
      | 'onSubmit'
      | 'onChange'
      | 'onInput'
      | 'onDrop'
      | 'onDragOver'
      | 'onClick'
    > {
  className?: string
}

export const CwChatMessageComposer = forwardRef<
  CwChatMessageComposerHandle,
  CwChatMessageComposerComponentProps
>(function CwChatMessageComposer(props, ref) {
  const {
    disabled = false,
    mentionAvatarFallbackSrc,
    mentionItems,
    enableAttachments = false,
    onDroppedFiles,
    attachmentMultiple = true,
    attachmentAccept,
    fixedTextareaRows,
    textareaMinRows,
    textareaMaxRows,
    textareaFieldPadYRem,
    externalAttachmentUi,
    placeholder,
    maxLength,
    showToolbar = true,
    toolbarItems = [],
    rootLayout = 'default',
    rootClass = '',
    acceptTreePathDrop = false,
    treeDropAbsoluteRoot = null,
    replyPreview,
    texts: textsProp,
    chatToolbarTexts: chatToolbarTextsProp,
    messageInputTexts: messageInputTextsProp,
    droppedFilePathResolver,
    onAttachmentPreviewContextMenu,
    mobileCompactLayout = false,
    mobileCompactKeepToolbar,
    mobileMinRows,
    mobileMaxRows,
    mobileShellTexts: mobileShellTextsProp,
    mobileShowVoice,
    mobileShowEmoji,
    mobileShowMore,
    stickerPacks,
    voiceWaveformLevels,
    mobileMorePanelItems = [],
    mobileMorePanelExtraItems,
    layoutVariant = 'default',
    stopReplyActive = false,
    outboundHoldActive = false,
    workspaceShowAttachButton = true,
    publicAssetBaseUrl: publicAssetBaseUrlProp,
    mobileAccessoryPanel: mobileAccessoryPanelProp,
    toolbarAppendSlot,
    attachmentsAboveSlot,
    aboveWorkspaceShellSlot,
    workspaceFooterLeftSlot,
    className,
  } = props

  const composerReplyQuoteWrapperMaxWidthStyle = chatCardBubbleWrapperMaxWidthStyle()

  const publicAssetBaseUrl =
    publicAssetBaseUrlProp?.trim() || resolveDefaultPublicAssetBaseUrl()

  const shellStyles = composerBase

  const texts = useMemo(
    () => ({
      ...defaultCwChatMessageComposerTexts,
      ...(textsProp ?? {}),
    }),
    [textsProp],
  )

  const chatToolbarTexts = useMemo(
    () => ({
      ...defaultCwChatToolbarTexts,
      ...(chatToolbarTextsProp ?? {}),
    }),
    [chatToolbarTextsProp],
  )

  const isWorkspaceLayout = layoutVariant === 'workspace'

  /** 微信式底栏：显式 `mobileCompactLayout`，或业务传入 `mobileMinRows` + `mobileMaxRows` */
  const isMobileShell =
    !isWorkspaceLayout &&
    (Boolean(mobileCompactLayout) ||
      (mobileMinRows != null && mobileMaxRows != null))

  const messageInputFieldLayout = isWorkspaceLayout
    ? 'workspace'
    : isMobileShell
      ? 'mobileCompact'
      : 'default'

  const messageInputFixedTextareaRows = isWorkspaceLayout
    ? undefined
    : fixedTextareaRows

  const messageInputTextareaMinRows = isWorkspaceLayout
    ? (textareaMinRows ?? WORKSPACE_TEXTAREA_MIN_ROWS)
    : textareaMinRows

  const messageInputTextareaMaxRows = isWorkspaceLayout
    ? WORKSPACE_TEXTAREA_MAX_ROWS
    : textareaMaxRows

  const messageInputTextareaFieldPadYRem = isWorkspaceLayout
    ? WORKSPACE_TEXTAREA_FIELD_PAD_Y_REM
    : textareaFieldPadYRem

  const showDesktopToolbar =
    !isWorkspaceLayout &&
    showToolbar &&
    (!isMobileShell || Boolean(mobileCompactKeepToolbar))

  /** 底栏按钮：compact 模式默认全开；仅显式 false，或「保留顶栏且不重复」时关闭 */
  const mobileShellShowVoice = isMobileShell && mobileShowVoice !== false

  const mobileShellShowEmoji = (() => {
    if (!isMobileShell) return false
    if (mobileShowEmoji === false) return false
    if (mobileCompactKeepToolbar && showDesktopToolbar) return false
    return true
  })()

  const mobileShellShowMore = (() => {
    if (!isMobileShell) return false
    if (mobileShowMore === false) return false
    if (mobileCompactKeepToolbar && showDesktopToolbar) return false
    return true
  })()

  const [mobileAccessoryPanel, setMobileAccessoryPanelState] =
    useState<CwChatMessageComposerMobileAccessoryPanel>(
      mobileAccessoryPanelProp ?? 'none',
    )
  const mobileAccessoryPanelRef = useRef(mobileAccessoryPanel)
  mobileAccessoryPanelRef.current = mobileAccessoryPanel

  useEffect(() => {
    if (mobileAccessoryPanelProp == null) return
    setMobileAccessoryPanelState(mobileAccessoryPanelProp)
  }, [mobileAccessoryPanelProp])

  const keyboardClearTimerRef = useRef<number | null>(null)

  function setMobileAccessoryPanel(
    panel: CwChatMessageComposerMobileAccessoryPanel,
  ) {
    if (mobileAccessoryPanelRef.current === panel) return
    mobileAccessoryPanelRef.current = panel
    setMobileAccessoryPanelState(panel)
    props.onMobileAccessoryPanelChange?.(panel)
  }

  function syncMobileComposerKeyboardInset(open: boolean) {
    if (!isMobileShell) return
    syncVirtualKeyboardOpenState(open)
  }

  function scheduleClearMobileComposerKeyboardInset() {
    if (keyboardClearTimerRef.current != null) {
      window.clearTimeout(keyboardClearTimerRef.current)
    }
    keyboardClearTimerRef.current = window.setTimeout(() => {
      if (mobileAccessoryPanelRef.current === 'emoji') return
      syncMobileComposerKeyboardInset(false)
    }, 250)
  }

  useEffect(
    () => () => {
      if (keyboardClearTimerRef.current != null) {
        window.clearTimeout(keyboardClearTimerRef.current)
      }
    },
    [],
  )

  const mobileAccessoryDockClass = shellStyles.mobileAccessoryDock ?? ''
  const mobileAccessoryDockInnerClass = shellStyles.mobileAccessoryDockInner ?? ''

  const mobileEmojiActive = mobileAccessoryPanel === 'emoji'
  const mobileMoreActive = mobileAccessoryPanel === 'more'

  const messageInputTexts = useMemo(
    () => ({
      ...defaultCwMessageInputTexts,
      ...(messageInputTextsProp ?? {}),
    }),
    [messageInputTextsProp],
  )

  const injectPendingAttachmentToolbar =
    (showToolbar || isWorkspaceLayout) &&
    enableAttachments &&
    !externalAttachmentUi

  const mobileMorePanelItemsResolved =
    useMemo((): CwChatMessageComposerMobileMoreItem[] => {
      const items: CwChatMessageComposerMobileMoreItem[] = [
        ...mobileMorePanelItems,
      ]
      if (injectPendingAttachmentToolbar) {
        const label =
          messageInputTexts.addAttachmentAriaLabel?.trim() || '附件'
        items.push({
          key: CW_CHAT_COMPOSER_PENDING_ATTACHMENT_TOOLBAR_KEY,
          label,
          icon: 'common--action--link-line',
        })
      }
      const extra = mobileMorePanelExtraItems ?? []
      for (const item of extra) {
        if (!items.some((i) => i.key === item.key)) items.push(item)
      }
      return items
    }, [
      mobileMorePanelItems,
      mobileMorePanelExtraItems,
      injectPendingAttachmentToolbar,
      messageInputTexts.addAttachmentAriaLabel,
    ])

  useEffect(() => {
    if (disabled) closeMobileAccessoryPanel()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disabled])

  useEffect(() => {
    if (!stopReplyActive) return
    closeMobileAccessoryPanel()
    mobileShellRef.current?.exitVoiceMode()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stopReplyActive])

  function closeMobileAccessoryPanel() {
    setMobileAccessoryPanel('none')
  }

  function blurMobileEditor() {
    messageInputRef.current?.getEditor()?.commands.blur()
  }

  function onMobileEditorFocus() {
    if (!isMobileShell) return
    if (keyboardClearTimerRef.current != null) {
      window.clearTimeout(keyboardClearTimerRef.current)
    }
    // 表情输入模式：程序化 focus（选表情）不关闭面板；用户点输入区走 editor-pointerdown
    if (mobileAccessoryPanelRef.current === 'emoji') return
    syncMobileComposerKeyboardInset(true)
    closeMobileAccessoryPanel()
  }

  function onMobileEditorBlur() {
    if (!isMobileShell) return
    scheduleClearMobileComposerKeyboardInset()
  }

  function onMobileEditorPointerDown() {
    if (!isMobileShell) return
    if (mobileAccessoryPanelRef.current !== 'emoji') return
    closeMobileAccessoryPanel()
    requestAnimationFrame(() => {
      messageInputRef.current?.getEditor()?.commands.focus()
    })
  }

  function toggleMobileEmojiPanel() {
    if (disabled) return
    const opening = mobileAccessoryPanelRef.current !== 'emoji'
    if (opening) {
      mobileShellRef.current?.exitVoiceMode()
      blurMobileEditor()
      syncMobileComposerKeyboardInset(false)
      props.onExpressionPanelOpen?.()
    }
    setMobileAccessoryPanel(opening ? 'emoji' : 'none')
  }

  function toggleMobileMorePanel() {
    if (disabled) return
    const opening = mobileAccessoryPanelRef.current !== 'more'
    if (opening) blurMobileEditor()
    setMobileAccessoryPanel(opening ? 'more' : 'none')
  }

  function onMobileSendClick() {
    if (disabled) return
    closeMobileAccessoryPanel()
    messageInputRef.current?.submit()
  }

  function onMobileVoiceModeChange(active: boolean) {
    if (active) closeMobileAccessoryPanel()
    props.onVoiceModeChange?.(active)
  }

  function onMobileMorePanelSelect(toolKey: string) {
    closeMobileAccessoryPanel()
    if (toolKey === CW_CHAT_COMPOSER_PENDING_ATTACHMENT_TOOLBAR_KEY) {
      openAttachmentPicker()
      return
    }
    const fileKeys = new Set(['file', 'image'])
    const toolbarHasFilePicker = toolbarItems.some(
      (i) => i.key === toolKey && i.action?.type === 'open-file-picker',
    )
    if (fileKeys.has(toolKey) || toolbarHasFilePicker) {
      openToolbarFilePicker(toolKey)
      return
    }
    props.onToolbarTap?.({ kind: 'tap', key: toolKey })
  }

  const mobileShellTexts = mobileShellTextsProp ?? {}

  const messageInputMentionPanelVariant: 'sheet' | 'popup' = isMobileShell
    ? 'sheet'
    : 'popup'

  /** 移动端底栏：微信式无 placeholder */
  const messageInputPlaceholder = isMobileShell ? '' : placeholder

  const toolbarItemsResolved = useMemo((): CwChatToolbarItemConfig[] => {
    const list = [...toolbarItems]
    if (!injectPendingAttachmentToolbar) return list
    if (
      list.some(
        (i) => i.key === CW_CHAT_COMPOSER_PENDING_ATTACHMENT_TOOLBAR_KEY,
      )
    ) {
      return list
    }
    const label =
      messageInputTexts.addAttachmentAriaLabel?.trim() || '添加附件'
    const item: CwChatToolbarItemConfig = {
      key: CW_CHAT_COMPOSER_PENDING_ATTACHMENT_TOOLBAR_KEY,
      label,
      icon: 'common--action--link-line',
      action: {
        type: 'open-file-picker',
        accept: attachmentAccept ?? '*/*',
      },
    }
    const emojiIdx = list.findIndex((i) => i.key === 'emoji')
    if (emojiIdx >= 0) list.splice(emojiIdx + 1, 0, item)
    else list.unshift(item)
    return list
  }, [
    toolbarItems,
    injectPendingAttachmentToolbar,
    messageInputTexts.addAttachmentAriaLabel,
    attachmentAccept,
  ])

  const rootClassMerged = [
    resolveComposerRootClass(rootLayout),
    rootClass,
    className,
  ]
    .filter(Boolean)
    .join(' ')
    .trim()

  function forwardToolbarTap(payload: CwChatToolbarActionPayload) {
    props.onToolbarTap?.(payload)
  }

  const messageInputRef = useRef<CwMessageInputExpose | null>(null)
  const mobileShellRef = useRef<CwChatMessageComposerMobileShellHandle | null>(
    null,
  )
  const pendingAttachmentsRef =
    useRef<CwPendingComposerAttachmentsHandle | null>(null)

  const [pendingCount, setPendingCount] = useState(0)
  const pendingCountRef = useRef(0)

  const [editorPlainText, setEditorPlainText] = useState('')

  function addPendingFiles(files: File[] | FileList) {
    pendingAttachmentsRef.current?.addFiles(files)
  }

  function clearPendingFiles() {
    pendingAttachmentsRef.current?.clearPendingFiles()
  }

  function onPendingAttachmentsChange(files: File[]) {
    pendingCountRef.current = files.length
    setPendingCount(files.length)
    syncWorkspaceCanSend()
  }

  const {
    chatToolbarFileInputRef,
    onChatToolbarItemClick,
    onChatToolbarFileChange,
    openFilePickerForKey,
  } = useChatToolbarFilePick({
    onToolbarTap: forwardToolbarTap,
    defaultFilePickerMultiple: () => attachmentMultiple,
    onToolbarFilesPicked(toolKey, files) {
      if (toolKey === CW_CHAT_COMPOSER_PENDING_ATTACHMENT_TOOLBAR_KEY) {
        addPendingFiles(files)
        return
      }
      props.onToolbarFilesPicked?.(toolKey, files)
    },
  })

  const submitSuspended = Boolean(stopReplyActive || outboundHoldActive)

  function onMessageSubmit(payload: { html: string; files: File[] }) {
    if (submitSuspended) return
    const html = payload.html.trim()
    const pending = pendingAttachmentsRef.current?.pendingFiles
    const merged = pending ? [...pending] : []
    if (!html && merged.length === 0) return
    props.onSubmit?.({ html: payload.html, files: merged })
    clearPendingFiles()
    pendingCountRef.current = 0
    setPendingCount(0)
    syncWorkspaceCanSend()
    if (isMobileShell) closeMobileAccessoryPanel()
  }

  function ingestComposerDroppedFiles(files: File[]) {
    if (!enableAttachments || externalAttachmentUi) return
    if (onDroppedFiles) {
      onDroppedFiles(files)
      return
    }
    messageInputRef.current?.ingestDroppedFiles(files)
  }

  function onEmojiPick(emoji: string) {
    mobileShellRef.current?.exitVoiceMode()
    messageInputRef.current?.insertText(emoji)
  }

  function onStickerPick(payload: import('../CwChatToolbar/types').CwChatStickerPickPayload) {
    closeMobileAccessoryPanel()
    props.onStickerPick?.(payload)
  }

  function hasExternalFileDrag(dt: DataTransfer | null | undefined) {
    if (!dt) return false
    if (Array.from(dt.types).includes('Files')) return true
    if (dt.items?.length) {
      for (const item of Array.from(dt.items)) {
        if (item.kind === 'file') return true
      }
    }
    return false
  }

  function onComposerDragOver(e: ReactDragEvent<HTMLDivElement>) {
    if (enableAttachments && hasExternalFileDrag(e.dataTransfer)) {
      e.preventDefault()
      if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy'
    }
    if (!acceptTreePathDrop) return
    const dt = e.dataTransfer
    if (!dt) return
    const types = Array.from(dt.types ?? [])
    if (types.includes(CW_TREE_NODE_DRAG_MIME) || types.includes('text/plain')) {
      e.preventDefault()
      dt.dropEffect = 'copy'
    }
  }

  function onComposerDrop(e: ReactDragEvent<HTMLDivElement>) {
    if (enableAttachments) {
      const list = e.dataTransfer?.files
      if (list && list.length > 0) {
        e.preventDefault()
        e.stopPropagation()
        ingestComposerDroppedFiles(Array.from(list))
        return
      }
    }
    onTreeDrop(e)
  }

  function onTreeDrop(e: ReactDragEvent<HTMLDivElement>) {
    if (!acceptTreePathDrop) return
    const dt = e.dataTransfer
    if (!dt) return
    const raw =
      dt.getData(CW_TREE_NODE_DRAG_MIME) || dt.getData('text/plain')
    const relOrKey = (raw.split(/\r?\n/)[0] ?? '').trim()
    if (!relOrKey) return
    e.preventDefault()
    e.stopPropagation()
    const root = treeDropAbsoluteRoot?.trim() ?? ''
    const pathToInsert = root
      ? absolutePathFromTreeDrop(root, relOrKey)
      : relOrKey
    messageInputRef.current?.insertFileRef(
      pathToInsert,
      pathToInsert.split('/').pop(),
    )
  }

  function openAttachmentPicker() {
    if (!injectPendingAttachmentToolbar) return
    openFilePickerForKey(
      CW_CHAT_COMPOSER_PENDING_ATTACHMENT_TOOLBAR_KEY,
      attachmentAccept ?? '*/*',
    )
  }

  function openToolbarFilePicker(toolKey: string) {
    const item = toolbarItemsResolved.find((i) => i.key === toolKey)
    if (!item) {
      forwardToolbarTap({ kind: 'tap', key: toolKey })
      return
    }
    const action = item.action ?? { type: 'emit' }
    if (action.type === 'open-file-picker') {
      openFilePickerForKey(toolKey, action.accept, action.multiple)
      return
    }
    forwardToolbarTap({ kind: 'tap', key: toolKey })
  }

  const [workspaceCanSend, setWorkspaceCanSend] = useState(false)

  function syncWorkspaceCanSend() {
    if (!isWorkspaceLayout) return
    const canInput = messageInputRef.current?.canSubmit() ?? false
    setWorkspaceCanSend(canInput || pendingCountRef.current > 0)
  }

  function onWorkspaceMessageInput() {
    syncWorkspaceCanSend()
  }

  useEffect(() => {
    syncWorkspaceCanSend()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submitSuspended])

  function onWorkspaceSendClick() {
    if (disabled || submitSuspended) return
    messageInputRef.current?.submit()
  }

  function onWorkspaceAttachClick() {
    if (injectPendingAttachmentToolbar) {
      openAttachmentPicker()
      return
    }
    openToolbarFilePicker('image')
  }

  function onWorkspaceStopClick() {
    props.onStopAiReply?.()
  }

  function mapGalleryItemToPending(
    item: CwAttachmentGalleryItem,
  ): import('../CwPendingComposerAttachments/types').CwPendingAttachmentPreviewItem | null {
    if (!item.file) return null
    return {
      key: String(item.key),
      file: item.file,
      kind:
        item.kind === 'video' || item.kind === 'file' ? item.kind : 'image',
      sizeBytes: item.sizeBytes ?? item.file.size,
      sourceIndex: item.sourceIndex ?? 0,
      objectUrl: item.objectUrl,
    }
  }

  function mapPreviewContextMenu(
    handler: (payload: AttachmentPreviewContextMenuEvent) => void,
    payload: AttachmentPreviewContextMenuEvent,
  ) {
    handler(payload)
  }

  function openPendingPreview(request: CwPendingAttachmentPreviewRequest) {
    showCwAttachmentPreview({
      items: request.items.map((item) => ({
        key: item.key,
        kind: item.kind,
        file: item.file,
        sizeBytes: item.sizeBytes,
        sourceIndex: item.sourceIndex,
        objectUrl: item.objectUrl,
      })),
      startPosition: request.startPosition,
      onContextMenu: request.onContextMenu
        ? (payload) => {
            request.onContextMenu?.({
              clientX: payload.clientX,
              clientY: payload.clientY,
              index: payload.index,
              item: payload.item
                ? mapGalleryItemToPending(payload.item)
                : null,
            })
          }
        : undefined,
      publicAssetBaseUrl,
    })
  }

  function openInlineImagePreview(
    payload: CwMessageInputInlineImagePreviewPayload,
  ) {
    showCwAttachmentPreview({
      items: payload.items.map((item) => ({
        key: item.key,
        kind: 'image' as const,
        file: item.file,
        objectUrl: item.objectUrl,
      })),
      startPosition: payload.startPosition,
      onContextMenu: payload.onContextMenu
        ? (event) => {
            const item =
              event.item && event.item.file && event.item.kind === 'image'
                ? {
                    key: String(event.item.key),
                    file: event.item.file,
                    kind: 'image' as const,
                    objectUrl: event.item.objectUrl,
                  }
                : null
            payload.onContextMenu?.({
              clientX: event.clientX,
              clientY: event.clientY,
              index: event.index,
              item,
            })
          }
        : undefined,
      publicAssetBaseUrl,
    })
  }

  useImperativeHandle(
    ref,
    (): CwChatMessageComposerHandle => ({
      insertText: (t: string) => messageInputRef.current?.insertText(t),
      addFiles: addPendingFiles,
      clearPendingFiles,
      getPendingFiles: () => [
        ...(pendingAttachmentsRef.current?.pendingFiles ?? []),
      ],
      ingestDroppedFiles: (files: File[]) =>
        messageInputRef.current?.ingestDroppedFiles(files),
      insertFileRef: (path: string, label?: string, lines?: string) =>
        messageInputRef.current?.insertFileRef(path, label, lines),
      openAttachmentPicker,
      openToolbarFilePicker,
      getMessageInputRef: () => messageInputRef.current,
      closeMobileAccessoryPanel,
      exitMobileVoiceMode: () => mobileShellRef.current?.exitVoiceMode(),
      get mobileAccessoryPanel() {
        return mobileAccessoryPanelRef.current
      },
    }),
    [],
  )

  const messageInputCommonProps = {
    disabled,
    suspendSubmit: submitSuspended,
    mentionItems,
    mentionAvatarFallbackSrc,
    mentionPanelVariant: messageInputMentionPanelVariant,
    allowComposerAttachmentPipeline: injectPendingAttachmentToolbar,
    onDroppedFiles,
    droppedFilePathResolver,
    onAttachmentPreviewContextMenu,
    pendingAttachmentCount: pendingCount,
    placeholder: messageInputPlaceholder,
    maxLength,
    fieldLayout: messageInputFieldLayout,
    texts: messageInputTexts,
    onSubmit: onMessageSubmit,
    onInlineImagePreview: openInlineImagePreview,
  } as const

  return (
    <CwPublicAssetBaseUrlContext.Provider value={publicAssetBaseUrl}>
      <div
        className={rootClassMerged}
        role="region"
        aria-label={texts.regionLabel?.trim() || undefined}
        onDragOver={onComposerDragOver}
        onDrop={onComposerDrop}
      >
        {showDesktopToolbar ? (
          <CwChatToolbar
            disabled={disabled}
            items={toolbarItemsResolved}
            texts={chatToolbarTexts}
            onItemClick={onChatToolbarItemClick}
            stickerPacks={stickerPacks}
            onEmojiPick={onEmojiPick}
            onStickerPick={onStickerPick}
            onExpressionPanelOpen={() => props.onExpressionPanelOpen?.()}
            appendSlot={toolbarAppendSlot}
          />
        ) : null}
        {showDesktopToolbar || isMobileShell || isWorkspaceLayout ? (
          <input
            ref={chatToolbarFileInputRef}
            type="file"
            multiple={attachmentMultiple}
            className={shellStyles.toolbarFileInput}
            tabIndex={-1}
            aria-hidden="true"
            onChange={onChatToolbarFileChange}
          />
        ) : null}
        {isWorkspaceLayout ? (
          <>
            {aboveWorkspaceShellSlot}
            <div className={shellStyles.workspaceShell}>
              {replyPreview ? (
                <div
                  className={shellStyles.replyPreviewWrap}
                  style={composerReplyQuoteWrapperMaxWidthStyle}
                >
                  <CwChatMessageQuote
                    dismissible
                    preview={replyPreview}
                    className={CHAT_CARD_BUBBLE_BODY_INNER_CLASS}
                    onDismiss={() => props.onCancelReply?.()}
                  />
                </div>
              ) : null}
              {attachmentsAboveSlot}
              {injectPendingAttachmentToolbar ? (
                <CwPendingComposerAttachments
                  ref={pendingAttachmentsRef}
                  disabled={disabled}
                  closeLabel={messageInputTexts.fileRefDeleteTitle}
                  onAttachmentPreviewContextMenu={
                    onAttachmentPreviewContextMenu
                  }
                  onPreviewOpen={openPendingPreview}
                  onChange={onPendingAttachmentsChange}
                />
              ) : null}
              <CwMessageInput
                {...messageInputCommonProps}
                ref={messageInputRef}
                fixedTextareaRows={messageInputFixedTextareaRows}
                textareaMinRows={messageInputTextareaMinRows}
                textareaMaxRows={messageInputTextareaMaxRows}
                textareaFieldPadYRem={messageInputTextareaFieldPadYRem}
                onInput={() => {
                  setEditorPlainText(
                    messageInputRef.current?.getPlainText?.() ?? '',
                  )
                  onWorkspaceMessageInput()
                }}
              />
              <CwChatMessageComposerWorkspaceFooter
                disabled={disabled}
                canSend={workspaceCanSend}
                showStop={Boolean(outboundHoldActive)}
                showAttachButton={workspaceShowAttachButton}
                leftSlot={workspaceFooterLeftSlot}
                onAttach={onWorkspaceAttachClick}
                onSend={onWorkspaceSendClick}
                onStop={onWorkspaceStopClick}
              />
            </div>
          </>
        ) : (
          <>
            {injectPendingAttachmentToolbar ? (
              <CwPendingComposerAttachments
                ref={pendingAttachmentsRef}
                disabled={disabled}
                closeLabel={messageInputTexts.fileRefDeleteTitle}
                onAttachmentPreviewContextMenu={onAttachmentPreviewContextMenu}
                onPreviewOpen={openPendingPreview}
                onChange={onPendingAttachmentsChange}
              />
            ) : null}
            {replyPreview ? (
              <div
                className={shellStyles.replyPreviewWrap}
                style={composerReplyQuoteWrapperMaxWidthStyle}
              >
                <CwChatMessageQuote
                  dismissible
                  preview={replyPreview}
                  className={CHAT_CARD_BUBBLE_BODY_INNER_CLASS}
                  onDismiss={() => props.onCancelReply?.()}
                />
              </div>
            ) : null}
            {isMobileShell ? (
              <>
                <CwChatMessageComposerMobileShell
                  ref={mobileShellRef}
                  disabled={disabled}
                  minRows={mobileMinRows ?? 1}
                  maxRows={mobileMaxRows ?? 4}
                  messageInputRef={messageInputRef}
                  showVoice={mobileShellShowVoice}
                  showEmoji={mobileShellShowEmoji}
                  showMore={mobileShellShowMore}
                  stopReplyActive={Boolean(stopReplyActive)}
                  outboundHoldActive={Boolean(outboundHoldActive)}
                  emojiActive={mobileEmojiActive}
                  moreActive={mobileMoreActive}
                  insetSafeAreaBottom={mobileAccessoryPanel === 'none'}
                  texts={mobileShellTexts}
                  voiceWaveformLevels={voiceWaveformLevels}
                  editorPlainText={editorPlainText}
                  pendingAttachmentCount={pendingCount}
                  onVoiceToggle={() => props.onVoiceToggle?.()}
                  onVoiceModeChange={onMobileVoiceModeChange}
                  onVoiceRecordStart={() => props.onVoiceRecordStart?.()}
                  onVoiceRecordEnd={(payload) =>
                    props.onVoiceRecordEnd?.(payload)
                  }
                  onEmojiToggle={toggleMobileEmojiPanel}
                  onMoreToggle={toggleMobileMorePanel}
                  onSend={onMobileSendClick}
                  onStopAiReply={onWorkspaceStopClick}
                >
                  <CwMessageInput
                    {...messageInputCommonProps}
                    ref={messageInputRef}
                    suppressVirtualKeyboard={mobileEmojiActive}
                    onInput={() => {
                      setEditorPlainText(
                        messageInputRef.current?.getPlainText?.() ?? '',
                      )
                    }}
                    onEditorFocus={onMobileEditorFocus}
                    onEditorBlur={onMobileEditorBlur}
                    onEditorPointerDown={onMobileEditorPointerDown}
                  />
                </CwChatMessageComposerMobileShell>
                {mobileAccessoryPanel !== 'none' ? (
                  <div className={mobileAccessoryDockClass}>
                    <div className={mobileAccessoryDockInnerClass}>
                      {mobileAccessoryPanel === 'emoji' &&
                      (stickerPacks?.length ?? 0) > 0 ? (
                        <CwChatToolbarExpressionPanel
                          variant="mobileDock"
                          stickerPacks={stickerPacks}
                          texts={chatToolbarTexts}
                          onEmojiPick={onEmojiPick}
                          onStickerPick={onStickerPick}
                        />
                      ) : mobileAccessoryPanel === 'emoji' ? (
                        <CwChatToolbarEmojiPanel
                          variant="mobileDock"
                          showCategories={false}
                          texts={chatToolbarTexts}
                          onPick={onEmojiPick}
                        />
                      ) : mobileAccessoryPanel === 'more' ? (
                        <CwChatMessageComposerMobileMorePanel
                          items={mobileMorePanelItemsResolved}
                          onSelect={onMobileMorePanelSelect}
                        />
                      ) : null}
                    </div>
                  </div>
                ) : null}
              </>
            ) : (
              <CwMessageInput
                {...messageInputCommonProps}
                ref={messageInputRef}
                fixedTextareaRows={messageInputFixedTextareaRows}
                textareaMinRows={messageInputTextareaMinRows}
                textareaMaxRows={messageInputTextareaMaxRows}
                textareaFieldPadYRem={messageInputTextareaFieldPadYRem}
                onInput={() => {
                  setEditorPlainText(
                    messageInputRef.current?.getPlainText?.() ?? '',
                  )
                }}
              />
            )}
          </>
        )}
      </div>
    </CwPublicAssetBaseUrlContext.Provider>
  )
})

export default CwChatMessageComposer
