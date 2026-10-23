import { useMemo } from 'react'
import type { CSSProperties, HTMLAttributes, ReactNode } from 'react'
import type { CwColProps } from './types'
import { useCwGridMeasuredLayout, useCwRowGutter } from './keys'
import {
  buildColInlineStyle,
  buildMeasuredColInlineStyle,
  GRID_COL_BREAKPOINT_KEYS,
} from './layout'
import { normalizeAttrStyle } from './functions/normalizeAttrStyle'

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
