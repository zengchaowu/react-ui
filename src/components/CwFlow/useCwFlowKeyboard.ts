import { useCallback } from 'react'

/** 键盘删除入参 */
export interface CwFlowKeyboardOptions {
  disabled: boolean
  onDelete: () => void
}

/** 组件聚焦时 Delete / Backspace 触发删除 */
export function useCwFlowKeyboard(options: CwFlowKeyboardOptions) {
  return useCallback(
    (event: { key: string; preventDefault: () => void }) => {
      if (options.disabled) return
      if (event.key !== 'Delete' && event.key !== 'Backspace') return
      event.preventDefault()
      options.onDelete()
    },
    [options.disabled, options.onDelete],
  )
}
