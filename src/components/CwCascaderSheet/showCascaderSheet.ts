import { createElement } from 'react'
import { createRoot } from 'react-dom/client'
import CwCascaderSheet from './CwCascaderSheet'
import type {
  CwCascaderSheetHandle,
  CwCascaderSheetOption,
  CwCascaderSheetProps,
} from './types'

export type ShowCascaderSheetResult =
  | {
      value: unknown[]
      option: CwCascaderSheetOption | null
    }
  | 'cancel'

export interface ShowCascaderSheetOptions
  extends Partial<CwCascaderSheetProps> {}

/**
 * 以全局方式显示级联选择面板 Sheet
 * 仅通过函数 API 使用，不直接暴露组件
 */
export function showCascaderSheet(
  options: ShowCascaderSheetOptions = {},
): Promise<ShowCascaderSheetResult> {
  return new Promise((resolve) => {
    const container = document.createElement('div')
    container.id = `cw-cascader-sheet-container-${Date.now()}`
    document.body.appendChild(container)

    let finalValue: unknown[] | null = null
    let finalOption: CwCascaderSheetOption | null = null
    let settled = false
    let instance: CwCascaderSheetHandle | null = null

    const root = createRoot(container)

    const cleanup = () => {
      // 延迟清理，等待 Sheet 关闭动画完成（300ms 与 CwDynamicSheet 动画时间一致）
      setTimeout(() => {
        root.unmount()
        if (container.parentNode) {
          container.parentNode.removeChild(container)
        }
      }, 300)
    }

    root.render(
      createElement(CwCascaderSheet, {
        ...options,
        onChange: (value: unknown[], option: CwCascaderSheetOption | null) => {
          // 只保存最新的值，不 resolve，等待最终选择完成
          finalValue = value
          finalOption = option
        },
        onClose: () => {
          if (settled) return
          settled = true
          const isLeaf =
            finalOption != null &&
            (!finalOption.children || finalOption.children.length === 0)
          if (finalValue !== null && isLeaf) {
            resolve({ value: finalValue, option: finalOption })
          } else {
            resolve('cancel')
          }
          cleanup()
        },
        ref: (handle: CwCascaderSheetHandle | null) => {
          if (!handle) {
            instance = null
            return
          }
          if (instance) return
          instance = handle
          handle.show()
        },
      }),
    )
  })
}
