import { getEmojionePngUrl } from '../../CwChatMessageQuote/emojioneEmoji'

/** 单字符 emoji 插入（与 `insertText` 一致） */
export function isSingleEmojiGlyph(
  text: string,
  baseUrl?: string,
): string | null {
  const t = text.trim()
  if (!t) return null
  const url = getEmojionePngUrl(t, baseUrl)
  return url ? t : null
}
