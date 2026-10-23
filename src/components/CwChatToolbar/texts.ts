import type { CwChatToolbarTexts } from './types'

export const defaultCwChatToolbarEmojiCategoryLabels: Record<string, string> = {
  'Smileys & Emotion': '表情',
  'People & Body': '人物',
  'Animals & Nature': '动物',
  'Food & Drink': '食物',
  Activities: '活动',
  'Travel & Places': '旅行',
  Objects: '物品',
  Symbols: '符号',
  Flags: '旗帜',
}

export const defaultCwChatToolbarTexts: CwChatToolbarTexts = {
  fallbackAssetIcon: 'common--status--info-line',
  emojiCategoryLabels: defaultCwChatToolbarEmojiCategoryLabels,
  emojiTabAriaLabel: '常用表情',
  emptyStickerPackLabel: '暂无表情',
  stickerFallbackAriaLabel: '表情',
  emojiPanelLoadingLabel: '加载中…',
}

export function resolveCwChatToolbarEmojiCategoryLabel(
  categoryKey: string,
  labels: Record<string, string> = defaultCwChatToolbarEmojiCategoryLabels,
): string {
  return labels[categoryKey]?.trim() || categoryKey
}
