import { parseImRichClipboardPlainText } from '@zengchaowu/shared/functions/im/imRichClipboardPlain'
import { parseImRichContentHtml } from '@zengchaowu/shared/functions/im/imRichContentHtml'
import { getEmojionePngUrl } from '../../CwChatMessageQuote/emojioneEmoji'

export type ImRichEditorContentNode =
  | { type: 'text'; text: string }
  | { type: 'imMention'; attrs: { uid: string; label: string } }
  | {
      type: 'inlineImage'
      attrs: {
        previewSrc: string
        name: string
        naturalWidth: number
        naturalHeight: number
      }
    }
  | {
      type: 'fileRef'
      attrs: {
        id: string
        path: string
        label: string
      }
    }
  | {
      type: 'emoji'
      attrs: {
        src: string
        alt: string
        'data-emoji': string
      }
    }

function segmentsToEditorContentNodes(
  segments: ReturnType<typeof parseImRichContentHtml>,
  baseUrl?: string,
): ImRichEditorContentNode[] {
  const nodes: ImRichEditorContentNode[] = []
  const stamp = Date.now()

  for (const seg of segments) {
    if (seg.type === 'text') {
      if (seg.text) nodes.push({ type: 'text', text: seg.text })
      continue
    }
    if (seg.type === 'mention') {
      const uid = seg.userId.trim()
      const label = seg.label.trim() || uid
      if (!uid) continue
      nodes.push({ type: 'imMention', attrs: { uid, label } })
      continue
    }
    if (seg.type === 'image') {
      const previewSrc = seg.url.trim()
      if (!previewSrc) continue
      nodes.push({
        type: 'inlineImage',
        attrs: {
          previewSrc,
          name: seg.alt?.trim() || '图片',
          naturalWidth: seg.width ?? 0,
          naturalHeight: seg.height ?? 0,
        },
      })
      continue
    }
    if (seg.type === 'file') {
      const path = seg.path.trim()
      const label = seg.label.trim() || path.split(/[/\\]/).pop() || path
      if (!path && !label) continue
      nodes.push({
        type: 'fileRef',
        attrs: {
          id: `ref_${stamp}_${Math.random().toString(36).slice(2, 9)}`,
          path,
          label,
        },
      })
      continue
    }
    if (seg.type === 'emoji') {
      const glyph = seg.glyph.trim()
      if (!glyph) continue
      const src = seg.src?.trim() || getEmojionePngUrl(glyph, baseUrl) || ''
      nodes.push({
        type: 'emoji',
        attrs: { src, alt: glyph, 'data-emoji': glyph },
      })
    }
  }

  return nodes
}

/** 将带 `\u2060` 元数据的 plain 剪贴板文本转为编辑器节点描述 */
export function buildEditorContentFromImRichPlainText(
  text: string,
  baseUrl?: string,
): ImRichEditorContentNode[] {
  return segmentsToEditorContentNodes(parseImRichClipboardPlainText(text), baseUrl)
}
