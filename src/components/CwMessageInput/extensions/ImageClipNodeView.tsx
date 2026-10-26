import type { KeyboardEvent, MouseEvent } from 'react'
import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react'
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

/** 内联图片 chip 节点视图（等价 Vue `ImageClipNodeView`） */
export function ImageClipNodeView({
  node,
  extension,
  deleteNode,
}: NodeViewProps) {
  const opts = extension.options as ImageClipNodeOptions
  const previewSrc = String(node.attrs.previewSrc ?? '').trim()
  const name = String(node.attrs.name ?? '')
  const naturalWidth = Number(node.attrs.naturalWidth) || 0
  const naturalHeight = Number(node.attrs.naturalHeight) || 0

  function onClose() {
    deleteNode()
    opts.onRemove?.({ previewSrc: previewSrc || undefined })
  }

  function onPreviewClick(event: MouseEvent | KeyboardEvent) {
    event.preventDefault()
    event.stopPropagation()
    if (!previewSrc) return
    opts.onPreview?.(previewSrc)
  }

  return (
    <NodeViewWrapper
      as="span"
      className={IMAGE_CHIP_WRAP_CLASS}
      data-cw-inline-image-wrap=""
      data-preview-src={previewSrc || undefined}
      data-natural-width={naturalWidth > 0 ? naturalWidth : undefined}
      data-natural-height={naturalHeight > 0 ? naturalHeight : undefined}
      data-image-name={name || undefined}
    >
      <CwCornerClosableWrap
        texts={{ closeLabel: opts.removeAriaLabel ?? '移除图片' }}
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
          {previewSrc ? (
            <CwImageFit
              src={previewSrc}
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
    </NodeViewWrapper>
  )
}

export default ImageClipNodeView
