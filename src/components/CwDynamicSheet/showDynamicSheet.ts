import { createElement, type ReactNode } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { CW_OVERLAY_LEAVE_MS } from '@zengchaowu/ui-shared/constants/cwOverlayZIndex'
import { scheduleBringOverlayHostToFront } from '../../constants/cwOverlayStack'
import CwDynamicSheet from './CwDynamicSheet'
import type { CwDynamicSheetConfig, CwDynamicSheetHandle } from './types'
import type { CwDynamicSheetInnerTexts } from '@zengchaowu/ui-shared/components/CwDynamicSheet/types'
import { defaultTexts } from '@zengchaowu/ui-shared/components/CwDynamicSheet/texts'

export type ShowDynamicSheetResult = 'close' | 'cancel'

type ShowDynamicSheetContentOption =
  | { /** Sheet 内容 */ component: ReactNode; content?: ReactNode }
  | { /** Sheet 内容 */ content: ReactNode; component?: ReactNode }

export type ShowDynamicSheetOptions = ShowDynamicSheetContentOption & {
  /** Sheet 配置 */
  config?: CwDynamicSheetConfig
  texts?: Partial<CwDynamicSheetInnerTexts>
}

export interface ShowDynamicSheetReturn {
  /** Promise，在 Sheet 关闭时 resolve */
  promise: Promise<ShowDynamicSheetResult>
  /** 手动关闭 Sheet 的方法 */
  close: () => void
}

/**
 * 以全局方式显示动态 Sheet
 * 仅通过函数 API 使用，不直接暴露组件
 */
export function showDynamicSheet(
  options: ShowDynamicSheetOptions,
): ShowDynamicSheetReturn {
  let sheetId: string | null = null
  let root: Root | null = null
  let handle: CwDynamicSheetHandle | null = null
  let resolvePromise: ((result: ShowDynamicSheetResult) => void) | null = null
  let settled = false
  let settleTimer: ReturnType<typeof setTimeout> | null = null
  let pendingClose = false

  const container = document.createElement('div')
  container.id = `cw-dynamic-sheet-container-${Date.now()}`
  document.body.appendChild(container)
  scheduleBringOverlayHostToFront(container)

  const cleanup = () => {
    if (settleTimer != null) {
      clearTimeout(settleTimer)
      settleTimer = null
    }
    if (root) {
      root.unmount()
      root = null
    }
    if (container.parentNode) {
      container.parentNode.removeChild(container)
    }
    handle = null
    sheetId = null
  }

  const settle = (result: ShowDynamicSheetResult) => {
    if (settled) return
    settled = true
    if (resolvePromise) {
      resolvePromise(result)
      resolvePromise = null
    }
    cleanup()
  }

  /** 等离场动画后再 settle；hide 与 Inner close 竞态时也能保证 promise 结束 */
  const scheduleSettle = (result: ShowDynamicSheetResult) => {
    if (settled) return
    if (settleTimer != null) clearTimeout(settleTimer)
    settleTimer = setTimeout(() => {
      settleTimer = null
      settle(result)
    }, CW_OVERLAY_LEAVE_MS)
  }

  const close = () => {
    if (settled) return
    if (sheetId && handle) {
      handle.hide(sheetId)
    } else {
      // createRoot 首次挂载是异步的：等 ref 就绪后再补一次 hide
      pendingClose = true
    }
    scheduleSettle('close')
  }

  const promise = new Promise<ShowDynamicSheetResult>((resolve) => {
    resolvePromise = resolve

    let shown = false
    root = createRoot(container)
    root.render(
      createElement(CwDynamicSheet, {
        texts: options.texts || defaultTexts,
        onClose: () => {
          scheduleSettle('close')
        },
        ref: (instance: CwDynamicSheetHandle | null) => {
          if (!instance) {
            handle = null
            return
          }
          handle = instance
          if (shown) return
          shown = true
          sheetId = instance.show(
            options.component ?? options.content,
            options.config ?? {},
          )
          if (pendingClose) {
            instance.hide(sheetId)
          }
        },
      }),
    )
  })

  return {
    promise,
    close,
  }
}
