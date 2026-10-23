import type { CwMarkdownBlock, CwMarkdownInlineNode } from '../types'
import { parseMarkdownBlocks } from '@zengchaowu/shared/functions/markdown/parseMarkdownBlocks'

function walkInlineNodes(
  nodes: CwMarkdownInlineNode[],
  out: string[],
  excludeSrc?: (src: string) => boolean,
) {
  for (const n of nodes) {
    if (n.type === 'image') {
      if (n.src && !(excludeSrc?.(n.src) ?? false)) out.push(n.src)
      continue
    }
    if (n.type === 'bold' || n.type === 'italic' || n.type === 'link') {
      if (n.children?.length) walkInlineNodes(n.children, out, excludeSrc)
    }
  }
}

function walkBlock(
  block: CwMarkdownBlock,
  out: string[],
  excludeSrc?: (src: string) => boolean,
) {
  switch (block.type) {
    case 'paragraph':
    case 'heading':
      walkInlineNodes(block.content, out, excludeSrc)
      return
    case 'codeBlock':
      return
    case 'blockquote':
      for (const c of block.children) walkBlock(c, out, excludeSrc)
      return
    case 'list':
      for (const item of block.items) walkInlineNodes(item, out, excludeSrc)
      return
    case 'table':
      for (const cell of block.header) walkInlineNodes(cell, out, excludeSrc)
      for (const row of block.body) {
        for (const cell of row) walkInlineNodes(cell, out, excludeSrc)
      }
      return
    case 'hr':
      return
  }
}

/**
 * 按与 `parseMarkdownBlocks` + `parseInline` 完全一致的规则，收集内联 `![](url)` 的 `src`（与点击时传入的 `src` 一致，含顺序与去重规则）。
 */
export function collectMarkdownImageSrcsInParseOrder(
  content: string,
  options?: { excludeSrc?: (src: string) => boolean },
): string[] {
  if (!content || typeof content !== 'string') return []
  const out: string[] = []
  const excludeSrc = options?.excludeSrc
  for (const b of parseMarkdownBlocks(content)) walkBlock(b, out, excludeSrc)
  return out
}

/** 用于点击图与解析列表匹配（编码、尾部斜杠等略有差异时仍能命中） */
export function normalizeMarkdownImageSrcForMatch(raw: string): string {
  const s = String(raw ?? '').trim()
  if (!s) return ''
  try {
    if (/^https?:\/\//i.test(s)) {
      const u = new URL(s)
      u.hash = ''
      let path = u.pathname
      if (path.length > 1 && path.endsWith('/')) path = path.slice(0, -1)
      u.pathname = path
      return u.toString()
    }
  } catch {
    /* 非绝对 URL 时退回简单规范化 */
  }
  try {
    return decodeURI(s)
  } catch {
    return s
  }
}
