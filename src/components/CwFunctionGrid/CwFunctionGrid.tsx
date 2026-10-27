import { useMemo, useState } from 'react'
import type {
  FocusEvent as ReactFocusEvent,
  HTMLAttributes,
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
} from 'react'
import type { CwFunctionGridItem, CwFunctionGridProps } from './types'
import type { CwFunctionGridTexts } from '@zengchaowu/ui-shared/components/CwFunctionGrid/types'
import { functionGridBase } from '@zengchaowu/ui-shared/components/CwFunctionGrid/styles'
import { defaultTexts } from '@zengchaowu/ui-shared/components/CwFunctionGrid/texts'
import CwGrid from '../CwGrid/CwGrid'
import CwIcon from '../CwIcon/CwIcon'
import { shouldShowFocus, useBrowserFocusVisible } from '../../hooks/useBrowserFocusVisible'

export interface CwFunctionGridComponentProps
  extends CwFunctionGridProps,
    Omit<HTMLAttributes<HTMLDivElement>, 'onClick'> {}

export function CwFunctionGrid({
  items = [],
  columns = 4,
  showAllStoresLink = true,
  onAllStoresClick,
  texts: textsProp,
  className,
  ...rest
}: CwFunctionGridComponentProps) {
  const styles = functionGridBase
  const texts: CwFunctionGridTexts = useMemo(
    () => ({ ...defaultTexts, ...(textsProp ?? {}) }),
    [textsProp],
  )

  const {
    isFocusVisible: allStoresLinkFocusVisible,
    handleFocus: handleAllStoresLinkFocus,
    handleBlur: handleAllStoresLinkBlur,
  } = useBrowserFocusVisible()

  // tabindex 必须使用 computed 函数
  const allStoresLinkTabindex = 0

  // 功能项聚焦状态（只在键盘导航时设置）
  const [functionItemFocusedForKeyboard, setFunctionItemFocusedForKeyboard] =
    useState<Record<string, boolean>>({})

  // 功能项聚焦处理
  const handleItemFocus = (key: string, event?: ReactFocusEvent<HTMLDivElement>) => {
    const item = items.find((i) => i.key === key)
    if (item?.disabled) return
    // 只在键盘导航时设置 functionItemFocusedForKeyboard
    if (event && shouldShowFocus()) {
      setFunctionItemFocusedForKeyboard((prev) => ({ ...prev, [key]: true }))
    } else if (!event) {
      // 如果没有事件（通过代码调用 focus），默认不显示 focus 样式
      setFunctionItemFocusedForKeyboard((prev) => ({ ...prev, [key]: false }))
    }
  }

  const handleItemBlur = (key: string) => {
    setFunctionItemFocusedForKeyboard((prev) => ({ ...prev, [key]: false }))
  }

  // 功能项键盘事件处理
  const handleItemKeyDown = (
    item: CwFunctionGridItem,
    event: ReactKeyboardEvent<HTMLDivElement>,
  ) => {
    if (item.disabled) return

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleItemClick(item, event as unknown as ReactMouseEvent<HTMLDivElement>)
    }
  }

  // 点击功能项（点击行为通过 item.onClick 配置，不再对外抛 itemClick 事件）
  const handleItemClick = (
    item: CwFunctionGridItem,
    event: ReactMouseEvent<HTMLDivElement>,
  ) => {
    if (item.disabled) {
      event.preventDefault()
      event.stopPropagation()
      return
    }
    // 优先使用 item 中的回调函数
    if (item.onClick) {
      item.onClick(item, event)
    }
  }

  // 点击全部门店链接
  const handleAllStoresClick = (event: ReactMouseEvent<HTMLDivElement>) => {
    // 如果提供了回调函数，先调用回调函数
    if (onAllStoresClick) {
      onAllStoresClick(event)
    }
  }

  // 全部门店链接键盘事件处理
  const handleAllStoresKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      // 如果提供了回调函数，先调用回调函数
      if (onAllStoresClick) {
        onAllStoresClick(event as unknown as ReactMouseEvent<HTMLDivElement>)
      }
    }
  }

  return (
    <div
      {...rest}
      className={[styles.root, className].filter(Boolean).join(' ')}
    >
      {/* 标题栏 */}
      <div className={styles.header}>
        <div className={styles.titleContainer}>
          <div className={styles.titleBar} />
          <div className={styles.title}>{texts.title}</div>
        </div>
        {showAllStoresLink ? (
          <div
            className={[
              styles.allStoresLink,
              styles.allStoresLinkNormal,
              allStoresLinkFocusVisible ? styles.allStoresLinkFocused : '',
            ]
              .filter(Boolean)
              .join(' ')}
            role="button"
            tabIndex={allStoresLinkTabindex}
            aria-label={texts.allStores}
            onClick={handleAllStoresClick}
            onFocus={handleAllStoresLinkFocus}
            onBlur={handleAllStoresLinkBlur}
            onKeyDown={handleAllStoresKeyDown}
          >
            <span>{texts.allStores}</span>
            <CwIcon
              name="common--dir--arrow-right-line"
              prefix="icon"
              size={styles.arrowIconStyles?.size ?? 1}
              className={styles.arrowIconStyles?.class}
            />
          </div>
        ) : null}
      </div>
      {/* 功能网格 */}
      <div className={styles.gridWrapClass}>
        {items && items.length > 0 ? (
          <CwGrid columns={columns} gutter={8}>
            {items.map((item) => (
              <div
                key={item.key}
                className={[
                  styles.functionItemRoot,
                  item.disabled
                    ? styles.functionItemRootDisabled
                    : styles.functionItemRootNormal,
                  functionItemFocusedForKeyboard[item.key] && !item.disabled
                    ? styles.functionItemRootFocused
                    : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                role="button"
                tabIndex={item.disabled ? undefined : 0}
                aria-disabled={item.disabled ? 'true' : 'false'}
                aria-label={item.label}
                onClick={(event) => handleItemClick(item, event)}
                onFocus={(event) => handleItemFocus(item.key, event)}
                onBlur={() => handleItemBlur(item.key)}
                onKeyDown={(event) => handleItemKeyDown(item, event)}
              >
                <div className={styles.functionItemContent}>
                  {item.icon ? (
                    <div
                      className={[
                        styles.functionItemIconContainer,
                        item.disabled
                          ? styles.functionItemIconContainerDisabled
                          : styles.functionItemIconContainerNormal,
                      ]
                        .filter(Boolean)
                        .join(' ')}
                    >
                      <CwIcon
                        name={item.icon}
                        prefix="icon"
                        size={styles.functionItemIconStyles?.size ?? 1}
                        className={styles.functionItemIconStyles?.class}
                      />
                    </div>
                  ) : null}
                  <div
                    className={[
                      styles.functionItemLabel,
                      item.disabled
                        ? styles.functionItemLabelDisabled
                        : styles.functionItemLabelNormal,
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    {item.label}
                  </div>
                </div>
              </div>
            ))}
          </CwGrid>
        ) : null}
      </div>
    </div>
  )
}

export default CwFunctionGrid
