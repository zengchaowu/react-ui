import { useEffect, useRef } from 'react'
import type { KeyboardEvent } from 'react'
import CwChatMessageComposer from '../CwChatMessageComposer/CwChatMessageComposer'
import type { CwMessageInputMentionItem } from './mentionProfile.types'

export interface CwChatMessageOwnEditProps {
  initialHtml: string
  mentionAvatarFallbackSrc: string
  mentionItems?: CwMessageInputMentionItem[] | null
  placeholder?: string
  disabled?: boolean
  /** 等价 Vue `@submit` */
  onSubmit?: (payload: { html: string; files: File[] }) => void
  /** 等价 Vue `@cancel` */
  onCancel?: () => void
}

export function CwChatMessageOwnEdit({
  initialHtml: _initialHtml,
  mentionAvatarFallbackSrc,
  mentionItems,
  placeholder = '编辑消息',
  disabled = false,
  onSubmit,
  onCancel,
}: CwChatMessageOwnEditProps) {
  const rootRef = useRef<HTMLDivElement | null>(null)

  function handleSubmit(payload: { html: string; files: File[] }) {
    if (disabled) return
    onSubmit?.(payload)
  }

  function isOutsideEditTarget(target: EventTarget | null): boolean {
    if (!(target instanceof Node)) return true
    if (rootRef.current?.contains(target)) return false
    if (target instanceof Element) {
      // Teleport 出的提及面板 / 其它 CwPopup
      if (target.closest('.cw-popup')) return false
      if (target.closest('input[type="file"]')) return false
    }
    return true
  }

  const disabledRef = useRef(disabled)
  disabledRef.current = disabled
  const onCancelRef = useRef(onCancel)
  onCancelRef.current = onCancel

  useEffect(() => {
    function onDocPointerDown(e: PointerEvent) {
      if (disabledRef.current) return
      if (!isOutsideEditTarget(e.target)) return
      onCancelRef.current?.()
    }

    // 跳过进入编辑的那次点击，避免立刻退出
    const timer = window.setTimeout(() => {
      document.addEventListener('pointerdown', onDocPointerDown, true)
    }, 0)
    return () => {
      window.clearTimeout(timer)
      document.removeEventListener('pointerdown', onDocPointerDown, true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function onKeyDownCapture(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== 'Escape') return
    event.preventDefault()
    event.stopPropagation()
    onCancel?.()
  }

  return (
    <div
      ref={rootRef}
      className="w-full min-w-0"
      onKeyDownCapture={onKeyDownCapture}
    >
      <CwChatMessageComposer
        layoutVariant="workspace"
        rootLayout="transparentShell"
        rootClass="w-full [&_.cw-chat-message-composer-workspace]:bg-transparent"
        mentionAvatarFallbackSrc={mentionAvatarFallbackSrc}
        mentionItems={mentionItems}
        placeholder={placeholder}
        disabled={disabled}
        enableAttachments={true}
        workspaceShowAttachButton={true}
        showToolbar={false}
        outboundHoldActive={false}
        onSubmit={handleSubmit}
      />
    </div>
  )
}

export default CwChatMessageOwnEdit
