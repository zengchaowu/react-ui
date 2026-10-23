import {
  hasImRichInlineClipboardMarkers,
  parseImRichContentHtml,
  sanitizeImRichContentHtml,
} from '@zengchaowu/shared/functions/im/imRichContentHtml'
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

/** 选区 HTML（保留 chip / emoji 全部 inline 节点） */
export function htmlFromEditorSelection(root: HTMLElement): string {
  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0) return ''
  const range = selection.getRangeAt(0)
  if (!root.contains(range.commonAncestorContainer)) return ''
  const wrap = document.createElement('div')
  wrap.appendChild(range.cloneContents())
  return wrap.innerHTML
}

/** plain 文本：人眼可读 + `\u2060` 携带 uid/src/path，跨重启可还原 chip */
export function restorablePlainFromHtml(html: string): string {
  const raw = html?.trim() ?? ''
  if (!raw) return ''
  const segments = parseImRichContentHtml(raw)
  let out = ''
  for (const seg of segments) {
    if (seg.type === 'text') {
      out += seg.text
      continue
    }
    if (seg.type === 'mention') {
      out += formatImMentionClipboardPlainToken(seg.userId, seg.label)
      continue
    }
    if (seg.type === 'image') {
      out += formatImImageClipboardPlainToken(
        seg.url,
        seg.alt ?? '图片',
        seg.width ?? 0,
        seg.height ?? 0,
      )
      continue
    }
    if (seg.type === 'file') {
      out += formatImFileClipboardPlainToken(seg.path, seg.label)
      continue
    }
    if (seg.type === 'emoji') {
      out += seg.glyph
    }
  }
  return out
}

export function writeImRichClipboardData(
  root: HTMLElement,
  event: ClipboardEvent,
): boolean {
  const html = sanitizeImRichContentHtml(htmlFromEditorSelection(root))
  if (!html.trim() || !event.clipboardData) return false
  event.preventDefault()
  event.clipboardData.clearData()
  event.clipboardData.setData('text/html', html)
  event.clipboardData.setData('text/plain', restorablePlainFromHtml(html))
  return true
}
