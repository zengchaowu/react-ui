import { IM_RICH_INLINE_IMAGE_ATTR } from '@zengchaowu/shared/functions/im/imRichContentHtml'
import {
  IMAGE_CHIP_INNER_CLASS,
  IMAGE_CHIP_WRAP_CLASS,
  IMAGE_CLIP_BOUNDS_MAX_HEIGHT,
  IMAGE_CLIP_BOUNDS_MAX_WIDTH,
  IMAGE_CLIP_BOUNDS_MIN_HEIGHT,
} from '../chips/chipStyles'
import {
  defineCwMessageInputInlineNode,
  type CwMessageInputInlineNodeDefinition,
} from './createNode'

export interface ImageClipNodeOptions {
  onRemove?: (payload: { previewSrc?: string }) => void
  onPreview?: (previewSrc: string) => void
  removeAriaLabel?: string
}

export interface ImageClipNodeAttrs {
  previewSrc?: string
  name?: string
  naturalWidth?: number
  naturalHeight?: number
}

/** 计算 inline-chip bounded 展示尺寸（设计稿 px） */
export function computeImageClipSize(
  width: number,
  height: number,
): { width: number; height: number } {
  const maxW = IMAGE_CLIP_BOUNDS_MAX_WIDTH
  const maxH = IMAGE_CLIP_BOUNDS_MAX_HEIGHT
  const minH = IMAGE_CLIP_BOUNDS_MIN_HEIGHT
  if (!(width > 0) || !(height > 0)) return { width: maxW, height: minH }
  const scale = Math.min(maxW / width, maxH / height)
  let w = width * scale
  let h = height * scale
  if (h < minH) {
    w = (w / h) * minH
    h = minH
  }
  return { width: Math.max(1, Math.round(w)), height: Math.max(1, Math.round(h)) }
}

const CORNER_CLOSE_WRAP_CLASS =
  'absolute right-0 top-0 z-[var(--z-index-above)] size-9 translate-x-1/2 -translate-y-1/2 transition-opacity [@media(pointer:fine)]:pointer-events-none [@media(pointer:fine)]:opacity-0 group-hover:pointer-events-auto group-focus-within:pointer-events-auto [@media(pointer:fine)]:group-hover:opacity-100 [@media(pointer:fine)]:group-focus-within:opacity-100'
const CORNER_CLOSE_CIRCLE_CLASS =
  'relative size-full cursor-pointer rounded-full bg-[var(--bg-color-component)] transition-colors duration-150 hover:bg-[var(--bg-color-secondarycomponent-hover)]'

/** 构造内联图片 clip DOM（等价 Vue `ImageClipNodeView`） */
export function createImageClipElement(
  attrs: ImageClipNodeAttrs,
  options: ImageClipNodeOptions,
): HTMLSpanElement {
  const previewSrc = String(attrs.previewSrc ?? '').trim()
  const name = String(attrs.name ?? '').trim()
  const naturalWidth = Number(attrs.naturalWidth) || 0
  const naturalHeight = Number(attrs.naturalHeight) || 0

  const wrap = document.createElement('span')
  wrap.className = `${IMAGE_CHIP_WRAP_CLASS} cw-corner-closable-wrap group relative inline-block w-fit max-w-full shrink-0 overflow-hidden rounded-[var(--radius-default)]`
  wrap.setAttribute('data-cw-inline-image-wrap', '')
  wrap.setAttribute('contenteditable', 'false')
  if (previewSrc) wrap.setAttribute('data-preview-src', previewSrc)
  if (naturalWidth > 0) wrap.setAttribute('data-natural-width', String(naturalWidth))
  if (naturalHeight > 0) wrap.setAttribute('data-natural-height', String(naturalHeight))
  if (name) wrap.setAttribute('data-image-name', name)

  const inner = document.createElement('span')
  inner.className = IMAGE_CHIP_INNER_CLASS
  inner.setAttribute('contenteditable', 'false')
  inner.setAttribute('role', 'img')
  inner.setAttribute('tabindex', '0')
  inner.setAttribute('aria-label', `预览 ${name || '图片'}`)
  inner.setAttribute('data-chip-preview', 'image')

  if (previewSrc) {
    const img = document.createElement('img')
    img.src = previewSrc
    img.alt = name || '图片'
    img.draggable = false
    img.setAttribute(IM_RICH_INLINE_IMAGE_ATTR, '')
    const size = computeImageClipSize(naturalWidth, naturalHeight)
    img.style.width = `${size.width}px`
    img.style.height = `${size.height}px`
    img.className = 'block max-h-full max-w-full object-contain [-webkit-user-drag:none]'
    inner.appendChild(img)
  }
  wrap.appendChild(inner)

  const closeWrap = document.createElement('div')
  closeWrap.className = CORNER_CLOSE_WRAP_CLASS
  const closeCircle = document.createElement('div')
  closeCircle.className = CORNER_CLOSE_CIRCLE_CLASS
  closeCircle.setAttribute('role', 'button')
  closeCircle.setAttribute('tabindex', '-1')
  closeCircle.setAttribute('aria-label', options.removeAriaLabel ?? '移除图片')
  closeCircle.setAttribute('data-chip-close', 'image')
  const icon = document.createElement('span')
  icon.className =
    'cw-icon inline-flex items-center justify-center text-current absolute left-[0.3125rem] top-[1.25rem]'
  icon.setAttribute('aria-hidden', 'true')
  const i = document.createElement('i')
  i.className =
    'icon-common--status--close-line asset inline-block not-italic leading-none text-current'
  i.style.fontSize = '0.75rem'
  icon.appendChild(i)
  closeCircle.appendChild(icon)
  closeWrap.appendChild(closeCircle)
  wrap.appendChild(closeWrap)

  return wrap
}

export function renderImageClipHtml(attrs: ImageClipNodeAttrs): string {
  const src = String(attrs.previewSrc ?? '').trim()
  const name = String(attrs.name ?? '').trim() || '图片'
  const w = Number(attrs.naturalWidth) || 0
  const h = Number(attrs.naturalHeight) || 0
  return `<img ${IM_RICH_INLINE_IMAGE_ATTR} src="${src}" alt="${name}" draggable="false"${
    w > 0 ? ` width="${w}"` : ''
  }${h > 0 ? ` height="${h}"` : ''} />`
}

export function renderImageClipText(): string {
  return '[图片]'
}

export const ImageClipNode: CwMessageInputInlineNodeDefinition<ImageClipNodeOptions> =
  defineCwMessageInputInlineNode<ImageClipNodeOptions>('inlineImage', {
    onRemove: undefined,
    onPreview: undefined,
    removeAriaLabel: '移除图片',
  })
