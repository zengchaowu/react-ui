import { useMemo } from 'react'
import type {
  CSSProperties,
  HTMLAttributes,
  PointerEvent as ReactPointerEvent,
} from 'react'
import CwWindowTitleBarControls from './CwWindowTitleBarControls'
import { isCwWindowTitleBarDragTarget } from '@zengchaowu/ui-shared/components/CwWindowTitleBar/dragTarget'
import {
  appearanceRootClass,
  backgroundRootClass,
  titleBarBase,
  titleSizeClass,
} from '@zengchaowu/ui-shared/components/CwWindowTitleBar/styles'
import { defaultTexts } from '@zengchaowu/ui-shared/components/CwWindowTitleBar/texts'
import type { CwWindowTitleBarProps } from './types'
import type { CwWindowTitleBarTexts } from '@zengchaowu/ui-shared/components/CwWindowTitleBar/types'

export interface CwWindowTitleBarComponentProps
  extends CwWindowTitleBarProps,
    Omit<HTMLAttributes<HTMLDivElement>, 'title' | 'onDoubleClick'> {}

export function CwWindowTitleBar({
  mode = 'mac',
  title = '',
  showTitle = false,
  closable = true,
  minimizable = true,
  maximizable = true,
  maximized = false,
  appearance = 'default',
  background = 'container',
  titleSize = 'md',
  texts: textsProp,
  startSlot,
  endSlot,
  onClose,
  onMinimize,
  onMaximize,
  onDoubleClick,
  onDragPointerDown,
  className,
  style,
  ...rest
}: CwWindowTitleBarComponentProps) {
  const texts = useMemo<CwWindowTitleBarTexts>(
    () => ({ ...defaultTexts, ...(textsProp ?? {}) }),
    [textsProp],
  )

  const rootClassList = [
    titleBarBase.root,
    backgroundRootClass[background || 'container'],
    appearanceRootClass[appearance || 'default'],
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const rootStyle = {
    '--dot-gap': mode === 'mac' ? '0.5rem' : '0px',
    ...style,
  } as CSSProperties

  const titleClassList = [titleBarBase.title, titleSizeClass[titleSize || 'md']].join(' ')

  // 始终保留拖拽区：Windows 在存在 #start 时原先会整段无法拖动
  const showDragRegion = true

  const dragRegionClass =
    mode === 'windows'
      ? titleBarBase.winDragRegion
      : maximized
        ? titleBarBase.dragRegionMaximized
        : titleBarBase.dragRegion

  const handleDragPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return
    if (!isCwWindowTitleBarDragTarget(event.target)) return
    onDragPointerDown?.(event)
  }

  const handleDoubleClick = () => {
    onDoubleClick?.()
  }

  return (
    <div {...rest} className={rootClassList} style={rootStyle}>
      {mode === 'mac' ? (
        <CwWindowTitleBarControls
          mode={mode}
          closable={closable}
          minimizable={minimizable}
          maximizable={maximizable}
          maximized={maximized}
          texts={texts}
          macGap="var(--dot-gap)"
          onClose={onClose}
          onMinimize={onMinimize}
          onMaximize={onMaximize}
        />
      ) : null}

      {startSlot != null ? (
        <div
          className={titleBarBase.startRegion}
          onPointerDown={handleDragPointerDown}
          onDoubleClick={handleDoubleClick}
        >
          {startSlot}
        </div>
      ) : null}

      {showDragRegion ? (
        <div
          className={dragRegionClass}
          onPointerDown={handleDragPointerDown}
          onDoubleClick={handleDoubleClick}
        />
      ) : null}

      {endSlot != null ? (
        <div className={titleBarBase.endRegion}>{endSlot}</div>
      ) : null}

      {mode === 'windows' ? (
        <CwWindowTitleBarControls
          mode={mode}
          closable={closable}
          minimizable={minimizable}
          maximizable={maximizable}
          maximized={maximized}
          texts={texts}
          onClose={onClose}
          onMinimize={onMinimize}
          onMaximize={onMaximize}
        />
      ) : null}

      {showTitle && title ? (
        <span className={titleClassList}>{title}</span>
      ) : null}
    </div>
  )
}

export default CwWindowTitleBar
