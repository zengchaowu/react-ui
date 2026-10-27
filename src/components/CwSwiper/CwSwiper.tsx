import { useEffect, useMemo, useRef, useState } from 'react'
import type { HTMLAttributes } from 'react'
import type { CwSwiperProps } from './types'
import type { CwSwiperItem } from '@zengchaowu/ui-shared/components/CwSwiper/types'
import { swiperBase } from '@zengchaowu/ui-shared/components/CwSwiper/styles'
import { CwInfiniteLoopScroll } from '../CwInfiniteLoopScroll'
import type { CwInfiniteLoopScrollItem } from '../CwInfiniteLoopScroll'
import { convertToScrollItems } from '@zengchaowu/ui-shared/components/CwSwiper/functions'
import { useContainerWidth } from './hooks/useContainerWidth'
import { useItemScales } from './hooks/useItemScales'

export interface CwSwiperComponentProps
  extends CwSwiperProps,
    Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'className' | 'style' | 'onScroll'> {}

type SwiperRenderItem = CwSwiperItem & { originalIndex: number }

export function CwSwiper({
  items,
  itemWidth = 300,
  disabled = false,
  readonly = false,
  enableMomentum = false,
  momentumDeceleration = 0.95,
  snapToPage = true,
  snapThreshold = 0.33,
  minScale = 0.8,
  texts: _texts,
  children,
  onScroll,
  onVisibleChange,
  className,
  ...rest
}: CwSwiperComponentProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [containerWidth, setContainerWidth] = useState(0)

  const scrollItems = useMemo(
    () => convertToScrollItems(items, itemWidth) as CwInfiniteLoopScrollItem[],
    [items, itemWidth],
  )

  const scrollPadding = useMemo(() => {
    const padding = Math.max(0, containerWidth / 2 - itemWidth / 2)
    return { left: padding, right: padding }
  }, [containerWidth, itemWidth])

  const { scheduleScaleUpdate, getItemStyle, getItemScale } = useItemScales(
    containerRef,
    minScale,
  )

  useContainerWidth(containerRef, setContainerWidth, scheduleScaleUpdate)

  // 拖拽/滚动中持续量一帧，确保缩放及时跟上
  useEffect(() => {
    scheduleScaleUpdate()
  }, [items, scheduleScaleUpdate])

  const rootClass = [
    swiperBase.root,
    disabled
      ? swiperBase.rootDisabled
      : readonly
        ? swiperBase.rootReadonly
        : swiperBase.rootNormal,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div ref={containerRef} className={rootClass} {...rest}>
      <CwInfiniteLoopScroll
        items={scrollItems}
        itemWidth={itemWidth}
        direction="horizontal"
        disabled={disabled}
        readonly={readonly}
        enableMomentum={enableMomentum}
        momentumDeceleration={momentumDeceleration}
        snapToPage={snapToPage}
        snapThreshold={snapThreshold}
        pageWidth={itemWidth}
        padding={scrollPadding}
        onScroll={(_top, left, centerIndex) => {
          scheduleScaleUpdate()
          onScroll?.(left, centerIndex)
        }}
        onVisibleChange={(startIndex, endIndex) => {
          onVisibleChange?.(startIndex, endIndex)
          requestAnimationFrame(scheduleScaleUpdate)
        }}
      >
        {({ item, index }) => {
          const swiperItem = item as SwiperRenderItem
          return (
            <div
              data-swiper-index={index}
              className={swiperBase.item}
              style={getItemStyle(index)}
            >
              <div className={swiperBase.itemContent}>
                {children ? (
                  children({
                    item: swiperItem,
                    index,
                    scale: getItemScale(index),
                  })
                ) : swiperItem.image ? (
                  <img
                    src={swiperItem.image}
                    alt={`Image ${index + 1}`}
                    className={swiperBase.itemImage}
                  />
                ) : (
                  <div>Item {index + 1}</div>
                )}
              </div>
            </div>
          )
        }}
      </CwInfiniteLoopScroll>
    </div>
  )
}

export default CwSwiper
