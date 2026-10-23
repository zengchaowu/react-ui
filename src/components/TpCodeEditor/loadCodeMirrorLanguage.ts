import type { Extension } from '@codemirror/state'

export type CodeMirrorLanguageFactory = () => Extension

async function loadJavascript(): Promise<CodeMirrorLanguageFactory> {
  return (await import('@codemirror/lang-javascript')).javascript
}

const languageLoaders: Record<string, () => Promise<CodeMirrorLanguageFactory>> = {
  javascript: loadJavascript,
  js: loadJavascript,
  html: async () => (await import('@codemirror/lang-html')).html,
  css: async () => (await import('@codemirror/lang-css')).css,
  json: async () => (await import('@codemirror/lang-json')).json,
  python: async () => (await import('@codemirror/lang-python')).python,
  py: async () => (await import('@codemirror/lang-python')).python,
  java: async () => (await import('@codemirror/lang-java')).java,
  cpp: async () => (await import('@codemirror/lang-cpp')).cpp,
  c: async () => (await import('@codemirror/lang-cpp')).cpp,
  cxx: async () => (await import('@codemirror/lang-cpp')).cpp,
  xml: async () => (await import('@codemirror/lang-xml')).xml,
  markdown: async () => (await import('@codemirror/lang-markdown')).markdown,
  md: async () => (await import('@codemirror/lang-markdown')).markdown,
  sql: async () => (await import('@codemirror/lang-sql')).sql,
  vue: async () => (await import('@codemirror/lang-vue')).vue,
}

/** 按 language 动态加载 CodeMirror 语言包；plaintext 不加高亮，其余未识别回退 javascript */
export async function loadCodeMirrorLanguage(
  language: string,
): Promise<CodeMirrorLanguageFactory> {
  const key = language.trim().toLowerCase()
  if (!key || key === 'plaintext' || key === 'plain' || key === 'text' || key === 'txt') {
    return () => []
  }
  const load = languageLoaders[key] ?? loadJavascript
  return load()
}
