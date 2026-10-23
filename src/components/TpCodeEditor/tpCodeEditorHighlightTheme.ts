import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import type { Extension } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import { tags as t } from '@lezer/highlight'
import {
  tpCodeEditorChrome,
  tpCodeEditorDarkSyntax,
  tpCodeEditorLightSyntax,
} from './tpCodeEditorColors'

/**
 * 对齐 VS Code Dark+ / Cursor 常见 JSON·代码着色（仅语法色，不改编辑器底色）。
 * @see https://github.com/microsoft/vscode/blob/main/extensions/theme-defaults/themes/dark_plus.json
 */
const vscodeDarkHighlight = HighlightStyle.define([
  {
    tag: [
      t.keyword,
      t.operatorKeyword,
      t.modifier,
      t.color,
      t.constant(t.name),
      t.standard(t.name),
      t.standard(t.tagName),
      t.special(t.brace),
      t.atom,
      t.bool,
      t.special(t.variableName),
      t.null,
    ],
    color: tpCodeEditorDarkSyntax.keyword,
  },
  {
    tag: [t.controlKeyword, t.moduleKeyword],
    color: tpCodeEditorDarkSyntax.controlKeyword,
  },
  {
    tag: [
      t.name,
      t.deleted,
      t.character,
      t.macroName,
      t.propertyName,
      t.variableName,
      t.labelName,
      t.definition(t.name),
    ],
    color: tpCodeEditorDarkSyntax.variable,
  },
  {
    tag: t.heading,
    fontWeight: 'bold',
    color: tpCodeEditorDarkSyntax.variable,
  },
  {
    tag: [t.typeName, t.className, t.tagName, t.changed, t.annotation, t.self, t.namespace],
    color: tpCodeEditorDarkSyntax.typeName,
  },
  {
    tag: [t.function(t.variableName), t.function(t.propertyName)],
    color: tpCodeEditorDarkSyntax.functionName,
  },
  { tag: [t.number, t.literal], color: tpCodeEditorDarkSyntax.number },
  {
    tag: [t.operator, t.punctuation, t.separator, t.url, t.escape, t.angleBracket],
    color: tpCodeEditorDarkSyntax.punctuation,
  },
  { tag: [t.regexp], color: tpCodeEditorDarkSyntax.regexp },
  {
    tag: [t.special(t.string), t.processingInstruction, t.string, t.inserted],
    color: tpCodeEditorDarkSyntax.string,
  },
  { tag: t.strong, fontWeight: 'bold' },
  { tag: t.emphasis, fontStyle: 'italic' },
  { tag: t.strikethrough, textDecoration: 'line-through' },
  { tag: [t.meta, t.comment], color: tpCodeEditorDarkSyntax.comment },
  {
    tag: t.link,
    color: tpCodeEditorDarkSyntax.comment,
    textDecoration: 'underline',
  },
  { tag: t.invalid, color: tpCodeEditorDarkSyntax.invalid },
])

/** 对齐 VS Code Light+ */
const vscodeLightHighlight = HighlightStyle.define([
  {
    tag: [
      t.keyword,
      t.operatorKeyword,
      t.modifier,
      t.color,
      t.constant(t.name),
      t.standard(t.name),
      t.standard(t.tagName),
      t.special(t.brace),
      t.atom,
      t.bool,
      t.special(t.variableName),
      t.null,
    ],
    color: tpCodeEditorLightSyntax.keyword,
  },
  {
    tag: [t.moduleKeyword, t.controlKeyword],
    color: tpCodeEditorLightSyntax.controlKeyword,
  },
  {
    tag: [
      t.name,
      t.deleted,
      t.character,
      t.macroName,
      t.propertyName,
      t.variableName,
      t.labelName,
      t.definition(t.name),
    ],
    color: tpCodeEditorLightSyntax.variable,
  },
  {
    tag: t.heading,
    fontWeight: 'bold',
    color: tpCodeEditorLightSyntax.variable,
  },
  {
    tag: [t.typeName, t.className, t.tagName, t.changed, t.annotation, t.self, t.namespace],
    color: tpCodeEditorLightSyntax.typeName,
  },
  {
    tag: [t.function(t.variableName), t.function(t.propertyName)],
    color: tpCodeEditorLightSyntax.functionName,
  },
  { tag: [t.number, t.literal], color: tpCodeEditorLightSyntax.number },
  {
    tag: [t.operator, t.punctuation, t.separator, t.url, t.escape, t.angleBracket],
    color: tpCodeEditorLightSyntax.punctuation,
  },
  { tag: [t.regexp], color: tpCodeEditorLightSyntax.regexp },
  {
    tag: [t.special(t.string), t.processingInstruction, t.string, t.inserted],
    color: tpCodeEditorLightSyntax.string,
  },
  { tag: t.strong, fontWeight: 'bold' },
  { tag: t.emphasis, fontStyle: 'italic' },
  { tag: t.strikethrough, textDecoration: 'line-through' },
  { tag: [t.meta, t.comment], color: tpCodeEditorLightSyntax.comment },
  {
    tag: t.link,
    color: tpCodeEditorLightSyntax.link,
    textDecoration: 'underline',
  },
  { tag: t.invalid, color: tpCodeEditorLightSyntax.invalid },
])

/** 选区等编辑器 chrome（底色仍跟随应用，不强制 VS Code 面板色） */
function vscodeEditorChrome(theme: 'light' | 'dark'): Extension {
  const dark = theme === 'dark'
  return EditorView.theme(
    {
      '&': {
        color: dark ? tpCodeEditorChrome.darkFg : tpCodeEditorChrome.lightFg,
      },
      '.cm-selectionBackground, &.cm-focused .cm-selectionBackground': {
        backgroundColor: dark
          ? tpCodeEditorChrome.darkSelection
          : tpCodeEditorChrome.lightSelection,
      },
      '.cm-selectionMatch': {
        backgroundColor: dark
          ? tpCodeEditorChrome.darkSelectionMatch
          : tpCodeEditorChrome.lightSelectionMatch,
      },
      '.cm-cursor, .cm-dropCursor': {
        borderLeftColor: dark
          ? tpCodeEditorChrome.darkCursor
          : tpCodeEditorChrome.lightCursor,
      },
      '.cm-activeLine': {
        backgroundColor: dark
          ? tpCodeEditorChrome.darkActiveLine
          : tpCodeEditorChrome.lightActiveLine,
      },
    },
    { dark },
  )
}

/** Cursor / VS Code 风格语法高亮 + 轻量 chrome */
export function createTpCodeEditorHighlightTheme(theme: 'light' | 'dark'): Extension[] {
  return [
    vscodeEditorChrome(theme),
    syntaxHighlighting(theme === 'dark' ? vscodeDarkHighlight : vscodeLightHighlight),
  ]
}
