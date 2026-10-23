import {
  Fragment,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from 'react'
import type { CSSProperties, HTMLAttributes, ReactNode } from 'react'
import type { CwWrapRowProps } from './types'
import {
  findBreakpointConfig,
  getCurrentBreakpoint,
  type Breakpoint,
} from './utils/breakpoint'
import { useCwGridMeasuredLayout } from './keys'
import { buildWrapRowControlsColProps } from './functions/wrapRowControls'
import {
  flattenReactNodes,
  resolveItemsPerRowFromColProps,
  resolveMaxVisibleItems,
  slotHasContent,
} from './functions/wrapRowSlotUtils'
import CwRow from './CwRow'
import CwCol from './CwCol'

export interface CwWrapRowComponentProps
  extends CwWrapRowProps,
    Omit<
      HTMLAttributes<HTMLDivElement>,
      'children' | 'className' | 'style' | 'wrap' | 'align' | 'justify'
    > {
  children?: ReactNode
  /** Vue `#controls` 具名插槽 */
  controlsSlot?: ReactNode
  className?: string
  style?: CSSProperties
}

export interface CwWrapRowInstance {
  isChildrenCollapsed: boolean
}

export const CwWrapRow = forwardRef<
  CwWrapRowInstance,
  CwWrapRowComponentProps
>(function CwWrapRow(props, ref) {
  const {
    gutter = 0,
    wrap = true,
    align = 'top',
    justify = 'start',
    rowGap = 0,
    maxRows,
    colPros,
    texts,
    children,
    controlsSlot,
    className,
    style,
    ...rest
  } = props

  /** 首屏用窗口断点，避免强刷时先按 xs 再切到实际断点导致 controls 闪动 */
  const [currentBreakpoint, setCurrentBreakpoint] = useState<Breakpoint>(() =>
    typeof window !== 'undefined' ? getCurrentBreakpoint() : 'lg',
  )

  useEffect(() => {
    const updateBreakpoint = () => {
      setCurrentBreakpoint(getCurrentBreakpoint())
    }
    updateBreakpoint()
    window.addEventListener('resize', updateBreakpoint)
    return () => window.removeEventListener('resize', updateBreakpoint)
  }, [])

  const gridLayout = useCwGridMeasuredLayout()

  const itemsPerRow = useMemo(() => {
    const measured = gridLayout
    if (measured && measured.columns > 0) return measured.columns

    const matched = findBreakpointConfig(colPros, currentBreakpoint)
    return resolveItemsPerRowFromColProps(matched ?? colPros.xs)
  }, [gridLayout, colPros, currentBreakpoint])

  const childNodes = useMemo(() => flattenReactNodes(children), [children])
  const hasControls = slotHasContent(controlsSlot)
  const maxVisible = resolveMaxVisibleItems(maxRows, itemsPerRow, hasControls)
  const isChildrenCollapsed = childNodes.length > maxVisible
  const visibleNodes = childNodes.slice(0, maxVisible)

  useImperativeHandle(
    ref,
    () => ({
      isChildrenCollapsed,
    }),
    [isChildrenCollapsed],
  )

  return (
    <CwRow
      {...rest}
      gutter={gutter}
      wrap={wrap}
      align={align}
      justify={justify}
      rowGap={rowGap}
      texts={texts}
      className={className}
      style={style}
    >
      {visibleNodes.map((node, index) => (
        <Fragment key={index}>{node}</Fragment>
      ))}
      {hasControls ? (
        <CwCol {...buildWrapRowControlsColProps(colPros)}>
          {controlsSlot}
        </CwCol>
      ) : null}
    </CwRow>
  )
})

export default CwWrapRow
