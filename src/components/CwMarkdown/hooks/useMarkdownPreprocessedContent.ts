import { useContext, useMemo } from 'react'
import { applyCwMarkdownContentPreprocessors } from '../functions/applyCwMarkdownContentPreprocessors'
import { CwMarkdownContentPreprocessorsContext } from '../context'

/** 合并应用级注入的预处理链，供 CwMarkdown / CwChatMessageMarkdown 共用 */
export function useMarkdownPreprocessedContent(content: string): string {
  const preprocessors = useContext(CwMarkdownContentPreprocessorsContext)
  return useMemo(
    () => applyCwMarkdownContentPreprocessors(content ?? '', preprocessors),
    [content, preprocessors],
  )
}
