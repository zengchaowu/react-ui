/** 与 CwImagePreview 根节点 `data-cw-image-preview-scaled` 对应 */
export const ZOOMED_IMAGE_PREVIEW_SELECTOR =
  '.cw-image-preview[data-cw-image-preview-scaled="true"]'

/** 触摸/鼠标是否发生在已放大的图片预览内（应阻止外层画廊横向滚动） */
export function isEventFromZoomedImagePreview(event: Event): boolean {
  const target = event.target
  if (!(target instanceof Element)) return false
  return Boolean(target.closest(ZOOMED_IMAGE_PREVIEW_SELECTOR))
}
