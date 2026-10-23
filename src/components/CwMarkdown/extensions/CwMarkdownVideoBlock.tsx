import type { MouseEvent } from 'react'
import type { InlineImageNode } from '../types'
import { useCwMarkdownContext } from '../context'
import { CwVideoPlayer } from '../../CwVideoPlayer'

export interface CwMarkdownVideoBlockProps {
  node: InlineImageNode
}

export function CwMarkdownVideoBlock({ node }: CwMarkdownVideoBlockProps) {
  const ctx = useCwMarkdownContext()

  function handleContextMenu(event: MouseEvent<HTMLDivElement>) {
    if (ctx.disabled || ctx.readonly) return
    ctx.onImageContextMenu({
      src: node.src,
      alt: node.alt,
      title: node.title,
      documentImageIndex: -1,
      event,
    })
  }

  return (
    <div
      className={[
        'cw-md-video block w-full max-w-full my-1',
        ctx.styles.image,
        'aspect-video h-auto max-h-[min(55vh,var(--size-chip-inline-max))] min-h-[4.5rem]',
      ]
        .filter(Boolean)
        .join(' ')}
      role="group"
      aria-label={`视频：${node.alt || node.src}`}
      title={node.title}
      onClick={(event) => event.stopPropagation()}
      onContextMenu={handleContextMenu}
    >
      <CwVideoPlayer
        src={node.src}
        controls
        autoplay={false}
        preload="metadata"
        fullscreen
        fitToParent
        disabled={ctx.disabled || ctx.readonly}
      />
    </div>
  )
}

export default CwMarkdownVideoBlock
