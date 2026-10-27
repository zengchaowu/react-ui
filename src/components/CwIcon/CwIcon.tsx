import { useEffect } from 'react'
import '../../assets/asset/asset.css'
import '../../assets/asset/asset-host.css'
import {
  resolveCwBoxSizeStyle,
  resolveCwIconFontSizeStyle,
} from '@zengchaowu/ui-shared/functions/ui/cwRemSize'
import type { CwIconProps } from './types'
import { iconBase } from '@zengchaowu/ui-shared/components/CwIcon/styles'
import { defaultTexts } from '@zengchaowu/ui-shared/components/CwIcon/texts'
import { ensureAssetSymbolSprite } from './ensureAssetSymbolSprite'

export function CwIcon({
  name,
  mode = 'font',
  spin = false,
  prefix = 'icon',
  size = iconBase.defaultSize,
  texts,
  className,
  style,
  ...rest
}: CwIconProps) {
  const sizeValue = size ?? iconBase.defaultSize

  const rootClassList = [iconBase.root, spin ? iconBase.spin : '', className]
    .filter(Boolean)
    .join(' ')

  const ariaLabel = texts?.label || name || defaultTexts.label

  const assetClass = name
    ? name.startsWith(prefix)
      ? name
      : `${prefix}-${name}`
    : ''

  const symbolHref = `#${assetClass}`

  const iconType: 'symbol' | 'asset' | null = name
    ? mode === 'symbol'
      ? 'symbol'
      : 'asset'
    : null

  const sizeBox = { size: sizeValue }

  const rootStyle = {
    ...resolveCwBoxSizeStyle(sizeBox, iconBase.defaultSize),
    ...style,
  }

  const assetStyle =
    sizeValue === 0
      ? { fontSize: 'inherit' }
      : resolveCwIconFontSizeStyle(sizeBox, iconBase.defaultSize)

  useEffect(() => {
    if (iconType === 'symbol') {
      ensureAssetSymbolSprite()
    }
  }, [iconType])

  return (
    <span
      {...rest}
      className={rootClassList}
      style={rootStyle}
      aria-label={ariaLabel}
      role="img"
    >
      {iconType === 'symbol' ? (
        <svg className={iconBase.symbol} aria-hidden="true">
          <use href={symbolHref} />
        </svg>
      ) : iconType === 'asset' ? (
        <i
          aria-hidden="true"
          className={[assetClass, 'asset', iconBase.asset]
            .filter(Boolean)
            .join(' ')}
          style={assetStyle}
        />
      ) : null}
    </span>
  )
}

export default CwIcon
