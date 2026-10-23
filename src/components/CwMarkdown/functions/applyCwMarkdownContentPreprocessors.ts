import type { CwMarkdownContentPreprocessor } from '../types'

/** 按注册顺序依次执行 Markdown 正文预处理（如将 `<video>` 转为 `![](url)`） */
export function applyCwMarkdownContentPreprocessors(
  content: string,
  preprocessors: CwMarkdownContentPreprocessor[],
): string {
  if (!content || preprocessors.length === 0) return content
  let out = content
  for (const fn of preprocessors) {
    out = fn(out)
  }
  return out
}
