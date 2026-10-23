import type { CwIconPickerStyles } from './types'
import { CW_GLASS_FROSTED_MENU_CHROME_CLASS } from '../CwContextMenu/styles'

export const iconPickerBase: CwIconPickerStyles = {
  // 根容器：固定尺寸（360x420）+ 与右键菜单同视觉
  root: [
    'cw-icon-picker flex h-[26.25rem] w-[22.5rem] flex-col',
    CW_GLASS_FROSTED_MENU_CHROME_CLASS,
  ].join(' '),

  // 头部：左右布局（去掉背景色，整体更轻、更矮）
  header:
    'flex items-center justify-between px-2 py-1.5 hairline-border-b border-[var(--border-color)] bg-transparent',

  // Tabs 区域：占满左侧
  tabs: 'flex-1',

  // 恢复默认按钮：紧凑一些、颜色更轻
  resetButton: 'ml-2 text-xs text-[var(--text-color-secondary)] hover:text-[var(--brand-color-6)]',

  // 搜索框区域：更小 padding
  searchWrapper: 'px-2 py-1.5 hairline-border-b border-[var(--border-color)] bg-[var(--bg-color-container)]',

  // 内容区域：占满剩余高度，由 CwDiv 承担滚动与自定义滚动条
  content: 'flex-1 min-h-0',
  contentInner: 'px-2 py-2',

  // 分类块：上下间距略减小
  category: 'mb-3 last:mb-0',

  // 分类标题：用次级文字样式、字号略小
  categoryTitle: 'text-xs font-medium text-[var(--text-color-secondary)] mb-1.5',

  // 单个图标：使用 w-full 让 CwGrid 列宽分配，高度固定，减小内边距
  iconItem:
    'w-full aspect-square flex items-center justify-center rounded-md border border-[var(--border-color)] ' +
    'cursor-pointer transition-colors bg-[var(--bg-color-container)] p-0',

  // 选中态：只有边框高亮，无背景色变化（即始终保持容器背景色）
  iconItemActive:
    'border-2 !border-[var(--brand-color-6)] bg-[var(--bg-color-container)] hover:bg-[var(--bg-color-container)]',

  // Hover 态：只有背景色变化，无边框变化（未选中时才体现）
  iconItemHover: 'hover:bg-[var(--button-brand-tint-active-bg)]',

  // 图标内容：增大字号以匹配更大的图标容器
  iconContent: '[font-size:var(--font-size-body-xl)] leading-none',
  // Emoji 图片样式：缩小尺寸，完全去除边距
  emojiImage: 'w-6 h-6 object-contain block',
}
