import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
} from 'react'
import { CwPopup } from '../CwPopup'
import { CwInput } from '../CwInput/CwInput'
import { CwIcon } from '../CwIcon/CwIcon'
import { CwDiv } from '../CwDiv/CwDiv'
import { CwTruncateText } from '../CwTruncateText/CwTruncateText'
import { createDimensions } from '@zengchaowu/ui-shared/components/CwPopup/plugins/dimensions'
import { createPosition } from '@zengchaowu/ui-shared/components/CwPopup/plugins/position'
import { createOffset } from '@zengchaowu/ui-shared/components/CwPopup/plugins/offset'
import { createFlip } from '@zengchaowu/ui-shared/components/CwPopup/plugins/flip'
import { createAdaptiveHeight } from '@zengchaowu/ui-shared/components/CwPopup/plugins/adaptive-height'
import { cwClearIconSize } from '@zengchaowu/ui-shared/functions/ui/cwClearIconSize'
import { scrollElementIntoCwDivViewport } from '@zengchaowu/ui-shared/components/CwDiv/scrollElementIntoCwDivViewport'
import type { CwAutoCompleteHandle, CwAutoCompleteOption, CwAutoCompleteOptionInput, CwAutoCompleteProps } from './types'
import type { CwAutoCompleteStyles } from '@zengchaowu/ui-shared/components/CwAutoComplete/types'
import {
  autoCompleteBase,
  CW_AUTOCOMPLETE_POPUP_SHELL_CLASS,
  CW_AUTOCOMPLETE_POPUP_TRIGGER_CLASS,
  CW_AUTOCOMPLETE_EMBEDDED_ROOT_CLASS,
  CW_AUTOCOMPLETE_PLAIN_ROOT_CLASS,
  CW_AUTOCOMPLETE_PLAIN_TRIGGER_CLASS,
  CW_AUTOCOMPLETE_PLAIN_SUFFIX_CLASS,
} from '@zengchaowu/ui-shared/components/CwAutoComplete/styles'
import { defaultTexts } from './texts'
import { useAutoCompleteKeyboard } from './hooks/useAutoCompleteKeyboard'

export interface CwAutoCompleteComponentProps
  extends CwAutoCompleteProps,
    Omit<
      HTMLAttributes<HTMLDivElement>,
      'children' | 'onChange' | 'onFocus' | 'onBlur'
    > {}

const DEFAULT_OPTIONS: CwAutoCompleteOptionInput[] = []

const popupPlugins = [
  createDimensions(),
  createAdaptiveHeight({ padding: 14, minHeight: 60 }),
  createFlip({ padding: 8 }),
  createPosition(),
  createOffset({ offset: 6 }),
]

const PLAIN_DROPDOWN_MIN_PX = 120

function normalizeOptions(
  list: CwAutoCompleteOptionInput[] | null | undefined,
): CwAutoCompleteOption[] {
  return (list ?? []).map((item, idx) => {
    if (typeof item === 'string') {
      return { label: item, key: item }
    }
    return {
      ...item,
      key: item.key ?? item.label ?? idx,
    }
  })
}

function toModelText(text: string): string | null {
  return text === '' ? null : text
}

/** 下拉项是否与给定文案一致（输入框语义的「选中」） */
function optionMatchesText(
  option: CwAutoCompleteOption,
  text: string,
): boolean {
  const trimmed = text.trim()
  return !!trimmed && option.label === trimmed
}

export const CwAutoComplete = forwardRef<
  CwAutoCompleteHandle,
  CwAutoCompleteComponentProps
>(function CwAutoComplete(
  {
    options = DEFAULT_OPTIONS,
    value,
    placeholder,
    disabled = false,
    readonly = false,
    clearable = false,
    debounce = 150,
    align = 'left',
    size = 'medium',
    inputAppearance = 'default',
    popupClass,
    popupTriggerClass,
    texts: textsProp,
    fetchOptions,
    onChange,
    onClear,
    onFocus,
    onBlur,
    className,
    ...rest
  },
  ref,
) {
  const componentIdRef = useRef('')
  if (!componentIdRef.current) {
    componentIdRef.current = `cw-autocomplete-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 11)}`
  }
  const componentId = componentIdRef.current

  const modelValue = value ?? null
  const isPlainAppearance = inputAppearance === 'plain'

  /** plain / 右对齐：弹层右缘贴齐触发器右缘（CellForm） */
  const popupPlacement = isPlainAppearance
    ? 'bottom-end'
    : align === 'right'
      ? 'bottom-end'
      : align === 'left'
        ? 'bottom-start'
        : 'bottom'

  const styles = useMemo<CwAutoCompleteStyles>(() => {
    const textAlign = align === 'right' ? 'text-right' : 'text-left'
    const base: CwAutoCompleteStyles = isPlainAppearance
      ? {
          ...autoCompleteBase,
          root: CW_AUTOCOMPLETE_PLAIN_ROOT_CLASS,
          suffix: CW_AUTOCOMPLETE_PLAIN_SUFFIX_CLASS,
        }
      : inputAppearance === 'embedded'
        ? {
            ...autoCompleteBase,
            root: CW_AUTOCOMPLETE_EMBEDDED_ROOT_CLASS,
          }
        : autoCompleteBase
    return {
      ...base,
      option: `${base.option} ${textAlign}`.trim(),
    }
  }, [align, inputAppearance, isPlainAppearance])

  const autoCompletePopupShellClass =
    popupClass ?? CW_AUTOCOMPLETE_POPUP_SHELL_CLASS
  const autoCompletePopupTriggerClass = popupTriggerClass
    ? popupTriggerClass
    : isPlainAppearance
      ? CW_AUTOCOMPLETE_PLAIN_TRIGGER_CLASS
      : CW_AUTOCOMPLETE_POPUP_TRIGGER_CLASS

  const clearIconStylesResolved = useMemo(
    () => ({
      ...autoCompleteBase.clearIconStyles,
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

  const texts = useMemo(
    () => ({ ...defaultTexts, ...(textsProp ?? {}) }),
    [textsProp],
  )

  const [popupVisible, setPopupVisible] = useState(false)
  const [hasKeyboardInteracted, setHasKeyboardInteracted] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const [triggerFocused, setTriggerFocused] = useState(false)
  const [triggerHovered, setTriggerHovered] = useState(false)
  const [triggerWidth, setTriggerWidth] = useState('120px')
  const [popupMaxHeight, setPopupMaxHeight] = useState<number | null>(null)

  const [inputValue, setInputValue] = useState(modelValue ?? '')
  const [renderedOptions, setRenderedOptions] = useState<CwAutoCompleteOption[]>(
    () => normalizeOptions(options),
  )

  const inputValueRef = useRef(inputValue)
  inputValueRef.current = inputValue
  const renderedOptionsRef = useRef(renderedOptions)
  const popupVisibleRef = useRef(popupVisible)
  popupVisibleRef.current = popupVisible
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const applyRenderedOptions = useCallback((next: CwAutoCompleteOption[]) => {
    renderedOptionsRef.current = next
    setRenderedOptions(next)
  }, [])

  const applyVisible = useCallback((visible: boolean) => {
    popupVisibleRef.current = visible
    setPopupVisible(visible)
  }, [])

  const listInlineStyle = useMemo(() => {
    const style: Record<string, string> = {}
    if (popupMaxHeight != null && popupMaxHeight > 0) {
      style.maxHeight = `${popupMaxHeight}px`
    }
    return style
  }, [popupMaxHeight])

  const isOptionMatched = useCallback(
    (option: CwAutoCompleteOption) =>
      optionMatchesText(option, modelValue ?? inputValueRef.current),
    [modelValue],
  )

  const optionClassList = useCallback(
    (option: CwAutoCompleteOption, index: number) => {
      const optionDisabled = !!option.disabled
      const selected = !optionDisabled && isOptionMatched(option)
      const focused =
        hasKeyboardInteracted && index === activeIndex && !optionDisabled
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
        !optionDisabled && !selected && !focused ? styles.optionHover : '',
        focusClass,
      ]
        .filter(Boolean)
        .join(' ')
    },
    [
      activeIndex,
      hasKeyboardInteracted,
      isOptionMatched,
      optionSizeClass,
      styles,
    ],
  )

  /** 打开后对准匹配项；等自适应高度落地后再滚一次 */
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

  const handleTriggerResize = useCallback(
    (nextSize: { width: number; height: number }) => {
      const width = isPlainAppearance
        ? Math.max(nextSize.width, PLAIN_DROPDOWN_MIN_PX)
        : nextSize.width
      setTriggerWidth(`${width}px`)
    },
    [isPlainAppearance],
  )

  const showClearButton =
    !isPlainAppearance &&
    clearable &&
    !!inputValue &&
    !disabled &&
    !readonly &&
    (triggerFocused || triggerHovered || popupVisible)

  const handlePopupVisibleChange = useCallback(
    (visible: boolean) => {
      applyVisible(visible)
    },
    [applyVisible],
  )

  const closePopup = useCallback(() => {
    applyVisible(false)
  }, [applyVisible])

  const openPopup = useCallback(() => {
    if (disabled || readonly) return
    if (!inputValueRef.current.trim()) return
    if (renderedOptionsRef.current.length === 0) return
    if (!popupVisibleRef.current) {
      applyVisible(true)
      setHasKeyboardInteracted(false)
    }
  }, [applyVisible, disabled, readonly])

  const runSearch = useCallback(
    async (query: string) => {
      if (!fetchOptions) {
        const base = normalizeOptions(options)
        applyRenderedOptions(
          !query
            ? base
            : base.filter((option) =>
                (option.label || '')
                  .toLowerCase()
                  .includes(query.toLowerCase()),
              ),
        )
        return
      }
      const result = await Promise.resolve(fetchOptions(query))
      applyRenderedOptions(normalizeOptions(result))
    },
    [applyRenderedOptions, fetchOptions, options],
  )

  const handleClear = useCallback(() => {
    if (disabled || readonly) return
    inputValueRef.current = ''
    setInputValue('')
    applyRenderedOptions([])
    if (modelValue !== null) onChange?.(null, null)
    onClear?.()
  }, [
    applyRenderedOptions,
    disabled,
    modelValue,
    onChange,
    onClear,
    readonly,
  ])

  /** 点选：把选项文案写入输入框 */
  const handleSelect = useCallback(
    (option: CwAutoCompleteOption) => {
      if (option.disabled || readonly) return
      inputValueRef.current = option.label
      setInputValue(option.label)
      onChange?.(toModelText(option.label), option)
      applyVisible(false)
    },
    [applyVisible, onChange, readonly],
  )

  const handleInput = useCallback(
    (nextValue: string) => {
      if (disabled || readonly) return
      inputValueRef.current = nextValue
      setInputValue(nextValue)

      // value 跟输入框同步；防抖只用于拉选项
      const nextModel = toModelText(nextValue)
      if (nextModel !== modelValue) onChange?.(nextModel, null)

      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
        void (async () => {
          await runSearch(nextValue)
          const latest = renderedOptionsRef.current
          if (!nextValue.trim() || latest.length === 0) {
            closePopup()
            return
          }
          openPopup()
          const currentIndex = latest.findIndex((option) =>
            optionMatchesText(option, nextValue),
          )
          setActiveIndex(currentIndex >= 0 ? currentIndex : -1)
        })()
      }, debounce)
    },
    [
      closePopup,
      debounce,
      disabled,
      modelValue,
      onChange,
      openPopup,
      readonly,
      runSearch,
    ],
  )

  const handleFocus = useCallback(
    (event: FocusEvent) => {
      if (disabled) return
      setTriggerFocused(true)
      openPopup()
      onFocus?.(event)
    },
    [disabled, onFocus, openPopup],
  )

  const handleBlur = useCallback(
    (event: FocusEvent) => {
      setTriggerFocused(false)
      closePopup()
      onBlur?.(event)
    },
    [closePopup, onBlur],
  )

  const handleMaxHeightChange = useCallback((height: number | null) => {
    setPopupMaxHeight(height)
  }, [])

  const handleSelectByIndex = useCallback(
    (index: number) => {
      if (index >= 0 && index < renderedOptionsRef.current.length) {
        const option = renderedOptionsRef.current[index]
        if (option && !option.disabled) {
          handleSelect(option)
        }
      }
    },
    [handleSelect],
  )

  useAutoCompleteKeyboard({
    popupVisible,
    triggerFocused,
    options: renderedOptions,
    activeIndex,
    setActiveIndex,
    clearable,
    disabled,
    readonly,
    onSelect: handleSelectByIndex,
    onOpen: openPopup,
    onClose: closePopup,
    onClear: handleClear,
    componentId,
    onKeyboardInteract: () => setHasKeyboardInteracted(true),
  })

  // 打开后对准匹配项；关闭时重置
  useEffect(() => {
    if (!popupVisible) {
      setActiveIndex(-1)
      setPopupMaxHeight(null)
      return
    }
    const index = renderedOptionsRef.current.findIndex((option) =>
      optionMatchesText(option, modelValue ?? inputValueRef.current),
    )
    setActiveIndex(index >= 0 ? index : -1)
    scrollOpenSelectedIntoView(index)
    // 与 Vue `watch(popupVisible)` 对齐：仅随显隐切换执行
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [popupVisible])

  // 外部 value 变化同步到输入框
  useEffect(() => {
    const next = value ?? ''
    if (inputValueRef.current !== next) {
      inputValueRef.current = next
      setInputValue(next)
    }
  }, [value])

  // 本地备选项同步（远程模式跳过）
  useEffect(() => {
    if (fetchOptions) return
    applyRenderedOptions(normalizeOptions(options))
  }, [applyRenderedOptions, fetchOptions, options])

  // 卸载时清理防抖计时器
  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    },
    [],
  )

  useImperativeHandle(
    ref,
    () => ({
      isVisible: () => popupVisibleRef.current,
    }),
    [],
  )

  const rootClassList = [
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

  const triggerNode = (
    <div
      role="combobox"
      aria-expanded={popupVisible}
      aria-haspopup={true}
      aria-disabled={disabled ? 'true' : 'false'}
      aria-readonly={readonly ? 'true' : 'false'}
      aria-controls={`${componentId}-listbox`}
      aria-activedescendant={
        popupVisible && activeIndex >= 0
          ? `${componentId}-option-${activeIndex}`
          : undefined
      }
      onMouseEnter={() => setTriggerHovered(true)}
      onMouseLeave={() => setTriggerHovered(false)}
    >
      <CwInput
        value={inputValue}
        placeholder={placeholder ?? texts.placeholder}
        disabled={disabled}
        readonly={readonly}
        clearable={false}
        align={align}
        size={size}
        appearance={inputAppearance}
        texts={texts.inputTexts}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChange={handleInput}
        suffixSlot={
          showClearButton ? (
            <div className={styles.suffix}>
              <div
                className={styles.clearButton}
                aria-label={texts.clear}
                aria-disabled={disabled || readonly ? 'true' : 'false'}
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
            </div>
          ) : undefined
        }
      />
    </div>
  )

  return (
    <div {...rest} className={rootClassList}>
      <CwPopup
        modelValue={popupVisible}
        placement={popupPlacement}
        trigger="manual"
        plugins={popupPlugins}
        closeOnClickOutside={true}
        popupClass={autoCompletePopupShellClass}
        triggerClass={autoCompletePopupTriggerClass}
        onVisibleChange={handlePopupVisibleChange}
        onTriggerResize={handleTriggerResize}
        onMaxHeightChange={handleMaxHeightChange}
        triggerSlot={triggerNode}
      >
        <div
          className={styles.dropdown}
          style={{ width: triggerWidth }}
          onMouseDown={(event) => event.preventDefault()}
        >
          <CwDiv
            id={`${componentId}-listbox`}
            role="listbox"
            className={styles.list}
            contentClass={styles.listContent}
            style={listInlineStyle}
          >
            {renderedOptions.map((option, index) => (
              <div
                key={String(option.key ?? option.label)}
                id={`${componentId}-option-${index}`}
                role="option"
                className={optionClassList(option, index)}
                aria-selected={isOptionMatched(option) ? 'true' : 'false'}
                aria-disabled={option.disabled ? 'true' : 'false'}
                onClick={() => handleSelect(option)}
              >
                <CwTruncateText
                  text={option.label}
                  placement="start"
                  tag="span"
                  className="block w-full min-w-0"
                />
              </div>
            ))}
          </CwDiv>
        </div>
      </CwPopup>
    </div>
  )
})

export default CwAutoComplete
