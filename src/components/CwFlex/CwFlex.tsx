import type { CSSProperties, HTMLAttributes } from 'react'
import type { CwFlexProps } from './types'
import { flexBase } from './styles'

export function CwFlex({
  direction = 'column',
  gap = 12,
  padding = 16,
  align = 'stretch',
  justify = 'flex-start',
  children,
  className,
  style,
  texts: _texts,
  ...rest
}: CwFlexProps & Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'className' | 'style'>) {
  const rootStyle: CSSProperties = {
    gap: `${gap}px`,
    padding: `${padding}px`,
    alignItems: align,
    justifyContent: justify,
    ...style,
  }

  return (
    <div
      className={[
        flexBase.root,
        direction === 'row' ? flexBase.directionRow : flexBase.directionColumn,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={rootStyle}
      {...rest}
    >
      {children}
    </div>
  )
}

export default CwFlex
