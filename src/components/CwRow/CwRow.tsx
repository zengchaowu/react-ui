import { useMemo } from 'react'
import type { CSSProperties, HTMLAttributes, ReactNode } from 'react'
import './cw-row-col.css'
import type { CwRowProps } from './types'
import { rowBase } from './styles'
import { CwRowGutterContext, useCwGridMeasuredLayout } from './keys'

export interface CwRowComponentProps
  extends CwRowProps,
    Omit<
      HTMLAttributes<HTMLDivElement>,
      'children' | 'className' | 'style' | 'wrap' | 'align' | 'justify'
    > {
  children?: ReactNode
  className?: string
  style?: CSSProperties
}

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

export function CwRow({
  gutter = 0,
  wrap = true,
  align = 'top',
  justify = 'start',
  rowGap = 0,
  texts: _texts,
  children,
  className,
  style,
  ...rest
}: CwRowComponentProps) {
  const gridLayout = useCwGridMeasuredLayout()

  const rowStyle = useMemo<CSSProperties>(() => {
    const next: CSSProperties = {}

    if (gridLayout) {
      if (gutter) next.columnGap = `${gutter}px`
    } else if (gutter) {
      const half = gutter / 2
      next.marginLeft = `-${half}px`
      next.marginRight = `-${half}px`
    }

    if (rowGap) {
      next.rowGap = `${rowGap}px`
    }

    return next
  }, [gridLayout, gutter, rowGap])

  const rootClassName = [
    'cw-row',
    rowBase.root,
    wrap === false ? rowBase.nowrap : '',
    alignClassMap[align],
    justifyClassMap[justify],
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <CwRowGutterContext.Provider value={gutter}>
      <div
        {...rest}
        className={rootClassName}
        style={{ ...rowStyle, ...style }}
      >
        {children}
      </div>
    </CwRowGutterContext.Provider>
  )
}

export default CwRow
