import { useCallback, useEffect, useState } from 'react'
import type {
  FocusEvent,
  KeyboardEvent as ReactKeyboardEvent,
} from 'react'
import CwGrid from '../CwGrid/CwGrid'
import type { CwGridBreakpointConfig } from '../CwGrid/types'
import { scrollElementIntoCwDivViewport } from '@zengchaowu/ui-shared/components/CwDiv/scrollElementIntoCwDivViewport'
import { shouldShowFocus } from '../../hooks/useBrowserFocusVisible'
import { selectSheetBase } from './styles'
import type { CwSelectSheetOption } from './types'

export interface CwSelectSheetContentProps {
  options: CwSelectSheetOption[]
  value: string | number | null
  disabled: boolean
  readonly: boolean
  columns: number
  breakpoints?: CwGridBreakpointConfig
  gutter: number
  rowGap: number
  componentId: string
  onChange: (
    value: string | number | null,
    option: CwSelectSheetOption | null,
  ) => void
  /** 请求关闭 Sheet（选中选项后） */
  onRequestClose: () => void
}

/**
 * Sheet 内的选项内容。
 * `showDynamicSheet` 保存的是渲染时的 ReactNode，故内容组件自持交互状态。
 */
export function CwSelectSheetContent({
  options,
  value,
  disabled,
  readonly,
  columns,
  breakpoints,
  gutter,
  rowGap,
  componentId,
  onChange,
  onRequestClose,
}: CwSelectSheetContentProps) {
  /** 只在键盘导航时显示 focus 样式 */
  const [focusedIndexForKeyboard, setFocusedIndexForKeyboard] = useState(-1)

  const handleOptionClick = useCallback(
    (option: CwSelectSheetOption) => {
      if (disabled || option.disabled || readonly) return

      const newValue = option.value === value ? null : option.value
      onChange(newValue, newValue !== null ? option : null)
      onRequestClose()
    },
    [disabled, readonly, value, onChange, onRequestClose],
  )

  const handleOptionKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLDivElement>, option: CwSelectSheetOption) => {
      // disabled 状态下不允许键盘操作
      if (disabled || option.disabled || readonly) return

      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        handleOptionClick(option)
      }
    },
    [disabled, readonly, handleOptionClick],
  )

  // readonly 状态下允许聚焦（保留键盘导航/可读性），但不得改值
  const handleOptionFocus = useCallback(
    (index: number, event: FocusEvent<HTMLDivElement>) => {
      if (disabled) return
      setFocusedIndexForKeyboard(shouldShowFocus() ? index : -1)
    },
    [disabled],
  )

  const handleOptionBlur = useCallback(() => {
    setFocusedIndexForKeyboard(-1)
  }, [])

  // 打开后对准选中项；等自适应高度落地后再滚一次
  useEffect(() => {
    const index = options.findIndex(
      (option) => option.value === value && !option.disabled,
    )
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <CwGrid
      columns={columns}
      breakpoints={breakpoints}
      gutter={gutter}
      rowGap={rowGap}
      className={selectSheetBase.root}
    >
      {options.map((option, index) => {
        const isSelected = option.value === value
        const isDisabled = disabled || !!option.disabled
        const isReadonly = readonly
        const isFocused = focusedIndexForKeyboard === index

        return (
          <div
            key={option.value}
            id={`${componentId}-option-${index}`}
            className={[
              selectSheetBase.option,
              isDisabled
                ? selectSheetBase.optionDisabled
                : isSelected
                  ? selectSheetBase.optionSelected
                  : selectSheetBase.optionNormal,
              isFocused && !isDisabled ? selectSheetBase.optionFocused : '',
              !isSelected && !isDisabled && !isReadonly
                ? selectSheetBase.optionHover
                : '',
            ]
              .filter(Boolean)
              .join(' ')}
            role="button"
            tabIndex={isDisabled ? undefined : 0}
            aria-label={option.label}
            aria-disabled={isDisabled ? 'true' : 'false'}
            aria-readonly={isReadonly ? 'true' : 'false'}
            aria-selected={isSelected ? 'true' : 'false'}
            onClick={() => handleOptionClick(option)}
            onKeyDown={(event) => handleOptionKeyDown(event, option)}
            onFocus={(event) => handleOptionFocus(index, event)}
            onBlur={handleOptionBlur}
          >
            {option.label}
          </div>
        )
      })}
    </CwGrid>
  )
}

export default CwSelectSheetContent
