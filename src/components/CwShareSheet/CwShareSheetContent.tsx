import { useCallback, useState } from 'react'
import type {
  FocusEvent,
  KeyboardEvent as ReactKeyboardEvent,
} from 'react'
import CwGrid from '../CwGrid/CwGrid'
import type { CwGridBreakpointConfig } from '../CwGrid/types'
import { shouldShowFocus } from '../../hooks/useBrowserFocusVisible'
import { shareSheetBase } from './styles'
import type { CwShareSheetOption } from './types'

export interface CwShareSheetContentProps {
  options: CwShareSheetOption[]
  columns: number
  breakpoints?: CwGridBreakpointConfig
  gutter: number
  rowGap: number
  onChange: (type: 'option' | 'cancel', option?: CwShareSheetOption) => void
  /** 请求关闭 Sheet（选中渠道后） */
  onRequestClose: () => void
}

/**
 * Sheet 内的分享渠道网格。
 * `showDynamicSheet` 保存的是渲染时的 ReactNode，故内容组件自持交互状态。
 */
export function CwShareSheetContent({
  options,
  columns,
  breakpoints,
  gutter,
  rowGap,
  onChange,
  onRequestClose,
}: CwShareSheetContentProps) {
  /** 只在键盘导航时显示 focus 样式 */
  const [focusedIndexForKeyboard, setFocusedIndexForKeyboard] = useState(-1)

  const handleOptionClick = useCallback(
    (option: CwShareSheetOption) => {
      onChange('option', option)
      onRequestClose()
    },
    [onChange, onRequestClose],
  )

  const handleOptionKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLDivElement>, option: CwShareSheetOption) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        handleOptionClick(option)
      }
    },
    [handleOptionClick],
  )

  const handleOptionFocus = useCallback(
    (index: number, event: FocusEvent<HTMLDivElement>) => {
      setFocusedIndexForKeyboard(shouldShowFocus() ? index : -1)
    },
    [],
  )

  const handleOptionBlur = useCallback(() => {
    setFocusedIndexForKeyboard(-1)
  }, [])

  return (
    <CwGrid
      columns={columns}
      breakpoints={breakpoints}
      gutter={gutter}
      rowGap={rowGap}
      justify="center"
      className={shareSheetBase.root}
    >
      {options.map((option, index) => {
        const isFocused = focusedIndexForKeyboard === index

        return (
          <div
            key={index}
            className={[
              shareSheetBase.option,
              shareSheetBase.optionNormal,
              isFocused ? shareSheetBase.optionFocused : '',
            ]
              .filter(Boolean)
              .join(' ')}
            role="button"
            tabIndex={0}
            aria-label={option.text}
            onClick={() => handleOptionClick(option)}
            onKeyDown={(event) => handleOptionKeyDown(event, option)}
            onFocus={(event) => handleOptionFocus(index, event)}
            onBlur={handleOptionBlur}
          >
            <div className={shareSheetBase.optionIcon}>
              <img
                src={option.icon}
                alt={option.text}
                className="w-full h-full object-contain"
              />
            </div>
            <span className={shareSheetBase.optionText}>{option.text}</span>
          </div>
        )
      })}
    </CwGrid>
  )
}

export default CwShareSheetContent
