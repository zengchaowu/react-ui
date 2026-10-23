/** 与 tokens.css `--size-chip-inline-max: 17.5rem`（16px 根字号下 280px）对齐 */
export const CW_MARKDOWN_INLINE_IMAGE_BOUNDS_MAX_WIDTH_PX = 280

/** 与 Markdown 内联图历史 `max-h: 55vh` 对齐 */
export function resolveMarkdownInlineImageBoundsMaxHeightPx(
  viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 800,
): number {
  return Math.max(72, Math.round(viewportHeight * 0.55))
}
