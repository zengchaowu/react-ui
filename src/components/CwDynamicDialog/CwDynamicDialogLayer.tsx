import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { scheduleBringOverlayHostToFront } from '../../constants/cwOverlayStack'
import CwDynamicDialogInner from './CwDynamicDialogInner'
import type {
  CwDynamicDialogInnerHandle,
  CwDynamicDialogLayerProps,
} from './types'
import { defaultTexts } from '@zengchaowu/ui-shared/components/CwDynamicDialog/texts'

function generateLayerId(): string {
  return `cw-dialog-layer-${Date.now()}_${Math.random().toString(36).slice(2, 11)}`
}

export function CwDynamicDialogLayer({
  visible = false,
  config = {},
  texts: textsProp,
  layerId,
  appendToBody = true,
  appendParent,
  onClose,
  onVisibleChange,
  children,
  className,
}: CwDynamicDialogLayerProps) {
  const texts = useMemo(
    () => ({ ...defaultTexts, ...(textsProp ?? {}) }),
    [textsProp],
  )

  const generatedLayerIdRef = useRef<string | null>(null)
  if (generatedLayerIdRef.current === null) {
    generatedLayerIdRef.current = generateLayerId()
  }
  const resolvedLayerId = layerId ?? generatedLayerIdRef.current

  const layerMountRef = useRef<HTMLDivElement | null>(null)
  const inlineLayerRef = useRef<CwDynamicDialogInnerHandle | null>(null)
  const [portalHost, setPortalHost] = useState<HTMLElement | null>(null)

  useEffect(() => {
    if (appendToBody === false) {
      setPortalHost(null)
      return
    }
    setPortalHost(appendParent?.() ?? document.body)
  }, [appendToBody, appendParent])

  useEffect(() => {
    if (appendToBody !== false && layerMountRef.current) {
      scheduleBringOverlayHostToFront(layerMountRef.current)
    }
  }, [appendToBody, portalHost])

  useEffect(() => {
    if (!visible) return
    const resolveLayerHostEl = (): HTMLElement | null => {
      if (appendToBody === false) {
        return inlineLayerRef.current?.overlayRootRef.current ?? null
      }
      return layerMountRef.current
    }
    scheduleBringOverlayHostToFront(() => resolveLayerHostEl())
  }, [visible, appendToBody])

  function handleClose(): void {
    onVisibleChange?.(false)
    onClose?.()
  }

  if (appendToBody === false) {
    return (
      <CwDynamicDialogInner
        ref={inlineLayerRef}
        id={resolvedLayerId}
        visible={visible}
        config={config}
        texts={texts}
        onClose={handleClose}
        className={className}
      >
        {children}
      </CwDynamicDialogInner>
    )
  }

  const inner = (
    <CwDynamicDialogInner
      id={resolvedLayerId}
      visible={visible}
      config={config}
      texts={texts}
      onClose={handleClose}
    >
      {children}
    </CwDynamicDialogInner>
  )

  if (!portalHost) return null

  return createPortal(
    <div
      ref={layerMountRef}
      className={['cw-dynamic-dialog-layer-mount', className]
        .filter(Boolean)
        .join(' ')}
      style={{ display: 'contents' }}
    >
      {inner}
    </div>,
    portalHost,
  )
}

export default CwDynamicDialogLayer
