import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import { IM_RICH_INLINE_IMAGE_ATTR } from '@zengchaowu/shared/functions/im/imRichContentHtml'
import { INLINE_CHIP_REACT_RENDERER_CLASS } from '../chips/chipStyles'
import { ImageClipNodeView } from './ImageClipNodeView'

export interface ImageClipNodeOptions {
  onRemove?: (payload: { previewSrc?: string }) => void
  onPreview?: (previewSrc: string) => void
  removeAriaLabel?: string
}

/**
 * 编辑器内联图片：wire format 为 `<img data-cw-inline-image src="data:|https:" …>`。
 */
export const ImageClipNode = Node.create<ImageClipNodeOptions>({
  name: 'inlineImage',

  group: 'inline',
  inline: true,
  atom: true,
  selectable: true,
  draggable: false,

  addOptions() {
    return {
      onRemove: undefined,
      onPreview: undefined,
      removeAriaLabel: '移除图片',
    }
  },

  addAttributes() {
    return {
      previewSrc: { default: '' },
      name: { default: '' },
      naturalWidth: { default: 0 },
      naturalHeight: { default: 0 },
    }
  },

  parseHTML() {
    const attrsFromImageEl = (el: HTMLElement, wrap?: HTMLElement | null) => {
      const span = wrap ?? el.closest('[data-cw-inline-image-wrap]')
      const previewFromWrap = span?.getAttribute('data-preview-src')?.trim() || ''
      const src = previewFromWrap || el.getAttribute('src')?.trim() || ''
      if (!src) return false
      const w =
        Number(span?.getAttribute('data-natural-width')) ||
        Number(el.getAttribute('width')) ||
        Number(el.getAttribute('data-natural-width')) ||
        0
      const h =
        Number(span?.getAttribute('data-natural-height')) ||
        Number(el.getAttribute('height')) ||
        Number(el.getAttribute('data-natural-height')) ||
        0
      return {
        previewSrc: src,
        name: el.getAttribute('alt') || span?.getAttribute('data-image-name') || '',
        naturalWidth: Number.isFinite(w) && w > 0 ? w : 0,
        naturalHeight: Number.isFinite(h) && h > 0 ? h : 0,
      }
    }
    return [
      {
        tag: `img[${IM_RICH_INLINE_IMAGE_ATTR}]`,
        getAttrs: (el) => attrsFromImageEl(el as HTMLImageElement),
      },
      {
        tag: 'span[data-cw-inline-image-wrap]',
        getAttrs: (el) => {
          const img = (el as HTMLElement).querySelector('img')
          if (!img) return false
          return attrsFromImageEl(img as HTMLImageElement, el as HTMLElement)
        },
      },
    ]
  },

  renderHTML({ node }) {
    const src = String(node.attrs.previewSrc ?? '').trim()
    const name = String(node.attrs.name ?? '').trim() || '图片'
    const w = Number(node.attrs.naturalWidth) || 0
    const h = Number(node.attrs.naturalHeight) || 0
    return [
      'img',
      mergeAttributes({
        [IM_RICH_INLINE_IMAGE_ATTR]: '',
        src,
        alt: name,
        draggable: 'false',
        ...(w > 0 ? { width: w } : {}),
        ...(h > 0 ? { height: h } : {}),
      }),
    ]
  },

  renderText() {
    return '[图片]'
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageClipNodeView, {
      className: INLINE_CHIP_REACT_RENDERER_CLASS,
    })
  },
})
