import {
  useMemo,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react'
import type { CwCenterRulerPickerProps } from './types'
import type { CwCenterRulerPickerValue } from '@zengchaowu/ui-shared/components/CwCenterRulerPicker/types'
import {
  buildNumericPickerOptions,
  resolveAutoLabelInterval,
  shouldShowCenterRulerTickLabel,
} from '@zengchaowu/ui-shared/components/CwCenterRulerPicker/functions'
import { centerRulerPickerBase } from '@zengchaowu/ui-shared/components/CwCenterRulerPicker/styles'
import { defaultTexts } from '@zengchaowu/ui-shared/components/CwCenterRulerPicker/texts'
import { useCwCenterRulerPicker } from './useCwCenterRulerPicker'
import { useBrowserFocusVisible } from '../../hooks/useBrowserFocusVisible'

/** aria-value* 原生属性仅接受 number；字符串选项转数值，不可转则交由 aria-valuetext 表达 */
function toAriaNumber(value: CwCenterRulerPickerValue | undefined): number | undefined {
  if (typeof value === 'number') return value
  if (value == null) return undefined
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

export function CwCenterRulerPicker({
  value,
  options,
  min,
  max,
  step = 1,
  disabled = false,
  readonly = false,
  tickWidthRem = 2.5,
  labelInterval,
  formatValue,
  formatTickLabel,
  texts: textsProp,
  className,
  onChange,
  ...rest
}: CwCenterRulerPickerProps) {
  const texts = useMemo(
    () => ({ ...defaultTexts, ...(textsProp ?? {}) }),
    [textsProp],
  )

  const pickerOptions = useMemo<readonly CwCenterRulerPickerValue[]>(() => {
    if (options && options.length > 0) return options
    if (min != null && max != null) {
      return buildNumericPickerOptions(min, max, step)
    }
    return []
  }, [options, min, max, step])

  const tabindex = disabled ? undefined : 0

  const { isFocusVisible, handleFocus: handleFocusVisibleFocus, handleBlur: handleFocusVisibleBlur } =
    useBrowserFocusVisible()

  const formatOptionLabel = (option: CwCenterRulerPickerValue): string => {
    if (formatValue) return formatValue(option)
    return String(option)
  }

  const formatTickLabelFn = (option: CwCenterRulerPickerValue): string => {
    if (formatTickLabel) return formatTickLabel(option)
    return formatOptionLabel(option)
  }

  const resolvedLabelInterval = (() => {
    if (labelInterval != null && labelInterval >= 1) {
      return Math.floor(labelInterval)
    }
    return resolveAutoLabelInterval(pickerOptions.length)
  })()

  const commitValue = (next: CwCenterRulerPickerValue) => {
    if (disabled || readonly) return
    if (next === value) return
    onChange?.(next)
  }

  const {
    viewportRef,
    trackOffsetPx,
    dragging,
    trackTransitionEnabled,
    tickWidthStyle,
    activeValue,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel,
    stepBy,
    jumpToEdge,
  } = useCwCenterRulerPicker({
    modelValue: value,
    pickerOptions,
    tickWidthRem,
    disabled,
    readonly,
    onValueChange: commitValue,
  })

  const showTickLabel = (index: number, option: CwCenterRulerPickerValue): boolean =>
    shouldShowCenterRulerTickLabel(
      index,
      pickerOptions.length,
      resolvedLabelInterval,
      option === activeValue,
      option,
    )

  const displayLabel = formatOptionLabel(activeValue)

  const ariaValueMin = pickerOptions[0] ?? min
  const ariaValueMax = pickerOptions[pickerOptions.length - 1] ?? max
  const ariaValueNow = activeValue

  const handleFocus = () => {
    if (disabled) return
    handleFocusVisibleFocus()
  }

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (disabled) return
    if (readonly) {
      if ([' ', 'Enter', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
        event.preventDefault()
      }
      return
    }
    switch (event.key) {
      case 'ArrowLeft':
      case 'ArrowDown':
        event.preventDefault()
        stepBy(-1)
        break
      case 'ArrowRight':
      case 'ArrowUp':
        event.preventDefault()
        stepBy(1)
        break
      case 'Home':
        event.preventDefault()
        jumpToEdge('start')
        break
      case 'End':
        event.preventDefault()
        jumpToEdge('end')
        break
      default:
        break
    }
  }

  return (
    <div
      {...rest}
      className={[
        centerRulerPickerBase.root,
        disabled
          ? centerRulerPickerBase.rootDisabled
          : readonly
            ? centerRulerPickerBase.rootReadonly
            : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div
        ref={viewportRef}
        className={[
          centerRulerPickerBase.viewport,
          isFocusVisible && !disabled ? centerRulerPickerBase.viewportFocused : '',
        ]
          .filter(Boolean)
          .join(' ')}
        role="slider"
        tabIndex={tabindex}
        aria-disabled={disabled}
        aria-readonly={readonly}
        aria-valuemin={toAriaNumber(ariaValueMin)}
        aria-valuemax={toAriaNumber(ariaValueMax)}
        aria-valuenow={toAriaNumber(ariaValueNow)}
        aria-valuetext={displayLabel}
        aria-label={texts.ariaLabel}
        onFocus={handleFocus}
        onBlur={handleFocusVisibleBlur}
        onKeyDown={handleKeyDown}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
      >
        <div className={centerRulerPickerBase.centerIndicator} aria-hidden="true" />

        <div
          className={[
            centerRulerPickerBase.track,
            dragging
              ? centerRulerPickerBase.trackDragging
              : trackTransitionEnabled
                ? centerRulerPickerBase.trackIdle
                : centerRulerPickerBase.trackInstant,
          ]
            .filter(Boolean)
            .join(' ')}
          style={{ transform: `translateX(${trackOffsetPx}px)` }}
        >
          {pickerOptions.map((option, index) => (
            <div
              key={String(option)}
              className={centerRulerPickerBase.tick}
              style={tickWidthStyle}
            >
              <span className={centerRulerPickerBase.tickMark} aria-hidden="true" />
              <span
                className={[
                  centerRulerPickerBase.tickLabel,
                  !showTickLabel(index, option) ? centerRulerPickerBase.tickLabelHidden : '',
                  option === activeValue
                    ? centerRulerPickerBase.tickLabelActive
                    : centerRulerPickerBase.tickLabelInactive,
                ]
                  .filter(Boolean)
                  .join(' ')}
                aria-hidden="true"
              >
                {showTickLabel(index, option) ? formatTickLabelFn(option) : ''}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default CwCenterRulerPicker
