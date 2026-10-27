import { useEffect, useState } from 'react'
import type { MouseEvent } from 'react'
import type { InlineImageNode } from '../types'
import { useCwMarkdownContext } from '../context'
import { CwImageFit } from '../../CwImageFit'
import {
  CW_MARKDOWN_INLINE_IMAGE_BOUNDS_MAX_WIDTH_PX,
  resolveMarkdownInlineImageBoundsMaxHeightPx,
} from '@zengchaowu/ui-shared/components/CwMarkdown/constants/markdownInlineImageBounds'
import { resolveMarkdownInlineImageDocumentIndex } from '../functions/resolveMarkdownInlineImageDocumentIndex'

const MARKDOWN_ROOT = '[data-cw-markdown-root]'

export interface CwMarkdownInlineImageProps {
  node: InlineImageNode
}

export function CwMarkdownInlineImage({ node }: CwMarkdownInlineImageProps) {
  const ctx = useCwMarkdownContext()

  const matchedExtension = ctx.inlineImageExtensions.find((ext) =>
    ext.match(node),
  )

  const [boundsMaxHeight, setBoundsMaxHeight] = useState(() =>
    resolveMarkdownInlineImageBoundsMaxHeightPx(),
  )

  useEffect(() => {
    function syncBoundsMaxHeight() {
      setBoundsMaxHeight(resolveMarkdownInlineImageBoundsMaxHeightPx())
    }
    syncBoundsMaxHeight()
    window.addEventListener('resize', syncBoundsMaxHeight)
    return () => window.removeEventListener('resize', syncBoundsMaxHeight)
  }, [])

  function handleClick(event: MouseEvent<HTMLDivElement>) {
    if (ctx.disabled || ctx.readonly) return
    const documentImageIndex = resolveMarkdownInlineImageDocumentIndex(
      event,
      MARKDOWN_ROOT,
    )
    ctx.onImageClick(node.src, event, documentImageIndex)
  }

  function handleContextMenu(event: MouseEvent<HTMLDivElement>) {
    if (ctx.disabled || ctx.readonly) return
    const documentImageIndex = resolveMarkdownInlineImageDocumentIndex(
      event,
      MARKDOWN_ROOT,
    )
    ctx.onImageContextMenu({
      src: node.src,
      alt: node.alt,
      title: node.title,
      documentImageIndex,
      event,
    })
  }

  if (matchedExtension) {
    const ExtensionComponent = matchedExtension.component
    return <ExtensionComponent node={node} />
  }

  return (
    <div
      className={[
        'cw-markdown-inline-image inline-block max-w-full',
        ctx.styles.image,
        ctx.disabled || ctx.readonly ? 'cursor-default' : 'cursor-pointer',
      ]
        .filter(Boolean)
        .join(' ')}
      aria-label={`${ctx.texts.imageAriaLabelPrefix}${node.alt || node.src}`}
      title={node.title}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
    >
      <CwImageFit
        src={node.src}
        alt={node.alt || ''}
        boundsMaxWidth={CW_MARKDOWN_INLINE_IMAGE_BOUNDS_MAX_WIDTH_PX}
        boundsMaxHeight={boundsMaxHeight}
        disabled={ctx.disabled}
        readonly={ctx.readonly}
        imgLoading="lazy"
      />
    </div>
  )
}

export default CwMarkdownInlineImage
