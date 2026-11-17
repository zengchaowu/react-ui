import { useEffect, useMemo, useRef, useState } from 'react'
import type { HTMLAttributes, ReactNode } from 'react'
import { CW_AI_ASSISTANT_BUBBLE_APPEARANCE } from '../CwChatMessageCell/chatMessageBubbleSurface'
import CwAttachmentPreview from '../CwAttachmentPreview/CwAttachmentPreview'
import type { CwAttachmentGalleryItem } from '../CwAttachmentGallery/types'
import type { CwChatAttachmentPreviewOpenPayload } from '@zengchaowu/ui-shared/components/CwChatMessageCell/types'
import CwChatMessageComposer from '../CwChatMessageComposer/CwChatMessageComposer'
import CwChatMessageList, {
  type CwChatMessageListHandle,
} from '../CwChatMessageList/CwChatMessageList'
import { cwWorkbenchAiPanelStyles } from '@zengchaowu/ui-shared/components/CwWorkbenchAiPanel/styles'
import { defaultCwWorkbenchAiPanelTexts } from '@zengchaowu/ui-shared/components/CwWorkbenchAiPanel/texts'
import type { CwWorkbenchAiPanelProps } from '@zengchaowu/ui-shared/components/CwWorkbenchAiPanel/types'
import type { ChatMessage } from '@zengchaowu/shared/types/im-chat'

export interface CwWorkbenchAiPanelComponentProps
  extends CwWorkbenchAiPanelProps,
    Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'className' | 'onSubmit'> {
  /** 等价 Vue 具名插槽 `banner` */
  bannerSlot?: ReactNode
  /** 等价 Vue 具名插槽 `status` */
  statusSlot?: ReactNode
  /** 等价 Vue 具名插槽 `composer-attachments` */
  composerAttachmentsSlot?: ReactNode
  /** 等价 Vue 作用域插槽 `message-extra`：渲染在单条消息 cell 正下方 */
  messageExtraSlot?: (scope: { message: ChatMessage }) => ReactNode
  /** 等价 Vue `close` */
  onClose?: () => void
  /** 等价 Vue `clear` */
  onClear?: () => void
  /** 等价 Vue `stop` */
  onStop?: () => void
  /** 等价 Vue `submit` */
  onSubmit?: (payload: { html: string; files: File[] }) => void
  className?: string
}

function noopDownload() {
  /* workbench sidebar has no file messages by default */
}

export function CwWorkbenchAiPanel({
  messages = [],
  busy = false,
  ready = true,
  errorMessage = '',
  avatarFallbackSrc,
  publicAssetBaseUrl,
  hasSelectionContext = false,
  texts: textsProp,
  bannerSlot,
  statusSlot,
  composerAttachmentsSlot,
  messageExtraSlot,
  onStop,
  onSubmit,
  className,
  ...rest
}: CwWorkbenchAiPanelComponentProps) {
  const styles = cwWorkbenchAiPanelStyles

  const mergedTexts = useMemo(
    () => ({ ...defaultCwWorkbenchAiPanelTexts, ...textsProp }),
    [textsProp],
  )

  const avatarSrc = String(avatarFallbackSrc ?? '').trim()

  const publicAssetBase = String(publicAssetBaseUrl ?? '').trim()

  const composerPlaceholder = hasSelectionContext
    ? mergedTexts.composerPlaceholderWithContext
    : mergedTexts.composerPlaceholder

  const listRef = useRef<CwChatMessageListHandle | null>(null)

  /** 用户消息内上下文图标缩略图的全屏预览 */
  const [previewState, setPreviewState] = useState<{
    items: CwAttachmentGalleryItem[]
    initialIndex: number
  } | null>(null)

  const handleAttachmentPreviewOpen = (
    payload: CwChatAttachmentPreviewOpenPayload,
  ) => {
    setPreviewState({
      items: payload.items.map((item) => ({
        key: item.key,
        kind: 'image' as const,
        src: item.src,
      })),
      initialIndex: payload.initialIndex ?? 0,
    })
  }

  /** 发送新消息 / 进入或结束生成时贴底，保证最新气泡可见 */
  useEffect(() => {
    listRef.current?.scrollToBottom()
  }, [messages.length, busy])

  return (
    <div
      {...rest}
      className={[styles.root, className].filter(Boolean).join(' ')}
    >
      {bannerSlot}
      {statusSlot}

      {errorMessage ? (
        <p className={styles.errorBanner}>{errorMessage}</p>
      ) : null}

      <div className={styles.listWrap}>
        <CwChatMessageList
          ref={listRef}
          className="min-h-0 flex-1"
          messages={messages}
          peerAvatarFallbackSrc={avatarSrc}
          mentionAvatarFallbackSrc={avatarSrc}
          downloadByUrl={noopDownload}
          alwaysFullWidthBubbles={true}
          showPeerSenderInMultiParty={false}
          peerBubbleAppearance={CW_AI_ASSISTANT_BUBBLE_APPEARANCE}
          publicAssetBaseUrl={publicAssetBase}
          texts={{ empty: mergedTexts.emptyMessages }}
          rootClass="h-full min-h-0"
          contentClass="px-2 py-2"
          onAttachmentPreviewOpen={handleAttachmentPreviewOpen}
          renderMessageExtra={
            messageExtraSlot
              ? (message) => messageExtraSlot({ message })
              : undefined
          }
        />
      </div>

      <div className={styles.composerWrap}>
        <CwChatMessageComposer
          layoutVariant="workspace"
          mentionAvatarFallbackSrc={avatarSrc}
          publicAssetBaseUrl={publicAssetBase}
          disabled={!ready}
          enableAttachments={false}
          showToolbar={false}
          stopReplyActive={busy}
          workspaceShowAttachButton={false}
          placeholder={composerPlaceholder}
          onSubmit={onSubmit}
          onStopAiReply={onStop}
          attachmentsAboveSlot={composerAttachmentsSlot}
        />
      </div>

      {previewState ? (
        <CwAttachmentPreview
          visible
          items={previewState.items}
          initialIndex={previewState.initialIndex}
          onClose={() => setPreviewState(null)}
          onVisibleChange={(visible) => {
            if (!visible) setPreviewState(null)
          }}
        />
      ) : null}
    </div>
  )
}

export default CwWorkbenchAiPanel
