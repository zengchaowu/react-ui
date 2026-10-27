import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  type CSSProperties,
} from 'react'
import type * as Monaco from 'monaco-editor'
import type { TpMonacoEditorHandle, TpMonacoEditorProps } from './types'
import { monacoEditorBase } from '@zengchaowu/ui-shared/components/TpMonacoEditor/styles'
import { resolveDesignCssSize } from '@zengchaowu/ui-shared/functions/ui/cwRemSize'

// 配置Monaco Editor的Web Worker
// 返回一个空的worker，禁用Web Worker功能
// 这样可以避免worker文件路径问题，但会使用主线程模式
if (typeof window !== 'undefined') {
  ;(window as unknown as { MonacoEnvironment: Monaco.Environment }).MonacoEnvironment = {
    getWorker: function () {
      return new Worker('data:text/javascript;charset=utf-8,')
    },
  }
}

export const TpMonacoEditor = forwardRef<TpMonacoEditorHandle, TpMonacoEditorProps>(
  function TpMonacoEditor(
    {
      value = '',
      language = 'javascript',
      theme = 'vs',
      readOnly = false,
      lineNumbers = 'on',
      wordWrap = 'off',
      wordWrapColumn = 80,
      minimap = true,
      folding = true,
      selectOnLineNumbers = true,
      renderLineHighlight = 'line',
      renderWhitespace = 'selection',
      matchBrackets = 'always',
      autoClosingBrackets = 'languageDefined',
      autoClosingQuotes = 'languageDefined',
      autoIndent = 'advanced',
      foldingStrategy = 'auto',
      showFoldingControls = 'mouseover',
      links = true,
      colorDecorators = true,
      codeLens = true,
      parameterHints = true,
      hover = true,
      contextmenu = true,
      multiCursorModifier = 'ctrlCmd',
      scrollbar = true,
      smoothScrolling = false,
      mouseWheelZoom = false,
      quickSuggestions = true,
      suggestOnTriggerCharacters = true,
      acceptSuggestionOnEnter = 'on',
      acceptSuggestionOnCommitCharacter = true,
      height = '18.75rem',
      width = '25rem',
      disabled = false,
      options,
      autoSave = false,
      autoSaveDelay = 1000,
      onValueChange,
      onReady,
      onChange,
      onFocus,
      onBlur,
      onSelectionChange,
      onCursorPositionChange,
      onSave,
      onLanguageChange,
      className,
      style,
      ...rest
    },
    ref,
  ) {
    const containerStyle = useMemo<CSSProperties>(
      () => ({
        height: resolveDesignCssSize(height),
        width: resolveDesignCssSize(width),
        minHeight: '12.5rem',
      }),
      [height, width],
    )

    const editorContainerRef = useRef<HTMLDivElement>(null)
    const monacoRef = useRef<typeof Monaco | null>(null)
    const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null)
    const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    const callbacksRef = useRef({
      onValueChange,
      onReady,
      onChange,
      onFocus,
      onBlur,
      onSelectionChange,
      onCursorPositionChange,
      onSave,
      onLanguageChange,
      autoSave,
      autoSaveDelay,
    })
    callbacksRef.current = {
      onValueChange,
      onReady,
      onChange,
      onFocus,
      onBlur,
      onSelectionChange,
      onCursorPositionChange,
      onSave,
      onLanguageChange,
      autoSave,
      autoSaveDelay,
    }

    // 初始化编辑器（对应 Vue onMounted）
    useEffect(() => {
      const container = editorContainerRef.current
      if (!container) {
        console.warn('TpMonacoEditor: editorContainer is not available')
        return
      }

      let cancelled = false

      const initEditor = async () => {
        try {
          // 动态导入monaco-editor
          if (!monacoRef.current) {
            monacoRef.current = await import('monaco-editor')
          }
          if (cancelled || !editorContainerRef.current) return

          const monaco = monacoRef.current

          const baseOptions: Monaco.editor.IStandaloneEditorConstructionOptions = {
            value,
            language,
            theme,
            readOnly,
            lineNumbers,
            wordWrap,
            wordWrapColumn,
            minimap: { enabled: minimap },
            folding,
            selectOnLineNumbers,
            renderLineHighlight,
            renderWhitespace,
            matchBrackets,
            autoClosingBrackets,
            autoClosingQuotes,
            autoIndent,
            foldingStrategy,
            showFoldingControls,
            links,
            colorDecorators,
            codeLens,
            parameterHints: { enabled: parameterHints },
            hover: { enabled: hover },
            contextmenu,
            multiCursorModifier,
            scrollbar: {
              vertical: scrollbar ? 'auto' : 'hidden',
              horizontal: scrollbar ? 'auto' : 'hidden',
              useShadows: false,
              verticalHasArrows: false,
              horizontalHasArrows: false,
              verticalScrollbarSize: 10,
              horizontalScrollbarSize: 10,
            },
            smoothScrolling,
            mouseWheelZoom,
            quickSuggestions,
            suggestOnTriggerCharacters,
            acceptSuggestionOnEnter,
            acceptSuggestionOnCommitCharacter,
            fontSize: 14,
            fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
            lineHeight: 1.5,
            padding: { top: 12, bottom: 12 },
            automaticLayout: true,
          }

          // 合并自定义配置
          if (options && Object.keys(options).length > 0) {
            Object.assign(baseOptions, options)
          }

          const editor = monaco.editor.create(editorContainerRef.current, baseOptions)
          editorRef.current = editor

          // 监听内容变化
          editor.onDidChangeModelContent(() => {
            const nextValue = editorRef.current?.getValue() || ''
            callbacksRef.current.onValueChange?.(nextValue)
            if (editorRef.current) {
              callbacksRef.current.onChange?.(nextValue, editorRef.current)
            }

            // 自动保存
            if (callbacksRef.current.autoSave) {
              if (autoSaveTimerRef.current) {
                clearTimeout(autoSaveTimerRef.current)
              }
              autoSaveTimerRef.current = setTimeout(() => {
                if (editorRef.current) {
                  callbacksRef.current.onSave?.(editorRef.current)
                }
              }, callbacksRef.current.autoSaveDelay)
            }
          })

          // 监听选择变化
          editor.onDidChangeCursorSelection(() => {
            if (editorRef.current) {
              callbacksRef.current.onSelectionChange?.(editorRef.current)
            }
          })

          // 监听光标位置变化
          editor.onDidChangeCursorPosition(() => {
            if (editorRef.current) {
              callbacksRef.current.onCursorPositionChange?.(editorRef.current)
            }
          })

          // 监听焦点事件
          editor.onDidFocusEditorWidget(() => {
            if (editorRef.current) {
              callbacksRef.current.onFocus?.(new FocusEvent('focus'), editorRef.current)
            }
          })

          editor.onDidBlurEditorWidget(() => {
            if (editorRef.current) {
              callbacksRef.current.onBlur?.(new FocusEvent('blur'), editorRef.current)
            }
          })

          // 监听语言变化
          editor.onDidChangeModelLanguage(() => {
            const lang = editorRef.current?.getModel()?.getLanguageId() || ''
            if (editorRef.current) {
              callbacksRef.current.onLanguageChange?.(lang, editorRef.current)
            }
          })

          callbacksRef.current.onReady?.(editor)
        } catch (error) {
          console.error('TpMonacoEditor: Failed to create editor:', error)
        }
      }

      void initEditor()

      return () => {
        cancelled = true
        if (editorRef.current) {
          editorRef.current.dispose()
          editorRef.current = null
        }
        if (autoSaveTimerRef.current) {
          clearTimeout(autoSaveTimerRef.current)
          autoSaveTimerRef.current = null
        }
      }
      // 与 Vue 一致：仅在挂载时初始化一次
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // 更新编辑器内容（对应 Vue watch modelValue）
    const updateContent = useCallback((newValue: string) => {
      const editor = editorRef.current
      if (!editor || editor.getValue() === newValue) return
      editor.setValue(newValue)
    }, [])

    useEffect(() => {
      updateContent(value || '')
    }, [value, updateContent])

    // 更新编辑器语言（对应 Vue watch language）
    const updateLanguage = useCallback((newLanguage: string) => {
      const editor = editorRef.current
      const monaco = monacoRef.current
      if (!editor || !monaco) return
      const model = editor.getModel()
      if (model) {
        monaco.editor.setModelLanguage(model, newLanguage)
      }
    }, [])

    useEffect(() => {
      updateLanguage(language)
    }, [language, updateLanguage])

    // 更新编辑器主题（对应 Vue watch theme）
    useEffect(() => {
      editorRef.current?.updateOptions({ theme })
    }, [theme])

    // 监听只读状态变化（对应 Vue watch readOnly）
    useEffect(() => {
      editorRef.current?.updateOptions({ readOnly })
    }, [readOnly])

    // 监听禁用状态变化（对应 Vue watch disabled）
    useEffect(() => {
      editorRef.current?.updateOptions({ readOnly: disabled })
    }, [disabled])

    const disposeEditor = useCallback(() => {
      if (editorRef.current) {
        editorRef.current.dispose()
        editorRef.current = null
      }
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current)
        autoSaveTimerRef.current = null
      }
    }, [])

    useImperativeHandle(ref, () => ({
      get editor() {
        return editorRef.current
      },
      getValue: () => editorRef.current?.getValue() || '',
      setValue: (nextValue: string) => updateContent(nextValue),
      getLanguage: () => editorRef.current?.getModel()?.getLanguageId() || '',
      setLanguage: (lang: string) => updateLanguage(lang),
      focus: () => editorRef.current?.focus(),
      getSelection: () => editorRef.current?.getSelection() || null,
      setSelection: (selection: Monaco.IRange) => editorRef.current?.setSelection(selection),
      getPosition: () => editorRef.current?.getPosition() || null,
      setPosition: (position: Monaco.IPosition) => editorRef.current?.setPosition(position),
      revealLine: (lineNumber: number) => editorRef.current?.revealLine(lineNumber),
      revealLineInCenter: (lineNumber: number) =>
        editorRef.current?.revealLineInCenter(lineNumber),
      revealRange: (range: Monaco.IRange) => editorRef.current?.revealRange(range),
      getModel: () => editorRef.current?.getModel() || null,
      setModel: (model: Monaco.editor.ITextModel) => editorRef.current?.setModel(model),
      updateOptions: (editorOptions: Monaco.editor.IEditorOptions) =>
        editorRef.current?.updateOptions(editorOptions),
      dispose: disposeEditor,
      format: () => {
        void editorRef.current?.getAction('editor.action.formatDocument')?.run()
      },
      find: () => {
        void editorRef.current?.getAction('editor.action.find')?.run()
      },
      replace: () => {
        void editorRef.current?.getAction('editor.action.replace')?.run()
      },
      selectAll: () => {
        void editorRef.current?.getAction('editor.action.selectAll')?.run()
      },
      undo: () => {
        void editorRef.current?.getAction('editor.action.undo')?.run()
      },
      redo: () => {
        void editorRef.current?.getAction('editor.action.redo')?.run()
      },
    }), [disposeEditor, updateContent, updateLanguage])

    return (
      <div
        {...rest}
        ref={editorContainerRef}
        className={[
          monacoEditorBase.root,
          disabled ? monacoEditorBase.disabled : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        style={{ ...style, ...containerStyle }}
      />
    )
  },
)

export default TpMonacoEditor
