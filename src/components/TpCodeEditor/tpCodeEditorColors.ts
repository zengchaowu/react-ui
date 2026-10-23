/**
 * TpCodeEditor / CodeMirror 语法高亮与 chrome 色（对齐 VS Code Dark+ / Light+）。
 * 与 vue-ui `src/assets/tokens/tpCodeEditorColors.ts` 保持一致；
 * 组件目录内自带，避免跨包/跨目录依赖。
 */

/** VS Code Dark+ 语法色 */
export const tpCodeEditorDarkSyntax = {
  keyword: '#569cd6',
  controlKeyword: '#c586c0',
  variable: '#9cdcfe',
  typeName: '#4ec9b0',
  functionName: '#dcdcaa',
  number: '#b5cea8',
  punctuation: '#d4d4d4',
  regexp: '#d16969',
  string: '#ce9178',
  comment: '#6a9955',
  invalid: '#f44747',
} as const

/** VS Code Light+ 语法色 */
export const tpCodeEditorLightSyntax = {
  keyword: '#0000ff',
  controlKeyword: '#af00db',
  variable: '#0451a5',
  typeName: '#267f99',
  functionName: '#795e26',
  number: '#098658',
  punctuation: '#383a42',
  regexp: '#af00db',
  string: '#a31515',
  comment: '#008000',
  link: '#4078f2',
  invalid: '#e45649',
} as const

/** 选区 / 光标 / 当前行等编辑器 chrome（不改面板底色） */
export const tpCodeEditorChrome = {
  darkFg: '#d4d4d4',
  lightFg: '#383a42',
  darkSelection: '#264f78',
  lightSelection: '#add6ff',
  darkSelectionMatch: '#72a1ff59',
  lightSelectionMatch: '#a8ac9480',
  darkCursor: '#aeafad',
  lightCursor: '#000000',
  darkActiveLine: '#ffffff0a',
  lightActiveLine: '#0000000a',
} as const
