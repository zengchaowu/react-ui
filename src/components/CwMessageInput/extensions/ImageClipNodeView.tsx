import type { KeyboardEvent, MouseEvent } from 'react'
import CwCornerClosableWrap from '../../CwCornerClosableWrap/CwCornerClosableWrap'
import CwImageFit from '../../CwImageFit/CwImageFit'
import {
  IMAGE_CHIP_INNER_CLASS,
  IMAGE_CHIP_WRAP_CLASS,
  IMAGE_CLIP_BOUNDS_MAX_HEIGHT,
  IMAGE_CLIP_BOUNDS_MAX_WIDTH,
  IMAGE_CLIP_BOUNDS_MIN_HEIGHT,
} from '../chips/chipStyles'
import type { ImageClipNodeOptions } from './ImageClipNode'

export interface ImageClipNodeViewProps {
  previewSrc?: string
  name?: string
  naturalWidth?: number
  naturalHeight?: number
  options?: ImageClipNodeOptions
}

/**
 * 内联图片 chip 的 React 视图（等价 Vue `ImageClipNodeView.vue`）。
 * 编辑器内部以 DOM 形式渲染，此组件供宿主只读复用。
 */
export function ImageClipNodeView({
  previewSrc,
  name = '',
  naturalWidth = 0,
  naturalHeight = 0,
  options,
}: ImageClipNodeViewProps) {
  const src = String(previewSrc ?? '').trim()

  function onClose() {
    options?.onRemove?.({ previewSrc: src || undefined })
  }

  function onPreviewClick(event: MouseEvent | KeyboardEvent) {
    event.preventDefault()
    event.stopPropagation()
    if (!src) return
    options?.onPreview?.(src)
  }

  return (
    <span
      className={IMAGE_CHIP_WRAP_CLASS}
      data-cw-inline-image-wrap=""
      data-preview-src={src || undefined}
      data-natural-width={naturalWidth > 0 ? naturalWidth : undefined}
      data-natural-height={naturalHeight > 0 ? naturalHeight : undefined}
      data-image-name={name || undefined}
    >
      <CwCornerClosableWrap
        texts={{ closeLabel: options?.removeAriaLabel ?? '移除图片' }}
        onClose={onClose}
      >
        <span
          className={IMAGE_CHIP_INNER_CLASS}
          contentEditable={false}
          role="img"
          tabIndex={0}
          aria-label={`预览 ${name || '图片'}`}
          onClick={onPreviewClick}
          onKeyDown={(event) => {
            if (event.key !== 'Enter' && event.key !== ' ') return
            event.preventDefault()
            onPreviewClick(event)
          }}
        >
          {src ? (
            <CwImageFit
              src={src}
              alt={name || '图片'}
              readonly
              intrinsicWidth={naturalWidth}
              intrinsicHeight={naturalHeight}
              boundsMaxWidth={IMAGE_CLIP_BOUNDS_MAX_WIDTH}
              boundsMaxHeight={IMAGE_CLIP_BOUNDS_MAX_HEIGHT}
              boundsMinHeight={IMAGE_CLIP_BOUNDS_MIN_HEIGHT}
              appearance="inline-chip"
            />
          ) : null}
        </span>
      </CwCornerClosableWrap>
    </span>
  )
}

export default ImageClipNodeView
