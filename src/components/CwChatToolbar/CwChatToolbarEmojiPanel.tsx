import {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
} from 'react'
import {
  COMMON_CHAT_EMOJI_CHARS,
  getEmojiCategoryOrder,
  loadEmojioneEmojisByCategoryAsync,
  resolveEmojiItemToPicker,
  resolveEmojiPickerItems,
  type EmojiItem,
} from '../../utils/emojioneEmoji'
import { usePublicAssetBaseUrl } from '../../utils/publicAssetBaseUrl'
import CwGrid from '../CwGrid/CwGrid'
import CwViewportImg from '../CwViewportImg/CwViewportImg'
import CwVirtualScroll from '../CwVirtualScroll/CwVirtualScroll'
import { useContainerSize } from '../CwVirtualScroll/hooks/useContainerSize'
import type {
  CwVirtualScrollHandle,
  CwVirtualScrollItem,
} from '../CwVirtualScroll'
import type { CwChatToolbarTexts } from '@zengchaowu/ui-shared/components/CwChatToolbar/types'
import {
  defaultCwChatToolbarTexts,
  resolveCwChatToolbarEmojiCategoryLabel,
} from '@zengchaowu/ui-shared/components/CwChatToolbar/texts'
import {
  EMOJI_PICKER_GRID_COLUMNS,
  EMOJI_PICKER_MOBILE_GRID_COLUMNS,
  emojiPickerCellClass,
  emojiPickerGridScrollClass,
  emojiPickerImgClass,
  emojiPickerMobilePanelClass,
  emojiPickerMobileRecentImgClass,
  emojiPickerPanelClass,
  emojiPickerTabBtnActiveClass,
  emojiPickerTabBtnClass,
  emojiPickerTabBtnHoverClass,
  emojiPickerTabBtnInactiveClass,
  emojiPickerTabsClass,
  resolveInitialEmojiCategory,
} from './emojiPopupConfig'

const EMOJI_PICKER_GRID_PADDING_PX = 8
const EMOJI_PICKER_ROW_HEIGHT_FALLBACK_PX = 40

type EmojiPickerCell = { emoji: string; src: string; name: string }
type EmojiPickerRow = { emojis: EmojiPickerCell[] }

export interface CwChatToolbarEmojiPanelProps {
  /** 移动端内嵌底栏：更宽网格、占满配件区高度 */
  variant?: 'popup' | 'mobileDock'
  /** 嵌在 ExpressionPanel 内：不再套一层面板背景，避免双层 flex 挤掉分类 Tab */
  embedded?: boolean
  /** 为 true 时展示 EmojiOne 全量分类；默认 popup 独立面板开启，嵌入/移动端仅常用区 */
  showCategories?: boolean
  texts?: Partial<CwChatToolbarTexts>
  /** 等价 Vue `@pick` */
  onPick?: (emoji: string) => void
  className?: string
}

export function CwChatToolbarEmojiPanel({
  variant = 'popup',
  embedded = false,
  showCategories: showCategoriesProp,
  texts: textsProp,
  onPick,
  className,
}: CwChatToolbarEmojiPanelProps) {
  const texts = useMemo(
    () => ({
      ...defaultCwChatToolbarTexts,
      ...(textsProp ?? {}),
    }),
    [textsProp],
  )

  const showCategories =
    showCategoriesProp ?? (variant === 'popup' && !embedded)

  const panelClass = embedded
    ? 'flex min-h-0 min-w-0 w-full flex-1 flex-col overflow-hidden'
    : variant === 'mobileDock'
      ? emojiPickerMobilePanelClass
      : emojiPickerPanelClass

  const emojiImgClass =
    variant === 'mobileDock' ? emojiPickerMobileRecentImgClass : emojiPickerImgClass

  const gridColumns =
    variant === 'mobileDock'
      ? EMOJI_PICKER_MOBILE_GRID_COLUMNS
      : EMOJI_PICKER_GRID_COLUMNS

  const gridGapPx = variant === 'mobileDock' ? 6 : 4

  const publicAssetBaseUrl = usePublicAssetBaseUrl()

  const commonEmojis = useMemo(
    () =>
      resolveEmojiPickerItems(COMMON_CHAT_EMOJI_CHARS, publicAssetBaseUrl).map(
        (item) => ({
          ...item,
          name: item.emoji,
        }),
      ),
    [publicAssetBaseUrl],
  )

  const [categoriesLoading, setCategoriesLoading] = useState(false)
  const [emojisByCategory, setEmojisByCategory] = useState<
    Record<string, EmojiItem[]>
  >({})
  const [activeCategory, setActiveCategory] = useState('Smileys & Emotion')

  const [gridHost, setGridHost] = useState<HTMLDivElement | null>(null)
  const virtualScrollRef = useRef<CwVirtualScrollHandle | null>(null)
  const { containerWidth: gridHostWidth } = useContainerSize(gridHost)

  const categoryLabels = useMemo(
    () =>
      texts.emojiCategoryLabels ??
      defaultCwChatToolbarTexts.emojiCategoryLabels ??
      {},
    [texts.emojiCategoryLabels],
  )

  const categoryTabs = useMemo(
    () =>
      getEmojiCategoryOrder()
        .filter((key) => (emojisByCategory[key]?.length ?? 0) > 0)
        .map((key) => ({
          key,
          label: resolveCwChatToolbarEmojiCategoryLabel(key, categoryLabels),
        })),
    [emojisByCategory, categoryLabels],
  )

  const categoryEmojis = useMemo(() => {
    const items = emojisByCategory[activeCategory] ?? []
    const out: EmojiPickerCell[] = []
    for (const item of items) {
      const resolved = resolveEmojiItemToPicker(item, publicAssetBaseUrl)
      if (resolved) out.push(resolved)
    }
    return out
  }, [emojisByCategory, activeCategory, publicAssetBaseUrl])

  const displayEmojis = showCategories ? categoryEmojis : commonEmojis

  const emojiRowHeight = useMemo(() => {
    const w = gridHostWidth
    const cols = gridColumns
    const gap = gridGapPx
    const horizontalPadding = EMOJI_PICKER_GRID_PADDING_PX * 2
    if (w <= horizontalPadding || cols <= 0) return EMOJI_PICKER_ROW_HEIGHT_FALLBACK_PX
    const inner = w - horizontalPadding
    const cell = (inner - (cols - 1) * gap) / cols
    return Math.max(32, Math.ceil(cell + gap))
  }, [gridHostWidth, gridColumns, gridGapPx])

  const emojiVirtualRowItems = useMemo(
    (): CwVirtualScrollItem<EmojiPickerRow>[] => {
      const emojis = displayEmojis
      const cols = gridColumns
      const rowHeight = emojiRowHeight
      const scopeKey = showCategories ? activeCategory : '__common__'
      const rows: EmojiPickerRow[] = []
      for (let i = 0; i < emojis.length; i += cols) {
        rows.push({ emojis: emojis.slice(i, i + cols) })
      }
      return rows.map((row, index) => ({
        key: `${scopeKey}-${index}`,
        data: row,
        height: rowHeight,
      }))
    },
    [displayEmojis, gridColumns, emojiRowHeight, showCategories, activeCategory],
  )

  const loadCategories = useCallback(async () => {
    if (!showCategories || categoriesLoading) return
    if (Object.keys(emojisByCategory).length > 0) return
    setCategoriesLoading(true)
    try {
      const grouped = await loadEmojioneEmojisByCategoryAsync()
      setEmojisByCategory(grouped)
      setActiveCategory(resolveInitialEmojiCategory(grouped))
    } finally {
      setCategoriesLoading(false)
    }
  }, [showCategories, categoriesLoading, emojisByCategory])

  useLayoutEffect(() => {
    if (showCategories) void loadCategories()
    // 与 Vue `onMounted` + `watch(showCategories)` 一致
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showCategories])

  useLayoutEffect(() => {
    virtualScrollRef.current?.scrollTo(0)
  }, [activeCategory, displayEmojis])

  function pickEmoji(emoji: string) {
    onPick?.(emoji)
  }

  function onEmojiKeyDown(event: KeyboardEvent<HTMLDivElement>, emoji: string) {
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    pickEmoji(emoji)
  }

  function onCellMouseDown(event: MouseEvent<HTMLDivElement>) {
    event.preventDefault()
  }

  return (
    <div className={[panelClass, className].filter(Boolean).join(' ')}>
      {showCategories && categoryTabs.length > 0 ? (
        <div className={emojiPickerTabsClass}>
          {categoryTabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={[
                emojiPickerTabBtnClass,
                activeCategory === tab.key
                  ? emojiPickerTabBtnActiveClass
                  : [emojiPickerTabBtnInactiveClass, emojiPickerTabBtnHoverClass].join(' '),
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => setActiveCategory(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      ) : null}
      <div ref={setGridHost} className="min-h-0 flex-1 overflow-hidden">
        {showCategories && categoriesLoading ? (
          <div className={emojiPickerGridScrollClass}>
            <div className="flex min-h-[6rem] items-center justify-center text-xs text-[var(--text-color-placeholder)]">
              {texts.emojiPanelLoadingLabel}
            </div>
          </div>
        ) : (
          <CwVirtualScroll
            ref={virtualScrollRef}
            className="h-full w-full"
            items={emojiVirtualRowItems}
            itemHeight={emojiRowHeight}
            bufferSize={3}
            padding={EMOJI_PICKER_GRID_PADDING_PX}
            showScrollbar
          >
            {({ item: row }) => (
              <CwGrid
                columns={gridColumns}
                gutter={gridGapPx}
                rowGap={0}
                measure={false}
                align="stretch"
              >
                {row.emojis.map((emoji) => (
                  <div
                    key={emoji.emoji}
                    role="button"
                    tabIndex={0}
                    className={[emojiPickerCellClass, 'cursor-pointer']
                      .filter(Boolean)
                      .join(' ')}
                    aria-label={emoji.name}
                    title={emoji.name}
                    onMouseDown={onCellMouseDown}
                    onClick={() => pickEmoji(emoji.emoji)}
                    onKeyDown={(event) => onEmojiKeyDown(event, emoji.emoji)}
                  >
                    <CwViewportImg
                      src={emoji.src}
                      alt={emoji.emoji}
                      className={emojiImgClass}
                    />
                  </div>
                ))}
              </CwGrid>
            )}
          </CwVirtualScroll>
        )}
      </div>
    </div>
  )
}

export default CwChatToolbarEmojiPanel
