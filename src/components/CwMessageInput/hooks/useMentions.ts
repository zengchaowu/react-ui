import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from 'react'
import { getTextBetween, getTextSerializersFromSchema, type Editor } from '@tiptap/core'
import { getActiveMentionQuery } from '@zengchaowu/shared/functions/im/getActiveMentionQuery'
import type { CwMessageInputMentionPanelHandle } from '../../CwMessageInputMentionPanel'
import type { CwMessageInputMentionItem } from '@zengchaowu/ui-shared/components/CwMessageInput/types'

/** @ 提及：候选过滤、浮层/Sheet 状态、键盘导航与选中/取消（等价 Vue `useMentions`） */
export function useMentions(options: {
  editor: Editor | null
  fieldRef: RefObject<HTMLElement | null>
  mentionItems: CwMessageInputMentionItem[] | null | undefined
  mentionPanelVariant: 'popup' | 'sheet'
  disabled: boolean
  getPlainText: () => string
  notifyContentChanged: () => void
}) {
  const {
    editor,
    fieldRef,
    mentionItems,
    mentionPanelVariant,
    disabled,
    getPlainText,
    notifyContentChanged,
  } = options

  const editorRef = useRef(editor)
  editorRef.current = editor

  const mentionPopupRef = useRef<CwMessageInputMentionPanelHandle | null>(null)
  const [mentionHighlightIndex, setMentionHighlightIndex] = useState(0)
  const [mentionSheetSearch, setMentionSheetSearch] = useState('')

  const mentionEnabled = Array.isArray(mentionItems)

  const isMentionInScope = useCallback(
    (uid: string): boolean => {
      const id = uid.trim()
      if (!id) return false
      if (!Array.isArray(mentionItems)) return false
      return mentionItems.some((item) => item.id === id)
    },
    [mentionItems],
  )

  // 虚拟引用 - 通过 getBoundingClientRect 返回光标位置
  const mentionVirtualRef = useMemo(
    () => ({
      getBoundingClientRect: (): DOMRect => {
        const ed = editorRef.current
        if (ed?.view) {
          try {
            const coords = ed.view.coordsAtPos(ed.state.selection.anchor)
            if (coords) {
              return new DOMRect(coords.left, coords.bottom, 0, 0)
            }
          } catch {
            // fallback below
          }
        }
        const fieldElement = fieldRef.current
        if (fieldElement) {
          const r = fieldElement.getBoundingClientRect()
          return new DOMRect(r.left, r.bottom, 0, 0)
        }
        return new DOMRect(0, 0, 0, 0)
      },
    }),
    [fieldRef],
  )

  const scheduleMentionReposition = useCallback((): void => {
    requestAnimationFrame(() => {
      mentionPopupRef.current?.updatePosition()
    })
  }, [])

  /** 不在成员池的 @ 节点降级为普通文本（切换会话 / 粘贴跨会话 @ 后） */
  const demoteOutOfScopeMentions = useCallback((): void => {
    const ed = editorRef.current
    if (!ed) return
    const mentionListEnabled = Array.isArray(mentionItems)
    const replacements: Array<{ from: number; to: number; text: string }> = []
    ed.state.doc.descendants((node, pos) => {
      if (node.type.name !== 'imMention') return
      const uid = String(node.attrs.uid ?? '').trim()
      if (mentionListEnabled && uid && isMentionInScope(uid)) return
      const label = String(node.attrs.label ?? '').trim() || uid
      replacements.push({ from: pos, to: pos + node.nodeSize, text: `@${label}` })
    })
    if (replacements.length === 0) return
    const tr = ed.state.tr
    for (let i = replacements.length - 1; i >= 0; i--) {
      const { from, to, text } = replacements[i]!
      tr.replaceWith(from, to, ed.schema.text(text))
    }
    ed.view.dispatch(tr)
    notifyContentChanged()
  }, [isMentionInScope, mentionItems, notifyContentChanged])

  /** 与 editor.getText() 一致的光标前纯文本（用于 @ 解析与索引），避免全文 lastIndexOf 误判 */
  const plainTextBeforeCursor = useCallback((): string => {
    const ed = editorRef.current
    if (!ed) return ''
    const to = ed.state.selection.from
    return getTextBetween(
      ed.state.doc,
      { from: 0, to },
      {
        blockSeparator: '\n\n',
        textSerializers: getTextSerializersFromSchema(ed.schema),
      },
    )
  }, [])

  const isCursorAfterImMention = useCallback((): boolean => {
    const ed = editorRef.current
    if (!ed) return false
    const { from, empty } = ed.state.selection
    if (!empty) return false

    let pos = from
    for (;;) {
      const nodeBefore = ed.state.doc.resolve(pos).nodeBefore
      if (!nodeBefore) return false
      if (nodeBefore.type.name === 'imMention') return true
      if (nodeBefore.isText && /^\s+$/.test(nodeBefore.text ?? '')) {
        pos -= nodeBefore.nodeSize
        continue
      }
      return false
    }
  }, [])

  /** 每次调用都读取最新 editor state（等价 Vue computed） */
  const resolveMentionQuery = useCallback((): {
    atIndex: number
    filter: string
  } | null => {
    if (!Array.isArray(mentionItems)) return null
    if (!editorRef.current) return null
    if (isCursorAfterImMention()) return null
    const textBefore = plainTextBeforeCursor()
    const q = getActiveMentionQuery(textBefore, textBefore.length)
    if (!q) return null
    return { atIndex: q.atIndex, filter: q.filter }
  }, [isCursorAfterImMention, mentionItems, plainTextBeforeCursor])

  const mentionQuery = resolveMentionQuery()

  const filteredMentionItems = ((): CwMessageInputMentionItem[] => {
    if (!Array.isArray(mentionItems) || mentionItems.length === 0) return []
    if (!mentionQuery) return []
    const raw = mentionQuery.filter.trim().toLowerCase()
    const isCodeRef = (item: CwMessageInputMentionItem) =>
      item.kind === 'file' || item.kind === 'folder'
    /** 仅 `@`：成员全量 + 少量文件/目录；`@` 后有字则按 label / id / path 过滤 */
    if (!raw) {
      const users: CwMessageInputMentionItem[] = []
      const refs: CwMessageInputMentionItem[] = []
      for (const item of mentionItems) {
        if (isCodeRef(item)) refs.push(item)
        else users.push(item)
      }
      return [...users, ...refs.slice(0, 24)]
    }
    return mentionItems.filter((item) => {
      const label = item.label.toLowerCase()
      const id = (item.id ?? '').toLowerCase()
      const path = (item.path ?? '').toLowerCase()
      return label.includes(raw) || id.includes(raw) || path.includes(raw)
    })
  })()

  const mentionSheetItems = ((): CwMessageInputMentionItem[] => {
    return Array.isArray(mentionItems) ? mentionItems : []
  })()

  const mentionUiActive = !!(
    mentionEnabled &&
    mentionQuery &&
    Array.isArray(mentionItems) &&
    mentionItems.length > 0
  )

  const mentionPopupVisible =
    mentionPanelVariant !== 'sheet' &&
    mentionUiActive &&
    filteredMentionItems.length > 0

  const mentionSheetVisible = mentionPanelVariant === 'sheet' && mentionUiActive

  const mentionPickerOpen = mentionPopupVisible || mentionSheetVisible

  const activeMentionCandidates = ((): CwMessageInputMentionItem[] => {
    if (mentionPanelVariant === 'sheet') {
      const items = mentionSheetItems
      const raw = mentionSheetSearch.trim().toLowerCase()
      if (!raw) return items.slice()
      return items.filter((item) => {
        const label = item.label.toLowerCase()
        const id = (item.id ?? '').toLowerCase()
        return label.includes(raw) || id.includes(raw)
      })
    }
    return filteredMentionItems
  })()

  const cancelMention = useCallback((): void => {
    const q = resolveMentionQuery()
    const ed = editorRef.current
    if (!q || !ed) return
    const { from: selFrom } = ed.state.selection
    const mentionLen = 1 + q.filter.length
    const delFrom = selFrom - mentionLen
    if (delFrom >= 0) {
      ed.chain().focus().deleteRange({ from: delFrom, to: selFrom }).run()
    } else {
      const full = getPlainText()
      const next = full.slice(0, q.atIndex) + full.slice(q.atIndex + 1 + q.filter.length)
      ed.commands.setContent(next, false)
    }
    notifyContentChanged()
    ed.chain().focus().run()
    setMentionSheetSearch('')
  }, [getPlainText, notifyContentChanged, resolveMentionQuery])

  const pickMention = useCallback(
    (item: CwMessageInputMentionItem): void => {
      const q = resolveMentionQuery()
      const ed = editorRef.current
      if (!q || !ed) return

      const full = getPlainText()
      const afterPlain = full.slice(q.atIndex + 1 + q.filter.length)
      /** 选人后默认补一个空格，便于继续打字；后面已是空白（含换行）则不再插入 */
      const spacer = /^\s/.test(afterPlain) ? '' : ' '

      const { from: selFrom } = ed.state.selection
      const mentionLen = 1 + q.filter.length
      const from = selFrom - mentionLen
      if (from < 0) return

      const kind = item.kind === 'file' || item.kind === 'folder' ? item.kind : 'user'
      if (kind === 'file' || kind === 'folder') {
        const path = String(item.path ?? '').trim()
        if (!path) return
        const display =
          String(item.label ?? '').trim() || path.split(/[/\\]/).pop() || path
        ed.chain()
          .focus()
          .deleteRange({ from, to: selFrom })
          .insertContent({
            type: 'fileRef',
            attrs: {
              id: `ref_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
              path,
              label: display,
            },
          })
          .run()
      } else {
        ed.chain()
          .focus()
          .deleteRange({ from, to: selFrom })
          .insertContent({
            type: 'imMention',
            attrs: { uid: item.id, label: item.label },
          })
          .run()
      }

      if (spacer) {
        ed.chain().focus().insertContent(spacer).run()
      }
      notifyContentChanged()
      ed.chain().focus().run()
      setMentionSheetSearch('')
    },
    [getPlainText, notifyContentChanged, resolveMentionQuery],
  )

  const scrollMentionHighlightIntoView = useCallback((): void => {
    requestAnimationFrame(() => {
      const rows = activeMentionCandidates
      const i = Math.min(mentionHighlightIndex, Math.max(0, rows.length - 1))
      const id = rows[i]?.id
      if (!id) return
      document
        .getElementById(`cw-message-input-mention-opt-${id}`)
        ?.scrollIntoView({ block: 'nearest' })
    })
  }, [activeMentionCandidates, mentionHighlightIndex])

  const mentionKeyboardActive = useCallback(
    (): boolean =>
      (mentionPopupVisible || mentionSheetVisible) &&
      mentionQuery != null &&
      !disabled,
    [disabled, mentionPopupVisible, mentionQuery, mentionSheetVisible],
  )

  const handleMentionKeyboardDown = useCallback(
    (event: KeyboardEvent): void => {
      const q = resolveMentionQuery()
      const inUi =
        (mentionPopupVisible || mentionSheetVisible) && q != null && !disabled
      if (!inUi) return

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
        if (event.key === 'ArrowDown') {
          setMentionHighlightIndex((prev) => (prev + 1) % listLen)
        } else if (event.key === 'ArrowUp') {
          setMentionHighlightIndex((prev) => (prev - 1 + listLen) % listLen)
        } else if (event.key === 'Home') {
          setMentionHighlightIndex(0)
        } else if (event.key === 'End') {
          setMentionHighlightIndex(listLen - 1)
        } else {
          setMentionHighlightIndex((prev) =>
            event.shiftKey ? (prev - 1 + listLen) % listLen : (prev + 1) % listLen,
          )
        }
        scrollMentionHighlightIntoView()
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
          const idx = Math.min(mentionHighlightIndex, listLen - 1)
          pickMention(list[idx]!)
        }
      }
    },
    [
      activeMentionCandidates,
      cancelMention,
      disabled,
      mentionHighlightIndex,
      mentionPopupVisible,
      mentionSheetVisible,
      pickMention,
      resolveMentionQuery,
      scrollMentionHighlightIntoView,
    ],
  )

  // 打开时重置高亮
  useEffect(() => {
    if (mentionPopupVisible) setMentionHighlightIndex(0)
  }, [mentionPopupVisible])

  useEffect(() => {
    if (!mentionSheetVisible) return
    setMentionHighlightIndex(0)
    const ed = editorRef.current
    if (!ed) return
    const textBefore = plainTextBeforeCursor()
    const q = getActiveMentionQuery(textBefore, textBefore.length)
    setMentionSheetSearch(q?.filter ?? '')
  }, [mentionSheetVisible, plainTextBeforeCursor])

  // Sheet 搜索跟随光标处 @ 过滤词
  useEffect(() => {
    if (!mentionSheetVisible) return
    const filter = resolveMentionQuery()?.filter
    if (filter != null) setMentionSheetSearch(filter)
  }, [mentionQuery?.filter, mentionSheetVisible, resolveMentionQuery])

  // 候选变化时收敛高亮下标
  useEffect(() => {
    const listLen = activeMentionCandidates.length
    setMentionHighlightIndex((prev) =>
      prev >= listLen ? Math.max(0, listLen - 1) : prev,
    )
  }, [activeMentionCandidates])

  // 提及面板打开时：在 window **捕获阶段**拦截按键
  useEffect(() => {
    if (!mentionKeyboardActive()) return
    const handler = (event: KeyboardEvent): void => handleMentionKeyboardDown(event)
    window.addEventListener('keydown', handler, true)
    return () => window.removeEventListener('keydown', handler, true)
  }, [handleMentionKeyboardDown, mentionKeyboardActive])

  return {
    mentionPopupRef,
    mentionHighlightIndex,
    mentionSheetSearch,
    setMentionSheetSearch,
    mentionQuery,
    filteredMentionItems,
    mentionSheetItems,
    mentionPopupVisible,
    mentionSheetVisible,
    mentionPickerOpen,
    activeMentionCandidates,
    mentionVirtualRef,
    scheduleMentionReposition,
    demoteOutOfScopeMentions,
    isMentionInScope,
    cancelMention,
    pickMention,
    mentionKeyboardActive,
    handleMentionKeyboardDown,
  }
}
