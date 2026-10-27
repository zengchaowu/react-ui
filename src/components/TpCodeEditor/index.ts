export { default as TpCodeEditor } from './TpCodeEditor'
export * from './types'
export type * from '@zengchaowu/ui-shared/components/TpCodeEditor/types'
export {
  createFoldMarkerDOM,
  createTpCodeEditorBaseExtensions,
  highlightHoveredLineGutter,
  tpCodeEditorGutterTheme,
} from '@zengchaowu/ui-shared/components/TpCodeEditor/createTpCodeEditorBaseExtensions'
export { createTpCodeEditorHighlightTheme } from './tpCodeEditorHighlightTheme'
export { loadCodeMirrorLanguage } from '@zengchaowu/ui-shared/components/TpCodeEditor/loadCodeMirrorLanguage'
export type { CodeMirrorLanguageFactory } from '@zengchaowu/ui-shared/components/TpCodeEditor/loadCodeMirrorLanguage'
export { defaultTexts } from '@zengchaowu/ui-shared/components/TpCodeEditor/texts'
