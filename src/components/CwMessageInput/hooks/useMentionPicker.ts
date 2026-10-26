import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { RefObject } from 'react'
import { getActiveMentionQuery } from '@zengchaowu/shared/functions/im/getActiveMentionQuery'
import type { CwMessageInputMentionPanelHandle } from '../../CwMessageInputMentionPanel'
import { createFileRefElement } from '../extensions/FileRefNode'
import { createMentionElement } from '../extensions/ImMentionNode'
import {
  deleteCharsBeforeCaret,
  getCaretRect,
  getSelectionRange,
  insertNodesAtCaret,
  isCaretAfterMention,
  plainTextBeforeCaret,
  textToNodes,
} from '../functions/editorDom'
import { focusEditorWithKeyboardPolicy } from '../functions/focusEditorWithKeyboardPolicy'
import type { CwMessageInputMentionItem } from '../types'

export interface UseMentionPickerOptions {
  mentionItems?: CwMessageInputMentionItem[] | null
  mentionPanelVariant: 'popup' | 'sheet'
  disabled: boolean
  fieldRef: RefObject<HTMLDivElement | null>
  getRoot: () => HTMLElement | null
  getPlainText: () => string
  emitContent: () => void
  resolveMentionProfile: (uid: string) => { label: string; avatar?: string }
  publicAssetBaseUrl: string
  suppressVirtualKeyboard: boolean
  fileRefDeleteTitle: string
  mentionPopupRef: RefObject<CwMessageInputMentionPanelHandle | null>
}

export function useMentionPicker(options: UseMentionPickerOptions) {
  const optionsRef = useRef(options)
  optionsRef.current = options

  const [mentionQuery, setMentionQuery] = useState<{
    atIndex: number
    filter: string
  } | null>(null)
  const [mentionHighlightIndex, setMentionHighlightIndex] = useState(0)
  const [mentionPanelMounted, setMentionPanelMounted] = useState(false)
  const [mentionSheetMounted, setMentionSheetMounted] = useState(false)
  const [mentionSheetSearch, setMentionSheetSearch] = useState('')
  const pickerOpenRef = useRef(false)

  const mentionItems = options.mentionItems
  const mentionPanelVariant = options.mentionPanelVariant
  const disabled = options.disabled

  const mentionEnabled = Array.isArray(mentionItems)
  const filteredMentionItems = useMemo<CwMessageInputMentionItem[]>(() => {
    const items = mentionItems
    if (!Array.isArray(items) || items.length === 0) return []
    if (!mentionQuery) return []
    const raw = mentionQuery.filter.trim().toLowerCase()
    const isCodeRef = (item: CwMessageInputMentionItem): boolean =>
      item.kind === 'file' || item.kind === 'folder'
    if (!raw) {
      const users: CwMessageInputMentionItem[] = []
      const refs: CwMessageInputMentionItem[] = []
      for (const item of items) {
        if (isCodeRef(item)) refs.push(item)
        else users.push(item)
      }
      return [...users, ...refs.slice(0, 24)]
    }
    return items.filter((item) => {
      const label = item.label.toLowerCase()
      const id = (item.id ?? '').toLowerCase()
      const path = (item.path ?? '').toLowerCase()
      return label.includes(raw) || id.includes(raw) || path.includes(raw)
    })
  }, [mentionItems, mentionQuery])

  const mentionSheetItems = useMemo<CwMessageInputMentionItem[]>(
    () => (Array.isArray(mentionItems) ? mentionItems : []),
    [mentionItems],
  )

  const mentionUiActive =
    mentionEnabled &&
    !!mentionQuery &&
    Array.isArray(mentionItems) &&
    mentionItems.length > 0
  const mentionPopupVisible =
    mentionPanelVariant !== 'sheet' &&
    mentionUiActive &&
    filteredMentionItems.length > 0
  const mentionSheetVisible =
    mentionPanelVariant === 'sheet' && mentionUiActive
  const mentionPickerOpen = mentionPopupVisible || mentionSheetVisible

  const activeMentionCandidates = useMemo<CwMessageInputMentionItem[]>(() => {
    if (mentionPanelVariant === 'sheet') {
      const raw = mentionSheetSearch.trim().toLowerCase()
      if (!raw) return mentionSheetItems.slice()
      return mentionSheetItems.filter((item) => {
        const label = item.label.toLowerCase()
        const id = (item.id ?? '').toLowerCase()
        return label.includes(raw) || id.includes(raw)
      })
    }
    return filteredMentionItems
  }, [
    filteredMentionItems,
    mentionPanelVariant,
    mentionSheetItems,
    mentionSheetSearch,
  ])

  pickerOpenRef.current = mentionPickerOpen

  const cancelMention = useCallback((): void => {
    const current = optionsRef.current
    const query = mentionQuery
    const root = current.getRoot()
    if (!query || !root) return
    deleteCharsBeforeCaret(root, 1 + query.filter.length)
    current.emitContent()
    focusEditorWithKeyboardPolicy(root, current.suppressVirtualKeyboard)
    setMentionSheetSearch('')
  }, [mentionQuery])

  const pickMention = useCallback(
    (item: CwMessageInputMentionItem): void => {
      const current = optionsRef.current
      const query = mentionQuery
      const root = current.getRoot()
      if (!query || !root) return
      const full = current.getPlainText()
      const afterPlain = full.slice(query.atIndex + 1 + query.filter.length)
      const spacer = /^\s/.test(afterPlain) ? '' : ' '
      focusEditorWithKeyboardPolicy(root, current.suppressVirtualKeyboard)
      deleteCharsBeforeCaret(root, 1 + query.filter.length)

      const kind =
        item.kind === 'file' || item.kind === 'folder' ? item.kind : 'user'
      if (kind === 'file' || kind === 'folder') {
        const path = String(item.path ?? '').trim()
        if (!path) return
        const display =
          String(item.label ?? '').trim() ||
          path.split(/[/\\]/).pop() ||
          path
        insertNodesAtCaret(root, [
          createFileRefElement(
            {
              id: `ref_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
              path,
              label: display,
            },
            { removeAriaLabel: current.fileRefDeleteTitle },
            current.publicAssetBaseUrl,
          ),
        ])
      } else {
        const profile = current.resolveMentionProfile(item.id)
        insertNodesAtCaret(root, [
          createMentionElement(
            { uid: item.id, label: item.label },
            { inScope: true, displayLabel: profile.label },
          ),
        ])
      }
      if (spacer) insertNodesAtCaret(root, textToNodes(spacer))
      current.emitContent()
      root.focus({ preventScroll: true })
      setMentionSheetSearch('')
    },
    [mentionQuery],
  )

  const refreshMentionState = useCallback((): void => {
    const current = optionsRef.current
    const root = current.getRoot()
    if (!root || current.disabled || !Array.isArray(current.mentionItems)) {
      setMentionQuery((prev) => (prev === null ? prev : null))
      return
    }
    if (isCaretAfterMention(root)) {
      setMentionQuery((prev) => (prev === null ? prev : null))
      return
    }
    // 块级闭合标签会附带尾部换行；光标前文本不应包含末尾分隔符（对齐 Tiptap getTextBetween）
    const textBefore = plainTextBeforeCaret(root).replace(/\n+$/, '')
    const query = getActiveMentionQuery(textBefore, textBefore.length)
    if (!query) {
      setMentionQuery((prev) => (prev === null ? prev : null))
      return
    }
    setMentionQuery((prev) =>
      prev && prev.atIndex === query.atIndex && prev.filter === query.filter
        ? prev
        : { atIndex: query.atIndex, filter: query.filter },
    )
  }, [])

  useEffect(() => {
    if (mentionPopupVisible) {
      setMentionPanelMounted(true)
      setMentionHighlightIndex(0)
    }
  }, [mentionPopupVisible])

  useEffect(() => {
    if (mentionSheetVisible) {
      setMentionSheetMounted(true)
      setMentionHighlightIndex(0)
      setMentionSheetSearch(mentionQuery?.filter ?? '')
    }
  }, [mentionQuery?.filter, mentionSheetVisible])

  useEffect(() => {
    if (mentionHighlightIndex < activeMentionCandidates.length) return
    setMentionHighlightIndex(Math.max(0, activeMentionCandidates.length - 1))
  }, [activeMentionCandidates.length, mentionHighlightIndex])

  // 光标移动 / 输入时刷新浮层位置（等价 Vue `scheduleMentionReposition`）
  useEffect(() => {
    if (!mentionPickerOpen || mentionPanelVariant === 'sheet') return
    requestAnimationFrame(() => optionsRef.current.mentionPopupRef.current?.updatePosition())
  }, [mentionPickerOpen, mentionPanelVariant, mentionQuery])

  useEffect(() => {
    if (!mentionPickerOpen) return
    const id = activeMentionCandidates[
      Math.min(
        mentionHighlightIndex,
        Math.max(0, activeMentionCandidates.length - 1),
      )
    ]?.id
    if (!id) return
    requestAnimationFrame(() => {
      document
        .getElementById(`cw-message-input-mention-opt-${id}`)
        ?.scrollIntoView({ block: 'nearest' })
    })
  }, [activeMentionCandidates, mentionHighlightIndex, mentionPickerOpen])

  useEffect(() => {
    if (!mentionPickerOpen || mentionQuery == null || disabled) return
    function handler(event: KeyboardEvent): void {
      if (!pickerOpenRef.current || optionsRef.current.disabled) return
      const list = activeMentionCandidates
      const listLen = list.length
      const isNavKey =
        event.key === 'ArrowDown' ||
        event.key === 'ArrowUp' ||
        event.key === 'Home' ||
        event.key === 'End' ||
        event.key === 'Tab'
      if (listLen > 0 && isNavKey) {
        if (event.ctrlKey || event.metaKey) return
        event.preventDefault()
        event.stopPropagation()
        setMentionHighlightIndex((prev) => {
          if (event.key === 'ArrowDown') return (prev + 1) % listLen
          if (event.key === 'ArrowUp') return (prev - 1 + listLen) % listLen
          if (event.key === 'Home') return 0
          if (event.key === 'End') return listLen - 1
          return event.shiftKey
            ? (prev - 1 + listLen) % listLen
            : (prev + 1) % listLen
        })
        return
      }
      if (event.key === 'Escape') {
        event.preventDefault()
        event.stopPropagation()
        cancelMention()
        return
      }
      if (event.key === 'Enter' && !event.shiftKey) {
        if (event.isComposing || event.keyCode === 229) return
        event.preventDefault()
        event.stopPropagation()
        if (listLen > 0) {
          const index = Math.min(mentionHighlightIndex, listLen - 1)
          const item = list[index]
          if (item) pickMention(item)
        }
      }
    }
    window.addEventListener('keydown', handler, true)
    return () => window.removeEventListener('keydown', handler, true)
  }, [
    activeMentionCandidates,
    cancelMention,
    disabled,
    mentionHighlightIndex,
    mentionPickerOpen,
    mentionQuery,
    pickMention,
  ])

  const mentionVirtualRef = useMemo(
    () => ({
      getBoundingClientRect: (): DOMRect => {
        const root = optionsRef.current.getRoot()
        if (root) {
          const range = getSelectionRange(root)
          const rect = range ? getCaretRect(range) : null
          if (rect) return new DOMRect(rect.left, rect.bottom, 0, 0)
        }
        const field = optionsRef.current.fieldRef.current
        if (field) {
          const rect = field.getBoundingClientRect()
          return new DOMRect(rect.left, rect.bottom, 0, 0)
        }
        return new DOMRect(0, 0, 0, 0)
      },
    }),
    [],
  )

  return {
    mentionQuery,
    setMentionQuery,
    mentionHighlightIndex,
    mentionPanelMounted,
    mentionSheetMounted,
    mentionSheetSearch,
    setMentionSheetSearch,
    filteredMentionItems,
    mentionSheetItems,
    mentionPopupVisible,
    mentionSheetVisible,
    mentionPickerOpen,
    pickerOpenRef,
    activeMentionCandidates,
    cancelMention,
    pickMention,
    refreshMentionState,
    mentionVirtualRef,
  }
}
