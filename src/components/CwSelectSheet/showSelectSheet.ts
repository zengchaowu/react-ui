import { createElement } from 'react'
import { createRoot } from 'react-dom/client'
import CwSelectSheet from './CwSelectSheet'
import type {
  CwSelectSheetHandle,
  CwSelectSheetOption,
  CwSelectSheetProps,
} from './types'

export type ShowSelectSheetResult =
  | { value: string | number | null; option: CwSelectSheetOption | null }
  | 'cancel'

export interface ShowSelectSheetOptions extends Partial<CwSelectSheetProps> {}

/**
 * 以全局方式显示选择面板 Sheet
 * 仅通过函数 API 使用，不直接暴露组件
 */
export function showSelectSheet(
  options: ShowSelectSheetOptions = {},
): Promise<ShowSelectSheetResult> {
  return new Promise((resolve) => {
    const container = document.createElement('div')
    container.id = `cw-select-sheet-container-${Date.now()}`
    document.body.appendChild(container)

    const root = createRoot(container)
    let settled = false
    let shown = false

    const cleanup = () => {
      // 延迟清理，等待 Sheet 关闭动画完成（300ms 与 CwDynamicSheet 动画时间一致）
      setTimeout(() => {
        root.unmount()
        if (container.parentNode) {
          container.parentNode.removeChild(container)
        }
      }, 300)
    }

    const finish = (result: ShowSelectSheetResult) => {
      if (settled) return
      settled = true
      resolve(result)
      cleanup()
    }

    root.render(
      createElement(CwSelectSheet, {
        ...options,
        onChange: (
          value: string | number | null,
          option: CwSelectSheetOption | null,
        ) => {
          finish({ value, option })
        },
        onClose: () => {
          finish('cancel')
        },
        ref: (handle: CwSelectSheetHandle | null) => {
          if (!handle || shown) return
          shown = true
          handle.show()
        },
      }),
    )
  })
}
