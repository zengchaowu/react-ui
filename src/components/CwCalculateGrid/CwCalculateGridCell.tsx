import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type {
  FocusEvent as ReactFocusEvent,
  KeyboardEvent as ReactKeyboardEvent,
  RefObject,
} from 'react'
import type { DisplayRow, SourceRowField } from '@zengchaowu/ui-shared/components/CwCalculateGrid/types'
import { recordFlash } from '@zengchaowu/ui-shared/components/CwCalculateGrid/functions/editTiming'

export interface CwCalculateGridCellProps {
  row: DisplayRow
  fieldKey: string
  editable: boolean
  revision: number
  onCommit?: (value: string) => void
}

const BRAND_FLASH_RATIO = 0.28

/**
 * 单元格值变化时的短暂高亮反馈。
 * flash 色 = 原始背景 * 72% + 品牌色 * 28%（在原始底色之上叠一层品牌色），
 * 避免用半透明 flash 色把格子底色"洗掉"导致透出底下的表格内容。
 */
function flashHostCell(hostRef: RefObject<HTMLDivElement | null>) {
  const started = performance.now()
  const host = hostRef.current?.parentElement?.parentElement
  if (!(host instanceof HTMLElement)) {
    recordFlash(performance.now() - started)
    return
  }
  if (!host.dataset.flashOrigin) {
    host.dataset.flashOrigin = getComputedStyle(host).backgroundColor
  }
  const origin = host.dataset.flashOrigin
  const flashColor = `color-mix(in srgb, ${origin} ${Math.round((1 - BRAND_FLASH_RATIO) * 100)}%, var(--brand-color-6) ${Math.round(BRAND_FLASH_RATIO * 100)}%)`
  const id = String(Date.now())
  host.dataset.flash = id
  host.style.transition = 'none'
  host.style.backgroundColor = flashColor
  void host.offsetWidth
  host.style.transition = 'background-color 800ms ease-out'
  host.style.backgroundColor = origin
  recordFlash(performance.now() - started)
  window.setTimeout(() => {
    if (host.dataset.flash !== id) return
    host.style.backgroundColor = ''
    host.style.transition = ''
    delete host.dataset.flash
    delete host.dataset.flashOrigin
  }, 820)
}

function readFieldText(source: SourceRowField, mode: 'display' | 'edit') {
  if (!source) return ''
  if (source.type === 'array') return source.value.join(',')
  if (mode === 'display' && source.type === 'formula' && source.display === 'result') {
    return source.result ?? ''
  }
  return source.value ?? ''
}

export function CwCalculateGridCell({
  row,
  fieldKey,
  editable,
  revision,
  onCommit,
}: CwCalculateGridCellProps) {
  void revision

  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const editingRef = useRef(false)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const rootRef = useRef<HTMLDivElement | null>(null)
  const editOriginRef = useRef('')

  const displayText = readFieldText(row._data[fieldKey], 'display')
  const prevDisplayRef = useRef<string | null>(null)

  useEffect(() => {
    if (prevDisplayRef.current === null) {
      prevDisplayRef.current = displayText
      return
    }
    if (prevDisplayRef.current === displayText) return
    prevDisplayRef.current = displayText
    flashHostCell(rootRef)
  }, [displayText])

  // 绘制前聚焦，等价 Vue nextTick(() => inputRef.focus())，避免编辑框晚一帧才出现光标
  useLayoutEffect(() => {
    if (editing) inputRef.current?.focus()
  }, [editing])

  function setEditingState(next: boolean) {
    editingRef.current = next
    setEditing(next)
  }

  function startEdit() {
    if (!editable || editingRef.current) return
    editOriginRef.current = readFieldText(row._data[fieldKey], 'edit')
    setDraft(editOriginRef.current)
    setEditingState(true)
  }

  function cancelEdit() {
    setEditingState(false)
  }

  function commitEdit(
    event:
      | ReactFocusEvent<HTMLInputElement>
      | ReactKeyboardEvent<HTMLInputElement>,
  ) {
    if (!editingRef.current) return
    const next = event.currentTarget?.value ?? draft
    setEditingState(false)
    if (next !== editOriginRef.current) onCommit?.(next)
  }

  return (
    <div ref={rootRef} className="w-full min-w-0">
      {editing ? (
        <input
          ref={inputRef}
          value={draft}
          className="box-border h-full w-full min-w-0 bg-transparent p-0 outline-none"
          onChange={(event) => setDraft(event.target.value)}
          onBlur={commitEdit}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              commitEdit(event)
            } else if (event.key === 'Escape') {
              event.preventDefault()
              cancelEdit()
            }
          }}
        />
      ) : (
        <span
          className={['block w-full truncate', editable ? 'cursor-text' : '']
            .filter(Boolean)
            .join(' ')}
          onClick={startEdit}
        >
          {displayText}
        </span>
      )}
    </div>
  )
}

export default CwCalculateGridCell
