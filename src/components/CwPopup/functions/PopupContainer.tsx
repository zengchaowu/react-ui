import type { ReactNode, RefObject } from 'react'
import { CW_OVERLAY_MODAL_Z_CLASS } from '@zengchaowu/ui-shared/constants/cwOverlayZIndex'
import { buildPopupRootClass } from '../utils/popupRootClass'
import { buildPopupRootStyle, canPaintPopup, POPUP_HIDDEN_STYLE } from '../utils/popupOffsetStyle'

const BRIDGE_BASE_CLASS = `fixed top-0 left-0 ${CW_OVERLAY_MODAL_Z_CLASS}`

export interface PopupContainerProps {
  visible: boolean
  offsetX: number | null
  offsetY: number | null
  styleClass: string
  popupRef: RefObject<HTMLDivElement>
  pluginRef: RefObject<HTMLDivElement>
  bridgeRef: RefObject<HTMLDivElement>
  children?: ReactNode
}

/**
 * 动态挂载的弹出层壳（createPortal 到 overlay scope 或 body）
 */
export function PopupContainer({
  visible,
  offsetX,
  offsetY,
  styleClass,
  popupRef,
  pluginRef,
  bridgeRef,
  children,
}: PopupContainerProps) {
  const paint = canPaintPopup(visible, offsetX, offsetY)

  return (
    <>
      <div
        ref={bridgeRef}
        className={BRIDGE_BASE_CLASS}
        style={
          paint
            ? { pointerEvents: 'auto', background: 'transparent' }
            : { ...POPUP_HIDDEN_STYLE, background: 'transparent' }
        }
      />
      <div
        ref={popupRef}
        className={buildPopupRootClass(styleClass)}
        style={buildPopupRootStyle(visible, offsetX, offsetY)}
      >
        <div ref={pluginRef} />
        {children}
      </div>
    </>
  )
}

export default PopupContainer
