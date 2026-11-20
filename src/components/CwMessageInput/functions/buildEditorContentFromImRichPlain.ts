import { buildEditorContentFromImRichPlainText as buildEditorContentFromImRichPlainTextCore } from '@zengchaowu/ui-shared/components/CwMessageInput/functions/buildEditorContentFromImRichPlain'
import { getEmojionePngUrl } from '@zengchaowu/ui-shared/utils/emojioneEmoji'

export type {
  ImRichEditorContentNode,
  ImRichEmojiPngResolver,
  BuildEditorContentFromImRichPlainOptions,
} from '@zengchaowu/ui-shared/components/CwMessageInput/functions/buildEditorContentFromImRichPlain'

/** 绑定本库 emoji 资源解析的薄适配（解析逻辑在 ui-shared） */
export function buildEditorContentFromImRichPlainText(
  text: string,
  baseUrl?: string,
) {
  return buildEditorContentFromImRichPlainTextCore(text, baseUrl, {
    resolveEmojiPngUrl: getEmojionePngUrl,
  })
}
