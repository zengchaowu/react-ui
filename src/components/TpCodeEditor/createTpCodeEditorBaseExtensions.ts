import {
  bracketMatching,
  foldGutter,
  foldKeymap,
  indentOnInput,
} from '@codemirror/language'
import { highlightSelectionMatches, searchKeymap } from '@codemirror/search'
import {
  EditorState,
  RangeSet,
  StateEffect,
  StateField,
  type Extension,
} from '@codemirror/state'
import {
  crosshairCursor,
  drawSelection,
  dropCursor,
  EditorView,
  GutterMarker,
  gutterLineClass,
  highlightActiveLine,
  highlightActiveLineGutter,
  highlightSpecialChars,
  keymap,
  lineNumbers,
  rectangularSelection,
} from '@codemirror/view'
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands'
import {
  autocompletion,
  closeBrackets,
  closeBracketsKeymap,
  completionKeymap,
} from '@codemirror/autocomplete'
import { designPxToRem } from '@zengchaowu/ui-shared/functions/ui/cwRemSize'

/** 折叠箭头：展开态向下 / 收起态向右（iconfont） */
export function createFoldMarkerDOM(open: boolean): HTMLElement {
  const wrap = document.createElement('span')
  wrap.className = open
    ? 'cm-foldMarker cm-foldMarker-open'
    : 'cm-foldMarker cm-foldMarker-closed'
  wrap.title = open ? 'Fold line' : 'Unfold line'
  const icon = document.createElement('i')
  icon.className = open
    ? 'asset icon-common--dir--arrow-down-line'
    : 'asset icon-common--dir--arrow-right-line'
  icon.setAttribute('aria-hidden', 'true')
  wrap.appendChild(icon)
  return wrap
}

const setHoveredLineFrom = StateEffect.define<number | null>()

const hoveredLineFromField = StateField.define<number | null>({
  create: () => null,
  update(value, tr) {
    for (const e of tr.effects) {
      if (e.is(setHoveredLineFrom)) return e.value
    }
    if (tr.docChanged && value != null) {
      try {
        return tr.newDoc.lineAt(tr.changes.mapPos(value)).from
      } catch {
        return null
      }
    }
    return value
  },
})

const hoveredLineGutterMarker = new (class extends GutterMarker {
  elementClass = 'cm-hoveredLineGutter'
})()

/**
 * 鼠标悬停某行内容时，给对应 gutter 行号加 `cm-hoveredLineGutter`（非整列 gutter hover）。
 */
export function highlightHoveredLineGutter(): Extension {
  return [
    hoveredLineFromField,
    gutterLineClass.compute([hoveredLineFromField], (state) => {
      const from = state.field(hoveredLineFromField)
      if (from == null) return RangeSet.empty
      return RangeSet.of([hoveredLineGutterMarker.range(from)])
    }),
    EditorView.domEventHandlers({
      mousemove(event, view) {
        const pos = view.posAtCoords({ x: event.clientX, y: event.clientY }, false)
        const next = pos == null ? null : view.state.doc.lineAt(pos).from
        if (view.state.field(hoveredLineFromField) !== next) {
          view.dispatch({ effects: setHoveredLineFrom.of(next) })
        }
        return false
      },
      mouseleave(_event, view) {
        if (view.state.field(hoveredLineFromField) != null) {
          view.dispatch({ effects: setHoveredLineFrom.of(null) })
        }
        return false
      },
    }),
  ]
}

/**
 * 对齐 `codemirror` 的 basicSetup，但折叠 gutter 可开关且使用 iconfont 标记。
 */
export function createTpCodeEditorBaseExtensions(opts: {
  lineNumbers: boolean
  foldGutter: boolean
  autocompletion: boolean
}): Extension[] {
  const extensions: Extension[] = [
    highlightSpecialChars(),
    history(),
    drawSelection(),
    dropCursor(),
    EditorState.allowMultipleSelections.of(true),
    indentOnInput(),
    bracketMatching(),
    closeBrackets(),
    rectangularSelection(),
    crosshairCursor(),
    highlightActiveLine(),
    highlightSelectionMatches(),
    keymap.of([
      ...closeBracketsKeymap,
      ...defaultKeymap,
      ...searchKeymap,
      ...historyKeymap,
      ...foldKeymap,
      ...completionKeymap,
    ]),
  ]

  if (opts.lineNumbers) {
    extensions.push(lineNumbers(), highlightActiveLineGutter(), highlightHoveredLineGutter())
  }

  if (opts.foldGutter) {
    extensions.push(foldGutter({ markerDOM: createFoldMarkerDOM }))
  }

  if (opts.autocompletion) {
    extensions.push(autocompletion())
  }

  return extensions
}

/** gutter / 折叠箭头外观：行号默认偏淡；悬停对应行 / 当前行时该行号加深 */
export const tpCodeEditorGutterTheme = EditorView.theme({
  '.cm-gutters': {
    backgroundColor: 'transparent',
    border: 'none',
    /* 左侧留白；右侧尽量贴正文，避免与 .cm-content padding-left 叠出大缝 */
    paddingLeft: '8px',
    paddingRight: '0',
    color: 'var(--text-color-placeholder)',
    fontSize: '12px',
    lineHeight: '1.45',
  },
  '.cm-lineNumbers .cm-gutterElement': {
    padding: '0 2px 0 0',
    minWidth: '1.5rem',
    transition: 'color 120ms ease',
  },
  '.cm-activeLineGutter, .cm-hoveredLineGutter': {
    backgroundColor: 'transparent',
    color: 'var(--text-color-secondary)',
  },
  '.cm-foldGutter': {
    width: designPxToRem(14),
    paddingLeft: '0',
    paddingRight: '0',
  },
  /* 与行号同一行盒垂直居中，避免箭头贴顶 */
  '.cm-foldGutter .cm-gutterElement': {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0',
  },
  '.cm-foldMarker': {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: designPxToRem(12),
    height: designPxToRem(12),
    cursor: 'pointer',
    opacity: '0',
    transition: 'opacity 120ms ease, color 120ms ease',
    color: 'var(--text-color-placeholder)',
  },
  '.cm-foldMarker i': {
    fontSize: '11px',
    lineHeight: '1',
    display: 'block',
  },
  /* 已折叠：始终显示，便于展开 */
  '.cm-foldMarker-closed': {
    opacity: '1',
  },
  /* 可折叠：悬停该行或当前编辑行时显示 */
  '.cm-hoveredLineGutter .cm-foldMarker-open, .cm-activeLineGutter .cm-foldMarker-open, .cm-foldMarker-open:hover':
    {
      opacity: '1',
      color: 'var(--text-color-secondary)',
    },
})
