import type { CwMarkdownInlineImageExtension } from '../types'
import { isMarkdownInlineVideoNode } from '@zengchaowu/shared/functions/im/imInlineMediaUrlVideo'
import { CwMarkdownVideoBlock } from './CwMarkdownVideoBlock'

/**
 * 将 Markdown `![alt](*.mp4|webm|…)` 渲染为 {@link CwMarkdownVideoBlock}。
 * 应用侧：`<CwMarkdownInlineImageExtensionsContext.Provider value={cwMarkdownVideoInlineImageExtensions}>`
 */
export const cwMarkdownVideoInlineImageExtensions: CwMarkdownInlineImageExtension[] =
  [
    {
      match: isMarkdownInlineVideoNode,
      component: CwMarkdownVideoBlock,
    },
  ]
