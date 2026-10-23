import { createDimensions } from '../CwPopup/plugins/dimensions'
import { createFlip } from '../CwPopup/plugins/flip'
import { createOffset } from '../CwPopup/plugins/offset'
import { createPosition } from '../CwPopup/plugins/position'
import { createPreventOverflow } from '../CwPopup/plugins/prevent-overflow'
import { createArrow } from '../CwPopup/plugins/arrow'
import type { PopupPluginFunction } from '../CwPopup/types/state'

export interface CwContextMenuPopupArrowOptions {
  margin?: number
  arrowClass: string
}

export interface CwContextMenuPopupPluginsOptions {
  viewportPadding: number
  /** 与锚点矩形间距（px） */
  anchorOffset?: number
  /** 是否启用主轴翻转；下拉菜单可关，避免翻到锚点上方 */
  flip?: boolean
  arrow?: CwContextMenuPopupArrowOptions
}

/** ContextMenu 用 Popup 插件链；竖排列表默认无箭头，消息工具条可传 arrow */
export function createCwContextMenuPopupPlugins(
  options: CwContextMenuPopupPluginsOptions,
): PopupPluginFunction[] {
  const {
    viewportPadding,
    anchorOffset = 0,
    flip = true,
    arrow,
  } = options
  const plugins: PopupPluginFunction[] = [createDimensions()]
  if (flip) {
    plugins.push(createFlip({ padding: viewportPadding }))
  }
  plugins.push(
    createPosition(),
    createOffset({ offset: anchorOffset }),
    createPreventOverflow({ padding: viewportPadding }),
  )
  if (arrow) {
    plugins.push(
      createArrow({
        margin: arrow.margin ?? 10,
        arrowClass: arrow.arrowClass,
      }),
    )
  }
  return plugins
}

/** 打开后忽略 click-outside 的时长（防触摸长按合成 click） */
export const CW_CONTEXT_MENU_DISMISS_GRACE_MS = 450
