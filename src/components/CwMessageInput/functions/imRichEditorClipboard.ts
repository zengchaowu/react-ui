import { DOMSerializer, type Schema, type Slice } from '@tiptap/pm/model'
import type { EditorView } from '@tiptap/pm/view'
import { getTextBetween, getTextSerializersFromSchema } from '@tiptap/core'
import { hasImRichInlineClipboardMarkers } from '@zengchaowu/shared/functions/im/imRichContentHtml'
import {
  formatImFileClipboardPlainToken,
  formatImImageClipboardPlainToken,
  formatImMentionClipboardPlainToken,
} from '@zengchaowu/shared/functions/im/imRichClipboardPlain'

/** 剪贴板 HTML 是否为本编辑器写入（含 @ / 图 / 文件 wire 或 emoji） */
export function hasEditorClipboardHtmlMarkers(html: string): boolean {
  const raw = html?.trim() ?? ''
  if (!raw) return false
  return hasImRichInlineClipboardMarkers(raw) || /\bdata-emoji\b/i.test(raw)
}

/** 用 schema renderHTML 序列化选区（保留 emoji / @ 等全部 inline 节点，不做 IM 消毒） */
export function wireHtmlFromEditorSlice(view: EditorView, slice: Slice): string {
  const serializer = DOMSerializer.fromSchema(view.state.schema)
  const wrap = document.createElement('div')
  wrap.appendChild(
    serializer.serializeFragment(slice.content, { document: document }),
  )
  return wrap.innerHTML
}

/** plain 文本：人眼可读 + `\u2060` 携带 uid/src/path，跨重启可还原 chip */
export function restorablePlainFromEditorSlice(
  slice: Slice,
  schema: Schema,
): string {
  const doc = schema.topNodeType.create(null, slice.content)
  const baseSerializers = getTextSerializersFromSchema(schema)
  return getTextBetween(doc, { from: 0, to: doc.content.size }, {
    blockSeparator: '\n\n',
    textSerializers: {
      ...baseSerializers,
      imMention: ({ node }) =>
        formatImMentionClipboardPlainToken(
          String(node.attrs.uid ?? ''),
          String(node.attrs.label ?? ''),
        ),
      inlineImage: ({ node }) =>
        formatImImageClipboardPlainToken(
          String(node.attrs.previewSrc ?? ''),
          String(node.attrs.name ?? '图片'),
          Number(node.attrs.naturalWidth) || 0,
          Number(node.attrs.naturalHeight) || 0,
        ),
      fileRef: ({ node }) =>
        formatImFileClipboardPlainToken(
          String(node.attrs.path ?? ''),
          String(node.attrs.label ?? ''),
        ),
    },
  })
}

export function writeImRichClipboardData(
  view: EditorView,
  event: ClipboardEvent,
): boolean {
  const { state } = view
  const { from, to } = state.selection
  if (from >= to || !event.clipboardData) return false

  const slice = state.doc.slice(from, to)
  const wireHtml = wireHtmlFromEditorSlice(view, slice)
  const plain = restorablePlainFromEditorSlice(slice, state.schema)

  event.preventDefault()
  event.clipboardData.clearData()
  event.clipboardData.setData('text/html', wireHtml)
  event.clipboardData.setData('text/plain', plain)
  return true
}
