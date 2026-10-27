import {
  createElement,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react'
import { pickFile } from '@zengchaowu/shared/functions/dom/pickFile'
import { readBrowserPickFileDeps } from '@zengchaowu/shared/functions/dom/readBrowserDomDeps'
import { CW_OVERLAY_FULLSCREEN_SHEET_BODY_CLASS } from '@zengchaowu/ui-shared/constants/cwOverlayHeaderTitle'
import {
  showDynamicSheet,
  type ShowDynamicSheetReturn,
} from '../CwDynamicSheet/showDynamicSheet'
import type { CwDynamicSheetConfig } from '../CwDynamicSheet'
import CwImageCropper from '../CwImageCropper/CwImageCropper'
import { cropImageToBlob } from '@zengchaowu/ui-shared/components/CwImageCropper/functions/canvasCrop'
import type { CwImageCropExportRequest } from '../CwImageCropper/types'
import type {
  CwImageCropperSheetHandle,
  CwImageCropperSheetProps,
} from './types'

function afterNextPaint(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve())
    })
  })
}

export const CwImageCropperSheet = forwardRef<
  CwImageCropperSheetHandle,
  CwImageCropperSheetProps
>(function CwImageCropperSheet(
  {
    aspectRatio,
    disabled = false,
    readonly = false,
    quality = 0.9,
    outputFormat = 'image/png',
    maxEdge,
    maxBytes,
    texts: _texts,
    onAccept,
    onCrop,
    onCancel,
    onError,
  },
  ref,
) {
  const propsRef = useRef({
    aspectRatio,
    disabled,
    readonly,
    quality,
    outputFormat,
    maxEdge,
    maxBytes,
    onAccept,
    onCrop,
    onCancel,
    onError,
  })
  propsRef.current = {
    aspectRatio,
    disabled,
    readonly,
    quality,
    outputFormat,
    maxEdge,
    maxBytes,
    onAccept,
    onCrop,
    onCancel,
    onError,
  }

  const sheetInstanceRef = useRef<ShowDynamicSheetReturn | null>(null)

  const closeSheet = useCallback(() => {
    const instance = sheetInstanceRef.current
    if (instance) {
      instance.close()
      sheetInstanceRef.current = null
    }
  }, [])

  const exportCropAfterClose = useCallback(
    async (request: CwImageCropExportRequest) => {
      await afterNextPaint()
      try {
        const blob = await cropImageToBlob(
          request.image,
          request.cropCoords,
          request.outputFormat,
          request.quality,
          { maxEdge: request.maxEdge, maxBytes: request.maxBytes },
        )
        propsRef.current.onCrop?.(blob)
      } catch (error) {
        propsRef.current.onError?.(
          error instanceof Error ? error : new Error(String(error)),
        )
      }
    },
    [],
  )

  const show = useCallback(async (): Promise<void> => {
    const p = propsRef.current
    if (p.disabled || p.readonly) {
      return
    }

    // 如果已经有打开的 Sheet，先关闭
    if (sheetInstanceRef.current) {
      closeSheet()
    }

    try {
      // 使用 pickFile 选择图片文件
      const pickFileDeps = readBrowserPickFileDeps()
      if (!pickFileDeps) return

      const files = await pickFile(
        {
          accept: 'image/*',
          multiple: false,
        },
        pickFileDeps,
      )

      // 处理文件选择结果
      const file = Array.isArray(files) ? files[0] : files
      if (!file || !(file instanceof File)) {
        // 用户取消选择或未选择文件，不显示错误
        return
      }

      // 验证文件类型
      if (!file.type.startsWith('image/')) {
        p.onError?.(new Error('选择的文件不是图片格式'))
        return
      }

      // 确认后立刻关层，再导出 Blob，避免大图编码挡住关闭动画
      const handleConfirm = (request: CwImageCropExportRequest) => {
        closeSheet()
        propsRef.current.onAccept?.()
        void exportCropAfterClose(request)
      }

      const handleCancel = () => {
        propsRef.current.onCancel?.()
        closeSheet()
      }

      const handleError = (error: Error) => {
        propsRef.current.onError?.(error)
        closeSheet()
      }

      const cropperContent = createElement(CwImageCropper, {
        className: 'w-full h-full',
        file,
        aspectRatio: p.aspectRatio,
        disabled: p.disabled,
        readonly: p.readonly,
        quality: p.quality,
        outputFormat: p.outputFormat,
        maxEdge: p.maxEdge,
        maxBytes: p.maxBytes,
        exportOnConfirm: false,
        onConfirm: handleConfirm,
        onCancel: handleCancel,
        onError: handleError,
      })

      // Sheet 配置：裁剪区本身可拖拽，禁止下拉关闭以免误隐藏
      const sheetConfig: CwDynamicSheetConfig = {
        direction: 'bottom',
        closeOnClickOutside: false,
        dragToClose: false,
        contentShell: 'fullscreenBottom',
        bodyPadding: false,
        bodyScroll: false,
        body: { class: CW_OVERLAY_FULLSCREEN_SHEET_BODY_CLASS },
      }

      const instance = showDynamicSheet({
        component: cropperContent,
        config: sheetConfig,
      })
      sheetInstanceRef.current = instance

      // 监听 Promise resolve，当 Sheet 关闭时清理
      instance.promise.then(() => {
        if (sheetInstanceRef.current === instance) {
          sheetInstanceRef.current = null
        }
      })
    } catch (error) {
      p.onError?.(
        error instanceof Error ? error : new Error(String(error)),
      )
    }
  }, [closeSheet, exportCropAfterClose])

  useImperativeHandle(ref, () => ({ show }), [show])

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      closeSheet()
    }
  }, [closeSheet])

  return null
})

export default CwImageCropperSheet
