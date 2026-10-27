import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import type { HTMLAttributes } from 'react'
import CwPopup from '../CwPopup/CwPopup'
import CwInput from '../CwInput/CwInput'
import CwIcon from '../CwIcon/CwIcon'
import CwCascaderPanel from '../CwCascaderPanel/CwCascaderPanel'
import { buildCascaderColumns } from '../CwCascaderPanel/functions/buildCascaderColumns'
import type {
  CwCascaderPanelOption,
  CwCascaderPanelValue,
} from '../CwCascaderPanel/types'
import { createDimensions } from '@zengchaowu/ui-shared/components/CwPopup/plugins/dimensions'
import { createPosition } from '@zengchaowu/ui-shared/components/CwPopup/plugins/position'
import { createOffset } from '@zengchaowu/ui-shared/components/CwPopup/plugins/offset'
import { createFlip } from '@zengchaowu/ui-shared/components/CwPopup/plugins/flip'
import { createPreventOverflow } from '@zengchaowu/ui-shared/components/CwPopup/plugins/prevent-overflow'
import { createAdaptiveHeight } from '@zengchaowu/ui-shared/components/CwPopup/plugins/adaptive-height'
import type {
  CwCascaderOption,
  CwCascaderProps,
} from './types'
import {
  cascaderBase,
  CW_CASCADER_POPUP_SHELL_CLASS,
  CW_CASCADER_POPUP_TRIGGER_CLASS,
} from './styles'
import { defaultTexts } from './texts'
import { useCascaderKeyboard } from './hooks/useCascaderKeyboard'
import { cwClearIconSize } from '@zengchaowu/ui-shared/functions/ui/cwClearIconSize'
import { scrollElementIntoCwDivViewport } from '@zengchaowu/ui-shared/components/CwDiv/scrollElementIntoCwDivViewport'

export interface CwCascaderComponentProps
  extends CwCascaderProps,
    Omit<
      HTMLAttributes<HTMLDivElement>,
      'children' | 'className' | 'onChange' | 'onFocus' | 'onBlur'
    > {
  className?: string
}

const popupPlugins = [
  createDimensions(),
  createAdaptiveHeight({
    padding: 14,
    minHeight: 60,
  }),
  createFlip({ padding: 8 }),
  createPosition(),
  createOffset({ offset: 6 }),
  // 多列变宽后水平方向收进视口（flip 只翻主轴 top/bottom）
  createPreventOverflow({ padding: 8 }),
]

const EMPTY_PATH: CwCascaderPanelValue[] = []

export function CwCascader({
  options = [],
  value,
  placeholder = '',
  disabled = false,
  readonly = false,
  clearable = false,
  size = 'medium',
  popupClass,
  popupTriggerClass,
  texts: textsProp,
  onChange,
  onClear,
  onFocus,
  onBlur,
  className,
  ...rest
}: CwCascaderComponentProps) {
  const componentIdRef = useRef('')
  if (!componentIdRef.current) {
    componentIdRef.current = `cw-cascader-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 11)}`
  }
  const componentId = componentIdRef.current

  const modelValue = value ?? EMPTY_PATH

  const styles = cascaderBase

  const cascaderPopupShellClass =
    popupClass ?? CW_CASCADER_POPUP_SHELL_CLASS
  const cascaderPopupTriggerClass =
    popupTriggerClass ?? CW_CASCADER_POPUP_TRIGGER_CLASS

  const texts = useMemo(
    () => ({ ...defaultTexts, ...(textsProp ?? {}) }),
    [textsProp],
  )

  const clearIconStylesResolved = useMemo(
    () => ({
      ...cascaderBase.clearIconStyles,
      size: cwClearIconSize(size),
    }),
    [size],
  )

  const [popupVisible, setPopupVisible] = useState(false)
  const [triggerFocused, setTriggerFocused] = useState(false)
  const [triggerHovered, setTriggerHovered] = useState(false)
  const [hasKeyboardInteracted, setHasKeyboardInteracted] = useState(false)
  const [popupMaxHeight, setPopupMaxHeight] = useState<number | null>(null)
  const [activePathIndex, setActivePathIndex] = useState(-1)
  const [activeIndexPerLevel, setActiveIndexPerLevel] = useState<number[]>([])

  const activePathIndexRef = useRef(activePathIndex)
  const activeIndexPerLevelRef = useRef(activeIndexPerLevel)

  const setPathIndex = useCallback((next: number) => {
    activePathIndexRef.current = next
    setActivePathIndex(next)
  }, [])

  const setIndexes = useCallback((next: number[]) => {
    activeIndexPerLevelRef.current = next
    setActiveIndexPerLevel(next)
  }, [])

  const columnMaxHeight =
    popupMaxHeight != null && popupMaxHeight > 0 ? popupMaxHeight : null

  const displayLabel = useMemo(() => {
    if (!modelValue || modelValue.length === 0) return ''
    const labels: string[] = []
    let current: CwCascaderOption[] = options
    for (const val of modelValue) {
      const found = current?.find((item) => item.value === val)
      if (!found) break
      labels.push(found.label)
      current = found.children || []
    }
    return labels.join(' / ')
  }, [options, modelValue])

  const columns = useMemo(
    () => buildCascaderColumns(options, modelValue),
    [options, modelValue],
  )

  const showClearButton =
    clearable &&
    Boolean(modelValue && modelValue.length > 0) &&
    !disabled &&
    !readonly &&
    (triggerFocused || triggerHovered || popupVisible)

  const arrowIconStyle = useMemo(() => {
    const iconStyle = styles.arrowIconStyles || {}
    return {
      ...iconStyle,
      class: [iconStyle.class || '', popupVisible ? styles.arrowOpen : '']
        .filter(Boolean)
        .join(' '),
    }
  }, [styles, popupVisible])

  const closePopup = useCallback(() => {
    setPopupVisible(false)
    setHasKeyboardInteracted(false)
  }, [])

  const scrollToSelectedColumns = useCallback(
    (
      targetColumns: CwCascaderPanelOption[][],
      targetIndexes: number[],
    ) => {
      const run = () => {
        targetColumns.forEach((levelItems, level) => {
          const items = levelItems || []
          const selectedVal = modelValue[level]
          let targetIdx = -1
          if (selectedVal !== undefined) {
            targetIdx = items.findIndex(
              (o) => o.value === selectedVal && !o.disabled,
            )
          }
          if (targetIdx < 0) {
            const idxFromActive = targetIndexes[level]
            targetIdx =
              idxFromActive != null && idxFromActive >= 0
                ? idxFromActive
                : items.findIndex((o) => !o.disabled)
          }
          if (level >= 0 && targetIdx >= 0) {
            const id = `${componentId}-node-${level}-${targetIdx}`
            scrollElementIntoCwDivViewport(document.getElementById(id), {
              block: 'center',
            })
          }
        })
      }
      requestAnimationFrame(() => {
        run()
        requestAnimationFrame(run)
      })
    },
    [componentId, modelValue],
  )

  const openPopup = useCallback(() => {
    if (disabled || readonly) return
    setPopupVisible(true)
    setHasKeyboardInteracted(false)

    const nextColumns = buildCascaderColumns(options, modelValue)
    if (nextColumns.length > 0) {
      const desiredLevel =
        modelValue.length > 0 ? modelValue.length - 1 : 0
      setPathIndex(
        Math.max(0, Math.min(desiredLevel, nextColumns.length - 1)),
      )
    } else {
      setPathIndex(0)
    }

    const nextIndexes = nextColumns.map((levelOptions, levelIdx) => {
      const selectedVal = modelValue[levelIdx]
      const selectedIdx =
        selectedVal !== undefined
          ? levelOptions.findIndex(
              (o) => o.value === selectedVal && !o.disabled,
            )
          : -1
      if (selectedIdx >= 0) {
        return -1
      }
      return levelOptions.findIndex((o) => !o.disabled)
    })
    setIndexes(nextIndexes)
    scrollToSelectedColumns(nextColumns, nextIndexes)
  }, [
    disabled,
    readonly,
    options,
    modelValue,
    setIndexes,
    setPathIndex,
    scrollToSelectedColumns,
  ])

  const handleTriggerClick = useCallback(() => {
    if (disabled || readonly) return
    if (!popupVisible) {
      openPopup()
    } else {
      closePopup()
    }
  }, [disabled, readonly, popupVisible, openPopup, closePopup])

  const handleMaxHeightChange = useCallback((height: number | null) => {
    setPopupMaxHeight(height)
  }, [])

  const handleFocus = useCallback(
    (event: FocusEvent) => {
      if (disabled) return
      setTriggerFocused(true)
      onFocus?.(event)
    },
    [disabled, onFocus],
  )

  const handleBlur = useCallback(
    (event: FocusEvent) => {
      setTriggerFocused(false)
      onBlur?.(event)
    },
    [onBlur],
  )

  const handleClear = useCallback(() => {
    if (disabled || readonly) return
    onChange?.([], null)
    onClear?.()
  }, [disabled, readonly, onChange, onClear])

  const onSelectActive = useCallback(
    (level: number, idx: number) => {
      const items = buildCascaderColumns(options, modelValue)[level] || []
      const item = items[idx]
      if (!item || item.disabled) return
      const nextPath = modelValue.slice(0, level)
      nextPath[level] = item.value
      onChange?.(nextPath, item)
      if (!item.children || item.children.length === 0) {
        setPopupVisible(false)
      }
    },
    [options, modelValue, onChange],
  )

  useCascaderKeyboard({
    popupVisible,
    triggerFocused,
    clearable,
    componentId,
    columns,
    modelValue,
    activePathIndexRef,
    activeIndexPerLevelRef,
    setActivePathIndex: setPathIndex,
    setActiveIndexPerLevel: setIndexes,
    onOpen: openPopup,
    onClose: closePopup,
    onClear: () => {
      onChange?.([], null)
      onClear?.()
    },
    onSelectActive,
    onKeyboardInteract: () => setHasKeyboardInteracted(true),
  })

  useEffect(() => {
    if (!popupVisible) {
      setPathIndex(-1)
      setIndexes([])
    }
  }, [popupVisible, setIndexes, setPathIndex])

  const currentActiveId = useMemo(() => {
    if (activePathIndex < 0) return ''
    const level = activePathIndex
    const idx = activeIndexPerLevel[level]
    if (idx === undefined || idx < 0) return ''
    return `${componentId}-node-${level}-${idx}`
  }, [activePathIndex, activeIndexPerLevel, componentId])

  const suffix = (
    <div className={styles.suffix}>
      {showClearButton ? (
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
      ) : null}
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
      aria-controls={`${componentId}-cascader`}
      aria-activedescendant={
        popupVisible && currentActiveId ? currentActiveId : undefined
      }
    >
      <CwInput
        value={displayLabel}
        placeholder={placeholder ?? texts.placeholder}
        disabled={disabled}
        readonly={true}
        clearable={false}
        size={size}
        texts={texts.inputTexts}
        suffixSlot={suffix}
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
    </div>
  )

  return (
    <div
      {...rest}
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
    >
      <CwPopup
        modelValue={popupVisible}
        placement="bottom-start"
        trigger="manual"
        plugins={popupPlugins}
        closeOnClickOutside={true}
        popupClass={cascaderPopupShellClass}
        triggerClass={cascaderPopupTriggerClass}
        onVisibleChange={(visible) => setPopupVisible(visible)}
        onMaxHeightChange={handleMaxHeightChange}
        triggerSlot={triggerNode}
      >
        <div
          id={`${componentId}-cascader`}
          className={styles.dropdown}
        >
          <CwCascaderPanel
            appearance="popup"
            idPrefix={componentId}
            options={options}
            value={modelValue}
            disabled={disabled}
            readonly={readonly}
            size={size}
            emptyText={texts.empty}
            columnMaxHeight={columnMaxHeight}
            activePathIndex={activePathIndex}
            activeIndexPerLevel={activeIndexPerLevel}
            showFocusHighlight={
              hasKeyboardInteracted ||
              (activeIndexPerLevel[activePathIndex] ?? -1) >= 0
            }
            onChange={(nextValue, option) => onChange?.(nextValue, option)}
            onComplete={closePopup}
          />
        </div>
      </CwPopup>
    </div>
  )
}

export default CwCascader
