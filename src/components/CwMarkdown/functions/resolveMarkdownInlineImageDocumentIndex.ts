const MARKDOWN_ROOT = '[data-cw-markdown-root]'

interface CurrentTargetEvent {
  currentTarget: Element | null
}

/** 与 collectMarkdownImageSrcsInParseOrder / image-click 的 DOM 顺序一致 */
export function resolveMarkdownInlineImageDocumentIndex(
  event: CurrentTargetEvent,
  markdownRootSelector = MARKDOWN_ROOT,
): number {
  const host = event.currentTarget as HTMLElement | null
  const root = host?.closest(markdownRootSelector) ?? null
  if (!root || !host) return -1
  const mine = host.querySelector('img')
  if (!mine) return -1
  const imgs = root.querySelectorAll('img')
  return Array.prototype.indexOf.call(imgs, mine)
}
