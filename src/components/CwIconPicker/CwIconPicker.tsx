import { useEffect, useMemo, useRef, useState } from 'react'
import type { CwIconPickerProps } from './types'
import type { IconCategory, IconItem, IconPickerType } from '@zengchaowu/ui-shared/components/CwIconPicker/types'
import { iconPickerBase } from '@zengchaowu/ui-shared/components/CwIconPicker/styles'
import { defaultTexts } from '@zengchaowu/ui-shared/components/CwIconPicker/texts'
import { resolveCwChatToolbarEmojiCategoryLabel } from '@zengchaowu/ui-shared/components/CwChatToolbar/texts'
import {
  COMMON_CHAT_EMOJI_CHARS,
  getEmojiCategoryOrder,
  getEmojiZhName,
  getEmojionePngUrl,
  loadEmojioneEmojisByCategoryAsync,
  resolveEmojiItemToPicker,
  resolveEmojiPickerItems,
  type EmojiItem,
} from '@zengchaowu/ui-shared/utils/emojioneEmoji'
import { usePublicAssetBaseUrl } from '../../utils/publicAssetBaseUrl'
import CwTabsStrip from '../CwTabsStrip/CwTabsStrip'
import CwButton from '../CwButton/CwButton'
import CwInput from '../CwInput/CwInput'
import CwIcon from '../CwIcon/CwIcon'
import CwGrid from '../CwGrid/CwGrid'
import CwVirtualScroll from '../CwVirtualScroll/CwVirtualScroll'
import CwViewportImg from '../CwViewportImg/CwViewportImg'
import { useContainerSize } from '../CwVirtualScroll/hooks/useContainerSize'
import type { CwVirtualScrollHandle, CwVirtualScrollItem } from '../CwVirtualScroll/types'
import assetData from '../../assets/asset/asset.json'

function extractAssetIconNames(data: { glyphs: { font_class: string }[] }): string[] {
  return data.glyphs
    .map((glyph) => glyph.font_class)
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b))
}

const ALL_ASSET_NAMES = extractAssetIconNames(assetData)

/** 网格列数 / 间距 / 内边距 / 分类标题行高（虚拟滚动按像素行高切分） */
const GRID_COLUMNS = 8
const GRID_GAP = 4
const GRID_PADDING = 8
const HEADER_HEIGHT = 28

type PreparedIcon = IconItem & { labelText: string; searchText: string }

type VirtualRow =
  | { kind: 'header'; name: string }
  | { kind: 'row'; icons: PreparedIcon[] }

/** 全量分类：只保留本地有 EmojiOne 资源的 emoji（不回退外部 CDN） */
function buildEmojiCategories(
  grouped: Record<string, EmojiItem[]>,
  baseUrl?: string,
): IconCategory[] {
  const categories: IconCategory[] = []
  for (const category of getEmojiCategoryOrder()) {
    const icons: IconItem[] = []
    for (const item of grouped[category] ?? []) {
      const cell = resolveEmojiItemToPicker(item, baseUrl)
      if (!cell || !cell.src) continue
      const zhName = getEmojiZhName(cell.emoji)
      icons.push({
        value: cell.emoji,
        content: cell.emoji,
        type: 'emoji',
        // 常用表情有中文名（可直接搜中文），其余用英文名，英文名始终可搜
        label: zhName ?? cell.name,
        keywords: zhName ? cell.name : undefined,
        imageSrc: cell.src,
      })
    }
    if (icons.length) {
      categories.push({
        name: resolveCwChatToolbarEmojiCategoryLabel(category),
        icons,
      })
    }
  }
  return categories
}

export function CwIconPicker({
  value,
  type = 'icon',
  categories = [],
  defaultValue = '',
  disabled = false,
  texts: textsProp,
  className,
  onChange,
  onSelect,
  onReset,
}: CwIconPickerProps) {
  const texts = useMemo(
    () => ({ ...defaultTexts, ...(textsProp ?? {}) }),
    [textsProp],
  )

  const publicAssetBaseUrl = usePublicAssetBaseUrl()

  /** 全量 emoji 分类（懒加载，未传 categories 时使用） */
  const [allEmojiCategories, setAllEmojiCategories] = useState<IconCategory[] | null>(null)
  const [allEmojiLoading, setAllEmojiLoading] = useState(false)

  // 当前选中的类型
  const [currentType, setCurrentType] = useState<IconPickerType>(type)
  // 当前选中的值
  const [currentValue, setCurrentValue] = useState<string>(value ?? defaultValue)
  // 搜索关键词
  const [searchKeyword, setSearchKeyword] = useState('')

  /** 常用表情：直接复用聊天表情面板的数据源，运行时按 EmojiOne 资源过滤 */
  const commonEmojis = useMemo<IconCategory[]>(
    () => [
      {
        name: texts.emojiTab || '表情',
        icons: resolveEmojiPickerItems(COMMON_CHAT_EMOJI_CHARS, publicAssetBaseUrl).map(
          (item) => ({
            value: item.emoji,
            content: item.emoji,
            type: 'emoji' as const,
            label: getEmojiZhName(item.emoji) ?? item.emoji,
            imageSrc: item.src,
          }),
        ),
      },
    ],
    [publicAssetBaseUrl, texts.emojiTab],
  )

  /** 当未传入 categories 时，根据当前类型自动展示全部图标 */
  const autoCategories = useMemo<IconCategory[]>(() => {
    if (currentType === 'emoji') {
      // Emoji 模式：优先使用已加载的全量列表，否则先用常用 emoji
      return allEmojiCategories ?? commonEmojis
    }
    // Icon 模式：返回全部 asset 图标
    return [
      {
        name: '',
        icons: ALL_ASSET_NAMES.map((name) => ({
          value: name,
          content: name,
          type: 'asset' as const,
          label: name,
          prefix: 'icon',
        })),
      },
    ]
  }, [currentType, allEmojiCategories, commonEmojis])

  const categoriesSource = useMemo<IconCategory[]>(() => {
    return categories && categories.length > 0 ? categories : autoCategories
  }, [categories, autoCategories])

  // 标签页配置
  const tabItems = useMemo(
    () => [
      { value: 'icon' as const, label: texts.iconTab || '图标' },
      { value: 'emoji' as const, label: texts.emojiTab || 'Emojis' },
    ],
    [texts],
  )

  /** 预处理：一次算好 emoji 图片地址与搜索串，避免渲染 / 每次输入时重复计算 */
  const preparedCategories = useMemo(
    () =>
      categoriesSource.map((cat) => ({
        name: cat.name,
        // emoji 统一解析为本地 EmojiOne 图片，缺失资源的直接丢弃（不回退外部 CDN）
        icons: cat.icons.flatMap<PreparedIcon>((icon) => {
          const imageSrc =
            icon.type === 'emoji'
              ? icon.imageSrc ?? getEmojionePngUrl(icon.content, publicAssetBaseUrl) ?? undefined
              : undefined
          if (icon.type === 'emoji' && !imageSrc) return []
          const labelText = icon.label || icon.value
          return [
            {
              ...icon,
              imageSrc,
              labelText,
              searchText: `${labelText} ${icon.keywords ?? ''} ${icon.content} ${cat.name}`.toLowerCase(),
            },
          ]
        }),
      })),
    [categoriesSource, publicAssetBaseUrl],
  )

  // 按当前标签页与关键词一次遍历过滤，避免先过滤分类再过滤图标的两遍扫描
  const filteredCategories = useMemo(() => {
    const wantAsset = currentType === 'icon'
    const keyword = searchKeyword.trim().toLowerCase()
    const result: Array<{ name: string; icons: PreparedIcon[] }> = []
    for (const category of preparedCategories) {
      const icons = category.icons.filter(
        (icon) =>
          (wantAsset ? icon.type === 'asset' : icon.type === 'emoji') &&
          (!keyword || icon.searchText.includes(keyword)),
      )
      if (icons.length) result.push({ name: category.name, icons })
    }
    return result
  }, [preparedCategories, currentType, searchKeyword])

  const [gridHost, setGridHost] = useState<HTMLDivElement | null>(null)
  const { containerWidth } = useContainerSize(gridHost)

  /** 单行高度：单元格为正方形，行高 = 单元格宽 + 行间距 */
  const rowHeight = useMemo(() => {
    const inner = containerWidth - GRID_PADDING * 2
    if (inner <= 0) return 40
    const cell = (inner - (GRID_COLUMNS - 1) * GRID_GAP) / GRID_COLUMNS
    return Math.max(32, Math.ceil(cell + GRID_GAP))
  }, [containerWidth])

  /** 把分类拍平成「标题行 + 图标行」，交给 CwVirtualScroll 只渲染可见部分 */
  const virtualRows = useMemo<CwVirtualScrollItem<VirtualRow>[]>(() => {
    const rows: CwVirtualScrollItem<VirtualRow>[] = []
    for (const category of filteredCategories) {
      if (category.name) {
        rows.push({
          key: `header:${category.name}`,
          height: HEADER_HEIGHT,
          data: { kind: 'header', name: category.name },
        })
      }
      for (let start = 0; start < category.icons.length; start += GRID_COLUMNS) {
        rows.push({
          key: `${category.name || '_'}:${start}`,
          height: rowHeight,
          data: { kind: 'row', icons: category.icons.slice(start, start + GRID_COLUMNS) },
        })
      }
    }
    return rows
  }, [filteredCategories, rowHeight])

  // 处理图标选择
  const handleIconSelect = (icon: IconItem) => {
    if (disabled) return
    setCurrentValue(icon.value)
    onChange?.(icon.value)
    onSelect?.(icon.value, icon)
  }

  // 处理恢复默认
  const handleReset = () => {
    if (disabled) return
    setCurrentValue(defaultValue)
    onChange?.(defaultValue)
    onReset?.()
  }

  // 监听 value（对应 Vue modelValue）变化
  useEffect(() => {
    if (value !== undefined) {
      setCurrentValue(value)
    }
  }, [value])

  /** 筛选结果变化后回到顶部：否则行数变少时仍停留在旧滚动位置，看起来像「搜不到」 */
  const scrollRef = useRef<CwVirtualScrollHandle | null>(null)
  useEffect(() => {
    scrollRef.current?.scrollTo(0)
  }, [searchKeyword, currentType])

  // 未传 categories 且为 emoji 模式时，懒加载全量分类（复用表情面板的数据源）
  const categoriesLength = categories?.length ?? 0
  useEffect(() => {
    if (
      currentType !== 'emoji' ||
      categoriesLength > 0 ||
      allEmojiCategories !== null ||
      allEmojiLoading
    ) {
      return
    }
    setAllEmojiLoading(true)
    loadEmojioneEmojisByCategoryAsync()
      .then((grouped) => {
        setAllEmojiCategories(buildEmojiCategories(grouped, publicAssetBaseUrl))
      })
      .finally(() => {
        setAllEmojiLoading(false)
      })
  }, [currentType, categoriesLength, allEmojiCategories, allEmojiLoading, publicAssetBaseUrl])

  return (
    <div className={[iconPickerBase.root, className].filter(Boolean).join(' ')}>
      {/* 头部：标签页和恢复默认按钮 */}
      <div className={iconPickerBase.header}>
        <CwTabsStrip
          value={currentType}
          items={tabItems}
          size="small"
          className={[iconPickerBase.tabs, 'min-w-0 !h-auto'].filter(Boolean).join(' ')}
          onChange={(_index, tabValue) => {
            if (tabValue === 'icon' || tabValue === 'emoji') {
              setCurrentType(tabValue)
            }
          }}
        />
        <CwButton
          variant="text"
          size="small"
          className={iconPickerBase.resetButton}
          onClick={handleReset}
        >
          {texts.resetButtonText}
        </CwButton>
      </div>

      {/* 搜索框 */}
      <div className={iconPickerBase.searchWrapper}>
        <CwInput
          value={searchKeyword}
          placeholder={texts.searchPlaceholder}
          clearable
          size="small"
          appearance="default"
          className="w-full"
          onChange={setSearchKeyword}
          iconSlot={
            <CwIcon
              name="common--action--search-line"
              prefix="icon"
              size={1}
              className="inline-flex items-center justify-center"
            />
          }
        />
      </div>

      {/* 内容区域：虚拟滚动，只渲染可见行（emoji 全量时 DOM 从数千降到几十） */}
      <div className="min-h-0 flex-1 overflow-hidden" ref={setGridHost}>
        {allEmojiLoading && currentType === 'emoji' && filteredCategories.length === 0 ? (
          <div className="px-3 py-3 text-sm text-[var(--text-color-secondary)]">加载全量 Emoji…</div>
        ) : (
          <CwVirtualScroll
            ref={scrollRef}
            className={[iconPickerBase.content, 'h-full w-full'].filter(Boolean).join(' ')}
            items={virtualRows}
            itemHeight={rowHeight}
            bufferSize={4}
            padding={GRID_PADDING}
            showScrollbar
          >
            {(args) => {
              const item = args.item
              return item.kind === 'header' ? (
                <div
                  className={[iconPickerBase.categoryTitle, iconPickerBase.rowInner, 'flex h-full items-center']
                    .filter(Boolean)
                    .join(' ')}
                >
                  {item.name}
                </div>
              ) : (
                <CwGrid
                  className={iconPickerBase.rowInner}
                  columns={GRID_COLUMNS}
                  gutter={GRID_GAP}
                  rowGap={GRID_GAP}
                  align="stretch"
                >
                  {item.icons.map((icon) => (
                    <div
                      key={icon.value}
                      className={[
                        iconPickerBase.iconItem,
                        iconPickerBase.iconItemHover,
                        currentValue === icon.value ? iconPickerBase.iconItemActive : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      onClick={() => handleIconSelect(icon)}
                    >
                      {icon.type === 'asset' ? (
                        <CwIcon name={icon.content} prefix={icon.prefix || 'icon'} size={1.25} />
                      ) : icon.type === 'emoji' ? (
                        <CwViewportImg
                          src={icon.imageSrc}
                          alt={icon.labelText}
                          className={[iconPickerBase.iconContent, iconPickerBase.emojiImage]
                            .filter(Boolean)
                            .join(' ')}
                        />
                      ) : (
                        <span className={iconPickerBase.iconContent}>{icon.content}</span>
                      )}
                    </div>
                  ))}
                </CwGrid>
              )
            }}
          </CwVirtualScroll>
        )}
      </div>
    </div>
  )
}

export default CwIconPicker
