export interface CwChatMessageForwardBundleTexts {
  /** 无发送者时的标题 */
  titleEmpty: string
  /** 占位：`{name}` */
  titleOne: string
  /** 占位：`{first}`、`{second}` */
  titleTwo: string
  /** 占位：`{first}`、`{second}`、`{third}` */
  titleThree: string
  /** 占位：`{first}`、`{second}`、`{count}` */
  titleMany: string
  unknownSender: string
  emptyPreviewBody: string
  previewLineSeparator: string
}

export const defaultCwChatMessageForwardBundleTexts: CwChatMessageForwardBundleTexts =
  {
    titleEmpty: '聊天记录',
    titleOne: '{name}的聊天记录',
    titleTwo: '{first}和{second}的聊天记录',
    titleThree: '{first}、{second}和{third}的聊天记录',
    titleMany: '{first}、{second}等{count}人的聊天记录',
    unknownSender: '未知',
    emptyPreviewBody: '[消息]',
    previewLineSeparator: ':',
  }

function fillTemplate(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(vars[key] ?? ''))
}

export function buildCwChatMessageForwardBundleTitle(
  names: readonly string[],
  texts: CwChatMessageForwardBundleTexts = defaultCwChatMessageForwardBundleTexts,
): string {
  if (names.length === 0) return texts.titleEmpty
  if (names.length === 1) {
    return fillTemplate(texts.titleOne, { name: names[0]! })
  }
  if (names.length === 2) {
    return fillTemplate(texts.titleTwo, { first: names[0]!, second: names[1]! })
  }
  if (names.length === 3) {
    return fillTemplate(texts.titleThree, {
      first: names[0]!,
      second: names[1]!,
      third: names[2]!,
    })
  }
  return fillTemplate(texts.titleMany, {
    first: names[0]!,
    second: names[1]!,
    count: names.length,
  })
}
