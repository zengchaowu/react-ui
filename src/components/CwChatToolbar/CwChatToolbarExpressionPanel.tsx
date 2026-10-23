import { useEffect, useMemo, useState, type KeyboardEvent, type ReactNode } from 'react'
import CwIcon from '../CwIcon/CwIcon'
import CwGrid from '../CwGrid/CwGrid'
import CwChatToolbarEmojiPanel from './CwChatToolbarEmojiPanel'
import type { CwChatToolbarTexts } from './types'
import { defaultCwChatToolbarTexts } from './texts'
import {
  emojiPickerMobilePanelClass,
  emojiPickerPanelClass,
  emojiPickerGridScrollClass,
  expressionPackTabBtnActiveClass,
  expressionPackTabBtnClass,
  expressionPackTabBtnHoverClass,
  expressionPackTabBtnInactiveClass,
  expressionPackTabThumbClass,
  expressionPackTabsTopClass,
  expressionPackTabsMobileDockClass,
  EXPRESSION_PACK_TAB_ICON_SIZE,
} from './emojiPopupConfig'
import type {
  CwChatStickerItem,
  CwChatStickerPackItem,
  CwChatStickerPickPayload,
} from './types/stickerPack'

interface ExpressionPackTabProps {
  active?: boolean
  ariaLabel?: string
  title?: string
  onSelect?: () => void
  children?: ReactNode
}

/** 微信式图标 Tab 按钮 */
function ExpressionPackTab({
  active = false,
  ariaLabel = '',
  title = '',
  onSelect,
  children,
}: ExpressionPackTabProps) {
  function activate() {
    onSelect?.()
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      activate()
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      className={[
        expressionPackTabBtnClass,
        active
          ? expressionPackTabBtnActiveClass
          : [expressionPackTabBtnInactiveClass, expressionPackTabBtnHoverClass].join(' '),
      ]
        .filter(Boolean)
        .join(' ')}
      aria-label={ariaLabel}
      title={title}
      onClick={activate}
      onKeyDown={onKeyDown}
    >
      {children}
    </div>
  )
}

export interface CwChatToolbarExpressionPanelProps {
  variant?: 'popup' | 'mobileDock'
  stickerPacks?: CwChatStickerPackItem[]
  texts?: Partial<CwChatToolbarTexts>
  /** 等价 Vue `@emoji-pick` */
  onEmojiPick?: (emoji: string) => void
  /** 等价 Vue `@sticker-pick` */
  onStickerPick?: (payload: CwChatStickerPickPayload) => void
  className?: string
}

const STICKER_CELL_CLASS =
  'flex aspect-square items-center justify-center rounded-md p-1 hover:bg-[var(--bg-color-component-hover)] active:scale-95 transition-transform'

const BASE_ROOT_CLASS = 'flex min-h-0 min-w-0 w-full flex-1 flex-col overflow-hidden'

function packTabKey(packId: string | number): string {
  return `pack:${String(packId)}`
}

function activePackIdFromTab(tab: string): string | null {
  if (tab === 'emoji') return null
  return tab.slice('pack:'.length)
}

function packTabThumb(pack: CwChatStickerPackItem): string | undefined {
  const cover = pack.cover_url?.trim()
  if (cover) return cover
  const first = pack.stickers?.find((s) => String(s.url ?? '').trim())
  return first?.url?.trim() || undefined
}

export function CwChatToolbarExpressionPanel({
  variant = 'popup',
  stickerPacks = [],
  texts: textsProp,
  onEmojiPick,
  onStickerPick,
  className,
}: CwChatToolbarExpressionPanelProps) {
  const texts = useMemo(
    () => ({
      ...defaultCwChatToolbarTexts,
      ...(textsProp ?? {}),
    }),
    [textsProp],
  )

  const showPackTabs = stickerPacks.length > 0
  const tabsOnTop = showPackTabs

  const rootClass =
    variant === 'mobileDock'
      ? `${BASE_ROOT_CLASS} bg-[var(--bg-color-container)]`
      : stickerPacks.length > 0
        ? BASE_ROOT_CLASS
        : emojiPickerPanelClass

  const packTabsBarClass =
    variant === 'mobileDock'
      ? expressionPackTabsMobileDockClass
      : expressionPackTabsTopClass

  const stickerScrollClass =
    variant === 'mobileDock'
      ? 'min-h-0 flex-1 overflow-y-auto overscroll-contain'
      : emojiPickerGridScrollClass

  const [activeTab, setActiveTab] = useState<string>('emoji')

  useEffect(() => {
    setActiveTab((prev) => {
      if (prev === 'emoji') return prev
      const stillExists = stickerPacks.some((p) => packTabKey(p.id) === prev)
      return stillExists ? prev : 'emoji'
    })
  }, [stickerPacks])

  const activePackStickers = useMemo((): CwChatStickerItem[] => {
    const packId = activePackIdFromTab(activeTab)
    if (packId == null) return []
    const pack = stickerPacks.find((p) => String(p.id) === packId)
    return pack?.stickers ?? []
  }, [activeTab, stickerPacks])

  function onEmojiPickInternal(emoji: string) {
    onEmojiPick?.(emoji)
  }

  function pickSticker(sticker: CwChatStickerItem) {
    const url = sticker.url?.trim()
    if (!url) return
    onStickerPick?.({
      packId: sticker.pack_id,
      stickerId: sticker.id,
      url,
      name: sticker.name,
      width: sticker.width,
      height: sticker.height,
    })
  }

  function onStickerKeyDown(event: KeyboardEvent<HTMLDivElement>, sticker: CwChatStickerItem) {
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    pickSticker(sticker)
  }

  return (
    <div className={[rootClass, className].filter(Boolean).join(' ')}>
      {showPackTabs && tabsOnTop ? (
        <div className={packTabsBarClass}>
          <ExpressionPackTab
            active={activeTab === 'emoji'}
            ariaLabel={texts.emojiTabAriaLabel}
            title={texts.emojiTabAriaLabel}
            onSelect={() => setActiveTab('emoji')}
          >
            <CwIcon
              name="chat--msg--emoji-line"
              prefix="icon"
              size={EXPRESSION_PACK_TAB_ICON_SIZE}
            />
          </ExpressionPackTab>
          {stickerPacks.map((pack) => (
            <ExpressionPackTab
              key={pack.id}
              active={activeTab === packTabKey(pack.id)}
              ariaLabel={pack.name}
              title={pack.name}
              onSelect={() => setActiveTab(packTabKey(pack.id))}
            >
              {packTabThumb(pack) ? (
                <img
                  src={packTabThumb(pack)}
                  alt={pack.name}
                  className={expressionPackTabThumbClass}
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                <CwIcon
                  name="chat--msg--emoji-line"
                  prefix="icon"
                  size={EXPRESSION_PACK_TAB_ICON_SIZE}
                />
              )}
            </ExpressionPackTab>
          ))}
        </div>
      ) : null}

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        {activeTab === 'emoji' ? (
          <CwChatToolbarEmojiPanel
            embedded
            showCategories={false}
            variant={variant}
            texts={texts}
            onPick={onEmojiPickInternal}
          />
        ) : (
          <div className={stickerScrollClass}>
            {activePackStickers.length === 0 ? (
              <div className="flex min-h-[6rem] flex-1 items-center justify-center text-xs text-[var(--text-color-placeholder)]">
                {texts.emptyStickerPackLabel}
              </div>
            ) : (
              <div className="p-2">
                <CwGrid columns={4} gutter={8} rowGap={8} align="stretch">
                  {activePackStickers.map((sticker) => (
                    <div
                      key={sticker.id}
                      role="button"
                      tabIndex={0}
                      className={[STICKER_CELL_CLASS, 'cursor-pointer']
                        .filter(Boolean)
                        .join(' ')}
                      aria-label={sticker.name || texts.stickerFallbackAriaLabel}
                      title={sticker.name}
                      onClick={() => pickSticker(sticker)}
                      onKeyDown={(event) => onStickerKeyDown(event, sticker)}
                    >
                      <img
                        src={sticker.url}
                        alt={sticker.name || ''}
                        className="h-full w-full object-contain"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                  ))}
                </CwGrid>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default CwChatToolbarExpressionPanel
