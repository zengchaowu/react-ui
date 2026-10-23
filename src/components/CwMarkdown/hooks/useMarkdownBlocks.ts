import { useContext, useMemo } from 'react'
import type { CwMarkdownBlock } from '../types'
import { parseMarkdownBlocks } from '@zengchaowu/shared/functions/markdown/parseMarkdownBlocks'

/**
 * 将 Markdown 内容解析为块级节点列表
 * 响应 content 变化，支持流式/不完整内容
 */
export function useMarkdownBlocks(content: string): CwMarkdownBlock[] {
  return useMemo(() => parseMarkdownBlocks(content ?? ''), [content])
}
