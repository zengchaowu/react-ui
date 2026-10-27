import type { ReactNode, Ref } from 'react'
import CwDiv from '../CwDiv/CwDiv'
import type { CwDivHandle } from '../CwDiv/CwDiv'
import CwLoading from '../CwLoading/CwLoading'
import CwEmptyState from '../CwEmptyState/CwEmptyState'
import type { CwDataTableStyles } from '@zengchaowu/ui-shared/components/CwDataTable/types'
import { dataTableBodyCwDivContentClass } from '@zengchaowu/ui-shared/components/CwDataTable/styles'

export interface CwDataTableBodyPanelProps {
  bodyShellClass: string
  cwDivRootClass: string
  bodyCwDivViewportClass: string
  styles: CwDataTableStyles
  loading: boolean
  empty: boolean
  emptyText: string
  loadingText: string
  persistScrollbar?: boolean
  cwDivRef?: Ref<CwDivHandle>
  onScroll?: (event: Event) => void
  emptySlot?: ReactNode
  loadingSlot?: ReactNode
  children?: ReactNode
}

export function CwDataTableBodyPanel({
  bodyShellClass,
  cwDivRootClass,
  bodyCwDivViewportClass,
  styles,
  loading,
  empty,
  emptyText,
  loadingText,
  persistScrollbar,
  cwDivRef,
  onScroll,
  emptySlot,
  loadingSlot,
  children,
}: CwDataTableBodyPanelProps) {
  return (
    <div className={bodyShellClass}>
      <CwDiv
        ref={cwDivRef}
        className={cwDivRootClass}
        viewportClass={bodyCwDivViewportClass}
        contentClass={dataTableBodyCwDivContentClass}
        persistScrollbar={persistScrollbar}
        onScroll={(event) => onScroll?.(event.nativeEvent)}
      >
        {children}
      </CwDiv>
      {!loading && empty ? (
        <div className={styles.empty}>
          {emptySlot ?? (
            <CwEmptyState size="small" text={<span>{emptyText}</span>} />
          )}
        </div>
      ) : null}
      {loading ? (
        <div className={styles.loading}>
          {loadingSlot ?? (
            <div className={styles.loadingContent}>
              <CwLoading type="spinner" size="small" />
              <span className={styles.loadingText}>{loadingText}</span>
            </div>
          )}
        </div>
      ) : null}
    </div>
  )
}

export default CwDataTableBodyPanel
