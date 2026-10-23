/**
 * 全量 Emoji 数据（iamcal/emoji-data 格式）
 * 运行时从 CDN 懒加载，避免打包体积过大
 */
import type { IconCategory, IconItem } from './types'

/** iamcal/emoji-data 单条格式 */
export interface RawEmojiEntry {
  unified: string
  short_name: string
  short_names?: string[]
  name?: string
  category: string
  subcategory?: string
  sort_order?: number
}

const EMOJI_DATA_URL =
  'https://cdn.jsdelivr.net/gh/iamcal/emoji-data@master/emoji.json'

/** 将 unified 码点（如 "1F1E6-1F1E8"）转为 emoji 字符 */
export function unifiedToEmoji(unified: string): string {
  if (!unified) return ''
  const codePoints = unified.split('-').map((hex) => parseInt(hex, 16))
  return String.fromCodePoint(...codePoints)
}

let cachedRaw: RawEmojiEntry[] | null = null

/** 从 CDN 拉取全量 emoji-data（带缓存） */
export async function fetchAllEmojiData(): Promise<RawEmojiEntry[]> {
  if (cachedRaw) return cachedRaw
  const res = await fetch(EMOJI_DATA_URL)
  if (!res.ok) throw new Error(`emoji-data fetch failed: ${res.status}`)
  const json = (await res.json()) as RawEmojiEntry[]
  cachedRaw = json
  return json
}

/** 将原始数据按 category 分组为 CwIconPicker 使用的 IconCategory[] */
export function buildAllEmojiCategories(data: RawEmojiEntry[]): IconCategory[] {
  const byCategory = new Map<string, IconItem[]>()
  for (const entry of data) {
    const content = unifiedToEmoji(entry.unified)
    const item: IconItem = {
      value: entry.short_name,
      content,
      type: 'emoji',
      label: entry.short_name.replace(/_/g, ' '),
    }
    const cat = entry.category || 'Other'
    if (!byCategory.has(cat)) byCategory.set(cat, [])
    byCategory.get(cat)!.push(item)
  }
  const order = [
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
  const categories: IconCategory[] = []
  const seen = new Set<string>()
  for (const name of order) {
    const icons = byCategory.get(name)
    if (icons?.length) {
      seen.add(name)
      categories.push({ name, icons })
    }
  }
  for (const [name, icons] of byCategory) {
    if (!seen.has(name)) categories.push({ name, icons })
  }
  return categories
}
