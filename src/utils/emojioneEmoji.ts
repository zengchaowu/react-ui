/**
 * EmojiOne（emoji-datasource-emojione）资源与「emoji 字符 → 展示用 PNG URL」
 * PNG 路径：`{publicAssetBaseUrl}/emojione/64/{unified}.png`（由宿主 provide 或 `import.meta.env.BASE_URL`）
 */

import emojioneUnifiedKeys from '../generated/emojione-unified-keys.json'
import { resolveDefaultPublicAssetBaseUrl } from './publicAssetBaseUrl'

export type EmojiTextPart =
  | { type: 'text'; text: string }
  | { type: 'emoji'; emoji: string; src: string }

/** 行内 emoji 图尺寸（1.25em），Markdown / 气泡 / 输入框等统一使用 */
export const CW_INLINE_EMOJI_IMG_CLASS =
  'inline-block h-[1.25em] w-[1.25em] align-middle [-webkit-user-drag:none]'

export type EmojiCategory =
  | 'Smileys & Emotion'
  | 'People & Body'
  | 'Animals & Nature'
  | 'Food & Drink'
  | 'Activities'
  | 'Travel & Places'
  | 'Objects'
  | 'Symbols'
  | 'Flags'

export interface EmojiItem {
  emoji: string
  name: string
  shortName: string
  category: string
  sortOrder: number
}

/** IM 常用表情（微信/QQ 高频），运行时按 EmojiOne 资源过滤 */
export const COMMON_CHAT_EMOJI_CHARS: readonly string[] = [
  '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '🥲', '😊',
  '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙',
  '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '😎', '🥳', '😏',
  '😒', '😞', '😔', '😟', '😕', '🙁', '😣', '😖', '😫', '😩',
  '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '😳', '🥵', '🥶',
  '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '😶',
  '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱',
  '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢', '🤮', '🤧', '😷',
  '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👋', '🤚',
  '✋', '🖐️', '👏', '🙌', '👐', '🤝', '🙏', '💪', '✊', '👊',
  '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '💔', '❣️',
  '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💯', '🎉', '🎊',
  '🎁', '🏆', '🔥', '⭐', '✨', '💫', '💥', '💢', '💦', '👀',
  '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯',
  '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🦄', '🐝',
  '🌹', '🌺', '🌸', '🌻', '🌼', '🍀', '🌈', '☀️', '🌙', '⚡',
  '🍎', '🍊', '🍋', '🍉', '🍇', '🍓', '🍒', '🍑', '🍔', '🍟',
  '🍕', '🌭', '🍜', '🍣', '🍱', '🍰', '🎂', '🍩', '🍪', '☕',
  '🍵', '🍺', '🍻', '🥂', '🍷', '🧋',
] as const

/** 聊天工具栏表情面板默认常用表情（快捷入口） */
export const DEFAULT_CHAT_TOOLBAR_EMOJI_CHARS: readonly string[] =
  COMMON_CHAT_EMOJI_CHARS.slice(0, 20)

interface EmojiDatasourceItem {
  name: string | null
  unified: string
  non_qualified: string | null
  short_name: string
  short_names: string[]
  category: string
  sort_order: number
  has_img_emojione: boolean
}

function buildAvailableUnifiedKeys(): Set<string> {
  return new Set(emojioneUnifiedKeys as string[])
}

const availableUnifiedKeys = buildAvailableUnifiedKeys()

function resolvePublicAssetBaseUrl(baseUrl?: string): string {
  return baseUrl?.trim() || resolveDefaultPublicAssetBaseUrl()
}

/** 由 unified key 与宿主资源根生成 EmojiOne PNG URL */
export function emojionePngUrlForUnifiedKey(
  unifiedKey: string,
  baseUrl?: string,
): string {
  const b = resolvePublicAssetBaseUrl(baseUrl).replace(/\/$/, '')
  if (b === './' || b === '.') return `./emojione/64/${unifiedKey}.png`
  if (b === '/') return `/emojione/64/${unifiedKey}.png`
  return `${b}/emojione/64/${unifiedKey}.png`
}

/** 将 emoji 图形簇转为 emoji-datasource 文件名 unified key（小写十六进制，以 `-` 连接码点） */
export function emojiToEmojioneUnifiedKey(emoji: string): string {
  return Array.from(emoji)
    .map((ch) => ch.codePointAt(0)?.toString(16).toLowerCase())
    .filter((x): x is string => !!x)
    .join('-')
}

/** 是否存在对应 EmojiOne PNG */
export function hasEmojioneAsset(emoji: string): boolean {
  const key = emojiToEmojioneUnifiedKey(emoji)
  return key ? availableUnifiedKeys.has(key) : false
}

/** 获取 EmojiOne PNG URL；无对应资源时返回 null */
export function getEmojionePngUrl(emoji: string, baseUrl?: string): string | null {
  const key = emojiToEmojioneUnifiedKey(emoji)
  if (!key || !availableUnifiedKeys.has(key)) return null
  return emojionePngUrlForUnifiedKey(key, baseUrl)
}

type GraphemeSegmenter = { segment: (input: string) => Iterable<{ segment: string }> }
const SegmenterCtor = (Intl as unknown as {
  Segmenter?: new (locales?: string, options?: { granularity?: string }) => GraphemeSegmenter
}).Segmenter
const graphemeSegmenter: GraphemeSegmenter | null =
  typeof Intl !== 'undefined' && typeof SegmenterCtor === 'function'
    ? new SegmenterCtor(undefined, { granularity: 'grapheme' })
    : null

function segmentGraphemes(text: string): string[] {
  return graphemeSegmenter
    ? Array.from(graphemeSegmenter.segment(text), (s) => s.segment)
    : Array.from(text)
}

/** 将纯文本拆成「文本段 + 可替换为 EmojiOne 的 emoji 段」 */
export function splitTextToEmojiParts(text: string, baseUrl?: string): EmojiTextPart[] {
  if (!text) return [{ type: 'text', text: '' }]
  const out: EmojiTextPart[] = []
  let buf = ''
  for (const g of segmentGraphemes(text)) {
    const src = getEmojionePngUrl(g, baseUrl)
    if (!src) {
      buf += g
      continue
    }
    if (buf) {
      out.push({ type: 'text', text: buf })
      buf = ''
    }
    out.push({ type: 'emoji', emoji: g, src })
  }
  if (buf) out.push({ type: 'text', text: buf })
  return out
}

/** 供表情面板等：根据配置字符列表生成 { emoji, src } */
export function resolveEmojiPickerItems(
  emojis: readonly string[],
  baseUrl?: string,
): { emoji: string; src: string }[] {
  const out: { emoji: string; src: string }[] = []
  for (const emoji of emojis) {
    const src = getEmojionePngUrl(emoji, baseUrl)
    if (src) out.push({ emoji, src })
  }
  return out
}

/** 检查文本是否包含可转换为 EmojiOne 的 emoji */
export function containsEmoji(text: string): boolean {
  if (!text) return false
  return segmentGraphemes(text).some((g) => hasEmojioneAsset(g))
}

function unifiedKeyToEmoji(unifiedKey: string): string {
  return unifiedKey
    .split('-')
    .map((hex) => {
      const code = parseInt(hex, 16)
      return Number.isNaN(code) ? '' : String.fromCodePoint(code)
    })
    .join('')
}

let _allEmojisCache: EmojiItem[] | null = null
let _emojiPrettyLoad: Promise<EmojiDatasourceItem[]> | null = null

async function loadEmojiPrettyData(): Promise<EmojiDatasourceItem[]> {
  if (!_emojiPrettyLoad) {
    _emojiPrettyLoad = import('emoji-datasource-emojione/emoji_pretty.json').then(
      (mod) => mod.default as EmojiDatasourceItem[],
    )
  }
  return _emojiPrettyLoad
}

/** 从 emoji-datasource 加载所有可用 emoji 元数据（按需拉取 JSON） */
export async function loadAllEmojioneEmojisAsync(): Promise<EmojiItem[]> {
  if (_allEmojisCache) return _allEmojisCache

  const data = await loadEmojiPrettyData()
  const items: EmojiItem[] = []

  for (const item of data) {
    if (!item.has_img_emojione) continue
    const unifiedKey = item.unified.toLowerCase()
    if (!availableUnifiedKeys.has(unifiedKey)) continue
    const emoji = unifiedKeyToEmoji(unifiedKey)
    if (!emoji) continue
    items.push({
      emoji,
      name: item.name ?? item.short_name,
      shortName: item.short_name,
      category: item.category,
      sortOrder: item.sort_order,
    })
  }

  items.sort((a, b) => a.sortOrder - b.sortOrder)
  _allEmojisCache = items
  return items
}

/** 按类别分组获取所有 emoji（按需拉取 JSON） */
export async function loadEmojioneEmojisByCategoryAsync(): Promise<
  Record<string, EmojiItem[]>
> {
  const all = await loadAllEmojioneEmojisAsync()
  const grouped: Record<string, EmojiItem[]> = {}

  for (const item of all) {
    const cat = item.category || 'Other'
    if (!grouped[cat]) grouped[cat] = []
    grouped[cat].push(item)
  }

  return grouped
}

/** 获取标准类别顺序 */
export function getEmojiCategoryOrder(): string[] {
  return [
    'Smileys & Emotion',
    'People & Body',
    'Animals & Nature',
    'Food & Drink',
    'Activities',
    'Travel & Places',
    'Objects',
    'Symbols',
    'Flags',
  ]
}

export function resolveEmojiItemToPicker(
  item: EmojiItem,
  baseUrl?: string,
): { emoji: string; src: string; name: string } | null {
  const src = getEmojionePngUrl(item.emoji, baseUrl)
  if (!src) return null
  return { emoji: item.emoji, src, name: item.name }
}
