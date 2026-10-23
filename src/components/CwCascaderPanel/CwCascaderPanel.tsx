import { forwardRef, useImperativeHandle, useMemo } from 'react'
import CwDiv from '../CwDiv/CwDiv'
import CwIcon from '../CwIcon/CwIcon'
import CwTruncateText from '../CwTruncateText/CwTruncateText'
import type {
  CwCascaderPanelComponentProps,
  CwCascaderPanelHandle,
  CwCascaderPanelOption,
} from './types'
import { cascaderPanelByAppearance } from './styles'
import { buildCascaderColumns } from './functions/buildCascaderColumns'

export const CwCascaderPanel = forwardRef<
  CwCascaderPanelHandle,
  CwCascaderPanelComponentProps
>(function CwCascaderPanel(
  {
    options = [],
    value = [],
    disabled = false,
    readonly = false,
    appearance = 'popup',
    size = 'medium',
    emptyText = '暂无数据',
    idPrefix = 'cw-cascader-panel',
    columnMaxHeight = null,
    activePathIndex = -1,
    activeIndexPerLevel = [],
    showFocusHighlight = false,
    optionTabIndex = false,
    onChange,
    onComplete,
    onOptionFocus,
    className,
    ...rest
  },
  ref,
) {
  const styles = cascaderPanelByAppearance[appearance]

  const columns = useMemo(
    () => buildCascaderColumns(options, value),
    [options, value],
  )

  const isEmpty = useMemo(
    () =>
      columns.length === 0 ||
      (columns.length === 1 && columns[0].length === 0),
    [columns],
  )

  const optionSizeClass = useMemo(() => {
    if (appearance === 'sheet') return ''
    const map = {
      small: styles.sizeSmall,
      medium: styles.sizeMedium,
      large: styles.sizeLarge,
    }
    return map[size || 'medium']
  }, [appearance, styles, size])

  const emptySizeClass = useMemo(() => {
    if (appearance === 'sheet') return ''
    const map = {
      small: styles.emptySizeSmall,
      medium: styles.emptySizeMedium,
      large: styles.emptySizeLarge,
    }
    return map[size || 'medium']
  }, [appearance, styles, size])

  const columnInlineStyle = useMemo(
    () =>
      columnMaxHeight == null
        ? undefined
        : { maxHeight: `${columnMaxHeight}px` },
    [columnMaxHeight],
  )

  const nodeId = useMemo(
    () => (levelIndex: number, itemIndex: number) =>
      `${idPrefix}-node-${levelIndex}-${itemIndex}`,
    [idPrefix],
  )

  useImperativeHandle(ref, () => ({ columns, nodeId }), [columns, nodeId])

  const isOptionDisabled = (item: CwCascaderPanelOption) =>
    Boolean(disabled || item.disabled)

  const optionTabIndexValue = (item: CwCascaderPanelOption) => {
    if (!optionTabIndex || isOptionDisabled(item)) return undefined
    return 0
  }

  const isSelected = (item: CwCascaderPanelOption, levelIndex: number) =>
    value[levelIndex] === item.value

  const isExpanded = (levelIndex: number, itemIndex: number) =>
    value[levelIndex] === columns[levelIndex]?.[itemIndex]?.value

  const isFocused = (levelIndex: number, itemIndex: number) => {
    if (!showFocusHighlight) return false
    return (
      activePathIndex === levelIndex &&
      activeIndexPerLevel[levelIndex] === itemIndex
    )
  }

  const optionClass = (
    item: CwCascaderPanelOption,
    levelIndex: number,
    itemIndex: number,
  ) => {
    const selected = isSelected(item, levelIndex)
    const optionDisabled = isOptionDisabled(item)
    const focused = isFocused(levelIndex, itemIndex) && !optionDisabled
    const focusClass = focused
      ? selected
        ? styles.optionFocusOnSelected
        : styles.optionFocus
      : ''
    return [
      styles.option,
      optionSizeClass,
      optionDisabled
        ? styles.optionDisabled
        : selected && !focused
          ? styles.optionSelected
          : styles.optionNormal,
      !selected && !optionDisabled && !readonly && !focused
        ? styles.optionHover
        : '',
      focusClass,
    ]
      .filter(Boolean)
      .join(' ')
  }

  const handleItemClick = (levelIndex: number, itemIndex: number) => {
    const item = columns[levelIndex]?.[itemIndex]
    if (!item || item.disabled || readonly || disabled) return
    const nextPath = value.slice(0, levelIndex)
    nextPath[levelIndex] = item.value
    onChange?.(nextPath, item)
    if (!item.children?.length) {
      onComplete?.(nextPath, item)
    }
  }

  const handleOptionKeyDown = (
    event: {
      key: string
      preventDefault: () => void
    },
    levelIndex: number,
    itemIndex: number,
  ) => {
    if (disabled || readonly) return
    const item = columns[levelIndex]?.[itemIndex]
    if (!item || item.disabled) return
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleItemClick(levelIndex, itemIndex)
    }
  }

  return (
    <div
      {...rest}
      className={[styles.root, className].filter(Boolean).join(' ')}
      role="tree"
      aria-multiselectable="false"
    >
      <div className={styles.panel}>
        {columns.map((level, levelIndex) => (
          <CwDiv
            key={levelIndex}
            className={styles.column}
            contentClass={styles.columnContent}
            style={columnInlineStyle}
            role="group"
            aria-label={`level-${levelIndex + 1}`}
          >
            {level.map((item, itemIndex) => (
              <div
                key={String(item.value)}
                id={nodeId(levelIndex, itemIndex)}
                className={optionClass(item, levelIndex, itemIndex)}
                role="treeitem"
                tabIndex={optionTabIndexValue(item)}
                aria-disabled={isOptionDisabled(item) ? 'true' : 'false'}
                aria-expanded={
                  item.children?.length
                    ? isExpanded(levelIndex, itemIndex)
                      ? 'true'
                      : 'false'
                    : undefined
                }
                aria-selected={
                  isSelected(item, levelIndex) ? 'true' : 'false'
                }
                onClick={() => handleItemClick(levelIndex, itemIndex)}
                onKeyDown={(event) =>
                  handleOptionKeyDown(event, levelIndex, itemIndex)
                }
                onFocus={() => onOptionFocus?.(levelIndex, itemIndex)}
              >
                <div className={styles.optionContent}>
                  <CwTruncateText
                    text={item.label}
                    placement="start"
                    tag="span"
                    className={styles.optionLabel}
                  />
                  {item.children && item.children.length ? (
                    <span className={styles.optionArrow} aria-hidden="true">
                      <CwIcon
                        name="common--dir--arrow-right-line"
                        prefix="icon"
                        size={0.75}
                      />
                    </span>
                  ) : null}
                </div>
              </div>
            ))}
          </CwDiv>
        ))}
        {isEmpty ? (
          <div
            className={[styles.empty, emptySizeClass]
              .filter(Boolean)
              .join(' ')}
          >
            {emptyText}
          </div>
        ) : null}
      </div>
    </div>
  )
})

export default CwCascaderPanel
