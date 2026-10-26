import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import {
  EMOJI_WRAP_CLASS,
  INLINE_CHIP_REACT_RENDERER_CLASS,
} from '../chips/chipStyles'
import { CW_INLINE_EMOJI_IMG_CLASS } from '../../CwChatMessageQuote/emojioneEmoji'
import { EmojiNodeView } from './EmojiNodeView'

const EMOJI_NODE_IMG_CLASS = `cw-emoji shrink-0 object-contain ${CW_INLINE_EMOJI_IMG_CLASS}`

export interface EmojiNodeOptions {
  HTMLAttributes: Record<string, unknown>
  publicAssetBaseUrl?: string
}

/** emoji 原子节点（与 Vue `EmojiNode` 对齐） */
export const EmojiNode = Node.create<EmojiNodeOptions>({
  name: 'emoji',

  group: 'inline',

  inline: true,

  atom: true,

  selectable: true,

  addOptions() {
    return {
      HTMLAttributes: {},
      publicAssetBaseUrl: undefined as string | undefined,
    }
  },

  addAttributes() {
    return {
      src: {
        default: null,
      },
      alt: {
        default: null,
      },
      'data-emoji': {
        default: null,
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-emoji]',
        getAttrs: (el) => {
          const span = el as HTMLElement
          const glyph =
            span.getAttribute('data-emoji')?.trim() ||
            span.querySelector('img[data-emoji]')?.getAttribute('data-emoji')?.trim() ||
            span.querySelector('img')?.getAttribute('alt')?.trim() ||
            ''
          const img =
            span.querySelector('img.cw-emoji') ||
            span.querySelector('img[data-emoji]') ||
            span.querySelector('img')
          if (img) {
            return {
              src: img.getAttribute('src') || '',
              alt: img.getAttribute('alt') || glyph,
              'data-emoji':
                span.getAttribute('data-emoji') ||
                img.getAttribute('data-emoji') ||
                glyph,
            }
          }
          return {
            src: span.getAttribute('data-src') || '',
            alt: span.getAttribute('data-alt') || glyph,
            'data-emoji': glyph,
          }
        },
      },
      {
        tag: 'img.cw-emoji[data-emoji]',
        getAttrs: (el) => {
          return {
            src: (el as HTMLElement).getAttribute('src'),
            alt: (el as HTMLElement).getAttribute('alt'),
            'data-emoji': (el as HTMLElement).getAttribute('data-emoji'),
          }
        },
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    const attrs = mergeAttributes(HTMLAttributes)
    return [
      'span',
      {
        'data-emoji': attrs['data-emoji'],
        class: EMOJI_WRAP_CLASS,
      },
      [
        'img',
        {
          src: attrs.src,
          alt: attrs.alt,
          'data-emoji': attrs['data-emoji'],
          class: EMOJI_NODE_IMG_CLASS,
          draggable: 'false',
        },
      ],
    ]
  },

  /** 与 ImMentionNode 一致：参与 editor.getText()，否则仅 emoji 时 canSend 会认为内容为空 */
  renderText({ node }) {
    const raw = node.attrs['data-emoji'] ?? node.attrs.alt
    return typeof raw === 'string' ? raw : ''
  },

  addNodeView() {
    return ReactNodeViewRenderer(EmojiNodeView, {
      className: INLINE_CHIP_REACT_RENDERER_CLASS,
    })
  },
})
