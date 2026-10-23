import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react'
import type {
  CSSProperties,
  HTMLAttributes,
  MouseEvent as ReactMouseEvent,
  TouchEvent as ReactTouchEvent,
} from 'react'
import type {
  CwImageCropExportRequest,
  CwImageCropperHandle,
  CwImageCropperProps,
  CwImageCropperTexts,
} from './types'
import { cropperBase } from './styles'
import { defaultCwImageCropperTexts } from './texts'
import CwIcon from '../CwIcon/CwIcon'
import CwImageFit from '../CwImageFit/CwImageFit'
import type { CwImageFitHandle } from '../CwImageFit/types'
import {
  getEventCoordinates,
  calculateImageBounds,
  adjustCropBoxSize,
  moveCropBox,
  calculateInitialCropBox,
  calculateCropCoordinates,
  generateCropHandles,
  cropImageToBlob,
  createImageUrl,
  revokeImageUrl,
} from './functions'
import type { CropBox, ImageBounds } from './functions'

interface DragState {
  type: 'cropBox' | 'handle'
  handlePosition?: string
  startX: number
  startY: number
  startCropBox: CropBox
  isTouch?: boolean
}

export interface CwImageCropperComponentProps
  extends CwImageCropperProps,
    Omit<
      HTMLAttributes<HTMLDivElement>,
      'children' | 'className' | 'onError' | 'onConfirm'
    > {
  className?: string
}

export const CwImageCropper = forwardRef<
  CwImageCropperHandle,
  CwImageCropperComponentProps
>(function CwImageCropper(
  {
    file,
    aspectRatio,
    disabled = false,
    readonly = false,
    quality = 0.9,
    outputFormat = 'image/png',
    maxEdge,
    maxBytes,
    exportOnConfirm = true,
    texts: textsProp,
    onConfirm,
    onCrop,
    onCancel,
    onError,
    className,
    ...rest
  },
  ref,
) {
  const texts = useMemo<CwImageCropperTexts>(
    () => ({
      ...defaultCwImageCropperTexts,
      ...(textsProp ?? {}),
    }),
    [textsProp],
  )

  const propsRef = useRef({
    file,
    aspectRatio,
    disabled,
    readonly,
    quality,
    outputFormat,
    maxEdge,
    maxBytes,
    exportOnConfirm,
    onConfirm,
    onCrop,
    onCancel,
    onError,
  })
  propsRef.current = {
    file,
    aspectRatio,
    disabled,
    readonly,
    quality,
    outputFormat,
    maxEdge,
    maxBytes,
    exportOnConfirm,
    onConfirm,
    onCrop,
    onCancel,
    onError,
  }

  const [imageUrl, setImageUrl] = useState('')
  const [imageLoaded, setImageLoaded] = useState(false)
  const [cropBox, setCropBox] = useState<CropBox>({
    x: 0,
    y: 0,
    width: 200,
    height: 200,
  })
  const [imageTransformState, setImageTransformState] = useState({
    scale: 1,
    x: 0,
    y: 0,
  })

  const imageUrlRef = useRef('')
  const imageFitRef = useRef<CwImageFitHandle | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const cropBoxRef = useRef(cropBox)
  cropBoxRef.current = cropBox
  const dragStateRef = useRef<DragState | null>(null)
  const confirmLockedRef = useRef(false)

  const getImageElement = useCallback(
    (): HTMLImageElement | null => imageFitRef.current?.imageRef ?? null,
    [],
  )

  const getImageBounds = useCallback((): ImageBounds | null => {
    const img = getImageElement()
    const container = containerRef.current
    if (!img || !container) return null
    return calculateImageBounds(
      container.clientWidth,
      container.clientHeight,
      img.naturalWidth,
      img.naturalHeight,
    )
  }, [getImageElement])

  const imageTransform = useMemo(
    () => ({
      scale: imageTransformState.scale,
      x: imageTransformState.x,
      y: imageTransformState.y,
    }),
    [imageTransformState],
  )

  const cropBoxStyle = useMemo(
    () => ({
      left: `${Math.round(cropBox.x)}px`,
      top: `${Math.round(cropBox.y)}px`,
      width: `${Math.round(cropBox.width)}px`,
      height: `${Math.round(cropBox.height)}px`,
    }),
    [cropBox],
  )

  const cropHandles = useMemo(() => generateCropHandles(32), [])

  const resetCropBox = useCallback(() => {
    const img = getImageElement()
    if (!img) return
    if (img.naturalWidth === 0 || img.naturalHeight === 0) return

    const bounds = getImageBounds()
    if (!bounds) return

    setCropBox(calculateInitialCropBox(bounds, propsRef.current.aspectRatio))
    setImageTransformState({ scale: 1, x: 0, y: 0 })
  }, [getImageElement, getImageBounds])

  // 监听文件变化（对应 Vue watch immediate）
  useEffect(() => {
    if (file) {
      try {
        if (imageUrlRef.current) revokeImageUrl(imageUrlRef.current)
        const url = createImageUrl(file)
        imageUrlRef.current = url
        setImageUrl(url)
        setImageLoaded(false)
      } catch (error) {
        propsRef.current.onError?.(error as Error)
      }
    } else {
      if (imageUrlRef.current) revokeImageUrl(imageUrlRef.current)
      imageUrlRef.current = ''
      setImageUrl('')
      setImageLoaded(false)
    }
  }, [file])

  // 组件卸载时释放 object URL
  useEffect(() => {
    return () => {
      if (imageUrlRef.current) {
        revokeImageUrl(imageUrlRef.current)
        imageUrlRef.current = ''
      }
    }
  }, [])

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true)
    resetCropBox()
  }, [resetCropBox])

  const startDrag = useCallback(
    (
      type: 'cropBox' | 'handle',
      event: ReactMouseEvent<HTMLDivElement> | ReactTouchEvent<HTMLDivElement>,
      handlePosition?: string,
    ): boolean => {
      const p = propsRef.current
      if (p.disabled || p.readonly) return false
      event.stopPropagation()
      const coords = getEventCoordinates(
        event.nativeEvent as MouseEvent | TouchEvent,
      )
      dragStateRef.current = {
        type,
        handlePosition,
        startX: coords.clientX,
        startY: coords.clientY,
        startCropBox: { ...cropBoxRef.current },
        isTouch: 'touches' in event.nativeEvent,
      }
      return true
    },
    [],
  )

  const moveCropBoxWrapper = useCallback(
    (deltaX: number, deltaY: number) => {
      const drag = dragStateRef.current
      const bounds = getImageBounds()
      if (!bounds || !drag) return
      setCropBox(moveCropBox(drag.startCropBox, deltaX, deltaY, bounds))
    },
    [getImageBounds],
  )

  const adjustCropBoxSizeWrapper = useCallback(
    (deltaX: number, deltaY: number, handlePosition: string) => {
      const drag = dragStateRef.current
      if (!drag) return
      const bounds = getImageBounds()
      if (!bounds) return
      setCropBox(
        adjustCropBoxSize(
          drag.startCropBox,
          deltaX,
          deltaY,
          handlePosition,
          bounds,
          propsRef.current.aspectRatio,
        ),
      )
    },
    [getImageBounds],
  )

  const endDrag = useCallback(() => {
    dragStateRef.current = null
  }, [])

  const handleContainerMouseDown = (event: ReactMouseEvent<HTMLDivElement>) => {
    const p = propsRef.current
    if (p.disabled || p.readonly || !imageLoaded) return
    const target = event.target as HTMLElement | null
    if (target === getImageElement() || target?.closest('[class*="cropBox"]')) return
    startDrag('cropBox', event)
  }

  const handleContainerTouchStart = (event: ReactTouchEvent<HTMLDivElement>) => {
    const p = propsRef.current
    if (p.disabled || p.readonly || !imageLoaded) return
    const target = event.target as HTMLElement | null
    if (target === getImageElement() || target?.closest('[class*="cropBox"]')) return
    startDrag('cropBox', event)
  }

  const handleContainerMouseMove = (event: ReactMouseEvent<HTMLDivElement>) => {
    const drag = dragStateRef.current
    const p = propsRef.current
    if (!drag || p.disabled || p.readonly || drag.isTouch) return
    const coords = getEventCoordinates(event.nativeEvent as MouseEvent)
    if (drag.type === 'cropBox') {
      moveCropBoxWrapper(coords.clientX - drag.startX, coords.clientY - drag.startY)
    }
  }

  const handleContainerTouchMove = (event: ReactTouchEvent<HTMLDivElement>) => {
    const drag = dragStateRef.current
    const p = propsRef.current
    if (!drag || p.disabled || p.readonly || !drag.isTouch) return
    event.preventDefault()
    const coords = getEventCoordinates(event.nativeEvent as TouchEvent)
    if (drag.type === 'cropBox') {
      moveCropBoxWrapper(coords.clientX - drag.startX, coords.clientY - drag.startY)
    }
  }

  const handleCropBoxMouseDown = (event: ReactMouseEvent<HTMLDivElement>) => {
    startDrag('cropBox', event)
  }

  const handleCropBoxTouchStart = (event: ReactTouchEvent<HTMLDivElement>) => {
    startDrag('cropBox', event)
  }

  const handleCropHandleMouseDown = (
    position: string,
    event: ReactMouseEvent<HTMLDivElement>,
  ) => {
    startDrag('handle', event, position)
  }

  const handleCropHandleTouchStart = (
    position: string,
    event: ReactTouchEvent<HTMLDivElement>,
  ) => {
    startDrag('handle', event, position)
  }

  // 全局鼠标 / 触摸事件
  useEffect(() => {
    const onMouseMove = (event: MouseEvent) => {
      const drag = dragStateRef.current
      const p = propsRef.current
      if (!drag || p.disabled || p.readonly || drag.isTouch) return
      const coords = getEventCoordinates(event)
      const deltaX = coords.clientX - drag.startX
      const deltaY = coords.clientY - drag.startY
      if (drag.type === 'handle' && drag.handlePosition) {
        adjustCropBoxSizeWrapper(deltaX, deltaY, drag.handlePosition)
      } else if (drag.type === 'cropBox') {
        moveCropBoxWrapper(deltaX, deltaY)
      }
    }

    const onMouseUp = () => {
      if (dragStateRef.current && !dragStateRef.current.isTouch) endDrag()
    }

    const onTouchMove = (event: TouchEvent) => {
      const drag = dragStateRef.current
      const p = propsRef.current
      if (!drag || p.disabled || p.readonly || !drag.isTouch) return
      event.preventDefault()
      const coords = getEventCoordinates(event)
      const deltaX = coords.clientX - drag.startX
      const deltaY = coords.clientY - drag.startY
      if (drag.type === 'handle' && drag.handlePosition) {
        adjustCropBoxSizeWrapper(deltaX, deltaY, drag.handlePosition)
      } else if (drag.type === 'cropBox') {
        moveCropBoxWrapper(deltaX, deltaY)
      }
    }

    const onTouchEnd = () => {
      if (dragStateRef.current?.isTouch) endDrag()
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    window.addEventListener('touchmove', onTouchMove, { passive: false })
    window.addEventListener('touchend', onTouchEnd)

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
    }
  }, [adjustCropBoxSizeWrapper, moveCropBoxWrapper, endDrag])

  // 确认裁剪。默认在组件内导出 Blob；Sheet 会关掉 exportOnConfirm，先关层再导出。
  const handleConfirm = useCallback(async () => {
    const p = propsRef.current
    const img = getImageElement()
    const container = containerRef.current
    if (
      confirmLockedRef.current ||
      p.disabled ||
      p.readonly ||
      !img ||
      !container ||
      !p.file
    ) {
      return
    }

    const cropCoords = calculateCropCoordinates(
      cropBoxRef.current.x,
      cropBoxRef.current.y,
      cropBoxRef.current.width,
      cropBoxRef.current.height,
      container.clientWidth,
      container.clientHeight,
      img.naturalWidth,
      img.naturalHeight,
    )
    const request: CwImageCropExportRequest = {
      image: img,
      cropCoords,
      outputFormat: p.outputFormat,
      quality: p.quality,
      maxEdge: p.maxEdge,
      maxBytes: p.maxBytes,
    }
    confirmLockedRef.current = true
    p.onConfirm?.(request)
    if (!p.exportOnConfirm) return

    try {
      const blob = await cropImageToBlob(
        img,
        cropCoords,
        p.outputFormat,
        p.quality,
        { maxEdge: p.maxEdge, maxBytes: p.maxBytes },
      )
      p.onCrop?.(blob)
    } catch (error) {
      confirmLockedRef.current = false
      p.onError?.(error as Error)
    }
  }, [getImageElement])

  const handleCancel = useCallback(() => {
    const p = propsRef.current
    if (p.disabled) return
    p.onCancel?.()
  }, [])

  useImperativeHandle(
    ref,
    () => ({
      crop: handleConfirm,
      reset: resetCropBox,
    }),
    [handleConfirm, resetCropBox],
  )

  return (
    <div
      {...rest}
      className={[
        cropperBase.root,
        disabled
          ? cropperBase.rootDisabled
          : readonly
            ? cropperBase.rootReadonly
            : cropperBase.rootNormal,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      role="region"
      aria-disabled={disabled ? 'true' : 'false'}
      aria-readonly={readonly ? 'true' : 'false'}
    >
      {/* 裁剪容器 */}
      <div
        ref={containerRef}
        className={[
          cropperBase.container,
          disabled
            ? cropperBase.containerDisabled
            : readonly
              ? cropperBase.containerReadonly
              : cropperBase.containerNormal,
        ]
          .filter(Boolean)
          .join(' ')}
        onMouseDown={handleContainerMouseDown}
        onMouseMove={handleContainerMouseMove}
        onMouseUp={endDrag}
        onMouseLeave={endDrag}
        onTouchStart={handleContainerTouchStart}
        onTouchMove={handleContainerTouchMove}
        onTouchEnd={endDrag}
      >
        {/* 图片预览 */}
        {imageUrl ? (
          <CwImageFit
            ref={imageFitRef}
            className="absolute inset-0 select-none"
            src={imageUrl}
            imageTransform={imageTransform}
            onLoad={handleImageLoad}
          />
        ) : null}

        {/* 遮罩层 */}
        {imageLoaded ? (
          <>
            <div
              className={cropperBase.overlay}
              style={{ top: 0, left: 0, right: 0, height: `${Math.round(cropBox.y)}px` }}
            />
            <div
              className={cropperBase.overlay}
              style={{
                top: `${Math.round(cropBox.y + cropBox.height)}px`,
                left: 0,
                right: 0,
                bottom: 0,
              }}
            />
            <div
              className={cropperBase.overlay}
              style={{
                top: `${Math.round(cropBox.y)}px`,
                left: 0,
                width: `${Math.round(cropBox.x)}px`,
                height: `${Math.round(cropBox.height)}px`,
              }}
            />
            <div
              className={cropperBase.overlay}
              style={{
                top: `${Math.round(cropBox.y)}px`,
                left: `${Math.round(cropBox.x + cropBox.width)}px`,
                right: 0,
                height: `${Math.round(cropBox.height)}px`,
              }}
            />
          </>
        ) : null}

        {/* 裁剪框 */}
        {imageLoaded ? (
          <div
            className={[
              cropperBase.cropBox,
              disabled
                ? cropperBase.cropBoxDisabled
                : readonly
                  ? cropperBase.cropBoxReadonly
                  : cropperBase.cropBoxNormal,
            ]
              .filter(Boolean)
              .join(' ')}
            style={cropBoxStyle}
            onMouseDown={handleCropBoxMouseDown}
            onTouchStart={handleCropBoxTouchStart}
          >
            {/* 裁剪手柄 */}
            {cropHandles.map((handle) => (
              <div
                key={handle.position}
                className={[
                  cropperBase.cropHandle,
                  disabled
                    ? cropperBase.cropHandleDisabled
                    : readonly
                      ? cropperBase.cropHandleReadonly
                      : cropperBase.cropHandleNormal,
                ]
                  .filter(Boolean)
                  .join(' ')}
                style={handle.style as CSSProperties}
                onMouseDown={(event) =>
                  handleCropHandleMouseDown(handle.position, event)
                }
                onTouchStart={(event) =>
                  handleCropHandleTouchStart(handle.position, event)
                }
              >
                {/* 手柄视觉元素（内部圆形，保持 20px 视觉大小） */}
                <div className={cropperBase.cropHandleInner} />
              </div>
            ))}
          </div>
        ) : null}

        {/* 取消按钮（容器左下角） */}
        {imageLoaded ? (
          <div
            className={[
              cropperBase.cancelButton,
              disabled
                ? cropperBase.cancelButtonDisabled
                : readonly
                  ? cropperBase.cancelButtonReadonly
                  : cropperBase.cancelButtonNormal,
            ]
              .filter(Boolean)
              .join(' ')}
            role="button"
            aria-label={texts.cancelAriaLabel}
            aria-disabled={disabled ? 'true' : 'false'}
            onClick={(event) => {
              event.stopPropagation()
              handleCancel()
            }}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <CwIcon
              name="common--status--close-line"
              size={2}
              className="inline-flex items-center justify-center text-[var(--text-color-anti)]"
            />
          </div>
        ) : null}

        {/* 确认按钮（容器右下角） */}
        {imageLoaded ? (
          <div
            className={[
              cropperBase.confirmButton,
              disabled
                ? cropperBase.confirmButtonDisabled
                : readonly
                  ? cropperBase.confirmButtonReadonly
                  : cropperBase.confirmButtonNormal,
            ]
              .filter(Boolean)
              .join(' ')}
            role="button"
            aria-label={texts.confirmAriaLabel}
            aria-disabled={disabled ? 'true' : 'false'}
            onClick={(event) => {
              event.stopPropagation()
              void handleConfirm()
            }}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <CwIcon
              name="common--status--check-line"
              prefix="icon"
              size={2}
              className="inline-flex items-center justify-center text-[var(--text-color-anti)]"
            />
          </div>
        ) : null}
      </div>
    </div>
  )
})

export default CwImageCropper
