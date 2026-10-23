import type { SVGProps } from 'react'
import type { CwTwoToneIconProps } from './types'
import { twoToneIconBase } from './styles'

/** 额外透传的 svg 属性（Vue 侧未关闭 inheritAttrs，等同 attrs 落到 svg 根节点） */
export type CwTwoToneIconAttrs = Omit<
  SVGProps<SVGSVGElement>,
  'className' | 'children' | 'color'
>

export function CwTwoToneIcon({
  primaryName,
  accentName,
  primaryColor = 'var(--text-color-secondary)',
  accentColor = 'var(--brand-color-6)',
  className = '',
  texts: _texts,
  ...rest
}: CwTwoToneIconProps & CwTwoToneIconAttrs) {
  /** 用 color 而非 fill：<use> 克隆的 symbol 会继承 currentColor，fill 在多数浏览器不继承 */
  const primaryStyle = primaryColor ? { color: primaryColor } : undefined
  const accentStyle = accentColor ? { color: accentColor } : undefined

  return (
    <svg
      {...rest}
      className={[twoToneIconBase.root, className]
        .filter(Boolean)
        .join(' ')
        .trim()}
      viewBox="0 0 1024 1024"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      aria-hidden="true"
    >
      <g>
        <use xlinkHref={`#${primaryName}`} style={primaryStyle} />
      </g>
      <g>
        <use xlinkHref={`#${accentName}`} style={accentStyle} />
      </g>
    </svg>
  )
}

export default CwTwoToneIcon
