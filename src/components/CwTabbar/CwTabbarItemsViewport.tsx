import {
  forwardRef,
  useImperativeHandle,
  useRef,
  type ReactNode,
} from 'react'
import CwDiv from '../CwDiv/CwDiv'
import type { CwDivHandle, CwDivProps } from '../CwDiv'

export interface CwTabbarItemsViewportProps {
  scroll?: boolean
  hideScrollbar?: CwDivProps['hideScrollbar']
  persistScrollbar?: CwDivProps['persistScrollbar']
  cwDivRootClass?: string
  cwDivViewportClass?: string
  cwDivContentClass?: string
  children?: ReactNode
}

export interface CwTabbarItemsViewportHandle {
  cwDiv: CwDivHandle | null
  remeasure: () => void
}

export const CwTabbarItemsViewport = forwardRef<
  CwTabbarItemsViewportHandle,
  CwTabbarItemsViewportProps
>(function CwTabbarItemsViewport(
  {
    scroll = false,
    hideScrollbar = true,
    persistScrollbar = false,
    cwDivRootClass = '',
    cwDivViewportClass = '',
    cwDivContentClass = '',
    children,
  },
  ref,
) {
  const cwDivRef = useRef<CwDivHandle | null>(null)

  useImperativeHandle(
    ref,
    () => ({
      get cwDiv() {
        return cwDivRef.current
      },
      remeasure: () => cwDivRef.current?.remeasure?.(),
    }),
    [],
  )

  if (!scroll) {
    return <>{children}</>
  }

  return (
    <CwDiv
      ref={cwDivRef}
      hideScrollbar={hideScrollbar}
      persistScrollbar={persistScrollbar}
      className={cwDivRootClass}
      viewportClass={cwDivViewportClass}
      contentClass={cwDivContentClass}
    >
      {children}
    </CwDiv>
  )
})

export default CwTabbarItemsViewport
