import type {
  HTMLAttributes,
  KeyboardEvent as ReactKeyboardEvent,
} from 'react'
import type { CwQuickAnswerProps } from './types'
import type { CwQuickAnswerTexts } from '@zengchaowu/ui-shared/components/CwQuickAnswer/types'
import { quickAnswerBase } from '@zengchaowu/ui-shared/components/CwQuickAnswer/styles'
import { defaultTexts } from '@zengchaowu/ui-shared/components/CwQuickAnswer/texts'

export interface CwQuickAnswerComponentProps
  extends CwQuickAnswerProps,
    Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'onSelect'> {}

export function CwQuickAnswer({
  label,
  description,
  conditions = [],
  disabled = false,
  value = null,
  texts: textsProp,
  onChange,
  onSelect,
  className,
  ...rest
}: CwQuickAnswerComponentProps) {
  const texts: CwQuickAnswerTexts = { ...defaultTexts, ...(textsProp ?? {}) }

  const handleYesClick = () => {
    if (disabled) return
    const newValue: 'yes' | 'no' | null = value === 'yes' ? null : 'yes'
    onChange?.(newValue)
    if (newValue === 'yes') {
      onSelect?.('yes')
    }
  }

  const handleNoClick = () => {
    if (disabled) return
    const newValue: 'yes' | 'no' | null = value === 'no' ? null : 'no'
    onChange?.(newValue)
    if (newValue === 'no') {
      onSelect?.('no')
    }
  }

  const handleKeyDown =
    (handler: () => void) => (event: ReactKeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        handler()
      }
    }

  return (
    <div
      {...rest}
      className={[quickAnswerBase.root, className].filter(Boolean).join(' ')}
    >
      {/* 标签 */}
      {label ? <div className={quickAnswerBase.label}>{label}</div> : null}

      {/* 内容区域 */}
      <div className={quickAnswerBase.content}>
        {/* 问题描述 */}
        {description ? (
          <div className={quickAnswerBase.description}>{description}</div>
        ) : null}

        {/* 条件列表 */}
        {conditions && conditions.length > 0 ? (
          <div className={quickAnswerBase.conditions}>
            {conditions.map((condition, index) => (
              <div key={index} className={quickAnswerBase.conditionItem}>
                <span className="font-medium">{index + 1}.</span>
                <span className="ml-1">{condition}</span>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      {/* 按钮组 */}
      <div className={quickAnswerBase.buttons}>
        {/* 是按钮 */}
        <div
          role="button"
          tabIndex={disabled ? undefined : 0}
          className={[
            quickAnswerBase.buttonYes,
            value === 'yes' ? quickAnswerBase.buttonYesActive : '',
            disabled ? '' : 'cursor-pointer',
          ]
            .filter(Boolean)
            .join(' ')}
          aria-disabled={disabled ? 'true' : 'false'}
          onClick={handleYesClick}
          onKeyDown={handleKeyDown(handleYesClick)}
        >
          {texts.yes}
        </div>

        {/* 否按钮 */}
        <div
          role="button"
          tabIndex={disabled ? undefined : 0}
          className={[
            quickAnswerBase.buttonNo,
            value === 'no' ? quickAnswerBase.buttonNoActive : '',
            disabled ? '' : 'cursor-pointer',
          ]
            .filter(Boolean)
            .join(' ')}
          aria-disabled={disabled ? 'true' : 'false'}
          onClick={handleNoClick}
          onKeyDown={handleKeyDown(handleNoClick)}
        >
          {texts.no}
        </div>
      </div>
    </div>
  )
}

export default CwQuickAnswer
