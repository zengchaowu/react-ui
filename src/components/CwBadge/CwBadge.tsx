import type { CwBadgeProps } from './types'
import type { CwBadgeAppearance } from '@zengchaowu/ui-shared/components/CwBadge/types'
import { appearanceStyles, badgeBase } from '@zengchaowu/ui-shared/components/CwBadge/styles'

const DEFAULT_BACKGROUND = 'var(--error-color-6)'

export function CwBadge({
  content,
  dot = false,
  max,
  showZero = false,
  size = 'medium',
  backgroundColor,
  appearance = 'default',
  texts: _texts,
  children,
  className,
  ...rest
}: CwBadgeProps) {
  const resolvedAppearance: CwBadgeAppearance = appearance || 'default'

  const styles = {
    ...badgeBase,
    ...(appearanceStyles[resolvedAppearance] ?? {}),
  }

  const hasSlot = children !== undefined && children !== null

  const rootClassList = [
    styles.root,
    hasSlot ? styles.rootWithSlot : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const bg = backgroundColor?.trim()
  const surfaceStyle = { backgroundColor: bg || DEFAULT_BACKGROUND }

  const sizeMap = {
    xsmall: styles.xsmall,
    small: styles.small,
    medium: styles.medium,
    large: styles.large,
  }

  const sizeClass = sizeMap[size || 'medium']

  const displayContent: string | null = (() => {
    if (dot) {
      return null
    }

    if (content === undefined || content === null || content === '') {
      return null
    }

    if (typeof content === 'number') {
      if (content === 0 && !showZero) {
        return null
      }

      if (max !== undefined && content > max) {
        return `${max}+`
      }

      return String(content)
    }

    return content
  })()

  return (
    <div {...rest} className={rootClassList}>
      {hasSlot ? children : null}
      {dot ? (
        <div
          className={[styles.dot, hasSlot ? styles.badgeOverlay : '']
            .filter(Boolean)
            .join(' ')}
          style={surfaceStyle}
        />
      ) : displayContent !== null ? (
        <div
          className={[
            styles.content,
            sizeClass,
            hasSlot ? styles.badgeOverlay : '',
          ]
            .filter(Boolean)
            .join(' ')}
          style={surfaceStyle}
        >
          <span className={styles.text}>{displayContent}</span>
        </div>
      ) : null}
    </div>
  )
}

export default CwBadge
