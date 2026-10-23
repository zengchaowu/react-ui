import { useCallback, useLayoutEffect, useRef, type RefObject } from 'react'

export interface UseCwInputDisplayPrefixOptions {
  prefix?: string
  value?: string
  inputRef: RefObject<HTMLInputElement | null>
  onValueChange: (value: string, kind: 'input' | 'change') => void
}

interface PendingSelection {
  start: number
  end: number
  contentLength: number
  prevHadContent: boolean
  prefixLength: number
}

export function useCwInputDisplayPrefix(options: UseCwInputDisplayPrefixOptions) {
  const { prefix, value, inputRef, onValueChange } = options

  const prefixText = String(prefix ?? '')
  const enabled = prefixText.length > 0

  const rawValue = String(value ?? '')
  const displayValue =
    !enabled || rawValue.length === 0 ? rawValue : prefixText + rawValue

  /** 等价于 Vue 的 nextTick：受控值提交后再恢复选区 */
  const pendingSelectionRef = useRef<PendingSelection | null>(null)

  useLayoutEffect(() => {
    const pending = pendingSelectionRef.current
    const el = inputRef.current
    if (!pending || !el) return
    pendingSelectionRef.current = null

    const { contentLength, prevHadContent, prefixLength } = pending
    if (contentLength === 0) {
      el.setSelectionRange(0, 0)
      return
    }

    const start = prevHadContent
      ? Math.max(prefixLength, pending.start)
      : pending.start + prefixLength
    const end = prevHadContent
      ? Math.max(prefixLength, pending.end)
      : pending.end + prefixLength

    const clamp = (position: number) =>
      Math.min(Math.max(position, prefixLength), prefixLength + contentLength)
    el.setSelectionRange(clamp(start), clamp(end))
  })

  const prefixLength = useCallback(
    (contentLength: number) => (enabled && contentLength > 0 ? prefixText.length : 0),
    [enabled, prefixText],
  )

  const stripDisplayRaw = useCallback(
    (raw: string): string => {
      if (!prefixText) return raw
      if (raw.length === 0) return ''
      if (raw.startsWith(prefixText)) return raw.slice(prefixText.length)
      return raw
    },
    [prefixText],
  )

  const restoreSelection = useCallback(
    (el: HTMLInputElement, start: number, end: number, contentLength: number) => {
      const pLen = prefixLength(contentLength)
      el.setSelectionRange(
        Math.min(Math.max(start, pLen), pLen + contentLength),
        Math.min(Math.max(end, pLen), pLen + contentLength),
      )
    },
    [prefixLength],
  )

  const clampSelection = useCallback(
    (el: HTMLInputElement, contentLength: number) => {
      const start = el.selectionStart ?? 0
      const end = el.selectionEnd ?? 0
      const pLen = prefixLength(contentLength)
      const nextStart = Math.min(Math.max(start, pLen), pLen + contentLength)
      const nextEnd = Math.min(Math.max(end, pLen), pLen + contentLength)
      if (start !== nextStart || end !== nextEnd) {
        el.setSelectionRange(nextStart, nextEnd)
      }
    },
    [prefixLength],
  )

  const handlePrefixInput = useCallback(() => {
    const el = inputRef.current
    if (!el || !enabled) return

    const pLen = prefixText.length
    const raw = el.value
    const selStart = el.selectionStart ?? raw.length
    const selEnd = el.selectionEnd ?? selStart
    const prevContent = String(value ?? '')
    const prevHadContent = prevContent.length > 0

    const content = stripDisplayRaw(raw)

    onValueChange(content, 'input')

    pendingSelectionRef.current = {
      start: selStart,
      end: selEnd,
      contentLength: content.length,
      prevHadContent,
      prefixLength: pLen,
    }
  }, [enabled, inputRef, onValueChange, prefixText, stripDisplayRaw, value])

  const handlePrefixKeydown = useCallback(
    (event: KeyboardEvent) => {
      const el = inputRef.current
      if (!el || !enabled) return

      const content = String(value ?? '')
      if (content.length === 0) return

      const pLen = prefixText.length
      const start = el.selectionStart ?? 0
      const end = el.selectionEnd ?? 0

      if (
        (event.key === 'Backspace' && start <= pLen && end <= pLen) ||
        (event.key === 'Delete' && start < pLen)
      ) {
        event.preventDefault()
        restoreSelection(el, pLen, pLen, content.length)
        return
      }

      if (event.key === 'ArrowLeft' && start <= pLen && !event.shiftKey) {
        event.preventDefault()
        restoreSelection(el, pLen, pLen, content.length)
        return
      }

      if (event.key === 'Home' && !event.shiftKey) {
        event.preventDefault()
        restoreSelection(el, pLen, pLen, content.length)
      }
    },
    [enabled, inputRef, prefixText, restoreSelection, value],
  )

  const guardPrefixSelection = useCallback(() => {
    const el = inputRef.current
    if (!el || !enabled) return

    const content = String(value ?? '')
    if (content.length === 0) return

    clampSelection(el, content.length)
  }, [clampSelection, enabled, inputRef, value])

  const handlePrefixFocus = useCallback(() => {
    guardPrefixSelection()
  }, [guardPrefixSelection])

  return {
    enabled,
    displayValue,
    handlePrefixInput,
    handlePrefixKeydown,
    guardPrefixSelection,
    handlePrefixFocus,
  }
}
