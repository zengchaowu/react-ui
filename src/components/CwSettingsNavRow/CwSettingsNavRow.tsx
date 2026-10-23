import { CwCell } from '../CwCell'
import { CwIcon } from '../CwIcon'
import type { CwSettingsNavRowProps } from './types'
import { settingsNavRowBase } from './styles'

export function CwSettingsNavRow({
  title,
  description,
  icon,
  danger = false,
  showChevron = true,
  showUnderline = true,
  iconSize = 1.25,
  className,
  onClick,
  ...rest
}: CwSettingsNavRowProps) {
  const styles = settingsNavRowBase

  const iconClass = [styles.icon, danger ? styles.iconDanger : '']
    .filter(Boolean)
    .join(' ')

  const titleClass = [styles.title, danger ? styles.titleDanger : '']
    .filter(Boolean)
    .join(' ')

  return (
    <CwCell
      title={title}
      subtitle={description}
      clickable
      appearance="compact-row"
      showArrow={showChevron}
      showUnderline={showUnderline}
      onClick={onClick}
      className={className}
      titleSlot={
        <span className={styles.titleWrap}>
          {icon ? (
            <span className={iconClass} aria-hidden="true">
              <CwIcon
                name={icon}
                size={iconSize}
                className="inline-flex shrink-0 items-center justify-center leading-none"
              />
            </span>
          ) : null}
          <span className={titleClass}>{title}</span>
        </span>
      }
      {...rest}
    />
  )
}

export default CwSettingsNavRow
