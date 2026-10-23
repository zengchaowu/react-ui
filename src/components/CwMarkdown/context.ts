import { createContext, useContext } from 'react'
import type {
  CwMarkdownCodeBlockExtension,
  CwMarkdownContentPreprocessor,
  CwMarkdownContextValue,
  CwMarkdownInlineImageExtension,
} from './types'

/** 供子组件消费的 Markdown 上下文（等价 Vue provide/inject） */
export const CwMarkdownContext = createContext<CwMarkdownContextValue | null>(
  null,
)

export function useCwMarkdownContext(): CwMarkdownContextValue {
  const ctx = useContext(CwMarkdownContext)
  if (!ctx) {
    throw new Error('CwMarkdown 子组件必须在 CwMarkdown 内使用')
  }
  return ctx
}

/** 应用级注入自定义代码块扩展（如 mermaid） */
export const CwMarkdownCodeBlockExtensionsContext = createContext<
  CwMarkdownCodeBlockExtension[]
>([])

/** 应用级注入自定义内联图片扩展（如视频播放器） */
export const CwMarkdownInlineImageExtensionsContext = createContext<
  CwMarkdownInlineImageExtension[]
>([])

/** 应用级注入 Markdown 正文预处理链；按数组顺序执行 */
export const CwMarkdownContentPreprocessorsContext = createContext<
  CwMarkdownContentPreprocessor[]
>([])

/** Vue InjectionKey 兼容别名（React 侧直接当 Context 使用） */
export const CwMarkdownContextKey = CwMarkdownContext
/** Vue InjectionKey 兼容别名（React 侧直接当 Context 使用） */
export const CwMarkdownCodeBlockExtensionsKey = CwMarkdownCodeBlockExtensionsContext
/** Vue InjectionKey 兼容别名（React 侧直接当 Context 使用） */
export const CwMarkdownInlineImageExtensionsKey =
  CwMarkdownInlineImageExtensionsContext
/** Vue InjectionKey 兼容别名（React 侧直接当 Context 使用） */
export const CwMarkdownContentPreprocessorsKey =
  CwMarkdownContentPreprocessorsContext
