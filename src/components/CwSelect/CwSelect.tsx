import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import type {
  FocusEvent,
  HTMLAttributes,
} from 'react'
import { CwPopup } from '../CwPopup'
import { CwInput } from '../CwInput/CwInput'
import { CwCheckbox } from '../CwCheckbox/CwCheckbox'
import { CwTag } from '../CwTag/CwTag'
import { CwIcon } from '../CwIcon/CwIcon'
import { CwDiv } from '../CwDiv/CwDiv'
import { createDimensions } from '../CwPopup/plugins/dimensions'
import { createPosition } from '../CwPopup/plugins/position'
import { createOffset } from '../CwPopup/plugins/offset'
import { createFlip } from '../CwPopup/plugins/flip'
import { createAdaptiveHeight } from '../CwPopup/plugins/adaptive-height'
import { cwClearIconSize } from '@zengchaowu/ui-shared/functions/ui/cwClearIconSize'
import { FORM_CONTROL_FOCUS_CLASS } from '@zengchaowu/ui-shared/functions/ui/focusStyles'
import { scrollElementIntoCwDivViewport } from '../CwDiv/scrollElementIntoCwDivViewport'
import { useBrowserFocusVisible } from '../../hooks/useBrowserFocusVisible'
import type {
  CwSelectOption,
  CwSelectProps,
  CwSelectValue,
} from './types'
import {
  selectBase,
  CW_SELECT_POPUP_SHELL_CLASS,
  CW_SELECT_POPUP_TRIGGER_CLASS,
  CW_SELECT_EMBEDDED_ROOT_CLASS,
  CW_SELECT_EMBEDDED_SUFFIX_CLASS,
  CW_SELECT_EMBEDDED_ARROW_ICON_SIZE,
  CW_SELECT_PLAIN_ROOT_CLASS,
  CW_SELECT_PLAIN_TRIGGER_CLASS,
  CW_SELECT_PLAIN_SUFFIX_CLASS,
  CW_SELECT_PLAIN_ARROW_ICON_SIZE,
} from './styles'
import { defaultTexts } from './texts'
import { useSelectKeyboard } from './hooks/useSelectKeyboard'

export interface CwSelectComponentProps
  extends CwSelectProps,
    Omit<
      HTMLAttributes<HTMLDivElement>,
      'children' | 'className' | 'onChange' | 'onFocus' | 'onBlur'
    > {}

const popupPlugins = [
  createDimensions(),
  createAdaptiveHeight({ padding: 14, minHeight: 60 }),
  createFlip({ padding: 8 }),
  createPosition(),
  createOffset({ offset: 6 }),
]

const PLAIN_DROPDOWN_MIN_PX = 120

/** 多选标签结构（对齐 vue-ui CwSelectTags 样式） */
const selectTagsBase = {
  tagsWrapper: 'flex items-center rounded-md overflow-hidden outline-none border',
  tagsWrapperNormal:
    'border-[var(--border-color)] cursor-text bg-[var(--bg-color-container)]',
  tagsWrapperReadonly:
    'border-[var(--border-color)] cursor-default bg-[var(--bg-color-container)]',
  tagsWrapperFocus: FORM_CONTROL_FOCUS_CLASS,
  tagsWrapperDisabled:
    'border-[var(--border-color)] bg-[var(--bg-color-component-disabled)] cursor-not-allowed',
  tagsContainer: 'flex min-w-0 flex-1 flex-wrap items-center gap-1 px-2 py-1.5',
  tagItem: '',
  moreTag: 'inline-flex items-center gap-1 cursor-pointer',
  placeholder: 'flex items-center text-[var(--text-color-placeholder)]',
  placeholderDisabled: 'text-[var(--text-color-disabled)]',
  sizeSmall: 'min-h-7',
  sizeMedium: 'min-h-9',
  sizeLarge: 'min-h-11',
  placeholderSizeSmall: 'text-xs',
  placeholderSizeMedium: 'text-sm',
  placeholderSizeLarge: 'text-base',
}

const TRUNCATE_TEXT_CLASS =
  'cw-truncate-text block w-full min-w-0 max-w-full overflow-hidden text-ellipsis whitespace-nowrap'

interface CwSelectTagItem {
  label: string
  value: CwSelectValue
}

const defaultTagsTexts = {
  placeholder: '请选择标签',
  label: '标签选择',
  selectAll: '全选',
  more: '+{count}',
}

export function CwSelect({
  options = [],
  value,
  multiple = false,
  placeholder,
  disabled = false,
  readonly = false,
  clearable = false,
  selectAll,
  size = 'medium',
  inputAppearance,
  align = 'left',
  tagsProps: tagsPropsProp,
  popupClass,
  popupTriggerClass,
  texts: textsProp,
  onChange,
  onSelectAllChange,
  onClear,
  onFocus,
  onBlur,
  onTagClick,
  onTagClose,
  onMoreClick,
  iconSlot,
  className,
  ...rest
}: CwSelectComponentProps) {
  const componentIdRef = useRef('')
  if (!componentIdRef.current) {
    componentIdRef.current = `cw-select-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 11)}`
  }
  const componentId = componentIdRef.current

  const modelValue = value ?? null
  const tagsProps = tagsPropsProp ?? {}

  const isPlainAppearance = inputAppearance === 'plain'

  /** plain / 右对齐：弹层右缘贴齐触发器右缘（CellForm） */
  const popupPlacement = isPlainAppearance
    ? 'bottom-end'
    : align === 'right'
      ? 'bottom-end'
      : align === 'left'
        ? 'bottom-start'
        : 'bottom'

  const styles = useMemo(() => {
    if (isPlainAppearance) {
      return {
        ...selectBase,
        root: CW_SELECT_PLAIN_ROOT_CLASS,
        suffix: CW_SELECT_PLAIN_SUFFIX_CLASS,
      }
    }
    if (inputAppearance === 'embedded') {
      return {
        ...selectBase,
        root: CW_SELECT_EMBEDDED_ROOT_CLASS,
        suffix: CW_SELECT_EMBEDDED_SUFFIX_CLASS,
      }
    }
    return selectBase
  }, [isPlainAppearance, inputAppearance])

  const selectPopupShellClass = popupClass ?? CW_SELECT_POPUP_SHELL_CLASS
  const selectPopupTriggerClass = popupTriggerClass
    ? popupTriggerClass
    : isPlainAppearance
      ? CW_SELECT_PLAIN_TRIGGER_CLASS
      : CW_SELECT_POPUP_TRIGGER_CLASS

  const texts = useMemo(
    () => ({ ...defaultTexts, ...(textsProp ?? {}) }),
    [textsProp],
  )

  const tagsTexts = useMemo(
    () => ({ ...defaultTagsTexts, ...(texts.tagsTexts ?? {}) }),
    [texts],
  )

  const clearIconStylesResolved = useMemo(
    () => ({
      ...selectBase.clearIconStyles,
      size: cwClearIconSize(size),
    }),
    [size],
  )

  const optionSizeClass = useMemo(() => {
    const sizeMap = {
      small: styles.sizeSmall,
      medium: styles.sizeMedium,
      large: styles.sizeLarge,
    }
    return sizeMap[size || 'medium']
  }, [styles, size])

  const emptySizeClass = useMemo(() => {
    const sizeMap = {
      small: styles.emptySizeSmall,
      medium: styles.emptySizeMedium,
      large: styles.emptySizeLarge,
    }
    return sizeMap[size || 'medium']
  }, [styles, size])

  const selectAllOptionSizeClass = useMemo(() => {
    const sizeMap = {
      small: styles.selectAllOptionSizeSmall,
      medium: styles.selectAllOptionSizeMedium,
      large: styles.selectAllOptionSizeLarge,
    }
    return sizeMap[size || 'medium']
  }, [styles, size])

  const [popupVisible, setPopupVisible] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [triggerFocused, setTriggerFocused] = useState(false)
  const [triggerHovered, setTriggerHovered] = useState(false)
  const [hasKeyboardInteracted, setHasKeyboardInteracted] = useState(false)
  const [popupMaxHeight, setPopupMaxHeight] = useState<number | null>(null)

  const popupVisibleRef = useRef(popupVisible)
  popupVisibleRef.current = popupVisible
  const selectedIndexRef = useRef(selectedIndex)
  selectedIndexRef.current = selectedIndex

  const listInlineStyle = useMemo(() => {
    const style: Record<string, string> = {}
    if (popupMaxHeight != null && popupMaxHeight > 0) {
      style.maxHeight = `${popupMaxHeight}px`
    }
    return style
  }, [popupMaxHeight])

  // 触发器宽度（plain 随文案收缩时可能很窄，下拉至少保持可读宽度）
  const [triggerWidth, setTriggerWidth] = useState('7.5rem')

  const handleTriggerResize = useCallback(
    (nextSize: { width: number; height: number }) => {
      const width = isPlainAppearance
        ? Math.max(nextSize.width, PLAIN_DROPDOWN_MIN_PX)
        : nextSize.width
      setTriggerWidth(`${width}px`)
    },
    [isPlainAppearance],
  )

  const displayValue = useMemo(() => {
    if (multiple) return '' // 多选模式下不使用 displayValue
    // null / undefined 才是未选择。空字符串可以是合法选项（例如「所有类型」）。
    if (modelValue === null || modelValue === undefined) return ''
    if (Array.isArray(modelValue)) return ''
    const option = options.find((opt) => opt.value === modelValue)
    return option?.label || ''
  }, [multiple, modelValue, options])

  // 多选模式下的选中值数组
  const selectedValues = useMemo<CwSelectValue[]>(() => {
    if (!multiple) return []
    return Array.isArray(modelValue) ? modelValue : []
  }, [multiple, modelValue])

  // 全选状态（始终根据实际选中情况判断）
  const isSelectAll = useMemo(() => {
    if (!multiple) return false
    const enabledOptions = options.filter((opt) => !opt.disabled)
    if (enabledOptions.length === 0) return false
    if (selectedValues.length === 0) return false
    return (
      enabledOptions.length === selectedValues.length &&
      enabledOptions.every((opt) => selectedValues.includes(opt.value))
    )
  }, [multiple, options, selectedValues])

  // 全选 Checkbox 的值（支持 indeterminate 状态）
  const selectAllCheckboxValue = useMemo<boolean | 'indeterminate'>(() => {
    if (!multiple) return false
    const enabledOptions = options.filter((opt) => !opt.disabled)
    if (enabledOptions.length === 0) return false
    if (selectedValues.length === 0) return false

    const selectedCount = enabledOptions.filter((opt) =>
      selectedValues.includes(opt.value),
    ).length

    if (selectedCount === 0) return false
    if (selectedCount === enabledOptions.length) return true
    return 'indeterminate'
  }, [multiple, options, selectedValues])

  // 为多选标签准备的数据
  const tagsForSelectTags = useMemo<CwSelectTagItem[]>(
    () => options.map((opt) => ({ label: opt.label, value: opt.value })),
    [options],
  )

  const isOptionSelected = useCallback(
    (option: CwSelectOption) => {
      if (multiple) return selectedValues.includes(option.value)
      return option.value === modelValue
    },
    [multiple, selectedValues, modelValue],
  )

  // 判断是否显示清除按钮（触发器聚焦 / 悬停 / 下拉展开时显示）
  const showClearButton = useMemo(() => {
    if (!clearable || disabled || readonly) return false
    const hasValue = multiple
      ? selectedValues.length > 0
      : modelValue !== null && modelValue !== undefined && modelValue !== ''
    if (!hasValue) return false
    return triggerFocused || triggerHovered || popupVisible
  }, [
    clearable,
    disabled,
    readonly,
    multiple,
    selectedValues.length,
    modelValue,
    triggerFocused,
    triggerHovered,
    popupVisible,
  ])

  const arrowIconStyle = useMemo(() => {
    const iconStyle = styles.arrowIconStyles || {}
    const iconSize = isPlainAppearance
      ? CW_SELECT_PLAIN_ARROW_ICON_SIZE
      : inputAppearance === 'embedded'
        ? CW_SELECT_EMBEDDED_ARROW_ICON_SIZE
        : (iconStyle.size ?? 1)
    return {
      ...iconStyle,
      size: iconSize,
      class: [
        iconStyle.class || '',
        popupVisible ? styles.arrowOpen : '',
      ]
        .filter(Boolean)
        .join(' '),
    }
  }, [styles, isPlainAppearance, inputAppearance, popupVisible])

  const optionClassList = useCallback(
    (option: CwSelectOption, index: number) => {
      const optionDisabled = !!option.disabled
      const selected = !optionDisabled && isOptionSelected(option)
      const focused =
        hasKeyboardInteracted && index === selectedIndex && !optionDisabled
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
        // 未选中才挂 hover:6%，选中用 optionSelected 自带 hover:16%
        !optionDisabled && !selected && !focused ? styles.optionHover : '',
        focusClass,
      ]
        .filter(Boolean)
        .join(' ')
    },
    [
      hasKeyboardInteracted,
      isOptionSelected,
      selectedIndex,
      styles,
      optionSizeClass,
    ],
  )

  const resolveOpenSelectedIndex = useCallback(() => {
    if (multiple) {
      if (selectedValues.length === 0) return -1
      return options.findIndex((opt) => selectedValues.includes(opt.value))
    }
    return options.findIndex((opt) => opt.value === modelValue)
  }, [multiple, selectedValues, options, modelValue])

  /** 打开后对准选中项；等自适应高度落地后再滚一次 */
  const scrollOpenSelectedIntoView = useCallback(
    (index: number) => {
      if (index < 0) return
      const run = () => {
        scrollElementIntoCwDivViewport(
          document.getElementById(`${componentId}-option-${index}`),
          { block: 'center' },
        )
      }
      requestAnimationFrame(() => {
        run()
        requestAnimationFrame(run)
      })
    },
    [componentId],
  )

  const openPopup = useCallback(() => {
    if (disabled || readonly) return
    setPopupVisible(true)
    setHasKeyboardInteracted(false)
  }, [disabled, readonly])

  const closePopup = useCallback(() => {
    setPopupVisible(false)
  }, [])

  const handlePopupVisibleChange = useCallback((visible: boolean) => {
    setPopupVisible(visible)
  }, [])

  const handleTriggerClick = useCallback(() => {
    if (disabled || readonly) return
    if (!popupVisibleRef.current) {
      openPopup()
    } else {
      closePopup()
    }
  }, [disabled, readonly, openPopup, closePopup])

  const emitChange = useCallback(
    (
      nextValue: CwSelectValue | CwSelectValue[] | null,
      option?: CwSelectOption | CwSelectOption[] | null,
    ) => {
      onChange?.(nextValue, option)
    },
    [onChange],
  )

  const selectedOptionsOf = useCallback(
    (values: CwSelectValue[]) =>
      values
        .map((v) => options.find((opt) => opt.value === v))
        .filter((opt): opt is CwSelectOption => Boolean(opt)),
    [options],
  )

  const handleOptionClick = useCallback(
    (option: CwSelectOption) => {
      if (option.disabled || readonly) return

      if (multiple) {
        // 多选模式：切换选中状态，不关闭弹出层
        const currentValues = Array.isArray(modelValue) ? [...modelValue] : []
        const index = currentValues.indexOf(option.value)
        if (index > -1) {
          currentValues.splice(index, 1)
        } else {
          currentValues.push(option.value)
        }
        emitChange(currentValues, selectedOptionsOf(currentValues))

        const enabledOptions = options.filter((opt) => !opt.disabled)
        const isAllSelected =
          enabledOptions.length > 0 &&
          currentValues.length === enabledOptions.length &&
          enabledOptions.every((opt) => currentValues.includes(opt.value))
        onSelectAllChange?.(isAllSelected)
      } else {
        // 单选模式：直接选中并关闭弹出层
        emitChange(option.value, option)
        closePopup()
      }
    },
    [
      readonly,
      multiple,
      modelValue,
      options,
      emitChange,
      selectedOptionsOf,
      onSelectAllChange,
      closePopup,
    ],
  )

  const handleClear = useCallback(() => {
    if (disabled || readonly) return
    const clearedValue: CwSelectValue[] | null = multiple ? [] : null
    emitChange(clearedValue, multiple ? [] : null)
    // 清除时也要更新全选状态
    if (multiple && selectAll !== undefined && selectAll) {
      onSelectAllChange?.(false)
    } else if (multiple && selectAll === undefined) {
      onSelectAllChange?.(false)
    }
    onClear?.()
  }, [
    disabled,
    readonly,
    multiple,
    selectAll,
    emitChange,
    onSelectAllChange,
    onClear,
  ])

  const handleMaxHeightChange = useCallback(
    (height: number | null) => {
      setPopupMaxHeight(height)
      // 自适应高度落地后视口才稳定，再对准选中项
      if (popupVisibleRef.current && selectedIndexRef.current >= 0) {
        requestAnimationFrame(() =>
          scrollOpenSelectedIntoView(selectedIndexRef.current),
        )
      }
    },
    [scrollOpenSelectedIntoView],
  )

  // 处理全选状态变化（来自标签区）
  const handleSelectAllChange = useCallback(
    (nextSelectAll: boolean) => {
      if (nextSelectAll) {
        const enabledOptions = options.filter((opt) => !opt.disabled)
        const allValues = enabledOptions.map((opt) => opt.value)
        emitChange(allValues, enabledOptions)
        onSelectAllChange?.(true)
      } else {
        emitChange([], [])
        onSelectAllChange?.(false)
      }
    },
    [options, emitChange, onSelectAllChange],
  )

  // 处理全选 Checkbox 切换（来自选项列表顶部）
  const handleSelectAllToggle = useCallback(() => {
    if (disabled || readonly) return
    const enabledOptions = options.filter((opt) => !opt.disabled)
    if (enabledOptions.length === 0) return

    if (isSelectAll) {
      emitChange([], [])
      onSelectAllChange?.(false)
    } else {
      const allValues = enabledOptions.map((opt) => opt.value)
      emitChange(allValues, enabledOptions)
      onSelectAllChange?.(true)
    }
  }, [
    disabled,
    readonly,
    options,
    isSelectAll,
    emitChange,
    onSelectAllChange,
  ])

  const handleTagClick = useCallback(
    (tag: CwSelectTagItem, event: MouseEvent) => {
      const option = options.find((opt) => opt.value === tag.value)
      if (option) onTagClick?.(option, event)
    },
    [options, onTagClick],
  )

  const handleTagClose = useCallback(
    (tag: CwSelectTagItem, event: MouseEvent) => {
      const option = options.find((opt) => opt.value === tag.value)
      if (!option) return
      // 从选中值中移除
      const nextValues = selectedValues.filter(
        (currentValue) => currentValue !== tag.value,
      )
      emitChange(nextValues, selectedOptionsOf(nextValues))
      // 更新全选状态（始终根据实际选中情况判断）
      const enabledOptions = options.filter((opt) => !opt.disabled)
      const isAllSelected =
        enabledOptions.length > 0 &&
        nextValues.length === enabledOptions.length &&
        enabledOptions.every((opt) => nextValues.includes(opt.value))
      onSelectAllChange?.(isAllSelected)
      onTagClose?.(option, event)
    },
    [
      options,
      selectedValues,
      emitChange,
      selectedOptionsOf,
      onSelectAllChange,
      onTagClose,
    ],
  )

  // 多选标签的可视化折叠
  const tagsWrapperRef = useRef<HTMLDivElement | null>(null)
  const tagsContainerRef = useRef<HTMLDivElement | null>(null)
  const {
    isFocusVisible,
    handleFocus: handleFocusVisibleFocus,
    handleBlur: handleFocusVisibleBlur,
  } = useBrowserFocusVisible()

  const collapseSelectAll = tagsProps.collapseSelectAll ?? true
  const showCollapsedSelectAll = isSelectAll && collapseSelectAll
  const maxRows = tagsProps.maxRows

  const selectedTags = useMemo(
    () =>
      tagsForSelectTags.filter((tag) => selectedValues.includes(tag.value)),
    [tagsForSelectTags, selectedValues],
  )

  const [visibleTags, setVisibleTags] = useState<CwSelectTagItem[]>(selectedTags)
  const [showMoreTag, setShowMoreTag] = useState(false)
  const [moreCount, setMoreCount] = useState(0)

  useEffect(() => {
    if (showCollapsedSelectAll) {
      setVisibleTags([])
      setShowMoreTag(false)
      setMoreCount(0)
      return
    }
    setVisibleTags(selectedTags)
    setShowMoreTag(false)
    setMoreCount(0)
  }, [selectedTags, showCollapsedSelectAll])

  useEffect(() => {
    if (showCollapsedSelectAll) return
    if (!maxRows || maxRows <= 0) return
    if (visibleTags.length !== selectedTags.length) return

    const container = tagsContainerRef.current
    if (!container) return
    const elements = Array.from(
      container.querySelectorAll<HTMLElement>('[data-cw-select-tag]'),
    )
    const first = elements[0]
    if (!first) return
    const tagHeight = first.offsetHeight
    if (!tagHeight) return

    // 与 tagsContainer 的 gap-1（0.25rem）一致
    const gap = 4
    const lineHeight = tagHeight + gap
    const computedStyle = getComputedStyle(container)
    const paddingY =
      (parseFloat(computedStyle.paddingTop) || 0) +
      (parseFloat(computedStyle.paddingBottom) || 0)
    const maxHeight = lineHeight * maxRows - gap + paddingY
    if (container.offsetHeight <= maxHeight) return

    const baseTop = first.offsetTop
    let visibleCount = elements.filter(
      (el) => el.offsetTop - baseTop < maxHeight - tagHeight / 2,
    ).length
    if (visibleCount === 0) visibleCount = 1
    if (visibleCount < elements.length) {
      visibleCount = Math.max(1, visibleCount - 1)
    }
    if (visibleCount >= selectedTags.length) return

    setVisibleTags(selectedTags.slice(0, visibleCount))
    setShowMoreTag(true)
    setMoreCount(selectedTags.length - visibleCount)
  }, [maxRows, showCollapsedSelectAll, visibleTags, selectedTags])

  const displayMoreText = (
    tagsProps.moreText ??
    tagsTexts.more ??
    '+{count}'
  ).replace('{count}', moreCount.toString())

  const wrapperSize = tagsProps.size ?? size ?? 'medium'
  const wrapperSizeClass =
    wrapperSize === 'large'
      ? selectTagsBase.sizeLarge
      : wrapperSize === 'small'
        ? selectTagsBase.sizeSmall
        : selectTagsBase.sizeMedium
  const placeholderSizeClass =
    wrapperSize === 'large'
      ? selectTagsBase.placeholderSizeLarge
      : wrapperSize === 'small'
        ? selectTagsBase.placeholderSizeSmall
        : selectTagsBase.placeholderSizeMedium
  const effectiveTagSize =
    tagsProps.tagSize ?? (wrapperSize === 'large' ? 'medium' : 'small')
  const tagClosable =
    (tagsProps.closable ?? true) && !disabled && !readonly

  const handleTagsWrapperFocus = (event: FocusEvent<HTMLDivElement>) => {
    if (disabled) return
    setTriggerFocused(true)
    handleFocusVisibleFocus()
    onFocus?.(event.nativeEvent)
  }

  const handleTagsWrapperBlur = (event: FocusEvent<HTMLDivElement>) => {
    setTriggerFocused(false)
    handleFocusVisibleBlur()
    onBlur?.(event.nativeEvent)
  }

  // 打开弹出层后定位选中项（对齐 Vue openPopup 中的 nextTick 行为）
  useEffect(() => {
    if (!popupVisible) {
      setSelectedIndex(-1)
      setPopupMaxHeight(null)
      return
    }
    const indexToShow = resolveOpenSelectedIndex()
    if (indexToShow >= 0) {
      setSelectedIndex(indexToShow)
      scrollOpenSelectedIntoView(indexToShow)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [popupVisible])

  useSelectKeyboard({
    popupVisible,
    triggerFocused,
    options,
    selectedIndex,
    setSelectedIndex,
    clearable,
    disabled,
    readonly,
    onSelect: (index) => {
      if (index >= 0 && index < options.length) {
        const option = options[index]
        if (option) handleOptionClick(option)
      }
    },
    onOpen: openPopup,
    onClose: closePopup,
    onClear: () => {
      const clearedValue: CwSelectValue[] | null = multiple ? [] : null
      emitChange(clearedValue, multiple ? [] : null)
      if (multiple && selectAll !== undefined && selectAll) {
        onSelectAllChange?.(false)
      } else if (multiple && selectAll === undefined) {
        onSelectAllChange?.(false)
      }
    },
    componentId,
    onKeyboardInteract: () => setHasKeyboardInteracted(true),
  })

  const renderSuffix = () => (
    <div className={styles.suffix}>
      {/* 清除按钮 */}
      {showClearButton ? (
        <div
          className={styles.clearButton}
          aria-label={texts.clear}
          role="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={(event) => {
            event.stopPropagation()
            handleClear()
          }}
        >
          <CwIcon
            name="common--status--close-circle-filled"
            prefix="icon"
            size={clearIconStylesResolved.size ?? 1}
            className={clearIconStylesResolved.class}
          />
        </div>
      ) : null}
      {/* 下拉箭头 */}
      <CwIcon
        name="common--dir--arrow-down-line"
        prefix="icon"
        size={arrowIconStyle.size ?? 1}
        className={arrowIconStyle.class}
      />
    </div>
  )

  const triggerNode = (
    <div
      onClick={handleTriggerClick}
      onMouseEnter={() => setTriggerHovered(true)}
      onMouseLeave={() => setTriggerHovered(false)}
      role="combobox"
      aria-expanded={popupVisible}
      aria-haspopup={true}
      aria-disabled={disabled ? 'true' : 'false'}
      aria-readonly={readonly ? 'true' : 'false'}
      aria-controls={`${componentId}-listbox`}
      aria-activedescendant={
        popupVisible && selectedIndex >= 0
          ? `${componentId}-option-${selectedIndex}`
          : undefined
      }
    >
      {multiple ? (
        <div
          className={[
            'cw-select-tags w-full',
            disabled
              ? 'cursor-not-allowed'
              : readonly
                ? 'cursor-default'
                : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <div
            ref={tagsWrapperRef}
            className={[
              selectTagsBase.tagsWrapper,
              wrapperSizeClass,
              disabled
                ? selectTagsBase.tagsWrapperDisabled
                : readonly
                  ? selectTagsBase.tagsWrapperReadonly
                  : selectTagsBase.tagsWrapperNormal,
              isFocusVisible && !disabled ? selectTagsBase.tagsWrapperFocus : '',
            ]
              .filter(Boolean)
              .join(' ')}
            tabIndex={disabled ? undefined : 0}
            role="button"
            aria-disabled={disabled ? 'true' : 'false'}
            onFocus={handleTagsWrapperFocus}
            onBlur={handleTagsWrapperBlur}
          >
            <div ref={tagsContainerRef} className={selectTagsBase.tagsContainer}>
              {showCollapsedSelectAll ? (
                <CwTag
                  content={tagsProps.selectAllText ?? tagsTexts.selectAll}
                  closable={tagClosable}
                  disabled={disabled}
                  readonly={readonly}
                  type={tagsProps.tagType ?? 'default'}
                  size={effectiveTagSize}
                  className={selectTagsBase.tagItem}
                  onClose={() => handleSelectAllChange(false)}
                />
              ) : visibleTags.length > 0 ? (
                <>
                  {visibleTags.map((tag) => (
                    <CwTag
                      key={tag.value}
                      data-cw-select-tag="true"
                      content={tag.label}
                      closable={tagClosable}
                      disabled={disabled}
                      readonly={readonly}
                      type={tagsProps.tagType ?? 'default'}
                      size={effectiveTagSize}
                      className={[
                        selectTagsBase.tagItem,
                        'tag-item',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      onClose={(event) => handleTagClose(tag, event)}
                      onClick={(event) => handleTagClick(tag, event)}
                    />
                  ))}
                  {showMoreTag ? (
                    <CwTag
                      content={displayMoreText}
                      closable={false}
                      disabled={disabled}
                      readonly={readonly}
                      type={tagsProps.tagType ?? 'default'}
                      size={effectiveTagSize}
                      className={[
                        selectTagsBase.tagItem,
                        selectTagsBase.moreTag,
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      onClick={(event: MouseEvent) =>
                        onMoreClick?.(event)
                      }
                    />
                  ) : null}
                </>
              ) : (
                <div
                  className={[
                    selectTagsBase.placeholder,
                    placeholderSizeClass,
                    disabled ? selectTagsBase.placeholderDisabled : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {placeholder ?? texts.placeholder}
                </div>
              )}
            </div>
            {renderSuffix()}
          </div>
        </div>
      ) : (
        <CwInput
          value={displayValue}
          placeholder={placeholder ?? texts.placeholder}
          disabled={disabled}
          readonly={true}
          clearable={false}
          size={size}
          appearance={inputAppearance}
          align={align}
          texts={texts.inputTexts}
          iconSlot={iconSlot}
          suffixSlot={renderSuffix()}
          onFocus={(event) => {
            setTriggerFocused(true)
            onFocus?.(event)
          }}
          onBlur={(event) => {
            setTriggerFocused(false)
            onBlur?.(event)
          }}
        />
      )}
    </div>
  )

  return (
    <div
      className={[
        styles.root,
        disabled
          ? styles.rootDisabled
          : readonly
            ? styles.rootReadonly
            : styles.rootNormal,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      <CwPopup
        modelValue={popupVisible}
        placement={popupPlacement}
        trigger="manual"
        plugins={popupPlugins}
        closeOnClickOutside={true}
        popupClass={selectPopupShellClass}
        triggerClass={selectPopupTriggerClass}
        onVisibleChange={handlePopupVisibleChange}
        onTriggerResize={handleTriggerResize}
        onMaxHeightChange={handleMaxHeightChange}
        triggerSlot={triggerNode}
      >
        <div className={styles.dropdown} style={{ width: triggerWidth }}>
          {/* 选项列表 */}
          <CwDiv
            id={`${componentId}-listbox`}
            role="listbox"
            className={styles.list}
            contentClass={styles.listContent}
            style={listInlineStyle}
          >
            {options.length > 0 ? (
              <>
                {/* 多选模式：全选 Checkbox */}
                {multiple ? (
                  <div
                    className={[
                      styles.option,
                      selectAllOptionSizeClass,
                      styles.selectAllOption || '',
                      styles.optionNormal,
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    role="option"
                    onClick={(event) => {
                      event.stopPropagation()
                      handleSelectAllToggle()
                    }}
                  >
                    <CwCheckbox
                      value={selectAllCheckboxValue}
                      disabled={disabled}
                      readonly={readonly}
                      size={size}
                      appearance="block"
                    >
                      全选
                    </CwCheckbox>
                  </div>
                ) : null}
                {options.map((option, index) => (
                  <div
                    key={option.value}
                    id={`${componentId}-option-${index}`}
                    role="option"
                    className={optionClassList(option, index)}
                    aria-selected={isOptionSelected(option) ? 'true' : 'false'}
                    aria-disabled={option.disabled ? 'true' : 'false'}
                    onClick={() => handleOptionClick(option)}
                  >
                    <span className={TRUNCATE_TEXT_CLASS}>{option.label}</span>
                  </div>
                ))}
              </>
            ) : (
              <div
                className={[styles.empty, emptySizeClass]
                  .filter(Boolean)
                  .join(' ')}
              >
                {texts.empty}
              </div>
            )}
          </CwDiv>
        </div>
      </CwPopup>
    </div>
  )
}

export default CwSelect
