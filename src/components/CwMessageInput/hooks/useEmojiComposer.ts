import { useCallback, useRef } from 'react'
import type { Editor } from '@tiptap/core'
import type { Node as PMNode } from '@tiptap/pm/model'
import {
  getEmojionePngUrl,
  splitTextToEmojiParts,
} from '../../CwChatMessageQuote/emojioneEmoji'
import { focusEditorWithKeyboardPolicy } from '../functions/focusEditorWithKeyboardPolicy'

export type EmojiComposerNode =
  | { type: 'text'; text: string }
  | { type: 'emoji'; attrs: Record<string, string> }

/** 插入文本（含 emoji 图片化）、粘贴文本 emoji 转换、编辑器内 emoji 字符转图片节点 */
export function useEmojiComposer(options: {
  getEditor: () => Editor | null
  publicAssetBaseUrl: string
  suppressVirtualKeyboard: boolean
  notifyContentChanged: () => void
  rememberComposerSelection: (ed: Editor) => void
  restoreComposerSelectionBeforeInsert: (ed: Editor) => void
  scrollFieldCaretIntoView: () => void
}) {
  const {
    getEditor,
    publicAssetBaseUrl,
    suppressVirtualKeyboard,
    notifyContentChanged,
    rememberComposerSelection,
    restoreComposerSelectionBeforeInsert,
    scrollFieldCaretIntoView,
  } = options

  // 使用防抖避免循环更新
  const convertingRef = useRef(false)

  const insertText = useCallback(
    (text: string): void => {
      const ed = getEditor()
      if (!text || !ed) return
      focusEditorWithKeyboardPolicy(ed, suppressVirtualKeyboard)
      restoreComposerSelectionBeforeInsert(ed)
      const url = getEmojionePngUrl(text, publicAssetBaseUrl)
      if (url) {
        ed.chain()
          .insertContent({
            type: 'emoji',
            attrs: {
              src: url,
              alt: text,
              'data-emoji': text,
            },
          })
          .run()
        rememberComposerSelection(ed)
        notifyContentChanged()
        return
      }
      ed.chain().insertContent(text).run()
      rememberComposerSelection(ed)
      notifyContentChanged()
    },
    [
      getEditor,
      notifyContentChanged,
      publicAssetBaseUrl,
      rememberComposerSelection,
      restoreComposerSelectionBeforeInsert,
      suppressVirtualKeyboard,
    ],
  )

  const handleTextPasteWithEmoji = useCallback(
    (text: string): void => {
      const ed = getEditor()
      if (!ed) return
      const parts = splitTextToEmojiParts(text, publicAssetBaseUrl)
      const nodes: EmojiComposerNode[] = []
      for (const part of parts) {
        if (part.type === 'text') {
          nodes.push({ type: 'text', text: part.text })
        } else {
          nodes.push({
            type: 'emoji',
            attrs: {
              src: part.src,
              alt: part.emoji,
              'data-emoji': part.emoji,
            },
          })
        }
      }
      ed.commands.insertContent(nodes)
      notifyContentChanged()
      scrollFieldCaretIntoView()
    },
    [
      getEditor,
      notifyContentChanged,
      publicAssetBaseUrl,
      scrollFieldCaretIntoView,
    ],
  )

  /** 将编辑器中的 emoji 字符转换为图片节点 */
  const convertEmojiCharsToNodes = useCallback(async (): Promise<void> => {
    const ed = getEditor()
    if (!ed || convertingRef.current) return
    convertingRef.current = true
    try {
      const { state } = ed

      // 逐段替换 emoji 字符（勿整段替换 text 节点），便于 selection mapping 保持光标
      const replacements: Array<{ from: number; to: number; node: PMNode }> = []

      const textNodes: Array<{ text: string; pos: number }> = []
      state.doc.descendants((node, pos) => {
        if (node.type.name !== 'text' || !node.text) return true
        textNodes.push({ text: node.text, pos })
        return true
      })

      const emojiType = state.schema.nodes.emoji
      if (!emojiType) return

      for (const { text, pos } of textNodes) {
        const parts = splitTextToEmojiParts(text, publicAssetBaseUrl)
        if (!parts.some((part) => part.type === 'emoji')) continue

        let offset = 0
        for (const part of parts) {
          if (part.type === 'emoji') {
            replacements.push({
              from: pos + offset,
              to: pos + offset + part.emoji.length,
              node: emojiType.create({
                src: part.src,
                alt: part.emoji,
                'data-emoji': part.emoji,
              }),
            })
            offset += part.emoji.length
          } else {
            offset += part.text.length
          }
        }
      }

      if (replacements.length === 0) return

      const tr = state.tr
      for (let i = replacements.length - 1; i >= 0; i--) {
        const { from, to, node } = replacements[i]!
        tr.replaceWith(from, to, node)
      }
      const mappedSelection = state.selection.map(tr.doc, tr.mapping)
      tr.setSelection(mappedSelection)
      const targetFrom = mappedSelection.from
      const targetTo = mappedSelection.to

      ed.view.dispatch(tr)
      rememberComposerSelection(ed)

      // NodeView 异步挂载 emoji 图时可能把选区重置到文末，下一帧再校正
      requestAnimationFrame(() => {
        if (ed.isDestroyed) return
        const { from, to } = ed.state.selection
        if (from !== targetFrom || to !== targetTo) {
          ed.commands.setTextSelection({ from: targetFrom, to: targetTo })
          rememberComposerSelection(ed)
        }
      })
    } finally {
      convertingRef.current = false
    }
  }, [
    getEditor,
    publicAssetBaseUrl,
    rememberComposerSelection,
  ])

  return { insertText, handleTextPasteWithEmoji, convertEmojiCharsToNodes }
}
