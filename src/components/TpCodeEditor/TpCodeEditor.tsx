import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  type CSSProperties,
} from 'react'
import { EditorView, placeholder as placeholderExtension } from '@codemirror/view'
import { EditorState, type Extension } from '@codemirror/state'
import { searchKeymap } from '@codemirror/search'
import { keymap } from '@codemirror/view'
import { indentWithTab } from '@codemirror/commands'
import type { TpCodeEditorHandle, TpCodeEditorProps, TpCodeEditorSelection } from './types'
import { codeEditorBase } from '@zengchaowu/ui-shared/components/TpCodeEditor/styles'
import {
  createTpCodeEditorBaseExtensions,
  tpCodeEditorGutterTheme,
} from '@zengchaowu/ui-shared/components/TpCodeEditor/createTpCodeEditorBaseExtensions'
import { createTpCodeEditorHighlightTheme } from './tpCodeEditorHighlightTheme'
import { loadCodeMirrorLanguage } from '@zengchaowu/ui-shared/components/TpCodeEditor/loadCodeMirrorLanguage'
import { resolveDesignCssSize } from '@zengchaowu/ui-shared/functions/ui/cwRemSize'
import { readAppTheme, useAppThemeTick } from '../../utils/appThemeDom'
import '../../assets/asset/asset.css'

export const TpCodeEditor = forwardRef<TpCodeEditorHandle, TpCodeEditorProps>(
  function TpCodeEditor(
    {
      value,
      defaultValue = '',
      language = 'javascript',
      theme = 'auto',
      readOnly = false,
      lineNumbers = true,
      lineWrapping = false,
      fontSize = 14,
      foldGutter = true,
      searchKeymap: enableSearchKeymap = true,
      autocompletion = true,
      height = '18.75rem',
      width = '100%',
      placeholder = '',
      disabled = false,
      options,
      className,
      style,
      onChange,
      onReady,
      onFocus,
      onBlur,
      onSelectionChange,
      ...rest
    },
    ref,
  ) {
    const appThemeTick = useAppThemeTick()

    const effectiveTheme = useMemo(() => {
      if (theme === 'light' || theme === 'dark') return theme
      void appThemeTick
      return readAppTheme()
    }, [theme, appThemeTick])

    const containerStyle = useMemo<CSSProperties>(
      () => ({
        height: resolveDesignCssSize(height),
        width: resolveDesignCssSize(width),
      }),
      [height, width],
    )

    const resolvedFontSizePx = useMemo(() => {
      const n = Math.round(Number(fontSize))
      if (!Number.isFinite(n)) return 14
      return Math.min(24, Math.max(10, n))
    }, [fontSize])

    const containerRef = useRef<HTMLDivElement>(null)
    const editorRef = useRef<EditorView | null>(null)
    const editorInitTokenRef = useRef(0)
    const initialDocRef = useRef(value ?? defaultValue)
    initialDocRef.current = value ?? defaultValue

    const callbacksRef = useRef({
      onChange,
      onReady,
      onFocus,
      onBlur,
      onSelectionChange,
    })
    callbacksRef.current = {
      onChange,
      onReady,
      onFocus,
      onBlur,
      onSelectionChange,
    }

    // 初始化 / 配置变更后重建编辑器（与 Vue watch 重建范围一致）
    useEffect(() => {
      const container = containerRef.current
      if (!container) return

      const token = ++editorInitTokenRef.current
      let cancelled = false

      const initEditor = async () => {
        const languageFactory = await loadCodeMirrorLanguage(language)
        if (cancelled || token !== editorInitTokenRef.current || !containerRef.current) {
          return
        }

        const themeMode = effectiveTheme === 'dark' ? 'dark' : 'light'
        const fontSizePx = `${resolvedFontSizePx}px`

        const extensions: Extension[] = [
          ...createTpCodeEditorBaseExtensions({
            lineNumbers,
            foldGutter,
            autocompletion,
          }),
          languageFactory(),
          ...createTpCodeEditorHighlightTheme(themeMode),
          tpCodeEditorGutterTheme,
          EditorView.theme({
            '&': {
              height: '100%',
            },
            '.cm-content': {
              /* 上/右/下保留；左侧收紧，避免与 gutter padding 叠出大缝 */
              padding: '8px 12px 8px 4px',
              fontSize: fontSizePx,
              fontFamily: 'Menlo, Monaco, Consolas, "Courier New", monospace',
            },
            /* &.cm-focused：焦点 class 在根节点，不能写成后代 .cm-focused */
            '&.cm-focused': {
              outline: 'none',
            },
            '.cm-editor': {
              height: '100%',
            },
            '.cm-scroller': {
              fontFamily: 'Menlo, Monaco, Consolas, "Courier New", monospace',
              fontSize: fontSizePx,
            },
          }),
        ]

        if (lineWrapping) {
          extensions.push(EditorView.lineWrapping)
        }

        // 只读模式
        if (readOnly) {
          extensions.push(EditorState.readOnly.of(true))
        }

        // 占位符
        if (placeholder) {
          extensions.push(placeholderExtension(placeholder))
        }

        // 添加键盘快捷键
        const keymaps = [indentWithTab]
        if (enableSearchKeymap) {
          keymaps.push(...searchKeymap)
        }
        extensions.push(keymap.of(keymaps))

        // 添加内容变化监听器
        extensions.push(
          EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              const newValue = update.state.doc.toString()
              callbacksRef.current.onChange?.(newValue)
            }
            if (update.selectionSet && editorRef.current) {
              callbacksRef.current.onSelectionChange?.(editorRef.current)
            }
          }),
        )

        // 合并自定义配置
        if (options && Object.keys(options).length > 0) {
          extensions.push(...Object.values(options))
        }

        const view = new EditorView({
          state: EditorState.create({
            doc: initialDocRef.current,
            extensions,
          }),
          parent: containerRef.current,
        })

        view.dom.addEventListener('focus', handleDomFocus)
        view.dom.addEventListener('blur', handleDomBlur)

        editorRef.current = view
        callbacksRef.current.onReady?.(view)
      }

      const handleDomFocus = (event: FocusEvent) => {
        const view = editorRef.current
        if (view) callbacksRef.current.onFocus?.(event, view)
      }

      const handleDomBlur = (event: FocusEvent) => {
        const view = editorRef.current
        if (view) callbacksRef.current.onBlur?.(event, view)
      }

      void initEditor()

      return () => {
        cancelled = true
        editorInitTokenRef.current += 1
        const view = editorRef.current
        if (view) {
          view.dom.removeEventListener('focus', handleDomFocus)
          view.dom.removeEventListener('blur', handleDomBlur)
          view.destroy()
          editorRef.current = null
        }
      }
      // 与 Vue 的 watch 范围保持一致：语言 / 主题 / 只读 / 换行 / gutter / 字号变化时重建
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
      language,
      effectiveTheme,
      readOnly,
      lineWrapping,
      lineNumbers,
      foldGutter,
      autocompletion,
      resolvedFontSizePx,
    ])

    const updateContent = useCallback((newValue: string) => {
      const editor = editorRef.current
      if (!editor || editor.state.doc.toString() === newValue) return

      editor.dispatch({
        changes: {
          from: 0,
          to: editor.state.doc.length,
          insert: newValue,
        },
      })
    }, [])

    // 受控内容同步
    useEffect(() => {
      updateContent(value ?? defaultValue)
    }, [value, defaultValue, updateContent])

    const destroyEditor = useCallback(() => {
      editorInitTokenRef.current++
      if (editorRef.current) {
        editorRef.current.destroy()
        editorRef.current = null
      }
    }, [])

    useImperativeHandle(ref, () => ({
      get editor() {
        return editorRef.current
      },
      getValue: () => editorRef.current?.state.doc.toString() || '',
      setValue: (nextValue: string) => updateContent(nextValue),
      focus: () => {
        editorRef.current?.focus()
      },
      destroy: destroyEditor,
      revealLine: (line: number): boolean => {
        const editor = editorRef.current
        if (!editor) return false
        const n = Math.floor(Number(line))
        if (!Number.isFinite(n) || n < 1) return false
        const doc = editor.state.doc
        const lineNum = Math.min(Math.max(1, n), doc.lines)
        const info = doc.line(lineNum)
        editor.dispatch({
          selection: { anchor: info.from, head: info.from },
          effects: EditorView.scrollIntoView(info.from, { y: 'center' }),
        })
        editor.focus()
        return true
      },
      getSelection: (): TpCodeEditorSelection | null => {
        const editor = editorRef.current
        if (!editor) return null
        const { from, to } = editor.state.selection.main
        if (from === to) return null
        const text = editor.state.sliceDoc(from, to)
        if (!text) return null
        const startLine = editor.state.doc.lineAt(from).number
        const endLine = editor.state.doc.lineAt(Math.max(from, to - 1)).number
        return { text, startLine, endLine }
      },
    }), [destroyEditor, updateContent])

    useEffect(() => {
      return () => {
        editorInitTokenRef.current++
        editorRef.current?.destroy()
        editorRef.current = null
      }
    }, [])

    return (
      <div
        {...rest}
        ref={containerRef}
        className={[codeEditorBase.root, disabled ? codeEditorBase.rootDisabled : '', className]
          .filter(Boolean)
          .join(' ')}
        style={{ ...style, ...containerStyle }}
      />
    )
  },
)

export default TpCodeEditor
