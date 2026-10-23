import {
  useCallback,
  useLayoutEffect,
  useRef,
} from 'react'
import type {
  ClipboardEvent as ReactClipboardEvent,
  FocusEvent as ReactFocusEvent,
  KeyboardEvent as ReactKeyboardEvent,
} from 'react'
import {
  buildComposerHtmlFromPlainText,
  getComposerPlainTextFromElement,
  insertComposerPlainTextAtCaret,
  normalizeComposerPastePlainText,
  setComposerCaretToEnd,
} from './composerPlainText'
import { scheduleScrollComposerSelectionIntoView } from './scrollComposerSelectionIntoView'

export interface UseCwAiChatComposerEditorOptions {
  value: string
  placeholder: string
  disabled: boolean
  showStop: boolean
  canSend: boolean
  onUpdateModelValue: (value: string) => void
  onSubmit: () => void
  isEditorFocused: boolean
  setIsEditorFocused: (focused: boolean) => void
}

/** 与 TipTap Placeholder 扩展一致：空态首个段落打标，样式由 `.ProseMirror p.is-editor-empty` 规则渲染 */
function syncEmptyPlaceholder(root: HTMLElement, placeholder: string): void {
  root.querySelectorAll('p.is-editor-empty').forEach((p) => {
    p.classList.remove('is-editor-empty')
    p.removeAttribute('data-placeholder')
  })

  if (getComposerPlainTextFromElement(root) !== '') return

  if (!(root.firstElementChild instanceof HTMLParagraphElement)) {
    root.innerHTML = '<p><br></p>'
  }
  const first = root.firstElementChild
  if (!(first instanceof HTMLParagraphElement)) return
  first.classList.add('is-editor-empty')
  first.setAttribute('data-placeholder', placeholder)
}

export function useCwAiChatComposerEditor(
  options: UseCwAiChatComposerEditorOptions,
) {
  const editorRef = useRef<HTMLDivElement | null>(null)

  const optionsRef = useRef(options)
  optionsRef.current = options

  const applyValueToDom = useCallback((value: string) => {
    const el = editorRef.current
    if (!el) return
    el.innerHTML = buildComposerHtmlFromPlainText(value)
    syncEmptyPlaceholder(el, optionsRef.current.placeholder)
  }, [])

  // 首次挂载：把外部受控值写入 contentEditable
  useLayoutEffect(() => {
    const el = editorRef.current
    if (!el) return
    if (el.childNodes.length === 0) applyValueToDom(optionsRef.current.value)
  }, [applyValueToDom])

  useLayoutEffect(() => {
    const el = editorRef.current
    if (!el) return
    const current = getComposerPlainTextFromElement(el)
    if (current === options.value) return
    applyValueToDom(options.value ?? '')
  }, [options.value, applyValueToDom])

  // 占位文案变化时同步空态标记
  useLayoutEffect(() => {
    const el = editorRef.current
    if (!el) return
    if (getComposerPlainTextFromElement(el) === '') {
      syncEmptyPlaceholder(el, options.placeholder)
    }
  }, [options.placeholder])

  const focusEditor = useCallback(() => {
    requestAnimationFrame(() => {
      const el = editorRef.current
      if (!el) return
      el.focus()
      setComposerCaretToEnd(el)
    })
  }, [])

  const handleInput = useCallback(() => {
    const el = editorRef.current
    if (!el) return
    syncEmptyPlaceholder(el, optionsRef.current.placeholder)
    optionsRef.current.onUpdateModelValue(getComposerPlainTextFromElement(el))
    scheduleScrollComposerSelectionIntoView(el)
  }, [])

  const handleKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        if (event.nativeEvent.isComposing || event.nativeEvent.keyCode === 229) {
          return
        }
        event.preventDefault()
        if (optionsRef.current.showStop) return
        if (optionsRef.current.canSend) optionsRef.current.onSubmit()
      }
    },
    [],
  )

  const handlePaste = useCallback(
    (event: ReactClipboardEvent<HTMLDivElement>) => {
      const rawText = event.clipboardData?.getData('text/plain')
      if (rawText == null) return
      event.preventDefault()
      const el = editorRef.current
      if (!el) return
      insertComposerPlainTextAtCaret(
        el,
        normalizeComposerPastePlainText(rawText),
      )
      syncEmptyPlaceholder(el, optionsRef.current.placeholder)
      // 兜底：部分粘贴路径可能未冒泡 input，仍要同步受控值以展开发送钮
      optionsRef.current.onUpdateModelValue(
        getComposerPlainTextFromElement(el),
      )
    },
    [],
  )

  const handleFocus = useCallback(
    (_event: ReactFocusEvent<HTMLDivElement>) => {
      optionsRef.current.setIsEditorFocused(true)
    },
    [],
  )

  const handleBlur = useCallback(
    (_event: ReactFocusEvent<HTMLDivElement>) => {
      optionsRef.current.setIsEditorFocused(false)
    },
    [],
  )

  return {
    editorRef,
    focusEditor,
    handleInput,
    handleKeyDown,
    handlePaste,
    handleFocus,
    handleBlur,
  }
}
