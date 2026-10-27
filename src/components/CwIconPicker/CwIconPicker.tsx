import { useEffect, useMemo, useState } from 'react'
import type { CwIconPickerProps } from './types'
import type { IconCategory, IconItem, IconPickerType } from '@zengchaowu/ui-shared/components/CwIconPicker/types'
import { iconPickerBase } from '@zengchaowu/ui-shared/components/CwIconPicker/styles'
import { defaultTexts } from '@zengchaowu/ui-shared/components/CwIconPicker/texts'
import { fetchAllEmojiData, buildAllEmojiCategories } from '@zengchaowu/ui-shared/components/CwIconPicker/emojiData'
import CwTabsStrip from '../CwTabsStrip/CwTabsStrip'
import CwButton from '../CwButton/CwButton'
import CwInput from '../CwInput/CwInput'
import CwIcon from '../CwIcon/CwIcon'
import CwDiv from '../CwDiv/CwDiv'
import CwGrid from '../CwGrid/CwGrid'
import assetData from '../../assets/asset/asset.json'

function extractAssetIconNames(data: { glyphs: { font_class: string }[] }): string[] {
  return data.glyphs
    .map((glyph) => glyph.font_class)
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b))
}

const ALL_ASSET_NAMES = extractAssetIconNames(assetData)

/** 常用 emoji 列表（按分类组织） */
const COMMON_EMOJIS: IconCategory[] = [
  {
    name: '表情',
    icons: [
      { value: 'smile', content: '😊', type: 'emoji', label: '微笑' },
      { value: 'grin', content: '😁', type: 'emoji', label: '大笑' },
      { value: 'joy', content: '😂', type: 'emoji', label: '笑哭' },
      { value: 'heart-eyes', content: '😍', type: 'emoji', label: '爱心眼' },
      { value: 'kiss', content: '😘', type: 'emoji', label: '飞吻' },
      { value: 'wink', content: '😉', type: 'emoji', label: '眨眼' },
      { value: 'sunglasses', content: '😎', type: 'emoji', label: '墨镜' },
      { value: 'thinking', content: '🤔', type: 'emoji', label: '思考' },
      { value: 'surprised', content: '😲', type: 'emoji', label: '惊讶' },
      { value: 'cry', content: '😢', type: 'emoji', label: '哭泣' },
      { value: 'sob', content: '😭', type: 'emoji', label: '大哭' },
      { value: 'angry', content: '😠', type: 'emoji', label: '生气' },
      { value: 'sleepy', content: '😴', type: 'emoji', label: '睡觉' },
      { value: 'dizzy', content: '😵', type: 'emoji', label: '晕' },
      { value: 'sick', content: '🤒', type: 'emoji', label: '生病' },
      { value: 'vomit', content: '🤮', type: 'emoji', label: '呕吐' },
    ],
  },
  {
    name: '手势',
    icons: [
      { value: 'thumbs-up', content: '👍', type: 'emoji', label: '点赞' },
      { value: 'thumbs-down', content: '👎', type: 'emoji', label: '点踩' },
      { value: 'clap', content: '👏', type: 'emoji', label: '鼓掌' },
      { value: 'pray', content: '🙏', type: 'emoji', label: '祈祷' },
      { value: 'handshake', content: '🤝', type: 'emoji', label: '握手' },
      { value: 'fist', content: '✊', type: 'emoji', label: '拳头' },
      { value: 'ok', content: '👌', type: 'emoji', label: 'OK' },
      { value: 'victory', content: '✌️', type: 'emoji', label: '胜利' },
      { value: 'love', content: '🤟', type: 'emoji', label: '我爱你' },
      { value: 'point-right', content: '👉', type: 'emoji', label: '指向右' },
      { value: 'point-left', content: '👈', type: 'emoji', label: '指向左' },
      { value: 'point-up', content: '👆', type: 'emoji', label: '指向上' },
      { value: 'point-down', content: '👇', type: 'emoji', label: '指向下' },
    ],
  },
  {
    name: '物品',
    icons: [
      { value: 'fire', content: '🔥', type: 'emoji', label: '火焰' },
      { value: 'star', content: '⭐', type: 'emoji', label: '星星' },
      { value: 'heart', content: '❤️', type: 'emoji', label: '爱心' },
      { value: 'sparkles', content: '✨', type: 'emoji', label: '闪光' },
      { value: 'gift', content: '🎁', type: 'emoji', label: '礼物' },
      { value: 'party', content: '🎉', type: 'emoji', label: '庆祝' },
      { value: 'cake', content: '🎂', type: 'emoji', label: '蛋糕' },
      { value: 'coffee', content: '☕', type: 'emoji', label: '咖啡' },
      { value: 'beer', content: '🍺', type: 'emoji', label: '啤酒' },
      { value: 'wine', content: '🍷', type: 'emoji', label: '红酒' },
      { value: 'pizza', content: '🍕', type: 'emoji', label: '披萨' },
      { value: 'hamburger', content: '🍔', type: 'emoji', label: '汉堡' },
      { value: 'phone', content: '📱', type: 'emoji', label: '手机' },
      { value: 'computer', content: '💻', type: 'emoji', label: '电脑' },
      { value: 'book', content: '📖', type: 'emoji', label: '书' },
      { value: 'money', content: '💰', type: 'emoji', label: '钱' },
    ],
  },
  {
    name: '动物',
    icons: [
      { value: 'dog', content: '🐶', type: 'emoji', label: '狗' },
      { value: 'cat', content: '🐱', type: 'emoji', label: '猫' },
      { value: 'panda', content: '🐼', type: 'emoji', label: '熊猫' },
      { value: 'bear', content: '🐻', type: 'emoji', label: '熊' },
      { value: 'rabbit', content: '🐰', type: 'emoji', label: '兔子' },
      { value: 'tiger', content: '🐯', type: 'emoji', label: '老虎' },
      { value: 'lion', content: '🦁', type: 'emoji', label: '狮子' },
      { value: 'cow', content: '🐮', type: 'emoji', label: '牛' },
      { value: 'pig', content: '🐷', type: 'emoji', label: '猪' },
      { value: 'monkey', content: '🐵', type: 'emoji', label: '猴子' },
      { value: 'chicken', content: '🐔', type: 'emoji', label: '鸡' },
      { value: 'bird', content: '🐦', type: 'emoji', label: '鸟' },
    ],
  },
  {
    name: '旗帜',
    icons: [
      { value: 'flag-cn', content: '🇨🇳', type: 'emoji', label: '中国' },
      { value: 'flag-us', content: '🇺🇸', type: 'emoji', label: '美国' },
      { value: 'flag-jp', content: '🇯🇵', type: 'emoji', label: '日本' },
      { value: 'flag-kr', content: '🇰🇷', type: 'emoji', label: '韩国' },
      { value: 'flag-gb', content: '🇬🇧', type: 'emoji', label: '英国' },
      { value: 'flag-fr', content: '🇫🇷', type: 'emoji', label: '法国' },
      { value: 'flag-de', content: '🇩🇪', type: 'emoji', label: '德国' },
      { value: 'flag-it', content: '🇮🇹', type: 'emoji', label: '意大利' },
      { value: 'flag-es', content: '🇪🇸', type: 'emoji', label: '西班牙' },
      { value: 'flag-ru', content: '🇷🇺', type: 'emoji', label: '俄罗斯' },
      { value: 'flag-ca', content: '🇨🇦', type: 'emoji', label: '加拿大' },
      { value: 'flag-au', content: '🇦🇺', type: 'emoji', label: '澳大利亚' },
    ],
  },
  {
    name: '符号',
    icons: [
      { value: 'check', content: '✅', type: 'emoji', label: '对勾' },
      { value: 'cross', content: '❌', type: 'emoji', label: '叉号' },
      { value: 'warning', content: '⚠️', type: 'emoji', label: '警告' },
      { value: 'info', content: 'ℹ️', type: 'emoji', label: '信息' },
      { value: 'question', content: '❓', type: 'emoji', label: '问号' },
      { value: 'exclamation', content: '❗', type: 'emoji', label: '感叹号' },
      { value: 'arrow-right', content: '➡️', type: 'emoji', label: '向右' },
      { value: 'arrow-left', content: '⬅️', type: 'emoji', label: '向左' },
      { value: 'arrow-up', content: '⬆️', type: 'emoji', label: '向上' },
      { value: 'arrow-down', content: '⬇️', type: 'emoji', label: '向下' },
      { value: 'recycle', content: '♻️', type: 'emoji', label: '回收' },
      { value: 'zap', content: '⚡', type: 'emoji', label: '闪电' },
    ],
  },
]

export function CwIconPicker({
  value,
  type = 'icon',
  categories = [],
  defaultValue = '',
  disabled = false,
  emojiAnimated = false,
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

  /** 全量 emoji 分类（懒加载，未传 categories 时使用） */
  const [allEmojiCategories, setAllEmojiCategories] = useState<IconCategory[] | null>(null)
  const [allEmojiLoading, setAllEmojiLoading] = useState(false)

  // 当前选中的类型
  const [currentType, setCurrentType] = useState<IconPickerType>(type)
  // 当前选中的值
  const [currentValue, setCurrentValue] = useState<string>(value ?? defaultValue)
  // 搜索关键词
  const [searchKeyword, setSearchKeyword] = useState('')

  /** 当未传入 categories 时，根据当前类型自动展示全部图标 */
  const autoCategories = useMemo<IconCategory[]>(() => {
    if (currentType === 'emoji') {
      // Emoji 模式：优先使用已加载的全量列表，否则先用常用 emoji
      return allEmojiCategories ?? COMMON_EMOJIS
    } else {
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
    }
  }, [currentType, allEmojiCategories])

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

  // 根据类型和搜索关键词过滤分类
  const filteredCategories = useMemo(() => {
    const filtered = categoriesSource.filter((cat) => {
      // 根据类型过滤
      const hasMatchingType = cat.icons.some((icon) => {
        if (currentType === 'icon') {
          return icon.type === 'asset'
        } else {
          return icon.type === 'emoji'
        }
      })
      if (!hasMatchingType) return false

      // 根据搜索关键词过滤
      if (searchKeyword.trim()) {
        const keyword = searchKeyword.toLowerCase()
        return cat.icons.some((icon) => {
          const label = icon.label || icon.value
          return (
            label.toLowerCase().includes(keyword) ||
            icon.content.toLowerCase().includes(keyword)
          )
        })
      }

      return true
    })

    // 过滤每个分类下的图标
    return filtered
      .map((cat) => ({
        ...cat,
        icons: cat.icons.filter((icon) => {
          // 类型过滤
          if (currentType === 'icon' && icon.type !== 'asset') return false
          if (currentType === 'emoji' && icon.type !== 'emoji') return false

          // 搜索过滤
          if (searchKeyword.trim()) {
            const keyword = searchKeyword.toLowerCase()
            const label = icon.label || icon.value
            return (
              label.toLowerCase().includes(keyword) ||
              icon.content.toLowerCase().includes(keyword)
            )
          }

          return true
        }),
      }))
      .filter((cat) => cat.icons.length > 0)
  }, [categoriesSource, currentType, searchKeyword])

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

  // 将 emoji 字符转换为图片 URL（使用 EmojiCDN；动图需外部 CDN 支持时再扩展）
  function getEmojiImageUrl(emoji: string): string {
    const base = `https://emojicdn.elk.sh/${encodeURIComponent(emoji)}`
    // 当前 EmojiCDN 仅支持 style=apple|google|facebook|twitter，无动图；预留 animated 扩展
    if (emojiAnimated) {
      return `${base}?style=apple`
    }
    return base
  }

  // 监听 value（对应 Vue modelValue）变化
  useEffect(() => {
    if (value !== undefined) {
      setCurrentValue(value)
    }
  }, [value])

  // 未传 categories 且为 emoji 模式时，懒加载全量 emoji-data
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
    fetchAllEmojiData()
      .then((data) => {
        setAllEmojiCategories(buildAllEmojiCategories(data))
      })
      .finally(() => {
        setAllEmojiLoading(false)
      })
  }, [currentType, categoriesLength, allEmojiCategories, allEmojiLoading])

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

      {/* 内容区域：CwDiv 提供自定义滚动条 */}
      <CwDiv className={iconPickerBase.content} contentClass={iconPickerBase.contentInner}>
        {allEmojiLoading && currentType === 'emoji' && !(categories && categories.length) ? (
          <div className={iconPickerBase.category}>
            <span className="text-[var(--text-color-secondary)] text-sm">加载全量 Emoji…</span>
          </div>
        ) : null}
        {filteredCategories.map((category) => (
          <div key={category.name || '__auto__'} className={iconPickerBase.category}>
            {category.name ? (
              <div className={iconPickerBase.categoryTitle}>{category.name}</div>
            ) : null}
            <CwGrid columns={8} gutter={4} rowGap={4} align="stretch">
              {category.icons.map((icon) => (
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
                    <CwIcon
                      name={icon.content}
                      prefix={icon.prefix || 'icon'}
                      size={1.375}
                    />
                  ) : icon.type === 'emoji' ? (
                    <img
                      src={getEmojiImageUrl(icon.content)}
                      alt={icon.label || icon.value}
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
          </div>
        ))}
      </CwDiv>
    </div>
  )
}

export default CwIconPicker
