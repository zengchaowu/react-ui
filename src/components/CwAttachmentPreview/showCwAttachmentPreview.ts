import { createElement, useState } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { CW_FULLSCREEN_PREVIEW_LEAVE_MS } from '@zengchaowu/ui-shared/constants/cwOverlayZIndex'
import { scheduleBringOverlayHostToFront } from '../../constants/cwOverlayStack'
import { CwPublicAssetBaseUrlContext } from '../../utils/publicAssetBaseUrl'
import CwAttachmentPreview from './CwAttachmentPreview'
import { buildAttachmentGalleryItems } from '../CwAttachmentGallery/functions/buildAttachmentGalleryItems'
import { buildImageAttachmentItems } from '../CwAttachmentGallery/functions/buildImageAttachmentItems'
import type { CwAttachmentGalleryItem } from '../CwAttachmentGallery/types'
import { clampIndex } from '@zengchaowu/shared/functions/number/clampIndex'
import type {
  ShowCwAttachmentPreviewOptions,
  ShowCwAttachmentPreviewReturn,
} from './types'

type ActiveAttachmentPreview = ShowCwAttachmentPreviewReturn & {
  fingerprint: string
}

let activePreview: ActiveAttachmentPreview | null = null

function normalizeItems(opts: ShowCwAttachmentPreviewOptions): CwAttachmentGalleryItem[] {
  if (opts.items?.length) return opts.items
  if (opts.files?.length) return buildAttachmentGalleryItems(opts.files)
  if (opts.images?.length) return buildImageAttachmentItems(opts.images)
  return []
}

function previewFingerprint(items: CwAttachmentGalleryItem[], initialIndex: number): string {
  return `${items.map((item) => item.key).join('\0')}#${initialIndex}`
}

/** 关闭当前命令式附件预览（若有） */
export function closeCwAttachmentPreview(): void {
  activePreview?.close()
}

/** 当前是否有命令式附件预览处于打开（含离场动画前） */
export function isCwAttachmentPreviewOpen(): boolean {
  return activePreview != null
}

/**
 * 命令式全屏附件预览：每次打开独立 mount，关闭动画结束后 unmount。
 * 若已打开同一组内容则关闭（空格切换）；若已打开其它内容则先关再开。
 */
export function showCwAttachmentPreview(
  options: ShowCwAttachmentPreviewOptions | File[] | string[],
  startPosition?: number,
): ShowCwAttachmentPreviewReturn {
  const opts: ShowCwAttachmentPreviewOptions = Array.isArray(options)
    ? typeof options[0] === 'string'
      ? { images: options as string[], startPosition: startPosition ?? 0 }
      : { files: options as File[], startPosition: startPosition ?? 0 }
    : options

  const items = normalizeItems(opts)
  if (items.length === 0) {
    return { close: () => {} }
  }

  const initialIndex = clampIndex(
    opts.initialIndex ?? opts.startPosition ?? 0,
    items.length,
  )
  const fingerprint = previewFingerprint(items, initialIndex)

  if (activePreview) {
    const same = activePreview.fingerprint === fingerprint
    const prev = activePreview
    activePreview = null
    prev.close()
    if (same) {
      return { close: () => {} }
    }
  }

  const container = document.createElement('div')
  container.id = `cw-attachment-preview-${Date.now()}`
  document.body.appendChild(container)
  scheduleBringOverlayHostToFront(container)

  let root: Root | null = null
  let teardownScheduled = false
  let opened = true
  let setVisibleExternal: ((value: boolean) => void) | null = null
  const userOnClose = opts.onClose
  const publicAssetBaseUrl = opts.publicAssetBaseUrl?.trim() || ''

  const cleanup = () => {
    if (root) {
      root.unmount()
      root = null
    }
    container.remove()
  }

  const clearActiveIfMine = () => {
    if (activePreview?.fingerprint === fingerprint) {
      activePreview = null
    }
  }

  const scheduleCleanup = () => {
    if (teardownScheduled) return
    teardownScheduled = true
    clearActiveIfMine()
    userOnClose?.()
    setTimeout(cleanup, CW_FULLSCREEN_PREVIEW_LEAVE_MS)
  }

  const close = () => {
    if (!opened) return
    opened = false
    clearActiveIfMine()
    setVisibleExternal?.(false)
    scheduleCleanup()
  }

  function Host() {
    const [visible, setVisible] = useState(true)
    setVisibleExternal = setVisible

    const content = createElement(CwAttachmentPreview, {
      visible,
      items,
      initialIndex,
      galleryKey: Date.now(),
      showIndex: opts.showIndex,
      showIndicator: opts.showIndicator === true,
      showDownload: opts.showDownload !== false,
      closeable: opts.closeable !== false,
      closeOnClickOverlay: opts.closeOnClickOverlay !== false,
      imagePreviewConfig: opts.imagePreviewConfig,
      onContextMenu: opts.onContextMenu,
      onVisibleChange: (value: boolean) => {
        setVisible(value)
      },
      onClose: scheduleCleanup,
      onChange: (index: number) => {
        opts.onChange?.(index)
      },
    })

    if (!publicAssetBaseUrl) return content
    // createRoot 无法继承宿主 Context；显式注入 file-icons 等静态资源根
    return createElement(
      CwPublicAssetBaseUrlContext.Provider,
      { value: publicAssetBaseUrl },
      content,
    )
  }

  root = createRoot(container)
  root.render(createElement(Host))

  const api: ActiveAttachmentPreview = { close, fingerprint }
  activePreview = api

  return { close }
}
