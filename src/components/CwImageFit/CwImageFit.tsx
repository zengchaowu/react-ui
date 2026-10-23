import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import type {
  CSSProperties,
  HTMLAttributes,
  SyntheticEvent,
} from 'react'
import type {
  CwImageFitHandle,
  CwImageFitProps,
} from './types'
import { resolveImageFitStyles } from './styles'
import { defaultTexts } from './texts'
import { CwLoading } from '../CwLoading'
import { CwIcon } from '../CwIcon'
import { createImageUrl, revokeImageUrl } from './functions/fileUtils'
import {
  calculateBoundedFitSize,
  calculateImageSize,
  calculateImageStyle,
  preloadRasterImageUrl,
} from './functions'
import { useContainerSize, useImageSize } from './hooks'

export interface CwImageFitComponentProps
  extends CwImageFitProps,
    Omit<
      HTMLAttributes<HTMLDivElement>,
      'children' | 'className' | 'onLoad' | 'onError'
    > {
  className?: string
}

/**
 * CwImageFit（对应 vue-ui `CwImageFit.vue`）
 */
export const CwImageFit = forwardRef<CwImageFitHandle, CwImageFitComponentProps>(
  function CwImageFit(
    {
      src,
      alt = '',
      imgLoading = 'eager',
      disabled = false,
      readonly = false,
      boundsMaxWidth,
      boundsMaxHeight,
      boundsMinWidth,
      boundsMinHeight,
      intrinsicWidth,
      intrinsicHeight,
      imageTransform,
      texts: textsProp,
      appearance = 'default',
      onLoad,
      onError,
      className,
      ...rest
    },
    ref,
  ) {
    const fitStyles = useMemo(() => resolveImageFitStyles(appearance), [appearance])
    const texts = useMemo(() => ({ ...defaultTexts, ...(textsProp ?? {}) }), [textsProp])

    const isBoundedInline =
      boundsMaxWidth != null &&
      boundsMaxHeight != null &&
      boundsMaxWidth > 0 &&
      boundsMaxHeight > 0

    // 容器和图片引用
    const rootRef = useRef<HTMLDivElement | null>(null)
    const imageRef = useRef<HTMLImageElement | null>(null)

    // 使用 hooks 获取容器和图片尺寸
    const {
      width: containerWidth,
      height: containerHeight,
      updateSize: updateContainerSize,
    } = useContainerSize(rootRef)
    const {
      naturalWidth: imageNaturalWidth,
      naturalHeight: imageNaturalHeight,
      updateSize: updateImageSize,
    } = useImageSize(imageRef)

    const [boundedLayout, setBoundedLayout] = useState<{ width: number; height: number } | null>(
      () => resolveBoundedLayout(intrinsicWidth ?? 0, intrinsicHeight ?? 0),
    )

    const boundedRootStyle = useMemo<CSSProperties | undefined>(() => {
      if (!isBoundedInline) return undefined
      if (boundedLayout) {
        return {
          width: `${boundedLayout.width}px`,
          height: `${boundedLayout.height}px`,
        }
      }
      return {
        maxWidth: `${boundsMaxWidth}px`,
        maxHeight: `${boundsMaxHeight}px`,
        overflow: 'hidden',
      }
    }, [isBoundedInline, boundedLayout, boundsMaxWidth, boundsMaxHeight])

    // 计算图片显示尺寸（保持宽高比，完全显示在容器内）
    const computedImageSize = useMemo(() => {
      if (
        isBoundedInline &&
        boundedLayout &&
        imageNaturalWidth &&
        imageNaturalHeight
      ) {
        return {
          width: `${boundedLayout.width}px`,
          height: `${boundedLayout.height}px`,
        }
      }
      return calculateImageSize(
        imageNaturalWidth && imageNaturalHeight
          ? { width: imageNaturalWidth, height: imageNaturalHeight }
          : null,
        containerWidth && containerHeight
          ? { width: containerWidth, height: containerHeight }
          : null,
      )
    }, [
      isBoundedInline,
      boundedLayout,
      imageNaturalWidth,
      imageNaturalHeight,
      containerWidth,
      containerHeight,
    ])

    // 计算图片样式（合并尺寸和 transform）
    const computedImageStyle = useMemo<CSSProperties>(() => {
      const size = computedImageSize
      const raw = calculateImageStyle(size, imageTransform)

      const style: CSSProperties = {
        width: raw.width,
        height: raw.height,
      }
      if (raw.transform) {
        style.transform = raw.transform
        style.transformOrigin = raw.transformOrigin as CSSProperties['transformOrigin']
      }

      if (isBoundedInline) {
        /** 仅有占位尺寸未知时才隐藏；有 intrinsic / 已算 layout 时不等 load 事件 */
        if (!boundedLayout) {
          style.visibility = 'hidden'
        }
        return style
      }

      // 基于容器尺寸和图片尺寸计算居中位置（不依赖 flex 布局）
      if (
        containerWidth &&
        containerHeight &&
        size.width !== 'auto' &&
        size.height !== 'auto'
      ) {
        const imgWidth = parseFloat(size.width)
        const imgHeight = parseFloat(size.height)

        if (!Number.isNaN(imgWidth) && !Number.isNaN(imgHeight)) {
          const left = (containerWidth - imgWidth) / 2
          const top = (containerHeight - imgHeight) / 2

          style.position = 'absolute'
          style.left = `${left}px`
          style.top = `${top}px`
        }
      }

      return style
    }, [
      computedImageSize,
      imageTransform,
      isBoundedInline,
      boundedLayout,
      containerWidth,
      containerHeight,
    ])

    const [imageLoaded, setImageLoadedState] = useState(false)
    const [imageError, setImageErrorState] = useState(false)
    const [imageSrc, setImageSrcState] = useState('')
    /** 每次提交 src 后触发一次布局同步（等价 Vue nextTick 后 adopt） */
    const [srcRenderToken, setSrcRenderToken] = useState(0)

    const imageLoadedRef = useRef(false)
    const imageErrorRef = useRef(false)
    const imageSrcRef = useRef('')
    const objectUrlRef = useRef<string | null>(null)
    const srcApplyGenerationRef = useRef(0)
    const srcRef = useRef(src)
    srcRef.current = src

    const setImageLoaded = (value: boolean) => {
      imageLoadedRef.current = value
      setImageLoadedState(value)
    }

    const setImageError = (value: boolean) => {
      imageErrorRef.current = value
      setImageErrorState(value)
    }

    const setImageSrc = (value: string) => {
      imageSrcRef.current = value
      setImageSrcState(value)
      setSrcRenderToken((token) => token + 1)
    }

    function clearObjectUrl() {
      if (objectUrlRef.current) {
        revokeImageUrl(objectUrlRef.current)
        objectUrlRef.current = null
      }
    }

    function resetBoundedLayoutUnlessIntrinsic() {
      if (!(intrinsicWidth && intrinsicHeight)) {
        setBoundedLayout(null)
      }
    }

    function resolvePropsSrcString(): string | null {
      const current = srcRef.current
      if (!current) return null
      if (typeof current === 'string') {
        const s = current.trim()
        return s || null
      }
      return null
    }

    async function adoptLoadedImageIfReady(): Promise<boolean> {
      const el = imageRef.current
      if (!el?.complete || !el.naturalWidth) return false
      setImageLoaded(true)
      setImageError(false)
      const size = updateImageSize()
      if (isBoundedInline) {
        updateBoundedLayoutFromImage(size.width, size.height)
      } else {
        updateContainerSize()
      }
      return true
    }

    /** 已展示一帧时：先离屏预加载再换 src，避免 bounded 模式 visibility:hidden 闪烁 */
    async function applyStringSrcTransition(next: string, generation: number) {
      try {
        await preloadRasterImageUrl(next)
        if (generation !== srcApplyGenerationRef.current) return
        if (resolvePropsSrcString() !== next) return
        setImageSrc(next)
        setImageError(false)
        setImageLoaded(true)
      } catch {
        if (generation !== srcApplyGenerationRef.current) return
        resetBoundedLayoutUnlessIntrinsic()
        setImageLoaded(false)
        setImageError(false)
        setImageSrc(next)
      }
    }

    async function applyImageSource() {
      const generation = ++srcApplyGenerationRef.current
      clearObjectUrl()

      const currentSrc = src
      if (!currentSrc) {
        setImageSrc('')
        setImageLoaded(false)
        setImageError(false)
        resetBoundedLayoutUnlessIntrinsic()
        return
      }

      if (typeof currentSrc === 'string') {
        const next = currentSrc.trim()
        if (!next) {
          setImageSrc('')
          setImageLoaded(false)
          setImageError(false)
          resetBoundedLayoutUnlessIntrinsic()
          return
        }
        if (
          imageLoadedRef.current &&
          imageSrcRef.current &&
          imageSrcRef.current !== next &&
          !imageErrorRef.current
        ) {
          await applyStringSrcTransition(next, generation)
          return
        }
        resetBoundedLayoutUnlessIntrinsic()
        setImageLoaded(false)
        setImageError(false)
        setImageSrc(next)
        return
      }

      if (currentSrc instanceof File || currentSrc instanceof Blob) {
        resetBoundedLayoutUnlessIntrinsic()
        setImageLoaded(false)
        setImageError(false)
        const url = createImageUrl(currentSrc as File)
        objectUrlRef.current = url
        setImageSrc(url)
      }
    }

    function resolveBoundedLayout(nw: number, nh: number) {
      if (!isBoundedInline || nw <= 0 || nh <= 0) return null
      return calculateBoundedFitSize(
        { width: nw, height: nh },
        {
          maxWidth: boundsMaxWidth as number,
          maxHeight: boundsMaxHeight as number,
          minWidth: boundsMinWidth,
          minHeight: boundsMinHeight,
        },
      )
    }

    function updateBoundedLayoutFromImage(nw: number, nh: number) {
      if (!isBoundedInline) return
      if (!nw || !nh) {
        if (!(intrinsicWidth && intrinsicHeight)) {
          setBoundedLayout(null)
        }
        return
      }
      setBoundedLayout(resolveBoundedLayout(nw, nh))
    }

    function syncBoundedLayoutFromIntrinsic() {
      if (!isBoundedInline) return
      const nw = intrinsicWidth ?? 0
      const nh = intrinsicHeight ?? 0
      const next = resolveBoundedLayout(nw, nh)
      if (next) setBoundedLayout(next)
    }

    // 处理图片加载成功
    const handleLoad = (event: SyntheticEvent<HTMLImageElement>) => {
      setImageLoaded(true)
      setImageError(false)

      const size = updateImageSize()
      if (isBoundedInline) {
        updateBoundedLayoutFromImage(size.width, size.height)
      } else {
        updateContainerSize()
      }

      onLoad?.(event.nativeEvent)
    }

    // 处理图片加载失败
    const handleError = (event: SyntheticEvent<HTMLImageElement>) => {
      setImageLoaded(false)
      setImageError(true)
      setBoundedLayout(null)
      onError?.(event.nativeEvent)
    }

    // 监听 bounded / intrinsic 参数变化（对应 Vue watch immediate）
    useEffect(() => {
      syncBoundedLayoutFromIntrinsic()
      if (imageLoadedRef.current) {
        updateBoundedLayoutFromImage(imageNaturalWidth, imageNaturalHeight)
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
      boundsMaxWidth,
      boundsMaxHeight,
      boundsMinWidth,
      boundsMinHeight,
      intrinsicWidth,
      intrinsicHeight,
    ])

    // 监听图片源变化（对应 Vue watch immediate）
    useEffect(() => {
      void applyImageSource()
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [src])

    // 对应 Vue nextTick：DOM 更新后若图片已缓存完成，补一次尺寸同步
    useLayoutEffect(() => {
      void adoptLoadedImageIfReady()
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [imageSrc, srcRenderToken])

    // 组件卸载时清理
    useEffect(() => {
      return () => {
        if (objectUrlRef.current) {
          revokeImageUrl(objectUrlRef.current)
          objectUrlRef.current = null
        }
      }
    }, [])

    // 暴露 imageRef 供外部访问
    useImperativeHandle(
      ref,
      () => ({
        get imageRef() {
          return imageRef.current
        },
      }),
      [],
    )

    return (
      <div
        {...rest}
        ref={rootRef}
        className={[
          fitStyles.root,
          disabled
            ? fitStyles.rootDisabled
            : readonly
              ? fitStyles.rootReadonly
              : fitStyles.rootNormal,
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        style={boundedRootStyle}
        role="img"
        aria-disabled={disabled ? 'true' : 'false'}
        aria-label={alt || texts.alt}
      >
        {/* 图片包装器 */}
        {imageSrc ? (
          <div className={fitStyles.imageWrapper}>
            <img
              ref={imageRef}
              src={imageSrc}
              alt={alt || texts.alt}
              loading={imgLoading}
              className={fitStyles.image}
              style={computedImageStyle}
              draggable="false"
              onLoad={handleLoad}
              onError={handleError}
            />
          </div>
        ) : null}

        {/* 加载中 */}
        {imageSrc && !imageLoaded && !imageError ? (
          <div className={fitStyles.loadingContainer}>
            <CwLoading type="spinner" size="small" />
          </div>
        ) : null}

        {/* 加载失败 */}
        {imageError ? (
          <div className={fitStyles.errorContainer}>
            <CwIcon
              name="common--status--image-error-line"
              prefix="icon"
              size={fitStyles.errorIconStyles?.size ?? 1}
              className={fitStyles.errorIconStyles?.class}
            />
          </div>
        ) : null}
      </div>
    )
  },
)

export default CwImageFit
