import { useMemo } from 'react'
import type { CSSProperties, HTMLAttributes, ReactNode } from 'react'
import type { CwColProps } from '@zengchaowu/ui-shared/components/CwRow/types'
import { useCwGridMeasuredLayout, useCwRowAlign, useCwRowGutter } from './keys'
import {
  buildColInlineStyle,
  buildMeasuredColInlineStyle,
  GRID_COL_BREAKPOINT_KEYS,
} from '@zengchaowu/ui-shared/components/CwRow/layout'
import { normalizeAttrStyle } from '@zengchaowu/ui-shared/components/CwRow/functions/normalizeAttrStyle'

export interface CwColComponentProps
  extends CwColProps,
    Omit<
      HTMLAttributes<HTMLDivElement>,
      'children' | 'className' | 'style' | 'content'
    > {
  /** CwGrid flush 时列内水平对齐 */
  contentAlign?: 'start' | 'end' | 'center'
  children?: ReactNode
  className?: string
  style?: CSSProperties
}

const colAlignClassMap = {
  start: 'items-start',
  end: 'items-end',
  center: 'items-center',
} as const

/**
 * 列本身是 h-full，行级 align-items 没有余量可对齐，
 * 所以垂直对齐由列内部的 flex-col justify-content 落地（top 与默认等价，不改变原布局）。
 */
const rowAlignJustifyMap: Record<string, CSSProperties['justifyContent']> = {
  top: 'flex-start',
  middle: 'center',
  bottom: 'flex-end',
}

export function CwCol({
  xs,
  sm,
  md,
  lg,
  xl,
  contentAlign,
  children,
  className,
  style,
  ...rest
}: CwColComponentProps) {
  const gutter = useCwRowGutter()
  const gridLayout = useCwGridMeasuredLayout()
  const rowAlign = useCwRowAlign()

  const colProps: CwColProps = { xs, sm, md, lg, xl }

  const hasBreakpointColProps = useMemo(
    () =>
      GRID_COL_BREAKPOINT_KEYS.some((key) => colProps[key] !== undefined),
    [colProps],
  )

  const colStyle = useMemo(() => {
    const measured = gridLayout
    // CwForm 等会按项传 xs/sm/md…；实测布局只应用「等分列」会丢掉半行/满行混排。
    // 有断点 props 时走 CSS 变量 + @container；Row 已用 column-gap，宽度须扣 gap。
    if (measured && !hasBreakpointColProps) {
      return buildMeasuredColInlineStyle(measured.columns, measured.gutter)
    }
    if (measured && hasBreakpointColProps) {
      return buildColInlineStyle(colProps, measured.gutter, { columnGap: true })
    }
    return buildColInlineStyle(colProps, gutter)
  }, [gridLayout, hasBreakpointColProps, colProps, gutter])

  const colAlignClass = contentAlign ? colAlignClassMap[contentAlign] : ''

  const mergedColStyle: CSSProperties = {
    ...(colStyle as CSSProperties),
    justifyContent: (rowAlign && rowAlignJustifyMap[rowAlign]) || 'flex-start',
    ...(normalizeAttrStyle(style) as CSSProperties),
  }

  const rootClassName = [
    'box-border flex h-full min-h-0 min-w-0 flex-col cw-col',
    colAlignClass,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div {...rest} className={rootClassName} style={mergedColStyle}>
      {children}
    </div>
  )
}

export default CwCol
