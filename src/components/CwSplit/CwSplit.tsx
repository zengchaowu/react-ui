import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
} from 'react'
import type {
  CwSplitDirection,
  CwSplitProps,
  CwSplitStyles,
  CwSplitTexts,
} from './types'
import { resolveSplitStyles } from './styles'
import { defaultTexts } from './texts'

export interface CwSplitComponentProps
  extends CwSplitProps,
    Omit<
      HTMLAttributes<HTMLDivElement>,
      'children' | 'className' | 'onDragStart' | 'onDragEnd'
    > {
  className?: string
}

type CssLengthUnit = 'px' | 'rem' | '%'

function isRowSplit(direction: CwSplitDirection): boolean {
  return direction === 'horizontal'
}

function parseCssLengthUnit(value: string): CssLengthUnit {
  const s = value.trim()
  if (/%\s*$/.test(s)) return '%'
  if (/rem\s*$/i.test(s)) return 'rem'
  return 'px'
}

/** 布局主轴占位 0；热区靠 padding 向外扩，负 margin 抵消，避免纵向被行高/min-content 撑出一条缝 */
function splitDividerHitBox(
  direction: CwSplitDirection,
  hitPx: number,
): CSSProperties {
  const inset = `${hitPx / 2}px`
  if (isRowSplit(direction)) {
    return {
      width: '0',
      height: '100%',
      paddingLeft: inset,
      paddingRight: inset,
      marginLeft: `-${inset}`,
      marginRight: `-${inset}`,
    }
  }
  return {
    height: '0',
    width: '100%',
    paddingTop: inset,
    paddingBottom: inset,
    marginTop: `-${inset}`,
    marginBottom: `-${inset}`,
  }
}

/** 分隔条 flex 净占位：热区用负 margin 完全抵消，钳制时按 0 计（勿用 offsetWidth，那是热区而非净占位） */
function getDividerThicknessPx(): number {
  return 0
}

function getClientPos(
  event: MouseEvent | TouchEvent,
  direction: CwSplitDirection,
): number {
  if (direction === 'horizontal') {
    return ('touches' in event ? event.touches[0]?.clientX : event.clientX) ?? 0
  }
  return ('touches' in event ? event.touches[0]?.clientY : event.clientY) ?? 0
}

export function CwSplit({
  direction = 'horizontal',
  firstSize = 0.5,
  firstMinSize = 0,
  firstMaxSize,
  secondMinSize = 0,
  secondMaxSize: _secondMaxSize,
  texts: textsProp,
  dividerHitPx = 11,
  firstClass = '',
  secondClass = '',
  dividerClass = '',
  firstSlot,
  secondSlot,
  onFirstSizeChange,
  onDragStart,
  onDragEnd,
  className,
  ...rest
}: CwSplitComponentProps) {
  const styles: CwSplitStyles = resolveSplitStyles(direction)
  const texts: CwSplitTexts = { ...defaultTexts, ...(textsProp ?? {}) }

  const rootRef = useRef<HTMLDivElement | null>(null)
  const firstRef = useRef<HTMLDivElement | null>(null)

  const [currentFirstSize, setCurrentFirstSize] = useState<number | string>(firstSize)
  const [isDragging, setIsDragging] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const isDraggingInternalRef = useRef(false)
  const moveListenerRef = useRef<((e: MouseEvent | TouchEvent) => void) | null>(null)
  const endDragListenerRef = useRef<(() => void) | null>(null)

  const initialFirstSizeRef = useRef<number | string>(firstSize)
  const onFirstSizeChangeRef = useRef(onFirstSizeChange)
  onFirstSizeChangeRef.current = onFirstSizeChange
  const onDragStartRef = useRef(onDragStart)
  onDragStartRef.current = onDragStart
  const onDragEndRef = useRef(onDragEnd)
  onDragEndRef.current = onDragEnd

  // 监听 props.firstSize 变化（受控）
  useEffect(() => {
    setCurrentFirstSize(firstSize)
  }, [firstSize])

  function getContainerSize(): number {
    if (!rootRef.current) return 0
    return isRowSplit(direction)
      ? rootRef.current.offsetWidth
      : rootRef.current.offsetHeight
  }

  function getRootFontSizePx(): number {
    if (!rootRef.current) return 16
    return parseFloat(getComputedStyle(rootRef.current).fontSize) || 16
  }

  function getFirstPanePxSize(): number {
    if (!firstRef.current) return 0
    return isRowSplit(direction)
      ? firstRef.current.offsetWidth
      : firstRef.current.offsetHeight
  }

  /** rem / px / % 等长度换算为容器主轴上的像素 */
  function cssLengthToPx(
    v: number | string | undefined,
    containerSize: number,
  ): number {
    if (v === undefined) return 0
    if (typeof v === 'number') return v * containerSize
    const s = String(v).trim()
    if (s.includes('%')) {
      return (parseFloat(s) / 100) * containerSize
    }
    if (/rem\s*$/i.test(s)) {
      return (parseFloat(s) || 0) * getRootFontSizePx()
    }
    return parseFloat(s) || 0
  }

  function formatFirstSizeFromPx(
    px: number,
    unit: CssLengthUnit | null,
    containerSize: number,
  ): number | string {
    if (unit === 'rem') {
      const font = getRootFontSizePx()
      return `${px / font}rem`
    }
    if (unit === '%') {
      return containerSize > 0 ? `${(px / containerSize) * 100}%` : '50%'
    }
    return `${px}px`
  }

  /** 与 props 约定一致：数字为「占容器的比例」；带 % 为百分比；rem/px 按实际像素换算为比例 */
  function sizePropToRatio(
    v: number | string | undefined,
    containerSize: number,
    fallback: number,
  ): number {
    if (v === undefined) return fallback
    if (containerSize <= 0) return fallback
    if (typeof v === 'number') return v
    const s = String(v)
    if (s.includes('%')) {
      return parseFloat(s) / 100
    }
    return cssLengthToPx(v, containerSize) / containerSize
  }

  function getFirstMinRatio(c: number): number {
    return sizePropToRatio(firstMinSize, c, 0)
  }

  function getFirstMaxRatio(c: number): number {
    if (c <= 0) return 1
    if (firstMaxSize === undefined) return 1
    if (typeof firstMaxSize === 'number') {
      return firstMaxSize
    }
    return cssLengthToPx(firstMaxSize, c) / c
  }

  function getSecondMinRatio(c: number): number {
    return sizePropToRatio(secondMinSize, c, 0)
  }

  // 更新大小
  function updateSize(newSize: number | string): void {
    const c = getContainerSize()
    const divT = getDividerThicknessPx()
    const minFirstRatio = getFirstMinRatio(c)
    const maxFromFirst = getFirstMaxRatio(c)
    const secondMinRatio = getSecondMinRatio(c)
    // 为第二个面板与分隔条留空间时，第一栏比例的上限
    const pairMaxRatio = c > 0 ? (c - divT - secondMinRatio * c) / c : 1

    let clampedSize: number | string = newSize

    if (typeof newSize === 'number') {
      // 第一栏为比例 0~1；须同时满足 first 的 max 与右栏 second-min
      const maxSize = Math.min(maxFromFirst, Math.max(minFirstRatio, pairMaxRatio))
      clampedSize = Math.min(maxSize, Math.max(minFirstRatio, newSize))
    } else {
      const raw = String(newSize).trim()
      if (c > 0) {
        const unit = parseCssLengthUnit(raw)
        const newPx = cssLengthToPx(raw, c)
        const minPx = minFirstRatio * c
        const maxFromFirstPx = maxFromFirst * c
        const maxFromPairPx = c - divT - secondMinRatio * c
        const maxCandidate = Math.min(maxFromFirstPx, maxFromPairPx)
        const maxPx = maxCandidate < minPx ? minPx : maxCandidate
        const outPx = Math.min(maxPx, Math.max(minPx, newPx))
        clampedSize = formatFirstSizeFromPx(outPx, unit, c)
      }
    }

    setCurrentFirstSize(clampedSize)
    onFirstSizeChangeRef.current?.(clampedSize)
  }

  const finishDrag = useCallback(() => {
    if (!isDraggingInternalRef.current) return
    isDraggingInternalRef.current = false
    setIsDragging(false)
    setIsHovered(false)
    onDragEndRef.current?.()
  }, [])

  const safeRemove = useCallback(() => {
    const moveListener = moveListenerRef.current
    const endDragListener = endDragListenerRef.current
    if (moveListener) {
      window.removeEventListener('mousemove', moveListener)
      window.removeEventListener('touchmove', moveListener)
    }
    if (endDragListener) {
      window.removeEventListener('mouseup', endDragListener)
      window.removeEventListener('touchend', endDragListener)
      window.removeEventListener('touchcancel', endDragListener)
      window.removeEventListener('blur', endDragListener)
    }
    moveListenerRef.current = null
    endDragListenerRef.current = null
  }, [])

  function handleMouseDown(e: MouseEvent | TouchEvent): void {
    const container = rootRef.current
    if (!container) return

    isDraggingInternalRef.current = true
    setIsDragging(true)
    onDragStartRef.current?.()

    const startClientPos = getClientPos(e, direction)

    const containerRect = container.getBoundingClientRect()
    const containerSize = isRowSplit(direction)
      ? containerRect.width
      : containerRect.height

    const initialFirstSize = currentFirstSize
    const initialIsRatio = typeof initialFirstSize === 'number'
    const initialLengthUnit = initialIsRatio
      ? null
      : parseCssLengthUnit(String(initialFirstSize))
    const startFirstPx = initialIsRatio
      ? (initialFirstSize as number) * containerSize
      : getFirstPanePxSize()

    const moveListener = (event: MouseEvent | TouchEvent) => {
      if (!isDraggingInternalRef.current) return

      const delta = getClientPos(event, direction) - startClientPos
      const newPx = startFirstPx + delta

      if (initialIsRatio) {
        updateSize((initialFirstSize as number) + delta / containerSize)
        return
      }

      updateSize(formatFirstSizeFromPx(newPx, initialLengthUnit, containerSize))
    }

    const endDragListener = () => {
      finishDrag()
      safeRemove()
    }

    moveListenerRef.current = moveListener
    endDragListenerRef.current = endDragListener

    window.addEventListener('mousemove', moveListener)
    window.addEventListener('mouseup', endDragListener)
    window.addEventListener('touchmove', moveListener, { passive: false })
    window.addEventListener('touchend', endDragListener)
    window.addEventListener('touchcancel', endDragListener)
    window.addEventListener('blur', endDragListener)
  }

  // 组件卸载时清理事件监听器
  useEffect(() => {
    return () => {
      finishDrag()
      safeRemove()
    }
  }, [finishDrag, safeRemove])

  // Hover 处理（拖拽中离开分隔条仍须清 hover，否则在容器外松手后指示条常亮）
  const handleMouseEnter = () => {
    if (!isDraggingInternalRef.current) {
      setIsHovered(true)
    }
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
  }

  // 双击复位到挂载时的初始尺寸
  const handleDoubleClick = () => {
    updateSize(initialFirstSizeRef.current)
  }

  // 第一个面板样式
  const firstStyle: CSSProperties = {}
  if (typeof currentFirstSize === 'number') {
    // 比例值：转换为百分比
    const percent = Math.min(100, Math.max(0, currentFirstSize * 100))
    firstStyle[isRowSplit(direction) ? 'width' : 'height'] = `${percent}%`
  } else {
    // 固定像素值
    firstStyle[isRowSplit(direction) ? 'width' : 'height'] = currentFirstSize
  }

  // 分隔条：宽热区叠在两栏接缝上（负 margin 使 flex 净占位 0），避免留透明缝透出父级背景；视觉线仍由内层 handle 画
  const hit = Math.max(3, Math.round(dividerHitPx ?? 11))
  const dividerStyle: CSSProperties = {
    backgroundColor: 'transparent',
    boxSizing: 'content-box',
    lineHeight: 0,
    fontSize: 0,
    overflow: 'visible',
    ...splitDividerHitBox(direction, hit),
  }

  // 发丝中心线：交叉轴贴满、主轴 50% 对齐，左右与上下镜像，避免 top+bottom 同时 0 把横线撑满热区
  const dividerHandleClass = [
    styles.dividerHandle,
    isHovered || isDragging
      ? styles.dividerHandleLineActive
      : styles.dividerHandleLine,
  ]
    .filter(Boolean)
    .join(' ')

  const row = isRowSplit(direction)
  const dividerHandleStyle: CSSProperties = {
    backgroundColor: 'transparent',
    boxSizing: 'content-box',
    ...(row
      ? { top: '0', bottom: '0', left: '50%', width: '0', height: 'auto' }
      : { left: '0', right: '0', top: '50%', height: '0', width: 'auto' }),
  }

  const rootClass = [styles.root, className].filter(Boolean).join(' ')
  const firstClassList = [styles.first, firstClass].filter(Boolean).join(' ')
  const secondClassList = [styles.second, secondClass].filter(Boolean).join(' ')
  const dividerClassList = [
    styles.divider,
    dividerClass,
    isDragging ? styles.dividerDragging : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div {...rest} ref={rootRef} className={rootClass}>
      {/* 第一个面板 */}
      <div ref={firstRef} className={firstClassList} style={firstStyle}>
        {firstSlot}
      </div>

      {/* 分隔条 */}
      <div
        className={dividerClassList}
        style={dividerStyle}
        role="separator"
        aria-label={texts.dividerLabel}
        aria-orientation={direction}
        onMouseDown={(event) => {
          event.preventDefault()
          handleMouseDown(event.nativeEvent)
        }}
        onTouchStart={(event) => handleMouseDown(event.nativeEvent)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onDoubleClick={handleDoubleClick}
      >
        <div className={dividerHandleClass} style={dividerHandleStyle} />
      </div>

      {/* 第二个面板 */}
      <div className={secondClassList}>{secondSlot}</div>
    </div>
  )
}

export default CwSplit
