import { useEffect, useState } from 'react'
import type { SyntheticEvent } from 'react'
import { resolveCwBoxSizeStyle } from '@zengchaowu/ui-shared/functions/ui/cwRemSize'
import {
  fileIconNameForPath,
  fileIconUrl,
  type FileIconMaps,
} from '@zengchaowu/shared/functions/file/fileIcon'
import type { CwFileIconProps } from './types'
import { fileIconBase } from '@zengchaowu/ui-shared/components/CwFileIcon/styles'
import { defaultTexts } from '@zengchaowu/ui-shared/components/CwFileIcon/texts'
import { usePublicAssetBaseUrl } from '../../utils/publicAssetBaseUrl'
import iconMaps from '../../assets/fileIconMaps.json'

export function CwFileIcon({
  path,
  isDirectory = false,
  size = fileIconBase.defaultSize,
  baseUrl,
  texts,
  className,
  ...rest
}: CwFileIconProps) {
  const publicAssetBaseUrl = usePublicAssetBaseUrl()

  const maps = iconMaps as FileIconMaps

  const iconName = fileIconNameForPath(maps, path, isDirectory)

  const resolveIconUrl = (name: string): string => {
    const override = baseUrl?.trim()
    if (override) return fileIconUrl(name, override)
    return fileIconUrl(name, publicAssetBaseUrl)
  }

  const ariaLabel = texts?.alt ?? defaultTexts.alt ?? ''

  const iconUrl = resolveIconUrl(iconName)
  const defaultIcon = maps.defaultFileIcon
  const defaultIconUrl = resolveIconUrl(defaultIcon)

  const [hasFallback, setHasFallback] = useState(false)
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    setHasFallback(false)
    setHidden(false)
  }, [iconName])

  function handleError(event: SyntheticEvent<HTMLImageElement>) {
    if (hasFallback || iconName === defaultIcon) {
      event.currentTarget.style.display = 'none'
      setHidden(true)
      return
    }
    setHasFallback(true)
  }

  const sizeValue = size ?? fileIconBase.defaultSize

  const iconBoxStyle = resolveCwBoxSizeStyle(
    { size: sizeValue },
    fileIconBase.defaultSize,
  )

  const fillParent = sizeValue === 0

  const imageStyle = hidden
    ? { ...iconBoxStyle, display: 'none' }
    : iconBoxStyle

  return (
    <div
      {...rest}
      className={[
        fileIconBase.root,
        fillParent ? 'h-full w-full' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={iconBoxStyle}
      role="img"
      aria-label={ariaLabel}
    >
      <img
        src={hasFallback ? defaultIconUrl : iconUrl}
        alt={ariaLabel}
        draggable={false}
        className={[fileIconBase.image, fillParent ? 'h-full w-full object-contain' : '']
          .filter(Boolean)
          .join(' ')}
        style={imageStyle}
        onError={handleError}
      />
    </div>
  )
}

export default CwFileIcon
