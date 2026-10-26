import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react'
import CwViewportImg from '../../CwViewportImg/CwViewportImg'
import {
  CW_INLINE_EMOJI_IMG_CLASS,
  getEmojionePngUrl,
} from '../../CwChatMessageQuote/emojioneEmoji'
import { EMOJI_WRAP_CLASS } from '../chips/chipStyles'
import type { EmojiNodeOptions } from './EmojiNode'

const EMOJI_NODE_IMG_CLASS = `cw-emoji shrink-0 object-contain ${CW_INLINE_EMOJI_IMG_CLASS}`

/** emoji 原子节点视图（等价 Vue `EmojiNodeView`） */
export function EmojiNodeView({ node, extension, selected }: NodeViewProps) {
  const attrs = node.attrs as {
    src?: string
    alt?: string
    'data-emoji'?: string
  }
  const options = extension.options as EmojiNodeOptions
  const glyph = String(attrs['data-emoji'] ?? attrs.alt ?? '').trim()
  const fromAttr = String(attrs.src ?? '').trim()
  const baseUrl = String(options.publicAssetBaseUrl ?? '').trim()
  const src =
    fromAttr || (glyph ? getEmojionePngUrl(glyph, baseUrl || undefined) ?? '' : '')

  return (
    <NodeViewWrapper
      as="span"
      className={[EMOJI_WRAP_CLASS, selected ? 'ProseMirror-selectednode' : '']
        .filter(Boolean)
        .join(' ')}
    >
      <CwViewportImg
        src={src}
        alt={attrs.alt ?? undefined}
        data-emoji={attrs['data-emoji'] ?? undefined}
        className={EMOJI_NODE_IMG_CLASS}
      />
    </NodeViewWrapper>
  )
}

export default EmojiNodeView
