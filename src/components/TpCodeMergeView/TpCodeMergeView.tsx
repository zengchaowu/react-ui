import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, type CSSProperties } from 'react'
import { MergeView } from '@codemirror/merge'
import { EditorState, type Extension } from '@codemirror/state'
import {
  EditorView,
  lineNumbers,
  drawSelection,
  highlightActiveLine,
  highlightActiveLineGutter,
} from '@codemirror/view'
import { oneDark } from '@codemirror/theme-one-dark'
import {
  bracketMatching,
  defaultHighlightStyle,
  syntaxHighlighting,
} from '@codemirror/language'
import { loadCodeMirrorLanguage } from '../TpCodeEditor/loadCodeMirrorLanguage'
import { resolveDesignCssSize } from '@zengchaowu/ui-shared/functions/ui/cwRemSize'
import { readAppTheme, useAppThemeTick } from '../../utils/appThemeDom'
import type { TpCodeMergeViewHandle, TpCodeMergeViewProps } from './types'
import { codeMergeViewBase } from './styles'
import './tp-code-merge-view.css'

export const TpCodeMergeView = forwardRef<TpCodeMergeViewHandle, TpCodeMergeViewProps>(
  function TpCodeMergeView(
    {
      original = '',
      modified = '',
      language = 'javascript',
      theme = 'auto',
      lineNumbers: showLineNumbers = true,
      collapseUnchanged = true,
      highlightChanges = true,
      height = '16rem',
      width = '100%',
      className,
      style,
      ...rest
    },
    ref,
  ) {
    const rootElRef = useRef<HTMLDivElement>(null)
    const mergeViewRef = useRef<MergeView | null>(null)
    const initTokenRef = useRef(0)
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

    useImperativeHandle(
      ref,
      () => ({
        getMergeView: () => mergeViewRef.current,
      }),
      [],
    )

    useEffect(() => {
      const el = rootElRef.current
      if (!el) return

      const token = ++initTokenRef.current
      let cancelled = false

      const collapseConfig = () => {
        const c = collapseUnchanged
        if (c === false) return undefined
        if (c === true) return { margin: 3, minSize: 4 }
        return { margin: 3, minSize: 4, ...c }
      }

      const buildSideExtensions = async (): Promise<Extension[]> => {
        const langFactory = await loadCodeMirrorLanguage(language || 'javascript')
        const themeExt = effectiveTheme === 'dark' ? [oneDark] : []
        const gutterExt = showLineNumbers
          ? [lineNumbers(), highlightActiveLineGutter()]
          : []
        return [
          ...gutterExt,
          drawSelection(),
          highlightActiveLine(),
          bracketMatching(),
          syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
          langFactory(),
          ...themeExt,
          EditorView.editable.of(false),
          EditorState.readOnly.of(true),
          EditorView.theme({
            '&': { height: '100%' },
            '.cm-scroller': { overflow: 'auto' },
            '.cm-content': { caretColor: 'transparent' },
          }),
        ]
      }

      const mountMerge = async () => {
        let aExt: Extension[]
        let bExt: Extension[]
        try {
          aExt = await buildSideExtensions()
          bExt = await buildSideExtensions()
        } catch (e) {
          console.error('[TpCodeMergeView] language/extensions failed', e)
          return
        }
        if (cancelled || token !== initTokenRef.current || rootElRef.current !== el) return

        mergeViewRef.current?.destroy()
        mergeViewRef.current = null
        el.replaceChildren()

        try {
          mergeViewRef.current = new MergeView({
            a: {
              doc: original ?? '',
              extensions: aExt,
            },
            b: {
              doc: modified ?? '',
              extensions: bExt,
            },
            parent: el,
            orientation: 'a-b',
            highlightChanges: highlightChanges !== false,
            gutter: true,
            collapseUnchanged: collapseConfig(),
            diffConfig: { scanLimit: 1000, timeout: 1500 },
          })
        } catch (e) {
          console.error('[TpCodeMergeView] MergeView mount failed', e)
          mergeViewRef.current = null
        }
      }

      void mountMerge()

      return () => {
        cancelled = true
        initTokenRef.current += 1
        mergeViewRef.current?.destroy()
        mergeViewRef.current = null
        el.replaceChildren()
      }
    }, [
      original,
      modified,
      language,
      effectiveTheme,
      showLineNumbers,
      collapseUnchanged,
      highlightChanges,
      height,
      width,
    ])

    return (
      <div
        {...rest}
        ref={rootElRef}
        className={[codeMergeViewBase.root, className].filter(Boolean).join(' ')}
        style={{ ...style, ...containerStyle }}
      />
    )
  },
)

export default TpCodeMergeView
