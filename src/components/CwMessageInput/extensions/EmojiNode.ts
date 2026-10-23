import { EMOJI_WRAP_CLASS } from '../chips/chipStyles'
import {
  CW_INLINE_EMOJI_IMG_CLASS,
  getEmojionePngUrl,
} from '../../CwChatMessageQuote/emojioneEmoji'
import {
  defineCwMessageInputInlineNode,
  type CwMessageInputInlineNodeDefinition,
} from './createNode'

const EMOJI_NODE_IMG_CLASS = `cw-emoji shrink-0 object-contain ${CW_INLINE_EMOJI_IMG_CLASS}`

export interface EmojiNodeOptions {
  HTMLAttributes: Record<string, unknown>
  publicAssetBaseUrl?: string
}

export interface EmojiNodeAttrs {
  src?: string
  alt?: string
  'data-emoji'?: string
}

function resolveEmojiSrc(attrs: EmojiNodeAttrs, baseUrl?: string): string {
  const fromAttr = String(attrs.src ?? '').trim()
  if (fromAttr) return fromAttr
  const glyph = String(attrs['data-emoji'] ?? attrs.alt ?? '').trim()
  return (glyph && getEmojionePngUrl(glyph, baseUrl)) || ''
}

/** 构造 emoji 原子节点 DOM（等价 Vue `EmojiNodeView` / `renderHTML`） */
export function createEmojiElement(
  attrs: EmojiNodeAttrs,
  baseUrl?: string,
): HTMLSpanElement {
  const wrap = document.createElement('span')
  wrap.className = EMOJI_WRAP_CLASS
  wrap.setAttribute('contenteditable', 'false')
  const glyph = String(attrs['data-emoji'] ?? attrs.alt ?? '')
  if (glyph) wrap.setAttribute('data-emoji', glyph)

  const img = document.createElement('img')
  img.className = EMOJI_NODE_IMG_CLASS
  img.src = resolveEmojiSrc(attrs, baseUrl)
  img.alt = String(attrs.alt ?? glyph)
  if (glyph) img.setAttribute('data-emoji', glyph)
  img.draggable = false
  wrap.appendChild(img)
  return wrap
}

/** emoji 原子节点的 wire HTML */
export function renderEmojiHtml(attrs: EmojiNodeAttrs, baseUrl?: string): string {
  const glyph = String(attrs['data-emoji'] ?? attrs.alt ?? '')
  const src = resolveEmojiSrc(attrs, baseUrl)
  return `<span data-emoji="${glyph}"><img class="${EMOJI_NODE_IMG_CLASS}" src="${src}" alt="${String(
    attrs.alt ?? glyph,
  )}" data-emoji="${glyph}" draggable="false" /></span>`
}

export function renderEmojiText(attrs: EmojiNodeAttrs): string {
  const raw = attrs['data-emoji'] ?? attrs.alt
  return typeof raw === 'string' ? raw : ''
}

export const EmojiNode: CwMessageInputInlineNodeDefinition<EmojiNodeOptions> =
  defineCwMessageInputInlineNode<EmojiNodeOptions>('emoji', {
    HTMLAttributes: {},
    publicAssetBaseUrl: undefined,
  })
