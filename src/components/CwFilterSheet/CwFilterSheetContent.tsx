import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react'
import CwGrid from '../CwGrid/CwGrid'
import CwIcon from '../CwIcon/CwIcon'
import { shouldShowFocus } from '../../hooks/useBrowserFocusVisible'
import { filterSheetBase } from '@zengchaowu/ui-shared/components/CwFilterSheet/styles'
import type { CwFilterSheetSection, CwFilterSheetValue, CwFilterSheetValues } from './types'
import type { CwFilterSheetOption } from '@zengchaowu/ui-shared/components/CwFilterSheet/types'

/** 供底部按钮栏读取/重置筛选值（Sheet footer 与 body 分属不同节点） */
export interface CwFilterSheetController {
  getValues: () => CwFilterSheetValues
  reset: () => void
}

export interface CwFilterSheetContentProps {
  sections: CwFilterSheetSection[]
  disabled: boolean
  readonly: boolean
  onValuesChange?: (values: CwFilterSheetValues) => void
  onReady: (controller: CwFilterSheetController) => void
}

/** 每个 section 的初始值：单选为 null，多选为空数组 */
function buildInitialValues(
  sections: CwFilterSheetSection[],
): CwFilterSheetValues {
  const values: CwFilterSheetValues = {}
  sections.forEach((section) => {
    if (section.initialValue !== undefined) {
      values[section.key] = section.initialValue
    } else {
      values[section.key] = section.mode === 'multiple' ? [] : null
    }
  })
  return values
}

function getOptionKey(
  section: CwFilterSheetSection,
  option: CwFilterSheetOption,
): string {
  return `${section.key}:${String(option.value)}`
}

/**
 * Sheet 内的筛选选项内容。
 * `showDynamicSheet` 保存的是渲染时的 ReactNode，故内容组件自持交互状态。
 */
export function CwFilterSheetContent({
  sections,
  disabled,
  readonly,
  onValuesChange,
  onReady,
}: CwFilterSheetContentProps) {
  const [values, setValues] = useState<CwFilterSheetValues>(() =>
    buildInitialValues(sections),
  )
  const valuesRef = useRef(values)
  valuesRef.current = values

  const [focusedOptionKeyForKeyboard, setFocusedOptionKeyForKeyboard] =
    useState<string | null>(null)

  const sectionsRef = useRef(sections)
  sectionsRef.current = sections
  const onValuesChangeRef = useRef(onValuesChange)
  onValuesChangeRef.current = onValuesChange

  // 监听 sections 变化，重新初始化（等价 Vue deep watch immediate）
  useEffect(() => {
    const next = buildInitialValues(sections)
    valuesRef.current = next
    setValues(next)
  }, [sections])

  const reset = useCallback(() => {
    const next = buildInitialValues(sectionsRef.current)
    valuesRef.current = next
    setValues(next)
    onValuesChangeRef.current?.({ ...next })
  }, [])

  const getValues = useCallback(() => ({ ...valuesRef.current }), [])

  useEffect(() => {
    onReady({ getValues, reset })
  }, [getValues, reset, onReady])

  const updateSectionValue = useCallback(
    (section: CwFilterSheetSection, nextValue: CwFilterSheetValue) => {
      const next = { ...valuesRef.current, [section.key]: nextValue }
      valuesRef.current = next
      setValues(next)
      onValuesChangeRef.current?.({ ...next })
    },
    [],
  )

  // 处理选项点击
  const handleOptionClick = useCallback(
    (section: CwFilterSheetSection, option: CwFilterSheetOption) => {
      if (disabled || section.disabled || option.disabled || readonly) {
        return
      }

      const currentValue = valuesRef.current[section.key]
      let nextValue: CwFilterSheetValue

      if (section.mode === 'multiple') {
        // 多选模式
        const currentArray = Array.isArray(currentValue) ? currentValue : []
        nextValue = currentArray.includes(option.value)
          ? currentArray.filter((v) => v !== option.value)
          : [...currentArray, option.value]
      } else {
        // 单选模式
        nextValue = currentValue === option.value ? null : option.value
      }

      updateSectionValue(section, nextValue)
    },
    [disabled, readonly, updateSectionValue],
  )

  const handleOptionFocus = useCallback(
    (section: CwFilterSheetSection, option: CwFilterSheetOption) => {
      if (disabled || section.disabled || option.disabled) return
      if (shouldShowFocus()) {
        setFocusedOptionKeyForKeyboard(getOptionKey(section, option))
      }
    },
    [disabled],
  )

  const handleOptionBlur = useCallback(() => {
    setFocusedOptionKeyForKeyboard(null)
  }, [])

  // 处理选项键盘事件
  const handleOptionKeyDown = useCallback(
    (
      event: ReactKeyboardEvent<HTMLDivElement>,
      section: CwFilterSheetSection,
      option: CwFilterSheetOption,
    ) => {
      if (disabled || section.disabled || option.disabled || readonly) {
        return
      }

      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        handleOptionClick(section, option)
      }
    },
    [disabled, readonly, handleOptionClick],
  )

  return (
    <div className={filterSheetBase.root}>
      {sections.map((section) => (
        <div key={section.key} className={filterSheetBase.section}>
          <div className={filterSheetBase.sectionTitle}>{section.title}</div>
          <CwGrid
            columns={section.columns || 3}
            breakpoints={section.breakpoints}
            gutter={section.gutter || 12}
            rowGap={section.rowGap || 12}
          >
            {section.options.map((option) => {
              const isSelected = (() => {
                const value = values[section.key]
                if (section.mode === 'multiple') {
                  return Array.isArray(value) && value.includes(option.value)
                }
                return value === option.value
              })()
              const isDisabled = Boolean(
                disabled || section.disabled || option.disabled,
              )
              const isFocused =
                focusedOptionKeyForKeyboard === getOptionKey(section, option)

              return (
                <div
                  key={option.value}
                  className={[
                    filterSheetBase.option,
                    isDisabled
                      ? filterSheetBase.optionDisabled
                      : isSelected
                        ? filterSheetBase.optionSelected
                        : filterSheetBase.optionNormal,
                    isFocused && !isDisabled ? filterSheetBase.optionFocused : '',
                    !isSelected && !isDisabled && !readonly
                      ? filterSheetBase.optionHover
                      : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  role="button"
                  tabIndex={isDisabled ? undefined : 0}
                  aria-label={option.label}
                  aria-disabled={isDisabled ? 'true' : 'false'}
                  aria-readonly={readonly ? 'true' : 'false'}
                  aria-selected={isSelected ? 'true' : 'false'}
                  onClick={() => handleOptionClick(section, option)}
                  onKeyDown={(event) =>
                    handleOptionKeyDown(event, section, option)
                  }
                  onFocus={() => handleOptionFocus(section, option)}
                  onBlur={handleOptionBlur}
                >
                  {option.label}
                  {isSelected && !isDisabled ? (
                    <div className={filterSheetBase.checkmark}>
                      <CwIcon
                        className="w-full h-full text-[var(--brand-color-6)]"
                        size={0.75}
                      />
                    </div>
                  ) : null}
                </div>
              )
            })}
          </CwGrid>
        </div>
      ))}
    </div>
  )
}

export default CwFilterSheetContent
