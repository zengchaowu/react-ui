import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  type CSSProperties,
} from 'react'
import type {
  TpCherryMarkdownHandle,
  TpCherryMarkdownInstance,
  TpCherryMarkdownProps,
  TpCherryMarkdownThemeSettings,
} from './types'
import { resolveDesignCssSize } from '@zengchaowu/ui-shared/functions/ui/cwRemSize'
import 'cherry-markdown/dist/cherry-markdown.css'
import './tp-cherry-markdown.css'

const BUILTIN_THEME_LIST: Array<{ className: string; label: string }> = [
  { className: 'default', label: '默认' },
  { className: 'dark', label: '暗黑' },
  { className: 'workDocs', label: '工作' },
]

type CherryDefaultModel = 'edit&preview' | 'editOnly' | 'previewOnly'

function mapDefaultModel(
  mode: NonNullable<TpCherryMarkdownProps['mode']>,
): CherryDefaultModel {
  if (mode === 'preview' || mode === 'previewOnly') return 'previewOnly'
  if (mode === 'editOnly') return 'editOnly'
  return 'edit&preview'
}

export const TpCherryMarkdown = forwardRef<TpCherryMarkdownHandle, TpCherryMarkdownProps>(
  function TpCherryMarkdown(
    {
      value = '',
      mode = 'edit',
      theme = 'default',
      themeSettings: customThemeSettings,
      height = '25rem',
      disabled = false,
      placeholder = '请输入Markdown内容...',
      toolbar = true,
      toolbarConfig,
      editorConfig,
      previewConfig,
      autofocus = false,
      fileUpload,
      onValueChange,
      onChange,
      onFocus,
      onBlur,
      onReady,
      onFileUpload,
    },
    ref,
  ) {
    const containerRef = useRef<HTMLDivElement>(null)
    const cherryInstanceRef = useRef<TpCherryMarkdownInstance | null>(null)
    const applyingExternalValueRef = useRef(false)

    const callbacksRef = useRef({
      onValueChange,
      onChange,
      onFocus,
      onBlur,
      onReady,
      onFileUpload,
      fileUpload,
    })
    callbacksRef.current = {
      onValueChange,
      onChange,
      onFocus,
      onBlur,
      onReady,
      onFileUpload,
      fileUpload,
    }

    const computedHeight = useMemo<CSSProperties>(
      () => ({ height: resolveDesignCssSize(height) }),
      [height],
    )

    const resolveThemeSettings = (): Required<
      Pick<
        TpCherryMarkdownThemeSettings,
        'themeList' | 'mainTheme' | 'codeBlockTheme' | 'inlineCodeTheme'
      >
    > => {
      const custom = customThemeSettings
      const mainTheme = custom?.mainTheme || theme || 'default'
      const themeList = [...BUILTIN_THEME_LIST]
      for (const item of custom?.themeList || []) {
        if (!themeList.some((t) => t.className === item.className)) {
          themeList.push(item)
        }
      }
      if (!themeList.some((t) => t.className === mainTheme)) {
        themeList.push({ className: mainTheme, label: mainTheme })
      }
      return {
        themeList,
        mainTheme,
        codeBlockTheme: custom?.codeBlockTheme || (mainTheme === 'dark' ? 'dark' : 'default'),
        inlineCodeTheme: custom?.inlineCodeTheme || 'black',
      }
    }
    const resolveThemeSettingsRef = useRef(resolveThemeSettings)
    resolveThemeSettingsRef.current = resolveThemeSettings

    // 初始化（对应 Vue onMounted + nextTick）
    useEffect(() => {
      const container = containerRef.current
      if (!container) return

      let cancelled = false

      const emitContent = (content: string) => {
        if (applyingExternalValueRef.current) return
        callbacksRef.current.onValueChange?.(content)
        callbacksRef.current.onChange?.(content)
      }

      const initCherry = async () => {
        try {
          const mod = (await import('cherry-markdown')) as unknown as {
            default: new (config: Record<string, unknown>) => TpCherryMarkdownInstance
          }
          const Cherry = mod.default
          if (cancelled || !containerRef.current) return

          const themeSettings = resolveThemeSettingsRef.current()

          const config: Record<string, unknown> = {
            el: containerRef.current,
            value: value || '',
            themeSettings,
            editor: {
              defaultModel: mapDefaultModel(mode),
              ...(editorConfig || {}),
            },
            toolbars: toolbar ? toolbarConfig || undefined : { toolbar: false },
            previewer: previewConfig || undefined,
            event: {
              afterChange: (markdownText: string) => {
                emitContent(markdownText || '')
              },
              afterInit: () => {
                callbacksRef.current.onReady?.()
              },
              focus: (payload: { e?: FocusEvent }) => {
                if (payload?.e) callbacksRef.current.onFocus?.(payload.e)
              },
              blur: (payload: { e?: FocusEvent }) => {
                if (payload?.e) callbacksRef.current.onBlur?.(payload.e)
              },
            },
          }

          if (callbacksRef.current.fileUpload) {
            config.callback = {
              fileUpload: async (file: File, callback: (url: string) => void) => {
                callbacksRef.current.onFileUpload?.(file)
                const upload = callbacksRef.current.fileUpload
                if (upload) {
                  const url = await upload(file)
                  callback(url)
                }
              },
            }
          }

          const instance = new Cherry(config)
          cherryInstanceRef.current = instance

          if (disabled && typeof instance.switchModel === 'function') {
            instance.switchModel('previewOnly', false)
          }
        } catch (error) {
          console.error('Cherry Markdown 初始化失败:', error)
        }
      }

      void initCherry()

      return () => {
        cancelled = true
        const instance = cherryInstanceRef.current
        if (instance?.destroy) {
          instance.destroy()
        }
        cherryInstanceRef.current = null
      }
      // 与 Vue 一致：仅在挂载时初始化一次
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // 监听 value（对应 Vue watch props.value）
    useEffect(() => {
      const instance = cherryInstanceRef.current
      if (!instance?.setValue) return
      const next = value || ''
      const current = typeof instance.getValue === 'function' ? instance.getValue() : ''
      if (current === next) return
      applyingExternalValueRef.current = true
      try {
        instance.setValue(next, true)
      } finally {
        applyingExternalValueRef.current = false
      }
    }, [value])

    // 监听 mode（对应 Vue watch props.mode）
    useEffect(() => {
      const instance = cherryInstanceRef.current
      if (!instance?.switchModel) return
      instance.switchModel(mapDefaultModel(mode), toolbar !== false)
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mode])

    // 监听 disabled（对应 Vue watch props.disabled）
    useEffect(() => {
      const instance = cherryInstanceRef.current
      if (!instance?.switchModel) return
      if (disabled) {
        instance.switchModel('previewOnly', false)
      } else {
        instance.switchModel(mapDefaultModel(mode), toolbar !== false)
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [disabled])

    // 监听 theme / themeSettings（对应 Vue watch [theme, themeSettings] deep）
    useEffect(() => {
      const instance = cherryInstanceRef.current
      if (!instance?.setTheme) return
      const { mainTheme } = resolveThemeSettingsRef.current()
      instance.setTheme(mainTheme)
    }, [theme, customThemeSettings])

    useImperativeHandle(ref, () => ({
      getValue: () => cherryInstanceRef.current?.getValue?.() || '',
      setValue: (nextValue: string, keepCursor = false) => {
        const instance = cherryInstanceRef.current
        if (!instance?.setValue) return
        applyingExternalValueRef.current = true
        try {
          instance.setValue(nextValue || '', keepCursor)
        } finally {
          applyingExternalValueRef.current = false
        }
      },
      setTheme: (nextTheme: string) => cherryInstanceRef.current?.setTheme?.(nextTheme),
      getInstance: () => cherryInstanceRef.current,
    }), [])

    return (
      <div
        ref={containerRef}
        className={[
          'cherry-markdown-container',
          disabled ? 'cherry-markdown-disabled' : '',
          theme === 'dark' ? 'cherry-markdown-dark' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        style={computedHeight}
      />
    )
  },
)

export default TpCherryMarkdown
