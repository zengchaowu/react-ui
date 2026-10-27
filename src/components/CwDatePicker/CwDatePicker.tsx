import {
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react'
import { CwPopup } from '../CwPopup/CwPopup'
import { CwInput } from '../CwInput/CwInput'
import { CwIcon } from '../CwIcon/CwIcon'
import CwDatePickerContent from './CwDatePickerContent'
import { createDimensions } from '@zengchaowu/ui-shared/components/CwPopup/plugins/dimensions'
import { createPosition } from '@zengchaowu/ui-shared/components/CwPopup/plugins/position'
import { createOffset } from '@zengchaowu/ui-shared/components/CwPopup/plugins/offset'
import { createFlip } from '@zengchaowu/ui-shared/components/CwPopup/plugins/flip'
import type {
  CwDatePickerModelValue,
  CwDatePickerProps,
} from './types'
import {
  datePickerBase,
  CW_DATE_PICKER_POPUP_SHELL_CLASS,
  CW_DATE_PICKER_POPUP_TRIGGER_CLASS,
} from './styles'
import { defaultTexts } from '@zengchaowu/ui-shared/components/CwDatePicker/texts'
import { formatDate, parseModelValue } from '@zengchaowu/ui-shared/components/CwDatePicker/functions'
import { cwClearIconSize } from '@zengchaowu/ui-shared/functions/ui/cwClearIconSize'

const popupPlugins = [
  createDimensions(),
  createFlip({ padding: 8 }),
  createPosition(),
  createOffset({ offset: 6 }),
]

export function CwDatePicker({
  value,
  placeholder = '',
  rangePlaceholder,
  range = false,
  disabled = false,
  readonly = false,
  clearable = true,
  size = 'medium',
  format = 'YYYY-MM-DD',
  valueType = 'string',
  firstDayOfWeek = 1,
  minDate = null,
  maxDate = null,
  disabledDate,
  showTodayButton = true,
  shortcuts,
  popupClass,
  popupTriggerClass,
  texts: textsProp,
  className,
  onChange,
  onClear,
  onVisibleChange,
  onFocus,
  onBlur,
  ...rest
}: CwDatePickerProps) {
  const panelIdRef = useRef('')
  if (!panelIdRef.current) {
    panelIdRef.current = `cw-date-picker-panel-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
  }
  const panelId = panelIdRef.current

  const styles = datePickerBase

  const datePickerPopupShellClass = popupClass ?? CW_DATE_PICKER_POPUP_SHELL_CLASS
  const datePickerPopupTriggerClass = popupTriggerClass ?? CW_DATE_PICKER_POPUP_TRIGGER_CLASS

  const texts = useMemo(
    () => ({ ...defaultTexts, ...(textsProp ?? {}) }),
    [textsProp],
  )

  /** 后缀区清除与日历图标同一套尺寸 */
  const suffixTriggerIconSize = cwClearIconSize(size)

  const clearIconStylesForTrigger = {
    ...datePickerBase.clearIconStyles,
    size: suffixTriggerIconSize,
  }

  const calendarIconStylesForTrigger = {
    ...datePickerBase.calendarIconStyles,
    size: suffixTriggerIconSize,
  }

  const [triggerWidth, setTriggerWidth] = useState('')
  const [popupVisible, setPopupVisible] = useState(false)
  const [triggerFocused, setTriggerFocused] = useState(false)
  const [triggerHovered, setTriggerHovered] = useState(false)

  /** 非受控：未传 value 时由组件内部记录选值 */
  const [internalValue, setInternalValue] = useState<CwDatePickerModelValue>(null)
  const resolvedValue = value === undefined ? internalValue : value

  const singleValue = useMemo(
    () => (range ? null : parseModelValue(resolvedValue as string | Date | number | null, format)),
    [range, resolvedValue, format],
  )

  const rangeValue = useMemo<[Date | null, Date | null]>(() => {
    if (!range || !Array.isArray(resolvedValue)) return [null, null]
    return [
      parseModelValue(resolvedValue[0], format),
      parseModelValue(resolvedValue[1], format),
    ]
  }, [range, resolvedValue, format])

  const displayValue = (() => {
    if (!range) {
      if (!singleValue) return ''
      return formatDate(singleValue, format)
    }

    const [start, end] = rangeValue
    if (!start && !end) return ''
    if (start && end) {
      return `${formatDate(start, format)}${texts.rangeSeparator}${formatDate(end, format)}`
    }
    if (start) return `${formatDate(start, format)}${texts.rangeSeparator}`
    return `${texts.rangeSeparator}${formatDate(end as Date, format)}`
  })()

  const displayPlaceholder = (() => {
    if (!range) return placeholder || texts.placeholder
    const start = rangePlaceholder?.[0] || texts.rangePlaceholderStart
    const end = rangePlaceholder?.[1] || texts.rangePlaceholderEnd
    return `${start}${texts.rangeSeparator}${end}`
  })()

  const showClearButton = (() => {
    if (!clearable || disabled || readonly) return false
    const hasValue = !range
      ? !!singleValue
      : !!(rangeValue[0] || rangeValue[1])
    if (!hasValue) return false
    return triggerFocused || triggerHovered || popupVisible
  })()

  const handleTriggerResize = (nextSize: { width: number; height: number }) => {
    if (nextSize.width > 0) setTriggerWidth(`${nextSize.width}px`)
  }

  const handleTriggerFocus = (event: FocusEvent) => {
    setTriggerFocused(true)
    onFocus?.(event)
  }

  const handleTriggerBlur = (event: FocusEvent) => {
    setTriggerFocused(false)
    onBlur?.(event)
  }

  const openPanel = () => {
    if (disabled || readonly) return
    setPopupVisible(true)
  }

  const closePanel = () => {
    setPopupVisible(false)
  }

  const handleVisibleChange = (visible: boolean) => {
    setPopupVisible(visible)
    onVisibleChange?.(visible)
  }

  const handleTriggerClick = () => {
    if (disabled || readonly) return
    if (popupVisible) {
      closePanel()
    } else {
      openPanel()
    }
  }

  const handleClear = () => {
    if (disabled || readonly) return
    if (range) {
      const clearedRange: CwDatePickerModelValue = [null, null]
      if (value === undefined) setInternalValue(clearedRange)
      onChange?.(clearedRange, null)
    } else {
      if (value === undefined) setInternalValue(null)
      onChange?.(null, null)
    }
    onClear?.()
  }

  const handleContentChange = (
    nextValue: CwDatePickerModelValue,
    date: Date | [Date, Date] | null,
  ) => {
    if (value === undefined) setInternalValue(nextValue)
    onChange?.(nextValue, date)
  }

  const handleRequestClose = () => {
    closePanel()
  }

  const handleTriggerKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (disabled) return

    if (!popupVisible) {
      if (readonly) {
        if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown') {
          event.preventDefault()
        }
        return
      }

      if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown') {
        event.preventDefault()
        openPanel()
        return
      }

      if ((event.key === 'Backspace' || event.key === 'Delete') && showClearButton) {
        event.preventDefault()
        handleClear()
      }
      return
    }

    if (event.key === 'Escape' || event.key === 'Tab') {
      if (event.key === 'Escape') event.preventDefault()
      closePanel()
    }
  }

  return (
    <div
      {...rest}
      className={[
        styles.root,
        disabled
          ? styles.rootDisabled
          : (readonly ? styles.rootReadonly : styles.rootNormal),
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <CwPopup
        modelValue={popupVisible}
        placement="bottom"
        trigger="manual"
        plugins={popupPlugins}
        closeOnClickOutside={true}
        popupClass={datePickerPopupShellClass}
        triggerClass={datePickerPopupTriggerClass}
        onVisibleChange={handleVisibleChange}
        onTriggerResize={handleTriggerResize}
        triggerSlot={(
          <div
            className={styles.trigger}
            role="combobox"
            aria-expanded={popupVisible ? 'true' : 'false'}
            aria-haspopup="dialog"
            aria-controls={panelId}
            aria-disabled={disabled ? 'true' : 'false'}
            aria-readonly={readonly ? 'true' : 'false'}
            onClick={handleTriggerClick}
            onKeyDown={handleTriggerKeyDown}
            onMouseEnter={() => setTriggerHovered(true)}
            onMouseLeave={() => setTriggerHovered(false)}
          >
            <CwInput
              value={displayValue}
              placeholder={displayPlaceholder}
              disabled={disabled}
              readonly={true}
              clearable={false}
              size={size}
              texts={texts.inputTexts}
              onFocus={handleTriggerFocus}
              onBlur={handleTriggerBlur}
              suffixSlot={(
                <div className={styles.suffix}>
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
                        size={clearIconStylesForTrigger.size ?? 1}
                        className={clearIconStylesForTrigger.class}
                      />
                    </div>
                  ) : null}
                  <CwIcon
                    name="common--time--calendar-line"
                    prefix="icon"
                    size={calendarIconStylesForTrigger.size ?? 1}
                    className={calendarIconStylesForTrigger.class}
                    texts={{ label: texts.openPanel }}
                  />
                </div>
              )}
            />
          </div>
        )}
      >
        <div
          id={panelId}
          role="dialog"
          className={styles.panel}
          style={triggerWidth ? { width: triggerWidth } : undefined}
        >
          <CwDatePickerContent
            value={resolvedValue}
            range={range}
            disabled={disabled}
            readonly={readonly}
            size={size}
            format={format}
            valueType={valueType}
            firstDayOfWeek={firstDayOfWeek}
            minDate={minDate}
            maxDate={maxDate}
            disabledDate={disabledDate}
            showTodayButton={showTodayButton}
            shortcuts={shortcuts}
            texts={textsProp}
            matchTriggerWidth
            onChange={handleContentChange}
            onRequestClose={handleRequestClose}
          />
        </div>
      </CwPopup>
    </div>
  )
}

export default CwDatePicker
