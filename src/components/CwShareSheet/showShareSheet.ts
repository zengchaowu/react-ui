import { createElement } from 'react'
import { createRoot } from 'react-dom/client'
import CwShareSheet from './CwShareSheet'
import type {
  CwShareSheetHandle,
  CwShareSheetOption,
  CwShareSheetProps,
} from './types'

export type ShowShareSheetResult =
  | { type: 'option'; option: CwShareSheetOption }
  | { type: 'cancel' }

export interface ShowShareSheetOptions extends Partial<CwShareSheetProps> {}

/**
 * 以全局方式显示分享面板 Sheet
 * 仅通过函数 API 使用，不直接暴露组件
 */
export function showShareSheet(
  options: ShowShareSheetOptions = {},
): Promise<ShowShareSheetResult> {
  return new Promise((resolve) => {
    const container = document.createElement('div')
    container.id = `cw-share-sheet-container-${Date.now()}`
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

    const finish = (result: ShowShareSheetResult) => {
      if (settled) return
      settled = true
      resolve(result)
      cleanup()
    }

    root.render(
      createElement(CwShareSheet, {
        ...options,
        onChange: (
          type: 'option' | 'cancel',
          option?: CwShareSheetOption,
        ) => {
          if (type === 'option' && option) {
            finish({ type: 'option', option })
          } else {
            finish({ type: 'cancel' })
          }
        },
        onClose: () => {
          finish({ type: 'cancel' })
        },
        ref: (handle: CwShareSheetHandle | null) => {
          if (!handle || shown) return
          shown = true
          handle.show()
        },
      }),
    )
  })
}
