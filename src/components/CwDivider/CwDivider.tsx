import type { CwDividerProps } from './types'
import { dividerBase } from '@zengchaowu/ui-shared/components/CwDivider/styles'

export function CwDivider({
  vertical = false,
  show = true,
  open,
  hairline = true,
  layout = 'standalone',
  dashed = false,
  content = '',
  text = '',
  label = '',
  contentPosition = 'center',
  dense = false,
  bold = false,
  disabled = false,
  texts: _texts,
  children,
  className,
  ...rest
}: CwDividerProps) {
  const styles = dividerBase

  const visible = open !== undefined ? !!open : show

  const contentText = String(content || text || label || '').trim()

  const hasDefaultSlot = children !== undefined && children !== null

  const hasContent =
    layout !== 'embedded' &&
    !vertical &&
    (hasDefaultSlot || Boolean(contentText))

  const dashedClass = !dashed
    ? ''
    : vertical
      ? styles.lineDashedVertical
      : styles.lineDashed

  const rootClassList =
    layout === 'embedded'
      ? [className].filter(Boolean).join(' ')
      : hasContent
        ? [
            styles.root,
            dense ? styles.withContentDense : styles.withContent,
            disabled ? styles.rootDisabled : '',
            className,
          ]
            .filter(Boolean)
            .join(' ')
        : [
            styles.root,
            vertical
              ? hairline
                ? styles.hairlineVertical
                : styles.vertical
              : hairline
                ? styles.hairlineHorizontal
                : styles.horizontal,
            dashedClass,
            disabled ? styles.rootDisabled : '',
            className,
          ]
            .filter(Boolean)
            .join(' ')

  const labelClassList = [
    styles.label,
    disabled ? styles.labelDisabled : styles.labelNormal,
    bold ? styles.labelBold : '',
  ]
    .filter(Boolean)
    .join(' ')

  function sideLineClass(kind: 'grow' | 'short'): string {
    return [
      styles.line,
      kind === 'grow' ? styles.lineGrow : styles.lineShort,
      hairline ? styles.lineHairline : styles.lineThick,
      dashed ? styles.lineDashed : '',
    ]
      .filter(Boolean)
      .join(' ')
  }

  if (!visible) return null

  return (
    <div
      {...rest}
      className={rootClassList}
      role={hasContent ? undefined : 'separator'}
      aria-orientation={vertical ? 'vertical' : 'horizontal'}
    >
      {hasContent ? (
        <>
          <div
            className={sideLineClass(
              contentPosition === 'left' ? 'short' : 'grow',
            )}
          />
          <span className={labelClassList}>{children ?? contentText}</span>
          <div
            className={sideLineClass(
              contentPosition === 'right' ? 'short' : 'grow',
            )}
          />
        </>
      ) : null}
    </div>
  )
}

export default CwDivider
