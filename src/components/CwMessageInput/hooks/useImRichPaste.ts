import { useCallback } from 'react'
import type { Editor } from '@tiptap/core'
import { normalizeImRichEditorClipboardHtml } from '@zengchaowu/shared/functions/im/imRichContentHtml'
import { hasImRichClipboardPlainMarkers } from '@zengchaowu/shared/functions/im/imRichClipboardPlain'
import {
  buildEditorContentFromImRichPlainText,
  type ImRichEditorContentNode,
} from '../functions/buildEditorContentFromImRichPlain'
import { hasEditorClipboardHtmlMarkers } from '../functions/imRichEditorClipboard'
import { backfillInlineImageDimensions } from '../functions/backfillInlineImageDimensions'

/** IM 富文本剪贴板粘贴：HTML wire format 与纯文本 marker 两种来源 */
export function useImRichPaste(options: {
  getEditor: () => Editor | null
  publicAssetBaseUrl: string
  notifyContentChanged: () => void
  demoteOutOfScopeMentions: () => void
  scrollFieldCaretIntoView: () => void
}) {
  const {
    getEditor,
    publicAssetBaseUrl,
    notifyContentChanged,
    demoteOutOfScopeMentions,
    scrollFieldCaretIntoView,
  } = options

  const backfillInlineImageDimensionsAfterPaste = useCallback(async (): Promise<void> => {
    const ed = getEditor()
    if (!ed) return
    await backfillInlineImageDimensions(ed)
    notifyContentChanged()
  }, [getEditor, notifyContentChanged])

  const insertImRichEditorContent = useCallback(
    (nodes: ImRichEditorContentNode[]): void => {
      if (nodes.length === 0) return
      getEditor()?.chain().focus().insertContent(nodes).run()
      demoteOutOfScopeMentions()
      notifyContentChanged()
      scrollFieldCaretIntoView()
      void backfillInlineImageDimensionsAfterPaste()
    },
    [
      backfillInlineImageDimensionsAfterPaste,
      demoteOutOfScopeMentions,
      getEditor,
      notifyContentChanged,
      scrollFieldCaretIntoView,
    ],
  )

  const pasteImRichFromClipboard = useCallback(
    (event: ClipboardEvent): boolean => {
      const rawHtml = event.clipboardData?.getData('text/html') ?? ''
      if (rawHtml.trim()) {
        const html = normalizeImRichEditorClipboardHtml(rawHtml)
        if (hasEditorClipboardHtmlMarkers(html)) {
          event.preventDefault()
          getEditor()?.chain().focus().insertContent(html).run()
          demoteOutOfScopeMentions()
          notifyContentChanged()
          scrollFieldCaretIntoView()
          void backfillInlineImageDimensionsAfterPaste()
          return true
        }
      }
      const text = event.clipboardData?.getData('text/plain') ?? ''
      if (text && hasImRichClipboardPlainMarkers(text)) {
        const nodes = buildEditorContentFromImRichPlainText(text, publicAssetBaseUrl)
        if (nodes.some((node) => node.type !== 'text')) {
          event.preventDefault()
          insertImRichEditorContent(nodes)
          return true
        }
      }
      return false
    },
    [
      backfillInlineImageDimensionsAfterPaste,
      demoteOutOfScopeMentions,
      getEditor,
      insertImRichEditorContent,
      notifyContentChanged,
      publicAssetBaseUrl,
      scrollFieldCaretIntoView,
    ],
  )

  return { pasteImRichFromClipboard }
}
