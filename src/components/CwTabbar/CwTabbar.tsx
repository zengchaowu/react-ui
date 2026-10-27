import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from 'react'
import type { Placement } from '@zengchaowu/shared/types/placement'
import type { PopupTrigger } from '@zengchaowu/ui-shared/components/CwPopup/types/state'
import type { CwTabbarEmits, CwTabbarItem, CwTabbarItemIconSlotScope, CwTabbarItemLabelSlotScope, CwTabbarProps, CwTabbarTexts } from './types'
import type { CwTabbarStyles } from '@zengchaowu/ui-shared/components/CwTabbar/types'
import {
  tabbarBase,
  horizontalRootWithoutTopDivider,
  tabbarAppearanceOverrides,
  tabbarHorizontalItemsScrollCwDivClasses,
  verticalOrientationStyleOverrides,
  verticalTabbarRootWithSideDivider,
  verticalTabbarRootWithoutSideDivider,
  tabbarSizeLgStyles,
} from '@zengchaowu/ui-shared/components/CwTabbar/styles'
import { defaultTexts } from './texts'
import CwIcon from '../CwIcon/CwIcon'
import CwTooltip from '../CwTooltip/CwTooltip'
import type { CwTooltipInstance } from '../CwTooltip/types'
import CwTabbarItemsViewport from './CwTabbarItemsViewport'
import type { CwTabbarItemsViewportHandle } from './CwTabbarItemsViewport'
import {
  shouldShowFocus,
  useBrowserFocusVisible,
} from '../../hooks/useBrowserFocusVisible'
import { createTooltipLongPressHandlers } from '@zengchaowu/shared/functions/dom/createTooltipLongPressHandlers'

export interface CwTabbarComponentProps
  extends CwTabbarProps,
    CwTabbarEmits,
    Omit<HTMLAttributes<HTMLDivElement>, 'className' | 'children' | 'onChange'> {
  className?: string
  /** `item-icon` 作用域插槽 */
  itemIconSlot?: (scope: CwTabbarItemIconSlotScope) => ReactNode
  /** `item-label` 作用域插槽 */
  itemLabelSlot?: (scope: CwTabbarItemLabelSlotScope) => ReactNode
}

export function CwTabbar({
  appearance = 'default',
  size = 'md',
  tooltipPlacement,
  tooltipShowDelay = 120,
  tooltipOffset,
  tooltipFlip,
  tooltipTouchLongPress,
  showTopDivider = true,
  orientation = 'horizontal',
  value,
  items = [],
  disabled = false,
  readonly = false,
  preserveModelWhenMissing = false,
  itemsScrollable = true,
  itemsScrollHideScrollbar = true,
  texts: textsProp,
  itemIconSlot,
  itemLabelSlot,
  className,
  onUpdateModelValue,
  onChange,
  ...rest
}: CwTabbarComponentProps) {
  // 挂载全局键盘/指针监听，供 shouldShowFocus 判定焦点可见性
  useBrowserFocusVisible()

  const resolvedOrientation = orientation ?? 'horizontal'
  const useHorizontalItemsScroll =
    resolvedOrientation === 'horizontal' && itemsScrollable !== false
  const resolvedItemsScrollHideScrollbar = itemsScrollHideScrollbar !== false

  const texts = useMemo<CwTabbarTexts>(
    () => ({ ...defaultTexts, ...(textsProp ?? {}) }),
    [textsProp],
  )

  const itemsValue = useMemo<CwTabbarItem[]>(
    () => (Array.isArray(items) ? items : []),
    [items],
  )

  const styles = useMemo<CwTabbarStyles>(() => {
    const base = { ...tabbarBase }
    if (resolvedOrientation === 'vertical') {
      Object.assign(base, verticalOrientationStyleOverrides)
      base.root =
        showTopDivider === false
          ? verticalTabbarRootWithoutSideDivider
          : verticalTabbarRootWithSideDivider
    }
    if (size === 'lg') {
      Object.assign(base, tabbarSizeLgStyles(resolvedOrientation === 'vertical'))
    }
    if (resolvedOrientation === 'horizontal' && showTopDivider === false) {
      base.root = horizontalRootWithoutTopDivider
    }
    const appearanceExtra =
      tabbarAppearanceOverrides[appearance ?? 'default'] ?? {}
    Object.assign(base, appearanceExtra)
    const merged: CwTabbarStyles = {
      ...base,
      itemIconStyles: {
        ...(tabbarBase.itemIconStyles ?? {}),
        ...(base.itemIconStyles ?? {}),
      },
    }
    if (resolvedOrientation === 'vertical') {
      merged.root = `${merged.root ?? ''} before:hidden after:pointer-events-none`.trim()
    }
    return merged
  }, [appearance, resolvedOrientation, showTopDivider, size])

  const itemsContainerClass = useMemo(() => {
    const base = styles.items
    if (!useHorizontalItemsScroll) return base
    const scrollExtra = styles.itemsHorizontalScroll
    return scrollExtra ? `${base} ${scrollExtra}` : base
  }, [styles, useHorizontalItemsScroll])

  const resolvedTooltipPlacement = useMemo<Placement>(
    () => tooltipPlacement ?? (resolvedOrientation === 'vertical' ? 'right' : 'top'),
    [resolvedOrientation, tooltipPlacement],
  )

  const tooltipTriggerClass =
    resolvedOrientation === 'vertical'
      ? 'inline-flex w-auto max-w-full min-w-0 mx-auto flex-col items-center justify-center min-h-0'
      : 'inline-flex w-full min-w-0 max-w-full flex-1 flex-col items-stretch justify-center min-h-0'

  const resolvedTooltipOffset = useMemo(
    () =>
      tooltipOffset != null && Number.isFinite(tooltipOffset)
        ? tooltipOffset
        : resolvedOrientation === 'vertical'
          ? 20
          : 8,
    [resolvedOrientation, tooltipOffset],
  )

  const resolvedTooltipFlip = useMemo(
    () =>
      tooltipFlip !== undefined ? tooltipFlip : resolvedOrientation !== 'vertical',
    [resolvedOrientation, tooltipFlip],
  )

  const [currentValue, setCurrentValue] = useState<string>(
    () => value ?? (itemsValue[0]?.key ?? ''),
  )
  const currentValueRef = useRef(currentValue)
  currentValueRef.current = currentValue

  const onUpdateModelValueRef = useRef(onUpdateModelValue)
  onUpdateModelValueRef.current = onUpdateModelValue
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  useEffect(() => {
    if (value !== undefined) {
      setCurrentValue(value)
    }
  }, [value])

  const itemsViewportRef = useRef<CwTabbarItemsViewportHandle | null>(null)
  const prevItemsRef = useRef<CwTabbarItem[] | null>(null)

  useLayoutEffect(() => {
    const list = itemsValue
    const previous = prevItemsRef.current
    prevItemsRef.current = list
    // Vue 侧 items 的 watch 非 immediate：首次挂载不触发回退/重新测量
    if (previous === null) return

    if (!list.length) {
      setCurrentValue('')
      return
    }
    if (!list.some((item) => item.key === currentValueRef.current)) {
      if (preserveModelWhenMissing) {
        return
      }
      const firstAvailable = list.find((item) => !item.disabled)
      const nextItem = firstAvailable ?? list[0]
      if (!nextItem) return
      setCurrentValue(nextItem.key)
      onUpdateModelValueRef.current?.(nextItem.key)
      onChangeRef.current?.(nextItem.key, nextItem)
    }
    if (useHorizontalItemsScroll) {
      itemsViewportRef.current?.remeasure?.()
    }
  }, [itemsValue, preserveModelWhenMissing, useHorizontalItemsScroll])

  const [focusedIndex, setFocusedIndex] = useState(-1)
  const [focusedIndexForKeyboard, setFocusedIndexForKeyboard] = useState(-1)
  const itemRefs = useRef<Array<HTMLElement | null>>([])

  const activeIndex = useMemo(
    () => itemsValue.findIndex((item) => item.key === currentValue),
    [currentValue, itemsValue],
  )

  const didMountScrollRef = useRef(false)

  useLayoutEffect(() => {
    if (!didMountScrollRef.current) {
      didMountScrollRef.current = true
      return
    }
    if (!useHorizontalItemsScroll || activeIndex < 0) return
    itemRefs.current[activeIndex]?.scrollIntoView({
      inline: 'center',
      block: 'nearest',
      behavior: 'smooth',
    })
  }, [activeIndex, useHorizontalItemsScroll])

  const tabindex = disabled ? undefined : 0

  const currentFocusableIndex = useMemo(() => {
    if (disabled) {
      return -1
    }
    if (focusedIndex !== -1) {
      return focusedIndex
    }
    if (activeIndex !== -1) {
      return activeIndex
    }
    return itemsValue.findIndex((item) => !item.disabled)
  }, [activeIndex, disabled, focusedIndex, itemsValue])

  const focusItemByIndex = useCallback(
    (index: number) => {
      if (disabled) {
        return
      }
      const item = itemsValue[index]
      if (!item || item.disabled) {
        return
      }
      setFocusedIndex(index)
      itemRefs.current[index]?.focus()
    },
    [disabled, itemsValue],
  )

  const moveFocus = useCallback(
    (direction: 1 | -1) => {
      if (disabled) {
        return
      }
      const total = itemsValue.length
      if (!total) {
        return
      }
      let start =
        focusedIndex !== -1 ? focusedIndex : activeIndex !== -1 ? activeIndex : 0
      for (let i = 0; i < total; i += 1) {
        start = (start + direction + total) % total
        const candidate = itemsValue[start]
        if (candidate && !candidate.disabled) {
          focusItemByIndex(start)
          break
        }
      }
    },
    [activeIndex, disabled, focusItemByIndex, focusedIndex, itemsValue],
  )

  const focusFirst = useCallback(() => {
    const index = itemsValue.findIndex((item) => !item.disabled)
    if (index !== -1) {
      focusItemByIndex(index)
    }
  }, [focusItemByIndex, itemsValue])

  const focusLast = useCallback(() => {
    const total = itemsValue.length
    for (let i = total - 1; i >= 0; i -= 1) {
      const item = itemsValue[i]
      if (item && !item.disabled) {
        focusItemByIndex(i)
        break
      }
    }
  }, [focusItemByIndex, itemsValue])

  const tooltipInstanceByKey = useRef(new Map<string, CwTooltipInstance>())
  const longPressByKey = useRef<
    Map<string, ReturnType<typeof createTooltipLongPressHandlers>>
  >(new Map())
  const tooltipTouchLongPressRef = useRef(tooltipTouchLongPress)
  tooltipTouchLongPressRef.current = tooltipTouchLongPress

  const getLongPressHandlers = useCallback((item: CwTabbarItem) => {
    if (!tooltipTouchLongPressRef.current || !item.tooltip) return null
    let handlers = longPressByKey.current.get(item.key)
    if (!handlers) {
      handlers = createTooltipLongPressHandlers({
        enabled: () =>
          Boolean(tooltipTouchLongPressRef.current && item.tooltip),
        onLongPress: () => {
          void tooltipInstanceByKey.current.get(item.key)?.show?.()
        },
      })
      longPressByKey.current.set(item.key, handlers)
    }
    return handlers
  }, [])

  useEffect(
    () => () => {
      longPressByKey.current.forEach((handlers) => handlers.clearTimer())
      longPressByKey.current.clear()
      tooltipInstanceByKey.current.clear()
    },
    [],
  )

  function updateValue(item: CwTabbarItem) {
    if (disabled || readonly || item.disabled) {
      return
    }
    if (currentValue !== item.key) {
      setCurrentValue(item.key)
      onUpdateModelValue?.(item.key)
      onChange?.(item.key, item)
    }
  }

  function handleItemClick(item: CwTabbarItem) {
    if (getLongPressHandlers(item)?.consumeSuppressClick()) {
      return
    }
    updateValue(item)
  }

  function handleItemFocus(
    index: number,
    item: CwTabbarItem,
    event?: FocusEvent,
  ) {
    if (disabled || item.disabled) {
      return
    }
    setFocusedIndex(index)
    if (event && shouldShowFocus()) {
      setFocusedIndexForKeyboard(index)
    } else if (!event) {
      setFocusedIndexForKeyboard(-1)
    }
  }

  function handleItemBlur(index: number) {
    if (focusedIndex === index) {
      setFocusedIndex(-1)
    }
    if (focusedIndexForKeyboard === index) {
      setFocusedIndexForKeyboard(-1)
    }
  }

  function isFocusVisibleForIndex(index: number): boolean {
    return focusedIndexForKeyboard === index
  }

  function handleItemKeyDown(
    event: KeyboardEvent<HTMLDivElement>,
    index: number,
    item: CwTabbarItem,
  ) {
    if (disabled) {
      return
    }
    const vertical = resolvedOrientation === 'vertical'
    switch (event.key) {
      case 'Enter':
      case ' ':
        if (item.disabled || readonly) {
          return
        }
        event.preventDefault()
        updateValue(item)
        break
      case 'ArrowRight':
        if (vertical) {
          return
        }
        event.preventDefault()
        moveFocus(1)
        break
      case 'ArrowDown':
        event.preventDefault()
        moveFocus(1)
        break
      case 'ArrowLeft':
        if (vertical) {
          return
        }
        event.preventDefault()
        moveFocus(-1)
        break
      case 'ArrowUp':
        event.preventDefault()
        moveFocus(-1)
        break
      case 'Home':
        event.preventDefault()
        focusFirst()
        break
      case 'End':
        event.preventDefault()
        focusLast()
        break
      default:
        break
    }
  }

  function resolveItemTitle(item: CwTabbarItem): string | undefined {
    if (item.tooltip) {
      return undefined
    }
    if (item.title !== undefined) {
      return item.title
    }
    if (item.hideLabel && item.label) {
      return item.label
    }
    return undefined
  }

  function resolveItemTabindex(index: number, itemDisabled: boolean) {
    if (itemDisabled || disabled) {
      return undefined
    }
    const focusIndex = currentFocusableIndex
    if (focusIndex === -1) {
      return index === 0 ? (tabindex ?? 0) : -1
    }
    return index === focusIndex ? (tabindex ?? 0) : -1
  }

  function getBadgeAriaLabel(item: CwTabbarItem) {
    if (item.badge === undefined || item.badge === null || `${item.badge}` === '') {
      return undefined
    }
    const prefix = item.badgeLabel || texts.badgeLabel || ''
    if (!prefix) {
      return `${item.badge}`
    }
    return `${prefix}: ${item.badge}`
  }

  function resolveItemTooltipTrigger(item: CwTabbarItem): PopupTrigger {
    if (tooltipTouchLongPress && item.tooltip) return 'manual'
    return 'hover'
  }

  function getIconStyles() {
    return styles.itemIconStyles || {}
  }

  function renderItemContent(item: CwTabbarItem, active: boolean) {
    const iconStyles = getIconStyles()
    const iconSlot = itemIconSlot?.({
      item,
      active,
      iconStyles,
    })
    const labelSlot = itemLabelSlot?.({ item, active })

    return (
      <div className={styles.itemContent}>
        <div className={styles.itemIconWrapper}>
          {iconSlot !== undefined ? (
            iconSlot
          ) : (
            <CwIcon
              name={item.icon}
              prefix="icon"
              size={iconStyles?.size ?? 1}
              className={iconStyles?.class}
            />
          )}
          {item.badge !== undefined &&
          item.badge !== null &&
          `${item.badge}` !== '' ? (
            <span
              className={[
                styles.badge,
                disabled || item.disabled
                  ? styles.badgeDisabled
                  : readonly
                    ? styles.badgeReadonly
                    : styles.badgeNormal,
              ]
                .filter(Boolean)
                .join(' ')}
              role="status"
              aria-label={getBadgeAriaLabel(item)}
            >
              {item.badge}
            </span>
          ) : null}
        </div>
        {!item.hideLabel ? (
          <span
            className={[
              styles.itemLabel,
              disabled || item.disabled
                ? styles.itemLabelDisabled
                : readonly
                  ? styles.itemLabelReadonly
                  : active
                    ? styles.itemLabelActive
                    : styles.itemLabelNormal,
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {labelSlot !== undefined ? labelSlot : item.label}
          </span>
        ) : null}
      </div>
    )
  }

  const rootClassName = [
    styles.root,
    disabled
      ? styles.rootDisabled
      : readonly
        ? styles.rootReadonly
        : styles.rootNormal,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      {...rest}
      className={rootClassName}
      role="tablist"
      aria-label={texts.tabbarLabel}
      aria-disabled={disabled ? 'true' : 'false'}
      aria-readonly={readonly ? 'true' : 'false'}
      aria-orientation={
        resolvedOrientation === 'vertical' ? 'vertical' : 'horizontal'
      }
    >
      <CwTabbarItemsViewport
        ref={itemsViewportRef}
        scroll={useHorizontalItemsScroll}
        hideScrollbar={resolvedItemsScrollHideScrollbar}
        cwDivRootClass={tabbarHorizontalItemsScrollCwDivClasses.root}
        cwDivViewportClass={tabbarHorizontalItemsScrollCwDivClasses.viewport}
        cwDivContentClass={tabbarHorizontalItemsScrollCwDivClasses.content}
      >
        <div className={itemsContainerClass}>
          {itemsValue.map((item, index) => {
            const active = item.key === currentValue
            const itemClassName = [
              styles.item,
              disabled || item.disabled
                ? styles.itemDisabled
                : readonly
                  ? styles.itemReadonly
                  : active
                    ? styles.itemActive
                    : styles.itemNormal,
              isFocusVisibleForIndex(index) && !disabled && !item.disabled
                ? styles.itemFocused
                : '',
            ]
              .filter(Boolean)
              .join(' ')

            const content = renderItemContent(item, active)

            return (
              <div
                key={item.key}
                ref={(element) => {
                  itemRefs.current[index] = element
                }}
                className={itemClassName}
                role="tab"
                aria-selected={active ? 'true' : 'false'}
                aria-disabled={disabled || item.disabled ? 'true' : 'false'}
                aria-label={item.ariaLabel || item.label}
                tabIndex={resolveItemTabindex(index, Boolean(item.disabled))}
                title={resolveItemTitle(item)}
                onClick={() => handleItemClick(item)}
                onTouchStart={(event) => {
                  getLongPressHandlers(item)?.onTouchStart({
                    touches: event.touches,
                  })
                }}
                onTouchMove={(event) => {
                  getLongPressHandlers(item)?.onTouchMove({
                    touches: event.touches,
                  })
                }}
                onTouchEnd={() => {
                  getLongPressHandlers(item)?.onTouchEnd()
                }}
                onTouchCancel={() => {
                  getLongPressHandlers(item)?.onTouchCancel()
                }}
                onFocus={(event) => handleItemFocus(index, item, event.nativeEvent)}
                onBlur={() => handleItemBlur(index)}
                onKeyDown={(event) => handleItemKeyDown(event, index, item)}
              >
                {item.tooltip ? (
                  <CwTooltip
                    ref={(instance) => {
                      if (instance) {
                        tooltipInstanceByKey.current.set(item.key, instance)
                      } else {
                        tooltipInstanceByKey.current.delete(item.key)
                      }
                    }}
                    content={item.tooltip}
                    placement={resolvedTooltipPlacement}
                    trigger={resolveItemTooltipTrigger(item)}
                    showDelay={tooltipShowDelay}
                    offset={resolvedTooltipOffset}
                    flip={resolvedTooltipFlip}
                    closeOnClickOutside={
                      tooltipTouchLongPress ? true : undefined
                    }
                    className={tooltipTriggerClass}
                    triggerSlot={content}
                  />
                ) : (
                  content
                )}
              </div>
            )
          })}
        </div>
      </CwTabbarItemsViewport>
    </div>
  )
}

export default CwTabbar
