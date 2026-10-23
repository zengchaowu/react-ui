export { default as TpCodeEditor } from './TpCodeEditor'
export * from './types'
export {
  createFoldMarkerDOM,
  createTpCodeEditorBaseExtensions,
  highlightHoveredLineGutter,
  tpCodeEditorGutterTheme,
} from './createTpCodeEditorBaseExtensions'
export { createTpCodeEditorHighlightTheme } from './tpCodeEditorHighlightTheme'
export { loadCodeMirrorLanguage } from './loadCodeMirrorLanguage'
export type { CodeMirrorLanguageFactory } from './loadCodeMirrorLanguage'
export { defaultTexts } from './texts'
