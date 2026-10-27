import type { CwEmptyStateProps } from './types'
import type { CwEmptyStateAppearance } from '@zengchaowu/ui-shared/components/CwEmptyState/types'
import { appearanceRootClass, getStyles } from '@zengchaowu/ui-shared/components/CwEmptyState/styles'
import { defaultCwEmptyStateTexts } from '@zengchaowu/ui-shared/components/CwEmptyState/texts'

export function CwEmptyState({
  size = 'medium',
  showText = true,
  appearance = 'default',
  texts,
  icon,
  text,
  action,
  className,
  ...rest
}: CwEmptyStateProps) {
  const resolvedAppearance: CwEmptyStateAppearance = appearance || 'default'

  const styles = getStyles(size)

  const mergedTexts = { ...defaultCwEmptyStateTexts, ...(texts ?? {}) }

  const rootClassList = [
    styles.root,
    appearanceRootClass[resolvedAppearance],
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div {...rest} className={rootClassList}>
      {icon != null ? <div className={styles.icon}>{icon}</div> : null}
      {showText ? (
        <div className={styles.text}>{text ?? mergedTexts.defaultMessage}</div>
      ) : null}
      {action != null ? <div className={styles.action}>{action}</div> : null}
    </div>
  )
}

export default CwEmptyState
