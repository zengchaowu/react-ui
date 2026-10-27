import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import type {
  HTMLAttributes,
  KeyboardEvent as ReactKeyboardEvent,
  ReactNode,
} from 'react'
import { CwPopup } from '../CwPopup'
import { CwButton } from '../CwButton/CwButton'
import { CwIcon } from '../CwIcon/CwIcon'
import { CwDiv } from '../CwDiv/CwDiv'
import { createDimensions } from '@zengchaowu/ui-shared/components/CwPopup/plugins/dimensions'
import { createPosition } from '@zengchaowu/ui-shared/components/CwPopup/plugins/position'
import { createOffset } from '@zengchaowu/ui-shared/components/CwPopup/plugins/offset'
import { createFlip } from '@zengchaowu/ui-shared/components/CwPopup/plugins/flip'
import { createAdaptiveHeight } from '@zengchaowu/ui-shared/components/CwPopup/plugins/adaptive-height'
import type { CwDropdownProps, CwDropdownTriggerSlotScope } from './types'
import type { CwDropdownItem } from '@zengchaowu/ui-shared/components/CwDropdown/types'
import {
  dropdownBase,
  CW_DROPDOWN_POPUP_SHELL_CLASS,
  CW_DROPDOWN_POPUP_TRIGGER_CLASS,
  CW_DROPDOWN_SIDEBAR_POPUP_TRIGGER_CLASS,
  cwDropdownAppearanceLayout,
} from './styles'
import { defaultTexts } from '@zengchaowu/ui-shared/components/CwDropdown/texts'

export interface CwDropdownComponentProps
  extends CwDropdownProps,
    Omit<
      HTMLAttributes<HTMLDivElement>,
      'children' | 'className' | 'onSelect' | 'onVisibleChange'
    > {}

const popupPlugins = [
  createDimensions(),
  createAdaptiveHeight({ padding: 14, minHeight: 48 }),
  createFlip({ padding: 8 }),
  createPosition(),
  createOffset({ offset: 6 }),
]

const TRIGGER_FOCUSABLE_SELECTOR =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"]), [role="button"]'

export function CwDropdown({
  items = [],
  disabled = false,
  triggerType = 'primary',
  triggerVariant = 'solid',
  size = 'medium',
  triggerLeadingIcon,
  showTriggerCaret = true,
  triggerFullWidth = false,
  appearance = 'default',
  showSelectedCheck = false,
  popupClass,
  popupTriggerClass,
  texts: textsProp,
  open,
  onOpenChange,
  onVisibleChange,
  onSelect,
  triggerSlot,
  className,
  ...rest
}: CwDropdownComponentProps) {
  const componentIdRef = useRef('')
  if (!componentIdRef.current) {
    componentIdRef.current = `cw-dropdown-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 11)}`
  }
  const componentId = componentIdRef.current
  const menuId = `${componentId}-menu`

  const styles = useMemo(
    () => ({
      ...dropdownBase,
      ...cwDropdownAppearanceLayout[appearance],
    }),
    [appearance],
  )

  const textsMerged = useMemo(
    () => ({ ...defaultTexts, ...(textsProp ?? {}) }),
    [textsProp],
  )

  const [internalOpen, setInternalOpen] = useState(false)
  const openModel = open !== undefined ? open : internalOpen

  const [triggerWidth, setTriggerWidth] = useState('auto')
  const [popupMaxHeight, setPopupMaxHeight] = useState<number | null>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [hasKeyboardInteract, setHasKeyboardInteract] = useState(false)

  const triggerWrapRef = useRef<HTMLDivElement | null>(null)
  const openRef = useRef(openModel)
  openRef.current = openModel

  const setOpen = useCallback(
    (next: boolean) => {
      if (open === undefined) setInternalOpen(next)
      onOpenChange?.(next)
    },
    [open, onOpenChange],
  )

  const dropdownPopupShellClass =
    popupClass !== undefined ? popupClass : CW_DROPDOWN_POPUP_SHELL_CLASS
  const dropdownPopupTriggerClass =
    popupTriggerClass !== undefined
      ? popupTriggerClass
      : appearance === 'sidebar-full'
        ? CW_DROPDOWN_SIDEBAR_POPUP_TRIGGER_CLASS
        : CW_DROPDOWN_POPUP_TRIGGER_CLASS

  const reserveCheckColumn =
    showSelectedCheck === true && items.some((item) => item.selected != null)
  /** 任一有 icon 时占位整列，避免有无图标行高/对齐不一致 */
  const reserveIconColumn = items.some((item) => !!item.icon)

  const menuInlineStyle = useMemo(() => {
    const style: Record<string, string> = { minWidth: triggerWidth }
    if (popupMaxHeight != null && popupMaxHeight > 0) {
      style.maxHeight = `${popupMaxHeight}px`
    }
    return style
  }, [triggerWidth, popupMaxHeight])

  const itemSizeClass = useMemo(() => {
    const map = {
      small: styles.sizeSmall,
      medium: styles.sizeMedium,
      large: styles.sizeLarge,
    }
    return map[size || 'medium']
  }, [styles, size])

  const isPrimarySolidTrigger =
    triggerType === 'primary' && triggerVariant === 'solid'

  const leadingIconStylesResolved = useMemo(() => {
    const base = styles.leadingIconStyles
    const tone = isPrimarySolidTrigger
      ? 'text-[var(--text-color-anti)]'
      : 'text-[var(--text-color-primary)]'
    return {
      ...base,
      class: [base.class || '', tone].filter(Boolean).join(' '),
      size: base.size ?? 1.125,
    }
  }, [styles, isPrimarySolidTrigger])

  const arrowIconStylesResolved = useMemo(() => {
    const base = styles.arrowIconStyles || {}
    const tone = isPrimarySolidTrigger
      ? 'text-current'
      : 'text-[var(--text-color-secondary)]'
    return {
      size: base.size ?? 1,
      class: [
        'inline-flex items-center justify-center transition-transform duration-200',
        tone,
        openModel ? styles.arrowOpen : '',
      ]
        .filter(Boolean)
        .join(' '),
    }
  }, [styles, isPrimarySolidTrigger, openModel])

  const handleTriggerResize = useCallback(
    (nextSize: { width: number; height: number }) => {
      setTriggerWidth(`${Math.max(nextSize.width, 1)}px`)
    },
    [],
  )

  const handleMaxHeightChange = useCallback((maxHeight: number | null) => {
    setPopupMaxHeight(maxHeight)
  }, [])

  const handlePopupVisibleChange = useCallback(
    (visible: boolean) => {
      if (visible !== openRef.current) setOpen(visible)
    },
    [setOpen],
  )

  const firstEnabledIndex = useCallback(() => {
    const index = items.findIndex((item) => !item.disabled)
    return index >= 0 ? index : 0
  }, [items])

  const focusMenuItem = useCallback(
    (index: number, retries = 5) => {
      if (!openRef.current) return
      const el = document.getElementById(`${componentId}-item-${index}`)
      if (el) {
        el.focus()
        return
      }
      if (retries > 0) {
        requestAnimationFrame(() => focusMenuItem(index, retries - 1))
      }
    },
    [componentId],
  )

  const focusTrigger = useCallback(() => {
    const wrap = triggerWrapRef.current
    const focusable = wrap?.querySelector<HTMLElement>(
      TRIGGER_FOCUSABLE_SELECTOR,
    )
    focusable?.focus?.()
  }, [])

  const menuItemClassList = useCallback(
    (item: CwDropdownItem, index: number) => {
      const itemDisabled = !!item.disabled
      const selected = !itemDisabled && !!item.selected
      const keyboard =
        index === activeIndex && !itemDisabled && hasKeyboardInteract
      const keyboardClass = keyboard
        ? selected
          ? styles.menuItemKeyboardOnSelected
          : styles.menuItemKeyboard
        : ''
      return [
        styles.menuItem,
        itemSizeClass,
        itemDisabled ? styles.menuItemDisabled : styles.menuItemNormal,
        selected && !keyboard ? styles.menuItemSelected : '',
        // 未选中才挂 hover:6%，选中用 menuItemSelected 自带 hover:16%
        !itemDisabled && !selected && !keyboard ? styles.menuItemHover : '',
        keyboardClass,
      ]
        .filter(Boolean)
        .join(' ')
    },
    [
      activeIndex,
      hasKeyboardInteract,
      itemSizeClass,
      styles,
    ],
  )

  const onTriggerClick = useCallback(() => {
    if (disabled) return
    setOpen(!openRef.current)
  }, [disabled, setOpen])

  const onTriggerKeydown = useCallback(
    (event: ReactKeyboardEvent<HTMLDivElement>) => {
      if (disabled || openRef.current) return
      if (event.key === 'ArrowDown') {
        event.preventDefault()
        setHasKeyboardInteract(true)
        setOpen(true)
      }
    },
    [disabled, setOpen],
  )

  const moveActive = useCallback(
    (delta: number) => {
      const total = items.length
      if (total === 0) return
      let index = activeIndex
      for (let step = 0; step < total; step += 1) {
        index = (index + delta + total) % total
        if (!items[index]?.disabled) {
          setActiveIndex(index)
          requestAnimationFrame(() => focusMenuItem(index))
          return
        }
      }
    },
    [activeIndex, items, focusMenuItem],
  )

  const selectItem = useCallback(
    (item: CwDropdownItem) => {
      if (item.disabled || disabled) return
      onSelect?.(item.value, item)
      setOpen(false)
    },
    [disabled, onSelect, setOpen],
  )

  const onMenuKeydown = useCallback(
    (event: ReactKeyboardEvent<HTMLDivElement>) => {
      if (items.length === 0) return
      setHasKeyboardInteract(true)
      if (event.key === 'ArrowDown') {
        event.preventDefault()
        moveActive(1)
      } else if (event.key === 'ArrowUp') {
        event.preventDefault()
        moveActive(-1)
      } else if (event.key === 'Home') {
        event.preventDefault()
        const index = firstEnabledIndex()
        setActiveIndex(index)
        requestAnimationFrame(() => focusMenuItem(index))
      } else if (event.key === 'End') {
        event.preventDefault()
        for (let index = items.length - 1; index >= 0; index -= 1) {
          if (!items[index]?.disabled) {
            setActiveIndex(index)
            requestAnimationFrame(() => focusMenuItem(index))
            break
          }
        }
      } else if (event.key === 'Enter') {
        const item = items[activeIndex]
        if (item && !item.disabled) {
          event.preventDefault()
          selectItem(item)
        }
      }
    },
    [items, activeIndex, moveActive, firstEnabledIndex, focusMenuItem, selectItem],
  )

  const onItemMouseEnter = useCallback(
    (index: number) => {
      if (items[index]?.disabled) return
      setActiveIndex(index)
    },
    [items],
  )

  // items 深监听：展开时重置到第一个可用项（用签名字符串避免每次渲染都重置）
  const itemsSignature = useMemo(
    () =>
      items
        .map((item) => `${String(item.value)}-${item.disabled ? 1 : 0}`)
        .join('|'),
    [items],
  )

  useEffect(() => {
    if (openRef.current) setActiveIndex(firstEnabledIndex())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemsSignature])

  // 展开状态变化：emit visibleChange + 焦点管理（对齐 Vue watch flush: post）
  const prevOpenRef = useRef(openModel)
  useEffect(() => {
    if (prevOpenRef.current === openModel) return
    prevOpenRef.current = openModel
    onVisibleChange?.(openModel)
    if (openModel) {
      const index = firstEnabledIndex()
      setActiveIndex(index)
      requestAnimationFrame(() => focusMenuItem(index))
    } else {
      setHasKeyboardInteract(false)
      focusTrigger()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openModel])

  const triggerContent: ReactNode =
    typeof triggerSlot === 'function'
      ? triggerSlot({
          open: openModel,
          toggle: onTriggerClick,
          menuId,
          disabled,
        } satisfies CwDropdownTriggerSlotScope)
      : triggerSlot

  return (
    <div
      className={[styles.root, className].filter(Boolean).join(' ')}
      {...rest}
    >
      <CwPopup
        modelValue={openModel}
        placement="bottom-start"
        trigger="manual"
        plugins={popupPlugins}
        closeOnClickOutside={true}
        popupClass={dropdownPopupShellClass}
        triggerClass={dropdownPopupTriggerClass}
        onVisibleChange={handlePopupVisibleChange}
        onTriggerResize={handleTriggerResize}
        onMaxHeightChange={handleMaxHeightChange}
        triggerSlot={
          <div
            ref={triggerWrapRef}
            className={styles.triggerWrap}
            onKeyDown={onTriggerKeydown}
          >
            {triggerContent != null ? (
              triggerContent
            ) : (
              <CwButton
                className={[
                  'min-w-0',
                  triggerFullWidth ? 'w-full' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                type={triggerType}
                variant={triggerVariant}
                size={size}
                disabled={disabled}
                aria-expanded={openModel ? 'true' : 'false'}
                aria-haspopup="menu"
                aria-controls={menuId}
                onClick={onTriggerClick}
              >
                <span className={styles.triggerInner}>
                  {triggerLeadingIcon ? (
                    <CwIcon
                      name={triggerLeadingIcon}
                      prefix="icon"
                      size={leadingIconStylesResolved.size ?? 1}
                      className={leadingIconStylesResolved.class}
                    />
                  ) : null}
                  {textsMerged.triggerLabel}
                  {showTriggerCaret ? (
                    <CwIcon
                      name="common--dir--arrow-down-line"
                      prefix="icon"
                      size={arrowIconStylesResolved.size ?? 1}
                      className={arrowIconStylesResolved.class}
                    />
                  ) : null}
                </span>
              </CwButton>
            )}
          </div>
        }
      >
        <CwDiv
          id={menuId}
          role="menu"
          className={styles.menu}
          contentClass={styles.menuContent}
          style={menuInlineStyle}
          onKeyDown={onMenuKeydown}
          onMouseMove={() => setHasKeyboardInteract(false)}
        >
          {items.length > 0 ? (
            items.map((item, index) => (
              <div
                id={`${componentId}-item-${index}`}
                key={`${String(item.value)}-${index}`}
                role="menuitem"
                tabIndex={index === activeIndex ? 0 : -1}
                className={menuItemClassList(item, index)}
                aria-disabled={item.disabled ? 'true' : 'false'}
                aria-checked={item.selected ? 'true' : undefined}
                onClick={() => selectItem(item)}
                onMouseEnter={() => onItemMouseEnter(index)}
              >
                {reserveCheckColumn ? (
                  <span
                    className={styles.menuItemCheck}
                    aria-hidden="true"
                  >
                    {item.selected ? (
                      <CwIcon
                        name="common--status--check-line"
                        prefix="icon"
                        size={styles.checkIconStyles.size ?? 0.75}
                        className={styles.checkIconStyles.class}
                      />
                    ) : null}
                  </span>
                ) : null}
                {reserveIconColumn ? (
                  <span
                    className={styles.menuItemIcon}
                    aria-hidden="true"
                  >
                    {item.icon ? (
                      <CwIcon
                        name={item.icon}
                        prefix="icon"
                        size={styles.itemIconStyles.size ?? 1}
                        className={styles.itemIconStyles.class}
                      />
                    ) : null}
                  </span>
                ) : null}
                <span className={styles.menuItemLabel}>{item.label}</span>
              </div>
            ))
          ) : (
            <div
              className={[
                itemSizeClass,
                'px-3 py-6 text-center text-[var(--text-color-secondary)]',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {textsMerged.empty}
            </div>
          )}
        </CwDiv>
      </CwPopup>
    </div>
  )
}

export default CwDropdown
