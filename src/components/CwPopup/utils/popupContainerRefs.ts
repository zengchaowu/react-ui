import type { RefObject } from 'react'

/** React 版弹出层容器对外暴露的 ref 集合 */
export interface PopupContainerExposed {
  popupContainerRef?: RefObject<HTMLElement | null>
  pluginContainerRef?: RefObject<HTMLElement | null>
  bridgeRef?: RefObject<HTMLElement | null>
}

export function readPopupContainerExposed(
  exposed: PopupContainerExposed | null | undefined,
): PopupContainerExposed | null {
  return exposed ?? null
}
