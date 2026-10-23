import { useMemo, type KeyboardEvent as ReactKeyboardEvent } from 'react'
import type {
  CwSecondaryTabItem,
  CwSecondaryTabsProps,
} from './types'
import { secondaryTabsBase } from './styles'
import { defaultTexts } from './texts'

const ROOT_SCROLL_CLASS =
  'flex-nowrap overflow-x-auto overflow-y-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]'

export function CwSecondaryTabs({
  activeTab,
  tabs,
  equalWidth = false,
  variant = 'default',
  texts: textsProp,
  tabSlot,
  onActiveTabChange,
  onChange,
  className,
  ...rest
}: CwSecondaryTabsProps) {
  const styles = secondaryTabsBase
  const texts = useMemo(
    () => ({ ...defaultTexts, ...(textsProp ?? {}) }),
    [textsProp],
  )

  function handleClick(tab: CwSecondaryTabItem) {
    if (tab.disabled) return
    if (activeTab === tab.value) return
    onActiveTabChange?.(tab.value)
    onChange?.(tab.value)
  }

  function handleKeyDown(
    event: ReactKeyboardEvent<HTMLDivElement>,
    tab: CwSecondaryTabItem,
  ) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleClick(tab)
    }
  }

  return (
    <div
      {...rest}
      className={[
        styles.root,
        equalWidth ? styles.rootEqualWidth : ROOT_SCROLL_CLASS,
        variant === 'stats' ? styles.rootStats : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      role="tablist"
      aria-label={texts.tablistLabel}
    >
      {tabs.map((tab) => {
        const active = activeTab === tab.value
        return (
          <div
            key={tab.value}
            role="tab"
            tabIndex={tab.disabled ? -1 : 0}
            className={[
              styles.tab,
              equalWidth ? styles.tabEqualWidth : 'flex-[0_0_auto]',
              variant === 'stats' ? styles.tabStats : '',
              active ? styles.tabActive : '',
              tab.disabled ? styles.tabDisabled : 'cursor-pointer',
            ]
              .filter(Boolean)
              .join(' ')}
            aria-disabled={tab.disabled ? 'true' : 'false'}
            aria-selected={active}
            onClick={() => handleClick(tab)}
            onKeyDown={(event) => handleKeyDown(event, tab)}
          >
            {typeof tabSlot === 'function' ? (
              tabSlot({ tab })
            ) : tabSlot !== undefined ? (
              tabSlot
            ) : (
              <span
                className={[
                  styles.tabText,
                  variant === 'stats' ? styles.tabTextStats : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {tab.label}
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default CwSecondaryTabs
