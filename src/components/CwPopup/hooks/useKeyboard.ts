import { useEffect, useRef } from 'react'
import type { PopupState } from '@zengchaowu/ui-shared/components/CwPopup/types/state'

export interface UseKeyboardOptions {
  state: PopupState
  onHide: () => void
}

/**
 * 键盘事件处理 Hook（可访问性）
 */
export function useKeyboard(options: UseKeyboardOptions): void {
  const { state, onHide } = options
  const onHideRef = useRef(onHide)
  onHideRef.current = onHide

  useEffect(() => {
    if (!state.visible) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!state.visible) return

      // ESC 键关闭弹出层
      if (e.key === 'Escape' || e.key === 'Esc') {
        onHideRef.current()
        e.preventDefault()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [state, state.visible])
}
