import { useMemo, useRef, type CSSProperties, type HTMLAttributes } from 'react'
import './cw-row-col.css'
import type { CwGridProps } from './types'
import { colBase, gridBase, rowBase } from './styles'
import { useGridContainerWidth } from './useGridContainerWidth'
import { useGridColBindings } from './resolveColProps'
import { buildColInlineStyle, columnsToSpan } from './layout'
import { flattenSlotNodes, gridSlotNodeKey } from './flattenSlotNodes'
import {
  resolveGridColContentAlign,
  resolveGridColFlushPaddingStyle,
} from './gridColFlush'

export interface CwGridComponentProps
  extends CwGridProps,
    Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'className'> {}

const alignClassMap = {
  top: rowBase.alignTop,
  middle: rowBase.alignMiddle,
  bottom: rowBase.alignBottom,
  stretch: rowBase.alignStretch,
} as const

const justifyClassMap = {
  start: rowBase.justifyStart,
  center: rowBase.justifyCenter,
  end: rowBase.justifyEnd,
  'space-between': rowBase.justifyBetween,
  'space-around': rowBase.justifyAround,
  'space-evenly': rowBase.justifyEvenly,
} as const

const contentAlignClassMap = {
  start: 'items-start',
  end: 'items-end',
  center: 'items-center',
} as const

export function CwGrid({
  columns = 3,
  breakpoints,
  gutter = 0,
  rowGap = 0,
  wrap = true,
  align = 'top',
  justify = 'start',
  flushStart = false,
  flushEnd = false,
  measure = true,
  texts: _texts,
  children,
  className,
  ...rest
}: CwGridComponentProps) {
  const measureRef = useRef<HTMLDivElement>(null)

  const { usesMeasuredLayout, activeColumns } = useGridContainerWidth(measureRef, {
    breakpoints,
    fallbackColumns: columns,
    measureEnabled: measure !== false,
  })

  const measuredSpan = columnsToSpan(activeColumns)

  const colBindings = useGridColBindings({
    breakpoints,
    fallbackColumns: columns,
    usesMeasuredLayout,
    measuredSpan,
  })

  const slotNodes = useMemo(() => flattenSlotNodes(children), [children])

  const flushOptions = { flushStart, flushEnd }

  const rowStyle: CSSProperties = {}
  if (gutter) rowStyle.columnGap = `${gutter}px`
  if (rowGap) rowStyle.rowGap = `${rowGap}px`

  const rowClass = [
    'cw-row',
    rowBase.root,
    wrap === false ? rowBase.nowrap : '',
    alignClassMap[align],
    justifyClassMap[justify],
    gridBase.root,
  ]
    .filter(Boolean)
    .join(' ')

  const rootClass = [
    'min-w-0 w-full',
    usesMeasuredLayout ? '' : 'overflow-x-hidden',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div {...rest} ref={measureRef} className={rootClass}>
      <div className={rowClass} style={rowStyle}>
        {slotNodes.map((slot, index) => {
          const contentAlign = resolveGridColContentAlign(
            index,
            slotNodes.length,
            activeColumns,
            flushOptions,
          )
          const flushStyle = resolveGridColFlushPaddingStyle(
            index,
            slotNodes.length,
            activeColumns,
            gutter,
            usesMeasuredLayout,
            flushOptions,
          )
          const colStyle = {
            ...buildColInlineStyle(colBindings, gutter, { columnGap: true }),
            ...(flushStyle ?? {}),
          } as CSSProperties

          return (
            <div
              key={gridSlotNodeKey(slot, index)}
              className={[colBase, contentAlign ? contentAlignClassMap[contentAlign] : '']
                .filter(Boolean)
                .join(' ')}
              style={colStyle}
            >
              {slot}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default CwGrid
