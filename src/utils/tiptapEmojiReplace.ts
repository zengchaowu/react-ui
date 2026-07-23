import type { Editor } from '@tiptap/core'
import { Fragment, Slice } from '@tiptap/pm/model'
import { containsEmoji, splitTextToEmojiParts } from './emojioneEmoji'

let isConvertingEmoji = false

export type TiptapPlainInsertNode =
  | { type: 'text'; text: string }
  | { type: 'emoji'; attrs: Record<string, string> }

/** 将纯文本拆成 TipTap insertContent 可用的 text / emoji 节点 */
export function buildTiptapInsertNodesFromPlainText(
  text: string,
  baseUrl?: string,
): TiptapPlainInsertNode[] {
  const nodes: TiptapPlainInsertNode[] = []
  for (const part of splitTextToEmojiParts(text, baseUrl)) {
    if (part.type === 'text') {
      if (part.text) nodes.push({ type: 'text', text: part.text })
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
  return nodes
}

/** 把文档内可映射的 emoji 字形替换为 EmojiOne 原子节点（与 CwMessageInput 一致） */
export function convertEmojiCharsToNodes(
  editor: Editor | null | undefined,
  baseUrl?: string,
): void {
  if (!editor || isConvertingEmoji) return
  const { state } = editor

  const replacements: Array<{
    from: number
    to: number
    nodes: ReturnType<typeof state.schema.nodes.emoji.create>[]
  }> = []

  state.doc.descendants((node, pos) => {
    if (node.type.name === 'text' && node.text) {
      const parts = splitTextToEmojiParts(node.text, baseUrl)
      if (!parts.some((p) => p.type === 'emoji')) return true
      const nodes = parts.map((part) => {
        if (part.type === 'text') {
          return state.schema.text(part.text)
        }
        return state.schema.nodes.emoji.create({
          src: part.src,
          alt: part.emoji,
          'data-emoji': part.emoji,
        })
      })
      replacements.push({ from: pos, to: pos + node.nodeSize, nodes })
    }
    return true
  })

  if (replacements.length === 0) return

  const tr = state.tr
  for (let i = replacements.length - 1; i >= 0; i--) {
    const { from, to, nodes } = replacements[i]!
    tr.replace(from, to, new Slice(Fragment.from(nodes), 0, 0))
  }

  isConvertingEmoji = true
  editor.view.dispatch(tr)
  isConvertingEmoji = false
}

export function insertPlainTextWithEmojiNodes(
  editor: Editor,
  text: string,
  baseUrl?: string,
): void {
  if (!text) return
  if (containsEmoji(text)) {
    editor.commands.insertContent(buildTiptapInsertNodesFromPlainText(text, baseUrl))
  } else {
    editor.commands.insertContent(text)
  }
}

/** 纯文本粘贴且含可映射 emoji 时由调用方 preventDefault */
export function tryHandlePlainPasteWithEmoji(
  editor: Editor | null | undefined,
  text: string | undefined | null,
  baseUrl?: string,
): boolean {
  if (!editor || !text || !containsEmoji(text)) return false
  insertPlainTextWithEmojiNodes(editor, text, baseUrl)
  return true
}
