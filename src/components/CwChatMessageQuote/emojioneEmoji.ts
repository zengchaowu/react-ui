/**
 * EmojiOne 资源与「emoji 字符 → 展示用 PNG URL」。
 * 移植自 vue-ui `src/utils/emojioneEmoji.ts` 中与本组件相关的纯函数部分。
 */

import emojioneUnifiedKeys from '../../generated/emojione-unified-keys.json'
import { resolveDefaultPublicAssetBaseUrl } from '../../utils/publicAssetBaseUrl'

export type EmojiTextPart =
  | { type: 'text'; text: string }
  | { type: 'emoji'; emoji: string; src: string }

/** 行内 emoji 图尺寸（1.25em），Markdown / 气泡 / 输入框等统一使用 */
export const CW_INLINE_EMOJI_IMG_CLASS =
  'inline-block h-[1.25em] w-[1.25em] align-middle [-webkit-user-drag:none]'

const availableUnifiedKeys = new Set(emojioneUnifiedKeys as string[])

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

type GraphemeSegmenter = {
  segment: (input: string) => Iterable<{ segment: string }>
}
const SegmenterCtor = (
  Intl as unknown as {
    Segmenter?: new (
      locales?: string,
      options?: { granularity?: string },
    ) => GraphemeSegmenter
  }
).Segmenter
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
export function splitTextToEmojiParts(
  text: string,
  baseUrl?: string,
): EmojiTextPart[] {
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
