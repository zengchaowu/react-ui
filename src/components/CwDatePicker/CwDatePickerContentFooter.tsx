import type { KeyboardEvent as ReactKeyboardEvent } from 'react'
import type { CwDatePickerContentFooterProps } from './types'
import { datePickerBase } from './styles'

/** Enter / Space 触发（对齐 Vue `@keydown.enter.prevent` / `@keydown.space.prevent`） */
const activateOnKey = (handler: () => void) => (event: ReactKeyboardEvent<HTMLDivElement>) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    handler()
  }
}

export function CwDatePickerContentFooter({
  showTodayButton = true,
  shortcuts = [],
  todayText = '',
  size = 'medium',
  tabindex,
  onToday,
  onShortcut,
}: CwDatePickerContentFooterProps) {
  const styles = datePickerBase

  const footerButtonSizeClass = {
    small: styles.footerButtonSizeSmall,
    medium: styles.footerButtonSizeMedium,
    large: styles.footerButtonSizeLarge,
  }[size]

  const shortcutButtonSizeClass = {
    small: styles.shortcutButtonSizeSmall,
    medium: styles.shortcutButtonSizeMedium,
    large: styles.shortcutButtonSizeLarge,
  }[size]

  return (
    <div className={styles.footer}>
      <div className={styles.footerLeft}>
        {showTodayButton ? (
          <div
            className={[styles.footerButton, footerButtonSizeClass].filter(Boolean).join(' ')}
            role="button"
            tabIndex={tabindex}
            onClick={() => onToday?.()}
            onKeyDown={activateOnKey(() => onToday?.())}
          >
            {todayText}
          </div>
        ) : null}
      </div>
      <div className={styles.footerRight}>
        <div className={styles.shortcuts}>
          {shortcuts.map((item) => (
            <div
              key={item.label}
              className={[styles.shortcutButton, shortcutButtonSizeClass].filter(Boolean).join(' ')}
              role="button"
              tabIndex={tabindex}
              onClick={() => onShortcut?.(item.value)}
              onKeyDown={activateOnKey(() => onShortcut?.(item.value))}
            >
              {item.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default CwDatePickerContentFooter
