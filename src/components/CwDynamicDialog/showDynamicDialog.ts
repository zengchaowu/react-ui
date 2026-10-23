import { createElement, type ReactNode } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { CW_OVERLAY_LEAVE_MS } from '@zengchaowu/ui-shared/constants/cwOverlayZIndex'
import { scheduleBringOverlayHostToFront } from '../../constants/cwOverlayStack'
import CwDynamicDialog from './CwDynamicDialog'
import type {
  CwDynamicDialogConfig,
  CwDynamicDialogHandle,
  CwDynamicDialogTexts,
} from './types'
import { defaultTexts } from './texts'

export type ShowDynamicDialogResult = 'close' | 'cancel'

export interface ShowDynamicDialogOptions {
  /** 对话框内容 */
  component: ReactNode
  /** 对话框配置 */
  config?: CwDynamicDialogConfig
  texts?: Partial<CwDynamicDialogTexts>
}

export interface ShowDynamicDialogReturn {
  /** Promise，在对话框关闭时 resolve */
  promise: Promise<ShowDynamicDialogResult>
  /** 手动关闭对话框的方法 */
  close: () => void
}

/**
 * 以全局方式显示动态对话框
 * 仅通过函数 API 使用，不直接暴露组件
 */
export function showDynamicDialog(
  options: ShowDynamicDialogOptions,
): ShowDynamicDialogReturn {
  let dialogId: string | null = null
  let root: Root | null = null
  let handle: CwDynamicDialogHandle | null = null
  let resolvePromise: ((result: ShowDynamicDialogResult) => void) | null = null
  let settled = false
  let settleTimer: ReturnType<typeof setTimeout> | null = null
  let pendingClose = false

  const container = document.createElement('div')
  container.id = `cw-dynamic-dialog-container-${Date.now()}`
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
    dialogId = null
  }

  const settle = (result: ShowDynamicDialogResult) => {
    if (settled) return
    settled = true
    if (resolvePromise) {
      resolvePromise(result)
      resolvePromise = null
    }
    cleanup()
  }

  /** 等离场动画后再 settle；hide 与 Inner close 竞态时也能保证 promise 结束 */
  const scheduleSettle = (result: ShowDynamicDialogResult) => {
    if (settled) return
    if (settleTimer != null) clearTimeout(settleTimer)
    settleTimer = setTimeout(() => {
      settleTimer = null
      settle(result)
    }, CW_OVERLAY_LEAVE_MS)
  }

  const close = () => {
    if (settled) return
    if (dialogId && handle) {
      handle.hide(dialogId)
    } else {
      // createRoot 首次挂载是异步的：等 ref 就绪后再补一次 hide
      pendingClose = true
    }
    scheduleSettle('close')
  }

  const promise = new Promise<ShowDynamicDialogResult>((resolve) => {
    resolvePromise = resolve

    let shown = false
    root = createRoot(container)
    root.render(
      createElement(CwDynamicDialog, {
        texts: options.texts || defaultTexts,
        onClose: () => {
          scheduleSettle('close')
        },
        ref: (instance: CwDynamicDialogHandle | null) => {
          if (!instance) {
            handle = null
            return
          }
          handle = instance
          if (shown) return
          shown = true
          dialogId = instance.show(options.component, options.config ?? {})
          if (pendingClose) {
            instance.hide(dialogId)
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
