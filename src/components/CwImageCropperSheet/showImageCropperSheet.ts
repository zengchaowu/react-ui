import { createElement } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import CwImageCropperSheet from './CwImageCropperSheet'
import type {
  CwImageCropperSheetHandle,
  CwImageCropperSheetProps,
} from './types'

export type ShowImageCropperSheetResult = Blob | 'cancel'

export interface ShowImageCropperSheetOptions
  extends Partial<CwImageCropperSheetProps> {
  /** 用户点确认、弹层开始关闭时回调（Blob 仍在导出） */
  onAccept?: () => void
}

/**
 * 以全局方式显示图片裁剪 Sheet
 * 使用方式与 CwConfirmDialog 的 showConfirmDialog 类似
 */
export function showImageCropperSheet(
  options: ShowImageCropperSheetOptions = {},
): Promise<ShowImageCropperSheetResult> {
  const { onAccept, ...sheetProps } = options
  return new Promise((resolve, reject) => {
    let root: Root | null = null
    const container = document.createElement('div')
    container.id = `cw-image-cropper-sheet-container-${Date.now()}`
    document.body.appendChild(container)

    const cleanup = () => {
      if (root) {
        root.unmount()
        root = null
      }
      container.remove()
    }

    // 等待 Sheet 关闭动画完成（300ms 与 CwDynamicSheet 动画时间一致）
    const scheduleCleanup = () => {
      setTimeout(cleanup, 300)
    }

    let shown = false
    root = createRoot(container)
    root.render(
      createElement(CwImageCropperSheet, {
        ...sheetProps,
        onAccept: () => {
          onAccept?.()
        },
        // 事件透出为 Promise
        onCrop: (blob: Blob) => {
          resolve(blob)
          scheduleCleanup()
        },
        onCancel: () => {
          resolve('cancel')
          scheduleCleanup()
        },
        onError: (error: Error) => {
          reject(error)
          scheduleCleanup()
        },
        ref: (instance: CwImageCropperSheetHandle | null) => {
          if (!instance || shown) return
          shown = true
          // 调用组件暴露的 show 方法，内部会触发文件选择并打开 Sheet
          void instance.show()
        },
      }),
    )
  })
}
