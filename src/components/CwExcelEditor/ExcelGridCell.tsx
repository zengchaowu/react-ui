import { useEffect, useRef } from 'react'
import type {
  CSSProperties,
  ChangeEvent,
  FocusEvent as ReactFocusEvent,
  HTMLAttributes,
  KeyboardEvent as ReactKeyboardEvent,
} from 'react'
import { excelEditorBase } from './styles'

export type ExcelCommitMoveDirection = 'stay' | 'down' | 'up' | 'left' | 'right'

export interface ExcelGridCellProps
  extends Omit<HTMLAttributes<HTMLSpanElement | HTMLTextAreaElement>, 'onInput' | 'onSelect' | 'css'> {
  /** Vue attrs 透传的 data-* 属性 */
  [dataAttr: `data-${string}`]: string | undefined
  text: string
  placeholder?: string
  align: 'left' | 'center' | 'right'
  css?: Record<string, string>
  selected: boolean
  editing: boolean
  readonly: boolean
  /** 正在编辑时的内容，和上方编辑栏共用 */
  draft?: string
  /** 选中后直接打字时，光标放在末尾 */
  typeover?: string | null
  autofocus?: boolean
  /** grid：参与底层网格线；merge：仅 overlay 内显示内容 */
  surface?: 'grid' | 'merge'
  borderShadow?: string
  borderRight?: boolean
  borderBottom?: boolean
  onSelect?: () => void
  onEdit?: () => void
  onInput?: (value: string) => void
  onCommit?: (payload: { value: string; move: ExcelCommitMoveDirection }) => void
  onCancel?: () => void
}

export function ExcelGridCell({
  text,
  placeholder = '',
  align,
  css,
  selected,
  editing,
  readonly,
  draft = '',
  typeover = null,
  autofocus = false,
  surface = 'grid',
  borderShadow = '',
  borderRight = false,
  borderBottom = false,
  onSelect,
  onEdit,
  onInput,
  onCommit,
  onCancel,
  ...rest
}: ExcelGridCellProps) {
  const editorCss = {
    ...(css ?? {}),
    ...(borderShadow ? { boxShadow: borderShadow } : {}),
  } as CSSProperties

  const boxCss = (() => {
    const next = { ...(css ?? {}) }
    delete next.color
    delete next.fontWeight
    delete next.fontSize
    delete next.lineHeight
    return next as CSSProperties
  })()

  const spillCss = (() => {
    const next: Record<string, string> = {}
    if (css?.color) next.color = css.color
    if (css?.fontWeight) next.fontWeight = css.fontWeight
    if (css?.fontSize) next.fontSize = css.fontSize
    if (css?.lineHeight) next.lineHeight = css.lineHeight
    return next as CSSProperties
  })()

  function alignClass(forInput: boolean) {
    if (align === 'right') return forInput ? excelEditorBase.cellInputRight : excelEditorBase.cellTextRight
    if (align === 'center') return forInput ? excelEditorBase.cellInputCenter : excelEditorBase.cellTextCenter
    return ''
  }

  const inputRef = useRef<HTMLTextAreaElement | null>(null)
  const focusTokenRef = useRef(0)
  /** 事件外（卸载、延迟聚焦）也要读到最新的 props */
  const liveRef = useRef({ editing, draft, session: false, closed: false })
  liveRef.current.editing = editing
  liveRef.current.draft = draft

  useEffect(() => {
    if (!editing) {
      focusTokenRef.current += 1
      return
    }
    if (!autofocus) return
    liveRef.current.session = true
    liveRef.current.closed = false
    const token = ++focusTokenRef.current
    const original = draft
    // useEffect 已经在 DOM 提交后跑，相当于 Vue watch + await nextTick
    if (token !== focusTokenRef.current) return
    const input = inputRef.current
    if (!input) return
    // 用户已经接着打了字，不能再全选，否则下一个数字会把整段替换掉。
    if (document.activeElement === input && input.value !== original) return
    input.focus()
    if (typeover == null) input.select()
    else input.setSelectionRange(input.value.length, input.value.length)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing])

  function handleFocus() {
    liveRef.current.session = true
    liveRef.current.closed = false
  }

  function handleInput(event: ChangeEvent<HTMLTextAreaElement>) {
    onInput?.(event.target.value)
  }

  function insertNewline() {
    const input = inputRef.current
    if (!input) return
    const start = input.selectionStart ?? input.value.length
    const end = input.selectionEnd ?? start
    const next = `${input.value.slice(0, start)}\n${input.value.slice(end)}`
    onInput?.(next)
    setTimeout(() => {
      const el = inputRef.current
      if (!el) return
      el.setSelectionRange(start + 1, start + 1)
    }, 0)
  }

  function handleEdit() {
    if (readonly || liveRef.current.editing) return
    onEdit?.()
  }

  function finish(move: ExcelCommitMoveDirection | 'cancel') {
    const live = liveRef.current
    if (!live.editing || !live.session || live.closed) return
    live.closed = true
    live.session = false
    if (move === 'cancel') {
      onCancel?.()
      return
    }
    onCommit?.({ value: live.draft, move })
  }
  const finishRef = useRef(finish)
  finishRef.current = finish

  function handleBlur(event: ReactFocusEvent<HTMLTextAreaElement>) {
    const next = event.relatedTarget
    if (next instanceof Element && next.closest('.cw-excel-input')) return
    finish('stay')
  }

  function handleKeydown(event: ReactKeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && event.altKey) {
      event.preventDefault()
      event.stopPropagation()
      insertNewline()
      return
    }
    if (event.key === 'Enter') {
      event.preventDefault()
      event.stopPropagation()
      finish(event.shiftKey ? 'up' : 'down')
    } else if (event.key === 'Tab') {
      event.preventDefault()
      event.stopPropagation()
      finish(event.shiftKey ? 'left' : 'right')
    } else if (event.key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      finish('cancel')
    }
  }

  useEffect(() => {
    return () => {
      // 没焦点的镜像输入框被表格重画卸掉时，不能把正在编辑栏里打的字提交掉并抢走焦点。
      if (document.activeElement !== inputRef.current) return
      finishRef.current('stay')
    }
  }, [])

  if (editing) {
    return (
      <textarea
        {...rest}
        ref={inputRef}
        rows={1}
        className={[excelEditorBase.cellInput, alignClass(true), excelEditorBase.cellSelected]
          .filter(Boolean)
          .join(' ')}
        data-excel-grid={surface === 'grid' ? 'plain' : undefined}
        data-excel-br={borderRight ? '' : undefined}
        data-excel-bb={borderBottom ? '' : undefined}
        style={editorCss}
        value={draft}
        placeholder={placeholder}
        onChange={handleInput}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeydown}
        onMouseDown={(event) => event.stopPropagation()}
      />
    )
  }

  return (
    <span
      {...rest}
      className={[
        excelEditorBase.cellText,
        alignClass(false),
        !text && placeholder ? excelEditorBase.cellPlaceholder : '',
        selected ? excelEditorBase.cellSelected : '',
        readonly ? '' : 'cursor-cell',
        borderShadow ? 'z-[var(--z-index-above-high)]' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      data-excel-grid={surface === 'grid' ? 'plain' : undefined}
      data-excel-br={borderRight ? '' : undefined}
      data-excel-bb={borderBottom ? '' : undefined}
      style={boxCss}
      onClick={() => onSelect?.()}
      onDoubleClick={handleEdit}
    >
      {borderShadow ? (
        <span
          className="pointer-events-none absolute inset-0 z-[var(--z-index-above)]"
          style={{ boxShadow: borderShadow }}
        />
      ) : null}
      <span className={[excelEditorBase.cellSpill, alignClass(false)].filter(Boolean).join(' ')} style={spillCss}>
        {text || placeholder}
      </span>
    </span>
  )
}

export default ExcelGridCell
