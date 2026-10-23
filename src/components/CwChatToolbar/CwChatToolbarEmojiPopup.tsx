import { useMemo, useRef, type ReactNode } from 'react'
import CwPopup from '../CwPopup/CwPopup'
import type { CwPopupInstance } from '../CwPopup'
import CwChatToolbarEmojiPanel from './CwChatToolbarEmojiPanel'
import CwChatToolbarExpressionPanel from './CwChatToolbarExpressionPanel'
import type {
  CwChatStickerPackItem,
  CwChatStickerPickPayload,
} from './types/stickerPack'
import type { CwChatToolbarTexts } from './types'
import { defaultCwChatToolbarTexts } from './texts'
import { emojiPickerPopupPlugins } from './emojiPopupConfig'

export interface CwChatToolbarEmojiPopupProps {
  stickerPacks?: CwChatStickerPackItem[]
  texts?: Partial<CwChatToolbarTexts>
  /** 等价 Vue 具名插槽 `trigger` */
  triggerSlot?: ReactNode
  /** 等价 Vue `@pick` */
  onPick?: (emoji: string) => void
  /** 等价 Vue `@sticker-pick` */
  onStickerPick?: (payload: CwChatStickerPickPayload) => void
  /** 等价 Vue `@expression-panel-open` */
  onExpressionPanelOpen?: () => void
}

export function CwChatToolbarEmojiPopup({
  stickerPacks = [],
  texts: textsProp,
  triggerSlot,
  onPick,
  onStickerPick,
  onExpressionPanelOpen,
}: CwChatToolbarEmojiPopupProps) {
  const texts = useMemo(
    () => ({
      ...defaultCwChatToolbarTexts,
      ...(textsProp ?? {}),
    }),
    [textsProp],
  )

  const hasStickerPacks = stickerPacks.length > 0

  const emojiPopupRef = useRef<CwPopupInstance | null>(null)

  function pickEmoji(emoji: string) {
    onPick?.(emoji)
    emojiPopupRef.current?.hide()
  }

  function onStickerPickInternal(payload: CwChatStickerPickPayload) {
    onStickerPick?.(payload)
    emojiPopupRef.current?.hide()
  }

  function onPopupVisibleChange(visible: boolean) {
    if (visible) onExpressionPanelOpen?.()
  }

  return (
    <CwPopup
      ref={emojiPopupRef}
      placement="top-start"
      trigger="click"
      closeOnClickOutside
      plugins={emojiPickerPopupPlugins}
      appearance="panel-emoji"
      triggerSlot={triggerSlot}
      onVisibleChange={onPopupVisibleChange}
    >
      {hasStickerPacks ? (
        <CwChatToolbarExpressionPanel
          variant="popup"
          stickerPacks={stickerPacks}
          texts={texts}
          onEmojiPick={pickEmoji}
          onStickerPick={onStickerPickInternal}
        />
      ) : (
        <CwChatToolbarEmojiPanel
          variant="popup"
          showCategories={false}
          texts={texts}
          onPick={pickEmoji}
        />
      )}
    </CwPopup>
  )
}

export default CwChatToolbarEmojiPopup
