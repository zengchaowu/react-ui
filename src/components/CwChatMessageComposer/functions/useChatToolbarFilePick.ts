import { useRef } from 'react'
import type { ChangeEvent } from 'react'
import type { CwChatToolbarItemConfig } from '../../CwChatToolbar/types'
import type { CwChatToolbarActionPayload } from '@zengchaowu/ui-shared/components/CwChatToolbar/types'

export interface UseChatToolbarFilePickOptions {
  onToolbarTap: (payload: CwChatToolbarActionPayload) => void
  onToolbarFilesPicked: (toolKey: string, files: File[]) => void
  /**
   * `open-file-picker` 的 action 未写 `multiple` 时用此值，与 Composer `attachmentMultiple` 一致。
   */
  defaultFilePickerMultiple?: () => boolean
}

export function useChatToolbarFilePick(
  options: UseChatToolbarFilePickOptions,
) {
  const chatToolbarFileInputRef = useRef<HTMLInputElement | null>(null)
  const chatToolbarPendingKeyRef = useRef<string | null>(null)

  function onChatToolbarItemClick(item: CwChatToolbarItemConfig) {
    const action = item.action ?? { type: 'emit' }
    if (action.type === 'open-file-picker') {
      chatToolbarPendingKeyRef.current = item.key
      const input = chatToolbarFileInputRef.current
      if (!input) return
      input.accept = action.accept
      const fallback = options.defaultFilePickerMultiple?.() ?? true
      input.multiple = action.multiple !== undefined ? action.multiple : fallback
      input.value = ''
      input.click()
      return
    }
    options.onToolbarTap({ kind: 'tap', key: item.key })
  }

  function onChatToolbarFileChange(ev: ChangeEvent<HTMLInputElement>) {
    const input = ev.target
    const files = input.files
    const tkey = chatToolbarPendingKeyRef.current
    if (!tkey) {
      input.value = ''
      return
    }
    chatToolbarPendingKeyRef.current = null
    if (!files || files.length === 0) {
      input.value = ''
      return
    }
    options.onToolbarFilesPicked(tkey, Array.from(files))
    input.value = ''
  }

  /** 程序化打开工具栏共用的隐藏 file input（与 item 的 open-file-picker 一致） */
  function openFilePickerForKey(
    toolKey: string,
    accept: string,
    multiple?: boolean,
  ) {
    chatToolbarPendingKeyRef.current = toolKey
    const input = chatToolbarFileInputRef.current
    if (!input) return
    input.accept = accept
    const fallback = options.defaultFilePickerMultiple?.() ?? true
    input.multiple = multiple !== undefined ? multiple : fallback
    input.value = ''
    input.click()
  }

  return {
    chatToolbarFileInputRef,
    chatToolbarPendingKeyRef,
    onChatToolbarItemClick,
    onChatToolbarFileChange,
    openFilePickerForKey,
  }
}
