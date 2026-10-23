import { escapeHtml } from '@zengchaowu/shared/functions/string/htmlEscape'

type HljsModule = typeof import('highlight.js')

let hljsModulePromise: Promise<HljsModule> | null = null

function loadHljs(): Promise<HljsModule> {
  hljsModulePromise ??= import('highlight.js')
  return hljsModulePromise
}

function normalizeLanguage(language: string | undefined): string | undefined {
  const lang = language?.trim().toLowerCase()
  if (
    !lang ||
    lang === 'text' ||
    lang === 'txt' ||
    lang === 'plain' ||
    lang === 'plaintext'
  ) {
    return undefined
  }
  return lang
}

/** 未高亮时的安全 HTML（转义后的纯文本） */
export function escapeMarkdownCodeHtml(code: string): string {
  return escapeHtml(code)
}

/**
 * 用 highlight.js 高亮围栏代码块；无语言时只转义，不自动猜语言。
 * 返回可安全用于 dangerouslySetInnerHTML 的 HTML 片段。
 */
export async function highlightMarkdownCode(
  code: string,
  language?: string,
): Promise<string> {
  if (!code) return ''
  const lang = normalizeLanguage(language)
  if (!lang) return escapeMarkdownCodeHtml(code)

  try {
    const hljs = (await loadHljs()).default
    if (hljs.getLanguage(lang)) {
      return hljs.highlight(code, { language: lang, ignoreIllegals: true })
        .value
    }
    return hljs.highlightAuto(code).value
  } catch {
    return escapeMarkdownCodeHtml(code)
  }
}
