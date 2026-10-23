import type { CwMarkdownContentPreprocessor } from '../types'
import { normalizeMarkdownHtmlVideoTags } from '@zengchaowu/shared/functions/markdown/normalizeMarkdownHtmlVideoTags'

/** HTML `<video src>` → `![](url)`，供视频内联扩展接管 */
export const cwMarkdownVideoContentPreprocessors: CwMarkdownContentPreprocessor[] =
  [normalizeMarkdownHtmlVideoTags]
