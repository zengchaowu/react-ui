import { useMemo } from 'react'
import CwDynamicDialogLayer from '../CwDynamicDialog/CwDynamicDialogLayer'
import type { CwDynamicDialogConfig } from '../CwDynamicDialog/types'
import CwLoading from '../CwLoading/CwLoading'
import type { CwHudProps } from './types'
import { hudBase } from './styles'
import { defaultCwHudTexts } from './texts'

export function CwHud({
  visible = false,
  text = '',
  mask = true,
  maskClosable = false,
  loadingType = 'spinner',
  loadingSize = 'medium',
  texts: textsProp,
  onVisibleChange,
}: CwHudProps) {
  const texts = { ...defaultCwHudTexts, ...(textsProp ?? {}) }

  const hudDialogConfig = useMemo<CwDynamicDialogConfig>(
    () => ({
      variant: 'hud',
      hudMask: mask,
      hudMaskClosable: maskClosable,
      dismissStack: maskClosable,
      closeOnClickOutside: maskClosable,
      bodyPadding: false,
      bodyScroll: false,
    }),
    [mask, maskClosable],
  )

  return (
    <CwDynamicDialogLayer
      visible={visible}
      config={hudDialogConfig}
      layerId="cw-hud"
      onClose={() => onVisibleChange?.(false)}
    >
      <CwLoading
        type={loadingType}
        size={loadingSize}
        texts={texts.loadingTexts}
      />
      {text && text.trim() ? <p className={hudBase.text}>{text.trim()}</p> : null}
    </CwDynamicDialogLayer>
  )
}

export default CwHud
