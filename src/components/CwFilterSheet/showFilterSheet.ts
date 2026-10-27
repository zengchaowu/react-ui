import { createElement } from 'react'
import { createRoot } from 'react-dom/client'
import CwFilterSheet from './CwFilterSheet'
import type {
  CwFilterSheetHandle,
  CwFilterSheetProps,
  CwFilterSheetSection,
  CwFilterSheetValues,
} from './types'
import { defaultTexts } from '@zengchaowu/ui-shared/components/CwFilterSheet/texts'

export type ShowFilterSheetResult = 'confirm' | 'reset' | 'close'

export interface ShowFilterSheetOptions
  extends Omit<
    CwFilterSheetProps,
    'onValuesChange' | 'onConfirm' | 'onReset' | 'onClose'
  > {
  /** 初始值 */
  initialValues?: Record<string, string | number | (string | number)[]>
  /** 确认回调 */
  onConfirm?: (values: CwFilterSheetValues) => void
  /** 重置回调 */
  onReset?: () => void
  /** 关闭回调 */
  onClose?: () => void
}

export interface ShowFilterSheetReturn {
  /** Promise，当 Sheet 关闭时 resolve */
  promise: Promise<ShowFilterSheetResult>
  /** 关闭 Sheet 的方法 */
  close: () => void
}

/**
 * 以全局方式显示筛选 Sheet
 * 仅通过函数 API 使用，不直接暴露组件
 */
export function showFilterSheet(
  options: ShowFilterSheetOptions,
): ShowFilterSheetReturn {
  const container = document.createElement('div')
  container.id = `cw-filter-sheet-container-${Date.now()}`
  document.body.appendChild(container)

  const root = createRoot(container)
  let handle: CwFilterSheetHandle | null = null
  let shown = false
  let settled = false
  let cleaned = false
  let cleanupTimer: ReturnType<typeof setTimeout> | null = null
  let resolvePromise: ((result: ShowFilterSheetResult) => void) | null = null

  const cleanup = () => {
    if (cleaned) return
    cleaned = true
    if (cleanupTimer != null) {
      clearTimeout(cleanupTimer)
      cleanupTimer = null
    }
    root.unmount()
    if (container.parentNode) {
      container.parentNode.removeChild(container)
    }
    handle = null
  }

  const settle = (result: ShowFilterSheetResult) => {
    if (settled) return
    settled = true
    if (resolvePromise) {
      resolvePromise(result)
      resolvePromise = null
    }
  }

  const close = () => {
    handle?.close()
  }

  const promise = new Promise<ShowFilterSheetResult>((resolve) => {
    resolvePromise = resolve

    const { initialValues, onConfirm, onReset, onClose, ...sheetProps } = options

    // 初始化 sections 的 initialValue
    const sectionsWithInitialValues: CwFilterSheetSection[] | undefined =
      options.sections?.map((section) => {
        if (initialValues && initialValues[section.key] !== undefined) {
          return {
            ...section,
            initialValue: initialValues[section.key],
          }
        }
        return section
      })

    root.render(
      createElement(CwFilterSheet, {
        ...sheetProps,
        sections: sectionsWithInitialValues,
        texts: options.texts || defaultTexts,
        onConfirm: (values: CwFilterSheetValues) => {
          onConfirm?.(values)
          settle('confirm')
          cleanup()
        },
        onReset: () => {
          onReset?.()
          settle('reset')
        },
        onClose: () => {
          onClose?.()
          settle('close')
          // 延迟清理，等待 Sheet 关闭动画完成
          cleanupTimer = setTimeout(cleanup, 300)
        },
        ref: (instance: CwFilterSheetHandle | null) => {
          if (!instance) {
            handle = null
            return
          }
          handle = instance
          if (shown) return
          shown = true
          instance.show()
        },
      }),
    )
  })

  return {
    promise,
    close,
  }
}
