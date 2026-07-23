import {
  forwardRef,
  useEffect,
  useMemo,
  type CSSProperties,
  type HTMLAttributes,
} from 'react'
import type { CwIconProps } from './types'
import { iconBase } from './styles'
import { defaultTexts } from './texts'
import {
  resolveCwBoxSizeStyle,
  resolveCwIconFontSizeStyle,
} from '../../utils/cwRemSize'
import { ensureIconfontSymbolSprite } from './ensureIconfontSymbolSprite'

export type CwIconReactProps = CwIconProps &
  Omit<HTMLAttributes<HTMLSpanElement>, 'children'> & {
    className?: string
  }

export const CwIcon = forwardRef<HTMLSpanElement, CwIconReactProps>(
  function CwIcon(props, ref) {
    const {
      name,
      mode = 'font',
      svg,
      spin = false,
      prefix = 'icon',
      size = iconBase.defaultSize,
      texts,
      className,
      style,
      ...rest
    } = props

    const ariaLabel = texts?.label || name || defaultTexts.label || undefined

    const iconfontClass = useMemo(() => {
      if (!name) return ''
      return name.startsWith(prefix) ? name : `${prefix}-${name}`
    }, [name, prefix])

    const symbolHref = `#${iconfontClass}`

    const iconType = useMemo(() => {
      if (svg) return 'svg' as const
      if (name && mode === 'symbol') return 'symbol' as const
      if (name) return 'iconfont' as const
      return null
    }, [svg, name, mode])

    useEffect(() => {
      if (iconType === 'symbol') {
        ensureIconfontSymbolSprite()
      }
    }, [iconType])

    const sizeBox = { size }
    const rootStyle: CSSProperties = {
      ...resolveCwBoxSizeStyle(sizeBox, iconBase.defaultSize),
      ...(style as CSSProperties | undefined),
    }

    const iconfontStyle: CSSProperties =
      size === 0
        ? { fontSize: 'inherit' }
        : resolveCwIconFontSizeStyle(sizeBox, iconBase.defaultSize)

    const svgContent = useMemo(() => {
      if (!svg) return ''
      if (typeof window === 'undefined' || typeof DOMParser === 'undefined') {
        return svg
      }
      try {
        const parser = new DOMParser()
        const svgDoc = parser.parseFromString(svg, 'image/svg+xml')
        const svgElement = svgDoc.querySelector('svg')
        if (!svgElement) return svg
        svgElement.removeAttribute('width')
        svgElement.removeAttribute('height')
        svgElement.setAttribute('width', '100%')
        svgElement.setAttribute('height', '100%')
        return svgElement.outerHTML
      } catch {
        return svg
      }
    }, [svg])

    const rootClassList = [iconBase.root, spin ? iconBase.spin : '', className]
      .filter(Boolean)
      .join(' ')

    return (
      <span
        ref={ref}
        className={rootClassList}
        style={rootStyle}
        aria-label={ariaLabel || undefined}
        role="img"
        {...rest}
      >
        {iconType === 'symbol' ? (
          <svg className={iconBase.symbol} aria-hidden="true">
            <use href={symbolHref} />
          </svg>
        ) : null}
        {iconType === 'iconfont' ? (
          <span
            className={['iconfont', iconBase.iconfont, iconfontClass].filter(Boolean).join(' ')}
            style={iconfontStyle}
          />
        ) : null}
        {iconType === 'svg' ? (
          <span
            className={iconBase.svg}
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
        ) : null}
      </span>
    )
  },
)

export default CwIcon
