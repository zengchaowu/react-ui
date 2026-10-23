import type { CwLoadingAppearance, CwLoadingProps } from './types'
import { appearanceStyles, loadingBase } from './styles'

type CwLoadingSize = 'small' | 'medium' | 'large'
type CwLoadingType = 'spinner' | 'dots' | 'bars'

const sizeStyles: Record<CwLoadingType, Record<CwLoadingSize, string>> = {
  spinner: {
    small: 'w-4 h-4 border-2',
    medium: 'w-6 h-6 border-2',
    large: 'w-8 h-8 border-[0.1875rem]',
  },
  dots: {
    small: 'w-1.5 h-1.5',
    medium: 'w-2 h-2',
    large: 'w-2.5 h-2.5',
  },
  bars: {
    small: 'w-0.5 h-3',
    medium: 'w-1 h-4',
    large: 'w-1.5 h-5',
  },
}

/** 这些 appearance 自带尺寸，勿再叠 size 的 w-6/h-6 */
const appearanceOwnsSizeList: CwLoadingAppearance[] = [
  'inverseTiny',
  'treeInline',
  'mutedInline',
  'inlineText',
]

export function CwLoading({
  type = 'spinner',
  size = 'medium',
  appearance = 'default',
  spinnerClass = '',
  texts: _texts,
  className,
  ...rest
}: CwLoadingProps) {
  const resolvedAppearance: CwLoadingAppearance = appearance || 'default'

  const styles = {
    ...loadingBase,
    ...(appearanceStyles[resolvedAppearance] ?? {}),
  }

  const appearanceOwnsSize = appearanceOwnsSizeList.includes(resolvedAppearance)

  const spinnerSizeClass = appearanceOwnsSize
    ? ''
    : sizeStyles.spinner[size || 'medium']

  return (
    <div
      {...rest}
      className={[styles.root, className].filter(Boolean).join(' ')}
    >
      <div className={styles.loader}>
        {type === 'spinner' ? (
          <div className={styles.spinner}>
            <div
              className={[styles.spinnerCircle, spinnerSizeClass, spinnerClass]
                .filter(Boolean)
                .join(' ')}
            />
          </div>
        ) : type === 'dots' ? (
          <div className={styles.dots}>
            {Array.from({ length: 3 }, (_, index) => (
              <div
                key={index}
                className={[
                  styles.dot,
                  sizeStyles.dots[size || 'medium'],
                  'animate-[loading-dot_0.6s_ease-in-out_infinite]',
                ]
                  .filter(Boolean)
                  .join(' ')}
                style={{ animationDelay: `${index * 0.15}s` }}
              />
            ))}
          </div>
        ) : (
          <div className={styles.bars}>
            {Array.from({ length: 4 }, (_, index) => (
              <div
                key={index}
                className={[
                  styles.bar,
                  sizeStyles.bars[size || 'medium'],
                  'origin-bottom scale-y-0 animate-[loading-bar_1.2s_ease-in-out_infinite]',
                ]
                  .filter(Boolean)
                  .join(' ')}
                style={{ animationDelay: `${index * 0.15}s` }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default CwLoading
