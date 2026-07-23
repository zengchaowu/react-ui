import type { CwConfigCardStyles } from './types'

export const defaultStyles: CwConfigCardStyles = {
  // 根容器：白底卡片 + 轻描边 + 圆角（使用更浅的边框颜色）
  root: 'w-full bg-[var(--bg-color-container)] border border-[var(--border-color-extra-light)] rounded-lg overflow-hidden',

  // 头部：标题 + 折叠图标（展开时才显示底部分割线）
  header: 'flex items-center justify-between px-4 py-3',
  /** 头部内层（整行可点击时使用，填满 header 区域） */
  headerInner: 'flex flex-1 items-center justify-between min-w-0',
  headerClickable: 'cursor-pointer outline-none focus:outline-none transition-colors duration-200 hover:bg-[var(--bg-color-component-hover)]',
  headerExpanded: 'hairline-border-b border-[var(--border-color-extra-light)] hairline-border-b',
  title: 'text-base font-semibold text-[var(--text-color-primary)]',
  // 折叠图标容器：固定方形区域，确保图标垂直水平居中，并参与旋转动画；颜色从容器继承
  collapseIcon: 'flex items-center justify-center w-6 h-6 text-[var(--text-color-secondary)] transform transition-transform duration-200 ease-in-out',
  collapseIconStyles: {
    // 不覆写 root，让 CwIcon 保持默认居中，只设置尺寸
    size: 1
  },
  divider: 'hairline-border-b border-[var(--component-border)] hairline-border-b',

  // 内容容器
  content: 'px-4 py-3',

  // 配置项：两列布局，label 左对齐，value 右对齐
  item: 'flex items-start gap-4 mb-4 last:mb-0',
  itemLabel: 'flex-shrink-0 text-sm text-[var(--text-color-secondary)] whitespace-nowrap text-left',
  itemValue: 'flex-1 text-sm text-[var(--text-color-primary)] break-words text-right',
  itemValueRichText: 'flex-1 text-right',
  itemValueComponent: 'flex-1 text-right',

  // CwRichText 默认样式配置
  richTextStyles: {
    root: 'inline-block',
    text: 'text-[var(--text-color-primary)]',
    link: 'text-[var(--text-color-link)] cursor-pointer outline-none focus:outline-none'
  },
}
