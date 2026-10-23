import {
  forwardRef,
  useImperativeHandle,
  useLayoutEffect,
  type HTMLAttributes,
} from 'react'
import type { CwDivProps } from './types'
import type { CwDivScrollExpose } from './resolveCwDivViewport'
import { divBase } from './styles'
import { useCwDivScrollbar } from './composables/useCwDivScrollbar'

export interface CwDivHandle extends CwDivScrollExpose {
  el: HTMLElement | null
  viewport: HTMLElement | null
  content: HTMLElement | null
  remeasure: () => void
  scrollTo: (scrollOptions?: ScrollToOptions | number, y?: number) => void
  scrollBy: (scrollOptions?: ScrollToOptions | number, y?: number) => void
}

export interface CwDivComponentProps
  extends CwDivProps,
    Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'className' | 'style' | 'onScroll'> {}

export const CwDiv = forwardRef<CwDivHandle, CwDivComponentProps>(function CwDiv(
  {
    hideScrollbar = false,
    persistScrollbar = false,
    scrollbarMap,
    viewportClass = '',
    contentClass = '',
    scrollbarVerticalClass = '',
    texts: _texts,
    onScrollbarSeek,
    children,
    className,
    style,
    onScroll,
    ...rest
  },
  ref,
) {
  const viewportClassMerged = [divBase.viewport, viewportClass].filter(Boolean).join(' ')
  /** padding 挂这里。grow 让内层占满确定高度；不要 shrink-0，否则盖掉 shrink，表格无法被限制在剩余高度里 */
  const contentInnerClass = ['min-h-0 min-w-0 w-full grow', contentClass]
    .filter(Boolean)
    .join(' ')
  const rootClass = [divBase.root, className].filter(Boolean).join(' ')

  const {
    rootRef,
    viewportRef,
    contentRef,
    verticalTrackRef,
    horizontalTrackRef,
    verticalThumbRef,
    horizontalThumbRef,
    vertical,
    horizontal,
    shouldShowScrollbars,
    verticalThumbStyle,
    horizontalThumbStyle,
    handleScroll,
    handleTrackPointerDown,
    startThumbDrag,
    onScrollbarPointerEnter,
    onScrollbarPointerLeave,
    scheduleUpdate,
    scrollTo,
    scrollBy,
  } = useCwDivScrollbar({
    persistScrollbar,
    scrollbarMap,
    onSeek: onScrollbarSeek,
  })

  const verticalTrackClass = [
    divBase.scrollbarVertical,
    scrollbarVerticalClass,
    shouldShowScrollbars ? divBase.scrollbarShown : divBase.scrollbarHidden,
    horizontal.visible ? divBase.scrollbarVerticalHasHorizontal : '',
  ]
    .filter(Boolean)
    .join(' ')

  const horizontalTrackClass = [
    divBase.scrollbarHorizontal,
    shouldShowScrollbars ? divBase.scrollbarShown : divBase.scrollbarHidden,
    vertical.visible ? divBase.scrollbarHorizontalHasVertical : '',
  ]
    .filter(Boolean)
    .join(' ')

  const verticalThumbClass = [divBase.thumbBase, divBase.thumbVertical].join(' ')
  const horizontalThumbClass = [divBase.thumbBase, divBase.thumbHorizontal].join(' ')

  useLayoutEffect(() => {
    scheduleUpdate()
  }, [className, style, scheduleUpdate])

  useImperativeHandle(
    ref,
    () => ({
      get el() {
        return rootRef.current
      },
      get viewport() {
        return viewportRef.current
      },
      get content() {
        return contentRef.current
      },
      remeasure: scheduleUpdate,
      scrollTo,
      scrollBy,
    }),
    [scheduleUpdate, scrollTo, scrollBy],
  )

  return (
    <div {...rest} ref={rootRef} className={rootClass} style={style}>
      <div
        ref={viewportRef}
        className={viewportClassMerged}
        onScroll={(event) => {
          handleScroll(event.nativeEvent)
          onScroll?.(event)
        }}
      >
        {/*
          viewport 是 flex 时，content 用 flex-1 + min-h-full 接住确定高度，内层才能把表格压进剩余空间并自己滚动。
          不要 shrink-0：内容会把整页撑高，表体 scrollHeight 与可视高度相同，纵向滚动条不会出现。
          padding 挂内层，避免和 min-h-full 叠在同一节点时被 border-box 裁掉。
        */}
        <div ref={contentRef} className={divBase.content}>
          <div className={contentInnerClass}>{children}</div>
        </div>
      </div>

      <div
        ref={verticalTrackRef}
        className={verticalTrackClass}
        style={{ display: !hideScrollbar && vertical.visible ? undefined : 'none' }}
        onPointerDown={(event) => handleTrackPointerDown('vertical', event.nativeEvent)}
        onPointerEnter={onScrollbarPointerEnter}
        onPointerLeave={(event) => onScrollbarPointerLeave(event.nativeEvent)}
      >
        <div
          ref={verticalThumbRef}
          className={verticalThumbClass}
          style={verticalThumbStyle}
          onPointerDown={(event) => {
            event.stopPropagation()
            startThumbDrag('vertical', event.nativeEvent)
          }}
        />
      </div>

      <div
        ref={horizontalTrackRef}
        className={horizontalTrackClass}
        style={{ display: !hideScrollbar && horizontal.visible ? undefined : 'none' }}
        onPointerDown={(event) => handleTrackPointerDown('horizontal', event.nativeEvent)}
        onPointerEnter={onScrollbarPointerEnter}
        onPointerLeave={(event) => onScrollbarPointerLeave(event.nativeEvent)}
      >
        <div
          ref={horizontalThumbRef}
          className={horizontalThumbClass}
          style={horizontalThumbStyle}
          onPointerDown={(event) => {
            event.stopPropagation()
            startThumbDrag('horizontal', event.nativeEvent)
          }}
        />
      </div>
    </div>
  )
})

export default CwDiv
