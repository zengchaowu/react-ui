import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import type {
  CSSProperties,
  FocusEvent as ReactFocusEvent,
  HTMLAttributes,
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
} from 'react'
import type {
  CwDataTableColumn,
  CwDataTableEmits,
  CwDataTableExternalRowScope,
  CwDataTableHandle,
  CwDataTableProps,
  CwDataTableSlots,
  CwDataTableSortState,
  CwDataTableStyles,
} from './types'
import {
  getDataTableBodyCwDivViewportClass,
  getDataTableContentBodyViewportClass,
  resolveDataTableStyles,
} from './styles'
import { defaultTexts } from './texts'
import { useContainerSize } from '../CwVirtualScroll/hooks/useContainerSize'
import CwDiv from '../CwDiv/CwDiv'
import type { CwDivHandle } from '../CwDiv/CwDiv'
import { resolveCwDivViewport } from '../CwDiv/resolveCwDivViewport'
import CwIcon from '../CwIcon/CwIcon'
import CwDataTableHeaderRenderer from './CwDataTableHeaderRenderer'
import CwDataTableBodyRows from './CwDataTableBodyRows'
import CwDataTableBodyPanel from './CwDataTableBodyPanel'
import { useVirtualScroll } from './hooks/useVirtualScroll'
import { useTreeRows } from './hooks/useTreeRows'
import { useScrollSync } from './hooks/useScrollSync'
import { useTableEdgeBorders } from './hooks/useTableEdgeBorders'
import { useColumnWidths } from './hooks/useColumnWidths'
import { useColumnResize } from './hooks/useColumnResize'
import { useColumnSelection } from './hooks/useColumnSelection'
import { useBrowserFocusVisible } from '../../hooks/useBrowserFocusVisible'
import {
  calculateColumnStyle,
  calculateHeaderProps,
  calculateNextSortOrder,
  computeLeftoverShares,
  computeVisibleColumns,
  fixedSideHasWidth,
  getTreeRowMeta,
  isSortedAsc,
  isSortedDesc,
  mergeColumnStyleTransparentLateralBorders,
  mergeColumnStyleTransparentRight,
  resizeHandleId as toResizeHandleId,
  stripFixedBodyFirstBorderClasses,
} from './functions'

export interface CwDataTableComponentProps
  extends CwDataTableProps,
    CwDataTableEmits,
    CwDataTableSlots,
    Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'className' | 'onScroll'> {
  className?: string
}



const OVERFLOW_EPSILON = 1





export const CwDataTable = forwardRef<CwDataTableHandle, CwDataTableComponentProps>(
  function CwDataTable(props, ref) {
    const {
      config,
      modelValue,
      collapsibleBody = false,
      loading = false,
      lifecycle,
      appearance = 'default',
      texts: textsProp,
      bodyExpanded: bodyExpandedProp,
      expandedKeys: expandedKeysProp,
      onUpdateBodyExpanded,
      onUpdateModelValue: _onUpdateModelValue,
      onUpdateSort,
      onSortChange,
      onColumnResizing,
      onColumnResize,
      onScroll,
      onUpdateColumnSelect,
      onColumnSelectChange,
      onUpdateExpandedKeys,
      onTreeExpandChange,
      externalRowSlot,
      headerOverlaySlot,
      bodyOverlaySlot,
      emptySlot,
      loadingSlot,
      className,
      ...rest
    } = props

    const columns = config.columns
    const showHeader = config.showHeader !== false
    const fixedHeader = config.fixedHeader ?? false
    const fixedLeftColumns = config.fixedLeftColumns ?? 0
    const fixedRightColumns = config.fixedRightColumns ?? 0
    const rowHeight = config.rowHeight ?? 50
    const rowHeightKey = config.rowHeightKey
    const virtualScroll = config.virtualScroll ?? false
    const virtualBuffer = config.virtualBuffer ?? 3
    const resizable = config.resizable !== false
    const showOverflowTooltip = config.showOverflowTooltip !== false
    const defaultSortable = config.sort?.defaultSortable ?? false
    const sortState = config.sort?.state
    const rowKeyField = config.rowKey
    const columnSelectConfig = config.columnSelect
    const columnSelectEnabled = columnSelectConfig?.enabled ?? false
    const columnSelectRequired = columnSelectConfig?.required ?? false
    const syncWidthsFromBody = config.syncColumnWidthsFromBody !== false
    const stretchFitColumnsToContainer = config.stretchFitColumnsToContainer === true
    const bodyLayoutFill = (config.bodyLayout ?? 'fill') === 'fill'

    const styles = useMemo<CwDataTableStyles>(
      () =>
        resolveDataTableStyles(appearance ?? 'default', {
          borderless: config.borderless,
          plainHeader: config.plainHeader,
          bodyLayout: config.bodyLayout,
        }),
      [appearance, config.borderless, config.plainHeader, config.bodyLayout],
    )

    const texts = useMemo(
      () => ({ ...defaultTexts, ...(textsProp ?? {}) }),
      [textsProp],
    )

    const headerRef = useRef<HTMLDivElement | null>(null)
    const externalRowRef = useRef<HTMLDivElement | null>(null)
    const cwDivHandleRef = useRef<CwDivHandle | null>(null)
    const bodyElRef = useRef<HTMLElement | null>(null)

    const [cwDivHandle, setCwDivHandle] = useState<CwDivHandle | null>(null)
    const [bodyEl, setBodyEl] = useState<HTMLElement | null>(null)

    const attachCwDiv = useCallback((handle: CwDivHandle | null) => {
      cwDivHandleRef.current = handle
      setCwDivHandle(handle)
    }, [])

    useLayoutEffect(() => {
      const viewport = resolveCwDivViewport(cwDivHandle)
      bodyElRef.current = viewport
      setBodyEl(viewport)
      cwDivHandle?.remeasure()
    }, [cwDivHandle])

    // 树形表格
    const {
      treeEnabled,
      treeIndentSize,
      flatRows: displayedRows,
      isIndentColumn,
      toggleTreeExpand,
    } = useTreeRows({
      tree: config.tree,
      modelValue,
      columns,
      rowKeyField,
      expandedKeys: expandedKeysProp,
      onUpdateExpandedKeys,
      onTreeExpandChange,
    })

    // 可见列
    const visibleColumns = useMemo(
      () => computeVisibleColumns(columns, fixedLeftColumns, fixedRightColumns),
      [columns, fixedLeftColumns, fixedRightColumns],
    )
    const visibleColumnsRef = useRef(visibleColumns)
    visibleColumnsRef.current = visibleColumns

    const { containerHeight } = useContainerSize(bodyEl)

    // 列宽管理
    const isResizingRef = useRef(false)
    const {
      columnWidths,
      setColumnWidths,
      columnWidthsRef,
      expandFillColumns,
      layoutContainerWidth,
      scrollbarWidth,
      flushExpandFillUpdate,
      runSyncColumnWidths,
      bodyScrollMetrics,
    } = useColumnWidths({
      bodyEl,
      bodyElRef,
      cwDivHandleRef,
      headerRef,
      visibleColumns,
      visibleColumnsRef,
      displayedRowCount: displayedRows.length,
      loading,
      modelValue,
      syncWidthsFromBody,
      stretchFitColumnsToContainer,
      defaultExpandFillColumns: config.defaultExpandFillColumns === true,
      isResizingRef,
      containerHeight,
    })

    const tableStyles = useMemo<CwDataTableStyles>(
      () => ({
        ...styles,
        scrollContent: expandFillColumns
          ? styles.scrollContentFitContainer
          : styles.scrollContent,
      }),
      [styles, expandFillColumns],
    )

    const headerScrollClass = useMemo(
      () =>
        expandFillColumns
          ? styles.header.replace(/\boverflow-x-auto\b/g, 'overflow-x-hidden')
          : styles.header,
      [styles, expandFillColumns],
    )

    const bodyShellClass = bodyLayoutFill
      ? `${styles.body} flex min-h-0 flex-1 flex-col`
      : `${styles.body} flex flex-col`
    const cwDivRootClass = bodyLayoutFill
      ? `${styles.body} w-full min-h-0 flex-1`
      : 'w-full shrink-0'
    const bodyCwDivViewportClass = bodyLayoutFill
      ? getDataTableBodyCwDivViewportClass(expandFillColumns)
      : getDataTableContentBodyViewportClass(expandFillColumns)

    // 滚动同步
    const {
      scrollTop,
      scrollLeft,
      handleHeaderScroll,
      handleBodyScroll,
      handleExternalRowScroll,
    } = useScrollSync({ headerRef, externalRowRef, bodyElRef, onScroll })





    const headerStyle = useMemo<CSSProperties>(
      () => (scrollbarWidth > 0 ? { paddingRight: `${scrollbarWidth}px` } : {}),
      [scrollbarWidth],
    )



    // 边缘线
    const { omitLastRowBottomBorder, omitLastColumnRightBorder } = useTableEdgeBorders({
      bodyEl,
      bodyElRef,
      displayedRowCount: displayedRows.length,
      columnWidths,
      containerHeight,
      loading,
      virtualScroll,
      scrollLeft,
    })

    // 虚拟滚动
    const { renderRows, offsetTop, offsetBottom } = useVirtualScroll({
      displayedRows,
      virtualScroll,
      rowHeight,
      containerHeight,
      scrollTop,
      virtualBuffer,
      rowKey: rowKeyField,
      rowHeightKey,
    })

    // 列宽调整
    const {
      activeResizeHandleId,
      canShowResizeHandle,
      onResizeHandlePointerDown,
      handleResizeMouseEnter,
      handleResizeMouseLeave,
    } = useColumnResize({
      resizable,
      headerRef,
      bodyElRef,
      visibleColumnsRef,
      columnWidthsRef,
      setColumnWidths,
      isResizingRef,
      flushExpandFillUpdate,
      onColumnResizing,
      onColumnResize,
    })



    const leftFixedOverlaps =
      fixedSideHasWidth(visibleColumns, columnWidths, 'left') && scrollLeft > 0
    const rightFixedOverlaps = (() => {
      if (!fixedSideHasWidth(visibleColumns, columnWidths, 'right')) return false
      const overflow = bodyScrollMetrics.scrollWidth - bodyScrollMetrics.clientWidth
      if (overflow <= OVERFLOW_EPSILON) return false
      return scrollLeft < overflow - OVERFLOW_EPSILON
    })()

    // 排序
    const handleSort = useCallback(
      (column: CwDataTableColumn) => {
        if (column.sortable === false && !defaultSortable) return
        const nextOrder = calculateNextSortOrder(
          sortState?.key,
          sortState?.order,
          column.key,
        )
        const nextSortState: CwDataTableSortState | undefined = nextOrder
          ? { key: column.key, order: nextOrder }
          : undefined

        onUpdateSort?.({
          ...(config.sort ?? {}),
          state: nextSortState,
        })
        onSortChange?.(nextSortState)
      },
      [defaultSortable, sortState, config.sort, onUpdateSort, onSortChange],
    )

    const isColumnSortedAscFn = (column: CwDataTableColumn) => isSortedAsc(column, sortState)
    const isColumnSortedDescFn = (column: CwDataTableColumn) => isSortedDesc(column, sortState)

    // 排序按钮键盘
    const { isFocusVisible: isSortButtonFocusVisible, handleFocus, handleBlur } =
      useBrowserFocusVisible()
    const tabindex = 0

    const handleSortButtonFocus = (_event: ReactFocusEvent<HTMLDivElement>) => {
      handleFocus()
    }
    const handleSortButtonBlur = () => {
      handleBlur()
    }
    const handleSortButtonKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        const column = visibleColumns.find((c) => c.sortable !== false)
        if (column) handleSort(column)
      }
    }

    // 列选中
    const {
      selectedColumnKey,
      isColumnSelected,
      handleColumnSelect,
      hoveredColumnKey,
      isColumnHovered,
      handleColumnMouseEnter,
      handleColumnMouseLeave,
      getBodyCellClassList,
      getHeaderCellClassList,
    } = useColumnSelection({
      visibleColumns,
      styles,
      columnSelect: columnSelectConfig,
      columnSelectEnabled,
      columnSelectRequired,
      resizable,
      bodyElRef,
      headerRef,
      columnWidths,
      leftFixedOverlaps,
      rightFixedOverlaps,
      omitLastColumnRightBorder,
      onUpdateColumnSelect,
      onColumnSelectChange,
    })

    // 列样式
    const leftoverShares = useMemo(
      () => computeLeftoverShares(visibleColumns, columnWidths, layoutContainerWidth),
      [visibleColumns, columnWidths, layoutContainerWidth],
    )

    const getColumnStyle = useCallback(
      (column: CwDataTableColumn) =>
        calculateColumnStyle(column, columnWidths, visibleColumns, {
          expandFillColumns,
          leftoverShares,
        }),
      [columnWidths, visibleColumns, expandFillColumns, leftoverShares],
    )

    // external-row 插槽辅助
    const getExternalRowColumnStyle = useCallback(
      (column: CwDataTableColumn) => mergeColumnStyleTransparentRight(getColumnStyle(column)),
      [getColumnStyle],
    )
    const getExternalCellStyle = useCallback(
      (column: CwDataTableColumn) =>
        mergeColumnStyleTransparentLateralBorders(getColumnStyle(column)),
      [getColumnStyle],
    )
    const getExternalRowBodyCellClasses = useCallback(
      (column: CwDataTableColumn) => {
        void hoveredColumnKey
        void selectedColumnKey
        return stripFixedBodyFirstBorderClasses(getBodyCellClassList(column))
      },
      [getBodyCellClassList, hoveredColumnKey, selectedColumnKey],
    )

    // 折叠表体
    const [bodyExpandedState, setBodyExpandedState] = useState(bodyExpandedProp ?? true)
    useEffect(() => {
      if (bodyExpandedProp !== undefined) setBodyExpandedState(bodyExpandedProp)
    }, [bodyExpandedProp])

    const collapsibleEffective = collapsibleBody && showHeader

    const setBodyExpanded = useCallback(
      (next: boolean) => {
        setBodyExpandedState(next)
        onUpdateBodyExpanded?.(next)
      },
      [onUpdateBodyExpanded],
    )

    const handleCollapsibleHeaderClick = (event: ReactMouseEvent<HTMLDivElement>) => {
      if (!collapsibleEffective) return
      const el = event.target as HTMLElement | null
      if (!el) return
      if (el.closest('a[href], button, [role="button"]')) return
      setBodyExpanded(!bodyExpandedState)
    }

    const handleCollapsibleHeaderKeydown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
      if (!collapsibleEffective) return
      if (event.target !== event.currentTarget) return
      if (event.key !== 'Enter' && event.key !== ' ') return
      event.preventDefault()
      setBodyExpanded(!bodyExpandedState)
    }

    const onHeaderCellSurfaceClick = (
      column: CwDataTableColumn,
      event: ReactMouseEvent<HTMLDivElement>,
    ) => {
      if (columnSelectEnabled) {
        event.stopPropagation()
        handleColumnSelect(column)
      }
    }

    const getHeaderProps = (column: CwDataTableColumn): Record<string, unknown> =>
      calculateHeaderProps(
        column,
        sortState,
        handleSort,
        columnSelectEnabled && isColumnSelected(column),
        columnSelectEnabled && isColumnHovered(column),
      )

    const renderHeaderContent = (column: CwDataTableColumn) => {
      if (typeof column.headerRender === 'function') {
        return (
          <CwDataTableHeaderRenderer
            column={column}
            sortState={sortState}
            onSort={handleSort}
            isSelected={columnSelectEnabled && isColumnSelected(column)}
            isHovered={columnSelectEnabled && isColumnHovered(column)}
          />
        )
      }

      const HeaderComponent = column.headerComponent
      if (HeaderComponent) {
        return <HeaderComponent {...getHeaderProps(column)} />
      }

      if (column.sortable !== false && (defaultSortable || column.sortable)) {
        const sortIconName = isColumnSortedAscFn(column)
          ? 'common--action--sort-asc-line'
          : isColumnSortedDescFn(column)
            ? 'common--action--sort-desc-line'
            : 'common--action--sort-line'
        return (
          <div
            role="button"
            tabIndex={tabindex}
            aria-label={`排序 ${column.title}`}
            className={[styles.sortButton, isSortButtonFocusVisible ? styles.sortButtonFocused : '']
              .filter(Boolean)
              .join(' ')}
            onClick={(event) => {
              event.stopPropagation()
              handleSort(column)
            }}
            onFocus={handleSortButtonFocus}
            onBlur={handleSortButtonBlur}
            onKeyDown={handleSortButtonKeyDown}
          >
            <span>{column.title}</span>
            <span className={styles.sortIcon} aria-hidden="true">
              <CwIcon name={sortIconName} prefix="icon" size={0.75} />
            </span>
          </div>
        )
      }

      return <span>{column.title}</span>
    }

    useImperativeHandle(
      ref,
      () => ({
        visibleColumns,
        columnWidths,
        scrollLeft,
        scrollTop,
        getColumnStyle,
        getBodyCellClasses: (column: CwDataTableColumn) => getBodyCellClassList(column),
        leftFixedOverlaps,
        rightFixedOverlaps,
        styles,
        headerRef: headerRef.current,
        bodyRef: bodyEl,
        requestSyncColumnWidthsFromBody: runSyncColumnWidths,
      }),
      [
        visibleColumns,
        columnWidths,
        scrollLeft,
        scrollTop,
        getColumnStyle,
        getBodyCellClassList,
        leftFixedOverlaps,
        rightFixedOverlaps,
        styles,
        bodyEl,
        runSyncColumnWidths,
      ],
    )

    const wrapperClass = bodyLayoutFill
      ? 'flex min-h-0 w-full flex-1 flex-col self-stretch'
      : 'flex w-full flex-col'

    const headerClass = [
      headerScrollClass,
      fixedHeader ? styles.headerFixed : '',
      'relative',
      collapsibleEffective ? 'cursor-pointer' : '',
      collapsibleEffective && !bodyExpandedState
        ? styles.headerCellBodyDividerOffWhenCollapsed
        : '',
    ]
      .filter(Boolean)
      .join(' ')

    const externalRowScope: CwDataTableExternalRowScope = {
      visibleColumns,
      columnWidths,
      scrollLeft,
      getColumnStyle: getExternalRowColumnStyle,
      getBodyCellClasses: getExternalRowBodyCellClasses,
      getExternalCellStyle,
      leftFixedOverlaps,
      rightFixedOverlaps,
      styles,
      columnSelectEnabled,
      isColumnSelected,
      isColumnHovered,
      handleColumnSelect,
      handleColumnMouseEnter,
      handleColumnMouseLeave,
    }

    const bodyRowsElement = (
      <CwDataTableBodyRows
        virtualScroll={virtualScroll}
        renderRows={renderRows}
        offsetTop={offsetTop}
        offsetBottom={offsetBottom}
        visibleColumns={visibleColumns}
        tableStyles={tableStyles}
        omitLastRowBottomBorder={omitLastRowBottomBorder}
        columnSelectEnabled={columnSelectEnabled}
        selectedColumnKey={selectedColumnKey}
        hoveredColumnKey={hoveredColumnKey}
        getBodyCellClassList={getBodyCellClassList}
        getColumnStyle={getColumnStyle}
        handleColumnSelect={handleColumnSelect}
        handleColumnMouseEnter={handleColumnMouseEnter}
        handleColumnMouseLeave={handleColumnMouseLeave}
        lifecycle={lifecycle}
        treeEnabled={treeEnabled}
        indentSize={treeIndentSize}
        texts={texts}
        isIndentColumn={isIndentColumn}
        getTreeRowMeta={getTreeRowMeta}
        toggleTreeExpand={toggleTreeExpand}
        showOverflowTooltip={showOverflowTooltip}
        overlay={bodyOverlaySlot}
      />
    )

    const bodyPanelElement = (
      <CwDataTableBodyPanel
        bodyShellClass={bodyShellClass}
        cwDivRootClass={cwDivRootClass}
        bodyCwDivViewportClass={bodyCwDivViewportClass}
        styles={styles}
        loading={loading}
        empty={displayedRows.length === 0}
        emptyText={texts.emptyText}
        loadingText={texts.loadingText}
        persistScrollbar={config.persistScrollbar === true}
        cwDivRef={attachCwDiv}
        onScroll={handleBodyScroll}
        emptySlot={emptySlot}
        loadingSlot={loadingSlot}
      >
        {bodyRowsElement}
      </CwDataTableBodyPanel>
    )

    return (
      <div className={[wrapperClass, className].filter(Boolean).join(' ')} {...rest}>
        {externalRowSlot ? (
          <div
            ref={externalRowRef}
            className="flex items-stretch border-l border-r border-b overflow-x-auto overflow-y-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] mb-2"
            style={{
              borderLeftColor: 'transparent',
              borderRightColor: 'transparent',
              borderBottomColor: 'transparent',
            }}
            onScroll={handleExternalRowScroll}
          >
            {externalRowSlot(externalRowScope)}
          </div>
        ) : null}
        <div className={styles.root}>
          {showHeader ? (
            <div
              ref={headerRef}
              className={headerClass}
              style={headerStyle}
              tabIndex={collapsibleEffective ? 0 : undefined}
              aria-label={
                collapsibleEffective
                  ? bodyExpandedState
                    ? texts.collapseBodyCollapseAriaLabel
                    : texts.collapseBodyExpandAriaLabel
                  : undefined
              }
              onScroll={handleHeaderScroll}
              onClick={handleCollapsibleHeaderClick}
              onKeyDown={handleCollapsibleHeaderKeydown}
            >
              <div
                className={[tableStyles.scrollContent, headerOverlaySlot ? 'relative' : '']
                  .filter(Boolean)
                  .join(' ')}
              >
                <div className={styles.headerRow}>
                  {visibleColumns.map((column, colIndex) => (
                    <div
                      key={column.key}
                      data-cw-dt-col={column.key}
                      className={getHeaderCellClassList(column).filter(Boolean).join(' ')}
                      style={getColumnStyle(column)}
                      onClick={(event) => onHeaderCellSurfaceClick(column, event)}
                      onMouseEnter={() => handleColumnMouseEnter(column)}
                      onMouseLeave={handleColumnMouseLeave}
                    >
                      <div
                        className={
                          column.fitContent
                            ? styles.headerCellContentFit
                            : styles.headerCellContent
                        }
                      >
                        {renderHeaderContent(column)}
                      </div>
                      {canShowResizeHandle(colIndex, 'end') ? (
                        <div
                          className={[
                            styles.resizeHandle,
                            styles.resizeHandleEnd,
                            activeResizeHandleId === toResizeHandleId(column.key, 'end')
                              ? styles.resizeHandleHover
                              : '',
                          ]
                            .filter(Boolean)
                            .join(' ')}
                          onClick={(event) => event.stopPropagation()}
                          onPointerDown={(event) =>
                            onResizeHandlePointerDown(colIndex, 'end', event)
                          }
                          onMouseEnter={() =>
                            handleResizeMouseEnter(toResizeHandleId(column.key, 'end'))
                          }
                          onMouseLeave={handleResizeMouseLeave}
                        />
                      ) : null}
                      {canShowResizeHandle(colIndex, 'start') ? (
                        <div
                          className={[
                            styles.resizeHandle,
                            styles.resizeHandleStart,
                            activeResizeHandleId === toResizeHandleId(column.key, 'start')
                              ? styles.resizeHandleHover
                              : '',
                          ]
                            .filter(Boolean)
                            .join(' ')}
                          onClick={(event) => event.stopPropagation()}
                          onPointerDown={(event) =>
                            onResizeHandlePointerDown(colIndex, 'start', event)
                          }
                          onMouseEnter={() =>
                            handleResizeMouseEnter(toResizeHandleId(column.key, 'start'))
                          }
                          onMouseLeave={handleResizeMouseLeave}
                        />
                      ) : null}
                    </div>
                  ))}
                </div>
                {headerOverlaySlot}
              </div>
            </div>
          ) : null}

          {collapsibleEffective ? (
            <div
              className={[
                styles.bodyCollapseShell,
                bodyExpandedState
                  ? styles.bodyCollapseShellOpen
                  : styles.bodyCollapseShellClosed,
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <div className={styles.bodyCollapseInner}>{bodyPanelElement}</div>
            </div>
          ) : (
            bodyPanelElement
          )}
        </div>
      </div>
    )
  },
)

export default CwDataTable
