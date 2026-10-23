import { CwButton } from '../CwButton'
import { CwIcon } from '../CwIcon'
import type { CwSettingsPageProps } from './types'
import { settingsPageBase } from './styles'
import { defaultCwSettingsPageTexts } from './texts'

export function CwSettingsPage({
  title,
  showBack = false,
  texts: textsProp,
  onBack,
  className,
  children,
  ...rest
}: CwSettingsPageProps) {
  const texts = {
    ...defaultCwSettingsPageTexts,
    ...(textsProp ?? {}),
  }

  const styles = settingsPageBase

  return (
    <div
      className={[styles.root, className].filter(Boolean).join(' ')}
      {...rest}
    >
      <header className={styles.header}>
        {showBack && (
          <CwButton
            variant="text"
            size="small"
            texts={{ label: texts.backLabel }}
            appearance="icon"
            onClick={() => onBack?.()}
          >
            <CwIcon
              name="common--dir--arrow-left-line"
              size={1.25}
              className="inline-flex shrink-0 items-center justify-center leading-none"
              aria-hidden="true"
            />
          </CwButton>
        )}
        <h2 className={styles.title}>{title}</h2>
      </header>
      <div className={styles.body}>{children}</div>
    </div>
  )
}

export default CwSettingsPage
