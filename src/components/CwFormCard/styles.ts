import type { CwFormCardStyles } from './types'

export const defaultStyles: CwFormCardStyles = {
  // 根容器：白底卡片 + 轻描边 + 圆角
  root: 'w-full bg-[var(--bg-color-container)] border border-[var(--border-color-extra-light)] rounded-lg overflow-hidden',

  // 头部：标题（与 CwCard header 一致：flex + 分割线）
  header: 'flex items-center justify-between px-4 py-3 hairline-border-b border-[var(--border-color-extra-light)] hairline-border-b',
  title: 'text-base font-semibold text-[var(--text-color-primary)]',

  // 内容容器
  content: '',

  // 表单项行：横向布局，左侧标签，右侧内容
  itemRow: 'flex items-center px-4 py-3 hairline-border-b border-[var(--border-color-extra-light)] hairline-border-b last:border-b-0 last:hairline-border-b-0',
  itemRowLast: '',

  // 左侧标签（纵向居中）
  itemLabel: 'flex-shrink-0 text-sm font-medium mr-4 flex items-center',
  itemLabelText: 'relative inline-block text-[var(--text-color-secondary)]',
  // 星号在 label 左侧，绝对定位，不占用布局空间
  itemLabelRequired: 'after:content-["*"] after:absolute after:right-full after:mr-1 after:text-[var(--error-color-6)]',

  // 右侧内容区域（占满剩余空间）
  itemContent: 'flex-1 flex items-center justify-end min-w-0',
  // 右侧内容内部容器：默认占满，可通过覆盖此类控制统一宽度（例如 w-[13.75rem]）
  itemContentInner: 'flex items-center gap-2 w-full min-w-0'
}
