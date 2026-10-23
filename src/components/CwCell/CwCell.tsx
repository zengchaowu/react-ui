import type { HTMLAttributes, ReactNode } from 'react'
import type {
  CwCellAppearance,
  CwCellProps,
  CwCellStyles,
  CwCellTexts,
} from './types'
import { cellAppearanceStyles, cellBase } from './styles'
import { defaultCellTexts } from './texts'
import { useCwCellGroupContext } from './CwCellGroup'
import { CwIcon } from '../CwIcon'
import { CwDivider } from '../CwDivider'

export interface CwCellComponentProps
  extends CwCellProps,
    Omit<HTMLAttributes<HTMLDivElement>, 'title' | 'onClick' | 'children'> {
  children?: ReactNode
  className?: string
}

export function CwCell({
  title = '',
  subtitle = '',
  showArrow = false,
  showUnderline = true,
  underlineAlign,
  clickable = false,
  rightPlacement = 'cell',
  appearance,
  texts: textsProp,
  contentSlot,
  titleSlot,
  titleRightSlot,
  rightSlot,
  subtitleSlot,
  children,
  className,
  onClick,
  ...rest
}: CwCellComponentProps) {
  const group = useCwCellGroupContext()

  const resolvedAppearance: CwCellAppearance =
    appearance ?? group?.cellAppearance ?? 'default'

  const texts: CwCellTexts = {
    ...defaultCellTexts,
    ...(group?.cellTexts ?? {}),
    ...(textsProp ?? {}),
  }

  const appearanceExtra = cellAppearanceStyles[resolvedAppearance] ?? {}
  const styles: CwCellStyles = {
    ...cellBase,
    ...appearanceExtra,
    arrowIconStyles: {
      ...cellBase.arrowIconStyles,
      ...appearanceExtra.arrowIconStyles,
    },
    dividerRoot: appearanceExtra.dividerRoot ?? cellBase.dividerRoot,
  }

  const rootClassName = [
    styles.root,
    clickable ? styles.clickable : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const baseRootStyle = styles.dividerRoot ?? cellBase.dividerRoot ?? ''
  const hasCustomHorizontalInset = /(?:^|\s)(?:left-\[|right-\[)/.test(
    baseRootStyle,
  )
  const rootStyleWithoutPosition = hasCustomHorizontalInset
    ? baseRootStyle.trim()
    : baseRootStyle.replace(/left-\d+|right-\d+/g, '').trim()

  const resolvedUnderlineAlign =
    underlineAlign !== undefined
      ? underlineAlign
      : (group?.underlineAlign ?? 'full')

  const positionClass = hasCustomHorizontalInset
    ? ''
    : resolvedUnderlineAlign === 'indent'
      ? 'left-4 right-0'
      : 'left-0 right-0'

  const dividerRootClass = hasCustomHorizontalInset
    ? rootStyleWithoutPosition
    : `${rootStyleWithoutPosition} ${positionClass}`.trim()

  const shouldShowUnderline = showUnderline !== false

  const showTitleRight =
    titleRightSlot != null ||
    (rightSlot != null && rightPlacement === 'title')

  const useTitleRowLayout = !!title || titleSlot != null || showTitleRight

  const content = contentSlot !== undefined ? contentSlot : children

  return (
    <div
      {...rest}
      className={rootClassName}
      role={clickable ? 'button' : undefined}
      onClick={clickable ? onClick : undefined}
    >
      <div className={styles.content}>
        {content !== undefined ? (
          content
        ) : (
          <>
            {useTitleRowLayout ? (
              <div className={styles.titleRow}>
                <div className={styles.titleMain}>
                  {titleSlot ?? (title ? <span>{title}</span> : null)}
                </div>
                {showTitleRight ? (
                  <div
                    className={styles.titleRightSlot}
                    onClick={(event) => event.stopPropagation()}
                  >
                    {titleRightSlot}
                    {rightPlacement === 'title' ? rightSlot : null}
                  </div>
                ) : null}
              </div>
            ) : title ? (
              <div className={styles.title}>{title}</div>
            ) : null}
            {subtitleSlot ?? (subtitle ? <div className={styles.subtitle}>{subtitle}</div> : null)}
          </>
        )}
      </div>
      {showArrow || (rightPlacement === 'cell' && rightSlot != null) ? (
        <div className={styles.rightSlot}>
          {rightPlacement === 'cell' ? rightSlot : null}
          {showArrow ? (
            <CwIcon
              name="common--dir--arrow-right-line"
              prefix="icon"
              size={styles.arrowIconStyles?.size ?? 1}
              className={styles.arrowIconStyles?.class}
            />
          ) : null}
        </div>
      ) : null}
      {shouldShowUnderline ? (
        <CwDivider
          layout="embedded"
          className={dividerRootClass}
          texts={texts.dividerTexts}
        />
      ) : null}
    </div>
  )
}

export default CwCell
