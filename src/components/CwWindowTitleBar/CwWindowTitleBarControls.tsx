import { useState } from 'react'
import type { CSSProperties, KeyboardEvent as ReactKeyboardEvent } from 'react'
import CwIcon from '../CwIcon/CwIcon'
import { titleBarBase } from './styles'
import type { CwWindowTitleBarTexts, WindowTitleBarMode } from './types'

export interface CwWindowTitleBarControlsProps {
  mode?: WindowTitleBarMode
  closable?: boolean
  minimizable?: boolean
  maximizable?: boolean
  maximized?: boolean
  texts: CwWindowTitleBarTexts
  macGap?: string
  onClose?: () => void
  onMinimize?: () => void
  onMaximize?: () => void
}

export function CwWindowTitleBarControls({
  mode = 'mac',
  closable = true,
  minimizable = true,
  maximizable = true,
  maximized = false,
  texts,
  macGap = '0.5rem',
  onClose,
  onMinimize,
  onMaximize,
}: CwWindowTitleBarControlsProps) {
  const [macTrafficHovered, setMacTrafficHovered] = useState(false)

  const tabindex = 0
  const macGapStyle: CSSProperties = { gap: macGap }

  const handleKeyDown =
    (handler?: () => void) => (event: ReactKeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        handler?.()
      }
    }

  const renderMacDot = (
    dotClass: string,
    hoverIconClass: string,
    iconName: string,
    ariaLabel: string,
    handler?: () => void,
  ) => (
    <div
      role="button"
      tabIndex={tabindex}
      className={[
        titleBarBase.macDot,
        dotClass,
        macTrafficHovered ? hoverIconClass : '',
      ]
        .filter(Boolean)
        .join(' ')}
      aria-label={ariaLabel}
      onClick={handler}
      onKeyDown={handleKeyDown(handler)}
    >
      {macTrafficHovered ? <CwIcon name={iconName} size={0.625} /> : null}
    </div>
  )

  if (mode === 'mac') {
    return (
      <div
        className={[titleBarBase.controls, titleBarBase.macControls]
          .filter(Boolean)
          .join(' ')}
        style={macGapStyle}
        onMouseEnter={() => setMacTrafficHovered(true)}
        onMouseLeave={() => setMacTrafficHovered(false)}
      >
        {closable
          ? renderMacDot(
              titleBarBase.macDotClose,
              titleBarBase.macDotCloseIcon,
              'common--window--mac-close-filled',
              texts.closeMacLabel,
              onClose,
            )
          : null}
        {minimizable
          ? renderMacDot(
              titleBarBase.macDotMinimize,
              titleBarBase.macDotMinimizeIcon,
              'common--window--mac-minimize-line',
              texts.minimizeMacLabel,
              onMinimize,
            )
          : null}
        {maximizable
          ? renderMacDot(
              titleBarBase.macDotMaximize,
              titleBarBase.macDotMaximizeIcon,
              'common--window--mac-maximize-line',
              texts.maximizeMacLabel,
              onMaximize,
            )
          : null}
      </div>
    )
  }

  return (
    <div className={titleBarBase.controls}>
      {minimizable ? (
        <div
          role="button"
          tabIndex={tabindex}
          className={[titleBarBase.winButton, titleBarBase.winButtonHover]
            .filter(Boolean)
            .join(' ')}
          aria-label={texts.minimizeWinLabel}
          onClick={onMinimize}
          onKeyDown={handleKeyDown(onMinimize)}
        >
          <CwIcon name="common--window--windows-minimize-line" size={1} />
        </div>
      ) : null}
      {maximizable ? (
        <div
          role="button"
          tabIndex={tabindex}
          className={[titleBarBase.winButton, titleBarBase.winButtonHover]
            .filter(Boolean)
            .join(' ')}
          aria-label={maximized ? texts.restoreWinLabel : texts.maximizeWinLabel}
          onClick={onMaximize}
          onKeyDown={handleKeyDown(onMaximize)}
        >
          <CwIcon
            name={
              maximized
                ? 'common--window--windows-restore-line'
                : 'common--window--windows-maximize-line'
            }
            size={1}
          />
        </div>
      ) : null}
      {closable ? (
        <div
          role="button"
          tabIndex={tabindex}
          className={[titleBarBase.winButton, titleBarBase.winButtonClose]
            .filter(Boolean)
            .join(' ')}
          aria-label={texts.closeWinLabel}
          onClick={onClose}
          onKeyDown={handleKeyDown(onClose)}
        >
          <CwIcon name="common--window--windows-close-line" size={1} />
        </div>
      ) : null}
    </div>
  )
}

export default CwWindowTitleBarControls
