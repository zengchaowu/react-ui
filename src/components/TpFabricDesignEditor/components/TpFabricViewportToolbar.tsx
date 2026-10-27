import { useState } from 'react'
import CwIcon from '../../CwIcon/CwIcon'
import CwPopup from '../../CwPopup/CwPopup'
import { createDimensions } from '@zengchaowu/ui-shared/components/CwPopup/plugins/dimensions'
import { createFlip } from '@zengchaowu/ui-shared/components/CwPopup/plugins/flip'
import { createOffset } from '@zengchaowu/ui-shared/components/CwPopup/plugins/offset'
import { createPosition } from '@zengchaowu/ui-shared/components/CwPopup/plugins/position'
import { FOCUS_VISIBLE_INTERACTIVE_CLASS } from '@zengchaowu/ui-shared/functions/ui/focusStyles'
import type { TpFabricViewportTool } from '../types'
import {
  FABRIC_EDITOR_ICON_BTN_ACTIVE_CLASS,
  FABRIC_EDITOR_ICON_BTN_CLASS,
  FABRIC_EDITOR_TOOLBAR_DIVIDER_CLASS,
} from '@zengchaowu/ui-shared/components/TpFabricDesignEditor/document/fabricDesignEditorUi'

export interface TpFabricViewportToolbarProps {
  viewportTool: TpFabricViewportTool
  zoomPercent: number
  showRulers?: boolean
  disabled?: boolean
  /** 等价 Vue `update:viewportTool`（v-model:viewportTool） */
  onViewportToolChange?: (tool: TpFabricViewportTool) => void
  /** 等价 Vue `update:showRulers`（v-model:showRulers） */
  onShowRulersChange?: (visible: boolean) => void
  /** 等价 Vue `zoom-set` */
  onZoomSet?: (percent: number) => void
  /** 等价 Vue `zoom-reset` */
  onZoomReset?: () => void
  /** 等价 Vue `zoom-fit` */
  onZoomFit?: () => void
}

const zoomPresets = [5, 10, 25, 50, 100, 200, 400, 800, 1600, 3200]

const popupPlugins = [
  createDimensions(),
  createFlip({ padding: 8 }),
  createPosition(),
  createOffset({ offset: 8 }),
]

const dividerClass = FABRIC_EDITOR_TOOLBAR_DIVIDER_CLASS
const menuItemClass = `flex w-full cursor-pointer items-center gap-2 border-none bg-transparent px-2.5 py-1.5 text-left text-xs text-[var(--text-color-primary)] transition-colors duration-150 hover:bg-[var(--bg-color-component-hover)] disabled:cursor-not-allowed disabled:text-[var(--text-color-disabled)] ${FOCUS_VISIBLE_INTERACTIVE_CLASS}`

const zoomTriggerClass = [
  FABRIC_EDITOR_ICON_BTN_CLASS,
  'w-auto gap-1 px-2 text-xs text-[var(--text-color-primary)]',
].join(' ')

function btnClass(active: boolean) {
  return [
    FABRIC_EDITOR_ICON_BTN_CLASS,
    active ? FABRIC_EDITOR_ICON_BTN_ACTIVE_CLASS : '',
  ].join(' ')
}

export function TpFabricViewportToolbar({
  viewportTool,
  zoomPercent,
  showRulers = true,
  disabled = false,
  onViewportToolChange,
  onShowRulersChange,
  onZoomSet,
  onZoomReset,
  onZoomFit,
}: TpFabricViewportToolbarProps) {
  const [zoomMenuOpen, setZoomMenuOpen] = useState(false)

  function onPresetZoom(percent: number) {
    setZoomMenuOpen(false)
    onZoomSet?.(percent)
  }

  function onResetViewport() {
    setZoomMenuOpen(false)
    onZoomReset?.()
  }

  function onFitContent() {
    setZoomMenuOpen(false)
    onZoomFit?.()
  }

  return (
    <div
      className="pointer-events-none absolute bottom-4 left-1/2 z-[var(--z-index-sticky)] -translate-x-1/2"
      role="toolbar"
      aria-label="画布导航"
    >
      <div
        className="pointer-events-auto inline-flex items-center gap-0.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-color-container)] p-1"
      >
        <button
          type="button"
          className={btnClass(viewportTool === 'select')}
          title="选择 (V)"
          disabled={disabled}
          onClick={() => onViewportToolChange?.('select')}
        >
          <CwIcon name="draw--tool--select-line" prefix="icon" size={1} />
        </button>

        <button
          type="button"
          className={btnClass(viewportTool === 'hand')}
          title="抓手平移 (H)"
          disabled={disabled}
          onClick={() => onViewportToolChange?.('hand')}
        >
          <CwIcon name="draw--tool--hand-line" prefix="icon" size={1} />
        </button>

        <div className={dividerClass} aria-hidden="true" />

        <CwPopup
          modelValue={zoomMenuOpen}
          placement="top"
          trigger="manual"
          plugins={popupPlugins}
          closeOnClickOutside={true}
          onUpdateModelValue={setZoomMenuOpen}
          triggerSlot={
            <button
              type="button"
              className={zoomTriggerClass}
              title="缩放比例（Ctrl / Alt + 滚轮）"
              disabled={disabled}
              onClick={() => setZoomMenuOpen((open) => !open)}
            >
              <span className="min-w-[2.75rem] tabular-nums">{zoomPercent}%</span>
              <CwIcon
                name="common--dir--arrow-down-line"
                prefix="icon"
                size={0.75}
              />
            </button>
          }
        >
          <div
            role="menu"
            className="min-w-[8.5rem] rounded-md border border-[var(--border-color)] bg-[var(--bg-color-container)] shadow-lg"
          >
            {zoomPresets.map((preset) => (
              <button
                key={preset}
                type="button"
                role="menuitem"
                className={menuItemClass}
                disabled={disabled}
                onClick={() => onPresetZoom(preset)}
              >
                <span>{preset}%</span>
              </button>
            ))}
            <button
              type="button"
              role="menuitem"
              className={menuItemClass}
              disabled={disabled}
              onClick={onFitContent}
            >
              <span>适应内容</span>
            </button>
            <button
              type="button"
              role="menuitem"
              className={menuItemClass}
              disabled={disabled}
              onClick={onResetViewport}
            >
              <span>重置视图 (100%)</span>
            </button>
          </div>
        </CwPopup>

        <div className={dividerClass} aria-hidden="true" />

        <button
          type="button"
          className={btnClass(showRulers)}
          title={showRulers ? '隐藏标尺' : '显示标尺'}
          disabled={disabled}
          onClick={() => onShowRulersChange?.(!showRulers)}
        >
          <CwIcon name="draw--measure--gap-horizontal-line" prefix="icon" size={1} />
        </button>
      </div>
    </div>
  )
}

export default TpFabricViewportToolbar
