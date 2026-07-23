/** 图库 / 附件全屏预览共用布局样式 */
export const defaultFullscreenGalleryPreviewShellStyles = {
  indexLabel:
    'pointer-events-none absolute left-1/2 top-2 z-[var(--z-index-above)] -translate-x-1/2 text-sm tabular-nums text-[var(--text-color-secondary)]',
  galleryWrap:
    'relative z-[var(--z-index-above)] flex min-h-0 flex-1 flex-col',
} as const
