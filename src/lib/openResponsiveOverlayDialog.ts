import { Fragment, createElement, type ReactNode } from 'react'
import { showDynamicDialog } from '../components/CwDynamicDialog/showDynamicDialog'
import type { CwDynamicDialogConfig } from '../components/CwDynamicDialog/types'
import {
  CW_OVERLAY_DIALOG_HOST_CLASS,
  resolveResponsiveOverlayDialogConfig,
} from '@zengchaowu/ui-shared/constants/cwOverlayDialogShell'
import type { ShowDynamicDialogReturn } from '../components/CwDynamicDialog/showDynamicDialog'

export interface OpenResponsiveOverlayDialogOptions {
  /** 窄屏（全屏 Dialog） */
  isBelowMd: boolean
  /** 宽屏 modal content 完整 class */
  contentClass: string
  /** 默认 true：host 容器包住内容，保证 Stack flex 高度 */
  wrapHost?: boolean
  hostClass?: string
  render: () => ReactNode
  config?: {
    fullscreen?: Partial<CwDynamicDialogConfig>
    modal?: Partial<CwDynamicDialogConfig>
  }
  /** 合并进 modal config 的默认值（如 showCloseButton: false） */
  modalDefaults?: Partial<CwDynamicDialogConfig>
}

/**
 * 窄屏全屏 / 宽屏居中 overlay Dialog（fade、可配关闭钮）。
 */
export function openResponsiveOverlayDialog(
  options: OpenResponsiveOverlayDialogOptions,
): ShowDynamicDialogReturn {
  let dialogHandle: ShowDynamicDialogReturn | null = null

  const close = () => {
    dialogHandle?.close()
  }

  const promise = new Promise<'close' | 'cancel'>((resolve) => {
    const inner = options.render()
    const children = (Array.isArray(inner) ? inner : [inner]).filter(
      (c) => c != null && c !== false,
    )
    if (children.length === 0) {
      resolve('cancel')
      return
    }
    const hostClass = options.hostClass ?? CW_OVERLAY_DIALOG_HOST_CLASS
    const component: ReactNode =
      options.wrapHost === false
        ? createElement(Fragment, {}, ...children)
        : createElement('div', { className: hostClass }, ...children)

    dialogHandle = showDynamicDialog({
      component,
      config: resolveResponsiveOverlayDialogConfig(options.isBelowMd, {
        contentClass: options.contentClass,
        fullscreen: {
          showCloseButton: false,
          ...options.config?.fullscreen,
        },
        modal: {
          ...options.modalDefaults,
          ...options.config?.modal,
        },
      }),
    })

    void dialogHandle.promise.then(resolve)
  })

  return {
    promise,
    close,
  }
}
