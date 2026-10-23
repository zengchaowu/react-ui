import type { CwFileDownloadCellStyles } from './types'

export const fileDownloadCellBase: CwFileDownloadCellStyles = {
  // 外层卡片：与设计稿一致的圆角和边框
  root: 'cw-file-download-cell w-full bg-[var(--bg-color-container)] rounded-[0.625rem] border border-[var(--border-color)] overflow-hidden',

  // 左侧整体内容包装
  contentWrapper: 'flex flex-col gap-1 min-w-0',

  // 主行内容：图标 + 文本列
  main: 'flex items-center gap-3 min-w-0',

  // 左侧图标容器（进一步放大）
  iconWrapper: 'flex items-center justify-center w-10 h-10 text-[var(--brand-color-6)] flex-shrink-0',

  // 文本区域
  textWrapper: 'flex-1 min-w-0 flex flex-col gap-0.5',
  fileName: 'font-body-medium [font-size:var(--font-size-body)] text-[var(--text-color-primary)] truncate',
  metaRow: 'flex items-center justify-between gap-2 text-xs',
  size: 'text-[var(--text-color-secondary)]',
  progressText: 'text-[var(--brand-color-6)] font-medium',

  // 进度条区域（仅在有 progress 时显示）
  progressBarWrapper: '',
  progressTrack: 'w-full h-[0.375rem] rounded-full bg-[var(--bg-color-component)] overflow-hidden',
  progressFill: 'h-full bg-[var(--brand-color-6)] transition-[width] duration-200 ease-out',

  // 右侧按钮区域（Cell 右侧插槽，小一点的右 padding）
  actionWrapper: 'flex items-center gap-3 pr-1',
  actionButtonRoot: 'inline-flex items-center justify-center rounded-full w-10 h-10 hover:bg-[var(--bg-color-component-hover)] active:bg-[var(--bg-color-component)]',
  actionButtonContent: 'flex items-center justify-center',
  actionPauseIcon: 'text-[var(--brand-color-6)] [font-size:var(--font-size-body-xl)] leading-none',
  actionCancelIcon: 'text-[var(--error-color-6)] text-[1.25rem] leading-none',

  // 图标样式
  iconStyles: {
    class: 'leading-none',
    size: 1.5,
  },
  iconButtonIconStyles: {
    class: 'leading-none text-[var(--brand-color-6)]',
    size: 1.25,
  },
}
