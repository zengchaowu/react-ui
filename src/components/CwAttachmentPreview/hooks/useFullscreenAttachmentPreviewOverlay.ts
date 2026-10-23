import { useEffect, useMemo, useRef, useState } from 'react'
import type {
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
} from 'react'
import { CW_FULLSCREEN_PREVIEW_LEAVE_MS } from '@zengchaowu/ui-shared/constants/cwOverlayZIndex'
import type { CwDynamicDialogConfig } from '../../CwDynamicDialog/types'
import type {
  AttachmentPreviewContextMenuEvent,
  CwAttachmentPreviewProps,
} from '../types'

const SCALE_CLOSE_EPSILON = 0.01

const DEFAULT_IMAGE_PREVIEW_CONFIG = {
  minScale: 1,
  maxScale: 4,
  initialScale: 1,
  enableDoubleClickZoom: true,
  enableDoubleClickReset: true,
  enableWheelZoom: true,
  enableDrag: true,
  enablePinchZoom: true,
  enablePinchRotate: false,
}

export function createFullscreenAttachmentPreviewDialogConfig(options: {
  closeOnClickOverlay?: boolean
  closeable?: boolean
}): CwDynamicDialogConfig {
  return {
    variant: 'fullscreen',
    leaveDurationMs: CW_FULLSCREEN_PREVIEW_LEAVE_MS,
    closeOnClickOutside: options.closeOnClickOverlay !== false,
    showCloseButton: options.closeable !== false,
    bodyPadding: false,
    bodyScroll: false,
    background: { class: 'bg-[var(--overlay-scrim-gallery)] cursor-default' },
  }
}

export interface UseFullscreenAttachmentPreviewOverlayOptions {
  activeSlideScale: { current: number }
}

export function useFullscreenAttachmentPreviewOverlay(
  props: CwAttachmentPreviewProps,
  handlers: {
    onClose?: () => void
    onVisibleChange?: (value: boolean) => void
    onChange?: (index: number) => void
  },
  options: UseFullscreenAttachmentPreviewOverlayOptions,
) {
  const previewVisible = props.visible === true

  const dialogConfig = useMemo(
    () =>
      createFullscreenAttachmentPreviewDialogConfig({
        closeOnClickOverlay: props.closeOnClickOverlay,
        closeable: props.closeable,
      }),
    [props.closeOnClickOverlay, props.closeable],
  )

  const [currentIndex, setCurrentIndex] = useState(Math.max(0, props.initialIndex ?? 0))

  const mergedImagePreviewConfig = useMemo(
    () => ({
      ...DEFAULT_IMAGE_PREVIEW_CONFIG,
      ...props.imagePreviewConfig,
    }),
    [props.imagePreviewConfig],
  )

  const resolvedShowIndex = useMemo(() => {
    if (props.showIndex === false) return false
    return (props.items?.length ?? 0) > 1
  }, [props.showIndex, props.items?.length])

  const displayIndex = currentIndex + 1

  useEffect(() => {
    const value = props.initialIndex
    if (typeof value === 'number' && Number.isFinite(value)) {
      setCurrentIndex(Math.max(0, value))
    }
  }, [props.initialIndex])

  useEffect(() => {
    if (!props.visible) return
    setCurrentIndex(Math.max(0, props.initialIndex ?? 0))
    options.activeSlideScale.current = props.imagePreviewConfig?.initialScale ?? 1
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.visible])

  const handlersRef = useRef(handlers)
  handlersRef.current = handlers

  function close() {
    handlersRef.current.onClose?.()
    handlersRef.current.onVisibleChange?.(false)
  }

  function onBackdropClick() {
    if (props.closeOnClickOverlay === false) return
    close()
  }

  function isActiveSlideScaled() {
    const baseline = props.imagePreviewConfig?.initialScale ?? 1
    return Math.abs(options.activeSlideScale.current - baseline) > SCALE_CLOSE_EPSILON
  }

  const galleryPointerStateRef = useRef({
    didMove: false,
    startX: 0,
    startY: 0,
  })

  function onGalleryPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    galleryPointerStateRef.current = {
      didMove: false,
      startX: event.clientX,
      startY: event.clientY,
    }
  }

  function onGalleryPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const state = galleryPointerStateRef.current
    if (state.didMove) return
    const dx = event.clientX - state.startX
    const dy = event.clientY - state.startY
    if (dx * dx + dy * dy > 16) state.didMove = true
  }

  function onGalleryShellClick(event: ReactMouseEvent<HTMLDivElement>) {
    const state = galleryPointerStateRef.current
    if (state.didMove) {
      state.didMove = false
      return
    }
    if (isActiveSlideScaled()) return
    onBackdropClick()
    event.stopPropagation()
  }

  function onGalleryContextMenu(event: ReactMouseEvent<HTMLDivElement>) {
    if (!props.onContextMenu) return
    event.preventDefault()
    event.stopPropagation()
    const items = props.items
    const payload: AttachmentPreviewContextMenuEvent = {
      clientX: event.clientX,
      clientY: event.clientY,
      index: currentIndex,
      item: items?.[currentIndex] ?? null,
    }
    props.onContextMenu(payload)
  }

  function onGalleryIndexChange(index: number) {
    setCurrentIndex(index)
    options.activeSlideScale.current = props.imagePreviewConfig?.initialScale ?? 1
    handlersRef.current.onChange?.(index)
  }

  return {
    previewVisible,
    dialogConfig,
    mergedImagePreviewConfig,
    currentIndex,
    resolvedShowIndex,
    displayIndex,
    onGalleryPointerDown,
    onGalleryPointerMove,
    onGalleryShellClick,
    onGalleryContextMenu,
    onGalleryIndexChange,
    close,
  }
}
