import { createDimensions } from '../CwPopup/plugins/dimensions'
import { createFlip } from '../CwPopup/plugins/flip'
import { createOffset } from '../CwPopup/plugins/offset'
import { createPosition } from '../CwPopup/plugins/position'
import { createPreventOverflow } from '../CwPopup/plugins/prevent-overflow'
import { createArrow } from '../CwPopup/plugins/arrow'
import type { PopupPluginFunction } from '../CwPopup/types/state'

export function buildTooltipPopupPlugins(options: {
  flip: boolean | undefined
  viewportPadding: number
  offset: number
  showArrow: boolean
  arrowMargin: number
  arrowClass: string
  extraPlugins?: PopupPluginFunction[]
}): PopupPluginFunction[] {
  const basePlugins: PopupPluginFunction[] = [createDimensions()]
  if (options.flip !== false) {
    basePlugins.push(createFlip({ padding: options.viewportPadding }))
  }
  basePlugins.push(
    createPosition(),
    createOffset({ offset: options.offset }),
    createPreventOverflow({ padding: options.viewportPadding }),
  )

  const arrowPlugins = options.showArrow
    ? [createArrow({ margin: options.arrowMargin, arrowClass: options.arrowClass })]
    : []

  return [...basePlugins, ...arrowPlugins, ...(options.extraPlugins ?? [])]
}
