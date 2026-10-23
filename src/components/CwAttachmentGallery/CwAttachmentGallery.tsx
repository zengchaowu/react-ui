import { useCallback, useMemo, useRef, useState } from 'react'
import type { HTMLAttributes } from 'react'
import type {
  CwAttachmentGalleryItem,
  CwAttachmentGalleryProps,
  CwAttachmentGalleryScrollItemData,
  CwAttachmentGalleryTexts,
} from './types'
import { attachmentGalleryBase } from './styles'
import { defaultCwAttachmentGalleryTexts } from './texts'
import CwAttachmentGallerySlide from './CwAttachmentGallerySlide'
import CwIndicator from '../CwIndicator/CwIndicator'
import CwInfiniteLoopScroll from '../CwInfiniteLoopScroll/CwInfiniteLoopScroll'
import type { CwInfiniteLoopScrollItem } from '../CwInfiniteLoopScroll/types'
import { droppedAttachmentNeedsObjectUrl } from './functions/attachmentKind'
import { usePagedGalleryLayout } from './hooks/usePagedGalleryLayout'
import { useBrowserFileObjectUrlMap } from './hooks/useBrowserFileObjectUrlMap'
import { isImagePreviewScaledForPan } from '../CwImagePreview/functions'

const EMPTY_IMAGE_PREVIEW_CONFIG: NonNullable<
  CwAttachmentGalleryProps['imagePreviewConfig']
> = {}

export interface CwAttachmentGalleryComponentProps
  extends CwAttachmentGalleryProps,
    Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'className' | 'onChange'> {
  className?: string
}

export function CwAttachmentGallery({
  items,
  initialIndex = 0,
  disabled = false,
  readonly = false,
  showIndicator,
  imagePreviewConfig = EMPTY_IMAGE_PREVIEW_CONFIG,
  indicatorConfig,
  texts: textsProp,
  onIndexChange,
  onActiveScaleChange,
  className,
  ...rest
}: CwAttachmentGalleryComponentProps) {
  const texts = useMemo<CwAttachmentGalleryTexts>(
    () => ({
      ...defaultCwAttachmentGalleryTexts,
      ...(textsProp ?? {}),
    }),
    [textsProp],
  )

  const resolvedShowIndicator = showIndicator !== false && items.length > 1

  const mergedIndicatorConfig = useMemo(
    () => ({
      variant: 'numbered' as const,
      scrollable: 'auto' as const,
      maxWidth: 320,
      itemSize: 20,
      itemSpacing: 4,
      activeColor: 'var(--brand-color-6)',
      inactiveColor: 'var(--bg-color-component)',
      ...(indicatorConfig ?? {}),
    }),
    [indicatorConfig],
  )

  const urlEntries = useMemo(
    () =>
      items.map((item) => ({
        key: item.key,
        file: item.file ?? new File([], ''),
        objectUrl: item.objectUrl ?? item.src,
        needsBlobUrl:
          Boolean(item.file) &&
          !item.src?.trim() &&
          !item.objectUrl?.trim() &&
          droppedAttachmentNeedsObjectUrl(item.kind),
      })),
    [items],
  )

  const { resolve: resolveBlobUrl } = useBrowserFileObjectUrlMap(urlEntries)

  const resolveMediaSrc = useCallback(
    (item: CwAttachmentGalleryScrollItemData): string => {
      const direct = item.src?.trim() || item.objectUrl?.trim()
      if (direct) return direct
      if (!item.file) return ''
      return resolveBlobUrl({
        key: item.key,
        file: item.file,
        objectUrl: item.objectUrl,
        needsBlobUrl: droppedAttachmentNeedsObjectUrl(item.kind),
      })
    },
    [resolveBlobUrl],
  )

  const [activeSlideScale, setActiveSlideScale] = useState(
    imagePreviewConfig?.initialScale ?? 1,
  )

  const isGalleryScrollLocked = isImagePreviewScaledForPan(activeSlideScale, {
    initialScale: imagePreviewConfig?.initialScale,
  })

  const handleIndexChange = useCallback(
    (index: number) => {
      const nextScale = imagePreviewConfig?.initialScale ?? 1
      setActiveSlideScale(nextScale)
      onActiveScaleChange?.(nextScale)
      onIndexChange?.(index)
    },
    [imagePreviewConfig?.initialScale, onActiveScaleChange, onIndexChange],
  )

  const buildScrollItem = useCallback(
    (width: number): CwInfiniteLoopScrollItem[] =>
      items.map((item, index) => {
        const data: CwAttachmentGalleryScrollItemData = { ...item, originalIndex: index }
        return { key: item.key, data, width }
      }),
    [items],
  )

  const {
    scrollRef,
    containerRef,
    pageWidth,
    currentIndex,
    activeIndex,
    scrollItems,
    handleScroll,
  } = usePagedGalleryLayout({
    itemCount: items.length,
    initialIndex,
    onIndexChange: handleIndexChange,
    buildScrollItem,
  })

  const activeIndexRef = useRef(activeIndex)
  activeIndexRef.current = activeIndex

  const handleSlideScaleChange = useCallback(
    (slideIndex: number, scale: number) => {
      if (slideIndex !== activeIndexRef.current) return
      setActiveSlideScale((prev) => {
        if (prev === scale) return prev
        onActiveScaleChange?.(scale)
        return scale
      })
    },
    [onActiveScaleChange],
  )

  return (
    <div
      {...rest}
      className={[
        attachmentGalleryBase.root,
        disabled
          ? attachmentGalleryBase.rootDisabled
          : readonly
            ? attachmentGalleryBase.rootReadonly
            : attachmentGalleryBase.rootNormal,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      role="region"
      aria-disabled={disabled ? 'true' : 'false'}
      aria-label={texts.imageAlt}
    >
      <div ref={containerRef} className={attachmentGalleryBase.container}>
        <CwInfiniteLoopScroll
          ref={scrollRef}
          items={scrollItems}
          itemWidth={pageWidth}
          direction="horizontal"
          snapToPage
          pageWidth={pageWidth}
          snapThreshold={0.2}
          disabled={disabled}
          readonly={isGalleryScrollLocked}
          enableMomentum={false}
          className={attachmentGalleryBase.scrollContainer}
          onScroll={handleScroll}
          emptySlot={
            <div className="flex h-full w-full items-center justify-center text-[var(--text-color-secondary)]">
              {texts.empty}
            </div>
          }
        >
          {({ item, index }) => {
            const data = item as CwAttachmentGalleryScrollItemData | null
            if (!data) return null
            const slideIndex = data.originalIndex ?? index
            return (
              <CwAttachmentGallerySlide
                item={data as CwAttachmentGalleryItem}
                active={slideIndex === activeIndex}
                slideIndex={slideIndex}
                mediaSrc={resolveMediaSrc(data)}
                disabled={disabled}
                readonly={readonly}
                texts={texts}
                imagePreviewConfig={imagePreviewConfig}
                onScaleChange={handleSlideScaleChange}
              />
            )
          }}
        </CwInfiniteLoopScroll>
      </div>
      {resolvedShowIndicator ? (
        <div className={attachmentGalleryBase.indicator}>
          <CwIndicator
            total={items.length}
            value={currentIndex}
            {...mergedIndicatorConfig}
          />
        </div>
      ) : null}
    </div>
  )
}

export default CwAttachmentGallery
