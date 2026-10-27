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
  HTMLAttributes,
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
} from 'react'
import type { CwDataTableColumn, CwDataTableEmits, CwDataTableExternalRowScope, CwDataTableHandle, CwDataTableProps, CwDataTableSlots } from './types'
import type { CwDataTableStyles } from '@zengchaowu/ui-shared/components/CwDataTable/types'
import {
  getDataTableBodyCwDivViewportClass,
  getDataTableContentBodyViewportClass,
  resolveDataTableStyles,
} from '@zengchaowu/ui-shared/components/CwDataTable/styles'
import { defaultTexts } from '@zengchaowu/ui-shared/components/CwDataTable/texts'
import { useContainerSize } from '../CwVirtualScroll/hooks/useContainerSize'
import CwDiv from '../CwDiv/CwDiv'
import type { CwDivHandle } from '../CwDiv/CwDiv'
import { resolveCwDivViewport } from '../CwDiv/resolveCwDivViewport'
import CwIcon from '../CwIcon/CwIcon'
import CwDataTableHeaderRenderer from './CwDataTableHeaderRenderer'
import CwDataTableBodyRows from './CwDataTableBodyRows'
import CwDataTableBodyPanel from './CwDataTableBodyPanel'
import { useVirtualScroll } from './hooks/useVirtualScroll'
import { useTableTree } from './hooks/useTableTree'
import { useScrollSync } from './hooks/useScrollSync'
import { useExternalRowScrollSync } from './hooks/useExternalRowScrollSync'
import { useScrollbarAlignment } from './hooks/useScrollbarAlignment'
import { useTableEdgeBorders } from './hooks/useTableEdgeBorders'
import { useExpandFillColumns } from './hooks/useExpandFillColumns'
import { useSyncColumnWidthsFromBody } from './hooks/useSyncColumnWidthsFromBody'
import { useColumnResize } from './hooks/useColumnResize'
import { useTableConfig } from './hooks/useTableConfig'
import { useVisibleColumns } from './hooks/useVisibleColumns'
import { useTableSort } from './hooks/useTableSort'
import { useSortButtonKeyboard } from './hooks/useSortButtonKeyboard'
import { useColumnSelect } from './hooks/useColumnSelect'
import { useColumnHover } from './hooks/useColumnHover'
import { useScrollToColumnCenterOnSelect } from './hooks/useScrollToColumnCenterOnSelect'
import { useCellClassLists } from './hooks/useCellClassLists'
import { useColumnStyleGetter } from './hooks/useColumnStyleGetter'
import { useExternalRowSlotHelpers } from './hooks/useExternalRowSlotHelpers'
import { useFixedColumnOverlap } from './hooks/useFixedColumnOverlap'
import { calculateHeaderProps, resizeHandleId as toResizeHandleId } from './functions'

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

    const {
      columns,
      showHeader,
      fixedHeader,
      fixedLeftColumns,
      fixedRightColumns,
      rowHeight,
      rowHeightKey,
      virtualScroll,
      virtualBuffer,
      resizable,
      showOverflowTooltip,
      sortConfig,
      defaultSortable,
      rowKey: rowKeyField,
      rowAttrs,
      columnSelectConfig,
      syncWidthsFromBody,
      defaultExpandFillColumns,
      stretchFitColumnsToContainer,
      bodyLayout,
    } = useTableConfig(config)

    const bodyLayoutFill = bodyLayout === 'fill'

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
      enabled: treeEnabled,
      indentSize: treeIndentSize,
      flatRows: displayedRows,
      isIndentColumn,
      toggleTreeExpand,
      getTreeRowMeta,
    } = useTableTree({
      tree: config.tree,
      modelValue,
      columns,
      rowKeyField,
      expandedKeys: expandedKeysProp,
      onUpdateExpandedKeys,
      onTreeExpandChange,
    })

    // 可见列
    const { visibleColumns, visibleColumnsRef } = useVisibleColumns(
      columns,
      fixedLeftColumns,
      fixedRightColumns,
    )

    const { containerHeight } = useContainerSize(bodyEl)

    // 列宽管理
    const isResizingRef = useRef(false)
    const [columnWidths, setColumnWidthsState] = useState<Record<string, number>>({})
    const columnWidthsRef = useRef(columnWidths)
    columnWidthsRef.current = columnWidths
    const setColumnWidths = useCallback((next: Record<string, number>) => {
      columnWidthsRef.current = next
      setColumnWidthsState(next)
    }, [])

    // fill / 剩余空间
    const {
      expandFillColumns,
      layoutContainerWidth,
      scheduleExpandFillUpdate,
      flushExpandFillUpdate,
    } = useExpandFillColumns({
      bodyEl,
      bodyElRef,
      visibleColumns,
      visibleColumnsRef,
      columnWidths,
      columnWidthsRef,
      initialExpandFill: defaultExpandFillColumns,
      onAfterUpdate: () => cwDivHandleRef.current?.remeasure(),
    })

    // 列样式
    const { getColumnStyle } = useColumnStyleGetter({
      columnWidths,
      visibleColumns,
      expandFillColumns,
      layoutContainerWidth,
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
      isSyncingRef,
      stopSyncing,
    } = useScrollSync({ headerRef, externalRowRef, bodyElRef, onScroll })

    // 外部行横向滚动同步
    const { handleExternalRowScroll } = useExternalRowScrollSync({
      externalRowRef,
      headerRef,
      bodyElRef,
      scrollLeft,
      isSyncingRef,
      stopSyncing,
    })





    // 滚动条对齐
    const { headerStyle, updateScrollbarWidth } = useScrollbarAlignment({
      bodyEl,
      bodyElRef,
      containerHeight,
      displayedRowCount: displayedRows.length,
      columnWidths,
      visibleColumnCount: visibleColumns.length,
      loading,
    })



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

    // 从表体同步列宽
    const { syncColumnWidthsFromBody: runSyncColumnWidths } = useSyncColumnWidthsFromBody({
      enabled: syncWidthsFromBody,
      bodyEl,
      bodyElRef,
      headerRef,
      visibleColumns,
      visibleColumnsRef,
      columnWidthsRef,
      setColumnWidths,
      modelValue,
      loading,
      isResizingRef,
      expandFillColumns,
      stretchFitColumnsToContainer,
      onAfterSync: () => {
        scheduleExpandFillUpdate()
        updateScrollbarWidth()
      },
    })

    // fill 状态切换后重新测量横滚/列宽
    const prevExpandFillReminderRef = useRef(expandFillColumns)
    useEffect(() => {
      if (prevExpandFillReminderRef.current === expandFillColumns) return
      prevExpandFillReminderRef.current = expandFillColumns
      requestAnimationFrame(() => {
        cwDivHandleRef.current?.remeasure()
        runSyncColumnWidths()
        updateScrollbarWidth()
      })
    }, [expandFillColumns, runSyncColumnWidths, updateScrollbarWidth])



    // 固定列重叠
    const { leftFixedOverlaps, rightFixedOverlaps } = useFixedColumnOverlap({
      bodyEl,
      bodyElRef,
      visibleColumns,
      columnWidths,
      scrollLeft,
    })

    // 排序
    const {
      sortState,
      isColumnSortedAsc: isColumnSortedAscFn,
      isColumnSortedDesc: isColumnSortedDescFn,
      handleSort,
    } = useTableSort({
      sortConfig,
      defaultSortable,
      onUpdateSort,
      onSortChange,
    })

    // 排序按钮键盘
    const {
      isFocusVisible: isSortButtonFocusVisible,
      tabindex,
      handleSortButtonFocus,
      handleSortButtonBlur,
      handleSortButtonKeyDown,
    } = useSortButtonKeyboard({ visibleColumns, handleSort })

    // 列选中
    const {
      enabled: columnSelectEnabled,
      selectedColumnKey,
      selectedColumn,
      isColumnSelected,
      handleColumnSelect,
    } = useColumnSelect({
      columnSelectConfig,
      visibleColumns,
      onUpdate: onUpdateColumnSelect,
      onChange: onColumnSelectChange,
    })

    // 列 hover
    const {
      hoveredColumnKey,
      isColumnHovered,
      handleColumnMouseEnter,
      handleColumnMouseLeave,
      handleColumnHoverOver,
    } = useColumnHover(columnSelectEnabled)

    // 单元格 class 变体
    const { getBodyCellClassList, getHeaderCellClassList } = useCellClassLists({
      visibleColumns,
      styles,
      leftFixedOverlaps,
      rightFixedOverlaps,
      omitLastColumnRightBorder,
      resizable,
      columnSelectEnabled,
      selectedColumnKey,
      hoveredColumnKey,
    })

    // 选中列水平居中
    useScrollToColumnCenterOnSelect({
      selectedColumn,
      columnSelectEnabled,
      visibleColumns,
      columnWidths,
      bodyElRef,
      headerRef,
    })

    // external-row 插槽辅助
    const {
      getExternalRowColumnStyle,
      getExternalCellStyle,
      getExternalRowBodyCellClasses,
    } = useExternalRowSlotHelpers({ getColumnStyle, getBodyCellClassList })

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
        rowAttrs={config.rowAttrs}
        handleColumnSelect={handleColumnSelect}
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
        <div
          className={styles.root}
          onMouseOver={handleColumnHoverOver}
          onMouseLeave={handleColumnMouseLeave}
        >
          {showHeader ? (
            <div
              ref={headerRef}
              data-cw-dt-header=""
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
