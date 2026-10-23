import { useEffect, useMemo, useState } from 'react'
import type { HTMLAttributes, ReactNode } from 'react'
import CwSplit from '../CwSplit/CwSplit'
import type { CwDesignEditorShellProps } from './types'
import { designEditorShellBase } from './styles'
import {
  DESIGN_EDITOR_ASSISTANT_PANEL_MAX_SIZE,
  DESIGN_EDITOR_ASSISTANT_PANEL_MIN_SIZE,
  DESIGN_EDITOR_ASSISTANT_PANEL_SIZE,
  DESIGN_EDITOR_CANVAS_MIN_SIZE,
  DESIGN_EDITOR_INSPECTOR_PANEL_MAX_SIZE,
  DESIGN_EDITOR_INSPECTOR_PANEL_MIN_SIZE,
  DESIGN_EDITOR_INSPECTOR_PANEL_SIZE,
  DESIGN_EDITOR_LEFT_PANEL_MAX_SIZE,
  DESIGN_EDITOR_LEFT_PANEL_MIN_SIZE,
  DESIGN_EDITOR_LEFT_PANEL_SIZE,
} from './panelSizeDefaults'

export interface CwDesignEditorShellComponentProps
  extends CwDesignEditorShellProps,
    Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'className'> {
  /** 等价 Vue 具名插槽 `header` */
  headerSlot?: ReactNode
  /** 等价 Vue 具名插槽 `toolRail` */
  toolRailSlot?: ReactNode
  /** 等价 Vue 具名插槽 `leftPanel` */
  leftPanelSlot?: ReactNode
  /** 等价 Vue 具名插槽 `inspector` */
  inspectorSlot?: ReactNode
  /** 等价 Vue 具名插槽 `assistant` */
  assistantSlot?: ReactNode
  /** 等价 Vue `update:leftPanelSize`（v-model:leftPanelSize） */
  onLeftPanelSizeChange?: (size: number | string) => void
  /** 等价 Vue `update:inspectorPanelSize`（v-model:inspectorPanelSize） */
  onInspectorPanelSizeChange?: (size: number | string) => void
  /** 等价 Vue `update:assistantPanelSize`（v-model:assistantPanelSize） */
  onAssistantPanelSizeChange?: (size: number | string) => void
  /** 默认插槽（画布） */
  children?: ReactNode
  className?: string
}

export function CwDesignEditorShell({
  showToolRail = true,
  showLeftPanel = true,
  showInspector = true,
  showAssistant = false,
  leftPanelSize = DESIGN_EDITOR_LEFT_PANEL_SIZE,
  leftPanelMinSize = DESIGN_EDITOR_LEFT_PANEL_MIN_SIZE,
  leftPanelMaxSize = DESIGN_EDITOR_LEFT_PANEL_MAX_SIZE,
  inspectorPanelSize = DESIGN_EDITOR_INSPECTOR_PANEL_SIZE,
  inspectorPanelMinSize = DESIGN_EDITOR_INSPECTOR_PANEL_MIN_SIZE,
  inspectorPanelMaxSize = DESIGN_EDITOR_INSPECTOR_PANEL_MAX_SIZE,
  assistantPanelSize = DESIGN_EDITOR_ASSISTANT_PANEL_SIZE,
  assistantPanelMinSize = DESIGN_EDITOR_ASSISTANT_PANEL_MIN_SIZE,
  assistantPanelMaxSize = DESIGN_EDITOR_ASSISTANT_PANEL_MAX_SIZE,
  canvasMinSize = DESIGN_EDITOR_CANVAS_MIN_SIZE,
  headerSlot,
  toolRailSlot,
  leftPanelSlot,
  inspectorSlot,
  assistantSlot,
  onLeftPanelSizeChange,
  onInspectorPanelSizeChange,
  onAssistantPanelSizeChange,
  children,
  className,
}: CwDesignEditorShellComponentProps) {
  const assistantAriaLabel = 'AI 助手'

  // defineModel 默认值 → 内部态 + prop 同步（与 CwSplit 同一模式）
  const [currentLeftPanelSize, setCurrentLeftPanelSize] =
    useState<number | string>(leftPanelSize)
  const [currentInspectorPanelSize, setCurrentInspectorPanelSize] =
    useState<number | string>(inspectorPanelSize)
  const [currentAssistantPanelSize, setCurrentAssistantPanelSize] =
    useState<number | string>(assistantPanelSize)

  useEffect(() => {
    setCurrentLeftPanelSize(leftPanelSize)
  }, [leftPanelSize])
  useEffect(() => {
    setCurrentInspectorPanelSize(inspectorPanelSize)
  }, [inspectorPanelSize])
  useEffect(() => {
    setCurrentAssistantPanelSize(assistantPanelSize)
  }, [assistantPanelSize])

  const showRightPanel = showInspector || showAssistant

  const rightPanelSize = showInspector
    ? currentInspectorPanelSize
    : currentAssistantPanelSize

  function onRightPanelSizeChange(v: number | string) {
    if (showInspector) {
      setCurrentInspectorPanelSize(v)
      onInspectorPanelSizeChange?.(v)
    } else {
      setCurrentAssistantPanelSize(v)
      onAssistantPanelSizeChange?.(v)
    }
  }

  function onLeftSplitSizeChange(v: number | string) {
    setCurrentLeftPanelSize(v)
    onLeftPanelSizeChange?.(v)
  }

  const activeRightMinSize = showInspector
    ? inspectorPanelMinSize
    : assistantPanelMinSize

  const activeRightMaxSize = showInspector
    ? inspectorPanelMaxSize
    : assistantPanelMaxSize

  /** Outer split second pane must fit canvas min + right panel min. */
  const rightPlusCanvasMinSize = useMemo(() => {
    const rightMin = String(activeRightMinSize ?? '0')
    const canvasMin = String(canvasMinSize ?? '0')
    const rightRem = /^([\d.]+)\s*rem$/i.exec(rightMin)
    const canvasRem = /^([\d.]+)\s*rem$/i.exec(canvasMin)
    if (rightRem && canvasRem) {
      return `${parseFloat(rightRem[1]) + parseFloat(canvasRem[1])}rem`
    }
    return canvasMinSize
  }, [activeRightMinSize, canvasMinSize])

  const rightPaneContent = showInspector ? (
    <div className={designEditorShellBase.inspector}>{inspectorSlot}</div>
  ) : (
    <aside
      className={designEditorShellBase.assistant}
      aria-label={assistantAriaLabel}
    >
      {assistantSlot}
    </aside>
  )

  const canvasMain = (
    <main className={designEditorShellBase.canvas}>{children}</main>
  )

  const leftPaneContent = (
    <div className={designEditorShellBase.leftPanel}>{leftPanelSlot}</div>
  )

  return (
    <div
      className={[designEditorShellBase.root, className]
        .filter(Boolean)
        .join(' ')}
    >
      {headerSlot != null && (
        <div className={designEditorShellBase.header}>{headerSlot}</div>
      )}
      {showToolRail && (
        <div className={designEditorShellBase.toolRail}>{toolRailSlot}</div>
      )}
      <div className={designEditorShellBase.body}>
        {showLeftPanel && showRightPanel ? (
          /* left + right */
          <CwSplit
            firstSize={currentLeftPanelSize}
            direction="horizontal"
            firstMinSize={leftPanelMinSize}
            firstMaxSize={leftPanelMaxSize}
            secondMinSize={rightPlusCanvasMinSize}
            className="min-h-0 min-w-0 flex-1"
            dividerHitPx={5}
            onFirstSizeChange={onLeftSplitSizeChange}
            firstSlot={leftPaneContent}
            secondSlot={
              <CwSplit
                firstSize={rightPanelSize}
                direction="horizontal"
                className="min-h-0 min-w-0 flex-1 flex-row-reverse"
                firstMinSize={activeRightMinSize}
                firstMaxSize={activeRightMaxSize}
                secondMinSize={canvasMinSize}
                dividerHitPx={5}
                onFirstSizeChange={onRightPanelSizeChange}
                firstSlot={rightPaneContent}
                secondSlot={canvasMain}
              />
            }
          />
        ) : showLeftPanel ? (
          /* left only */
          <CwSplit
            firstSize={currentLeftPanelSize}
            direction="horizontal"
            firstMinSize={leftPanelMinSize}
            firstMaxSize={leftPanelMaxSize}
            secondMinSize={canvasMinSize}
            className="min-h-0 min-w-0 flex-1"
            dividerHitPx={5}
            onFirstSizeChange={onLeftSplitSizeChange}
            firstSlot={leftPaneContent}
            secondSlot={canvasMain}
          />
        ) : showRightPanel ? (
          /* right only */
          <CwSplit
            firstSize={rightPanelSize}
            direction="horizontal"
            className="min-h-0 min-w-0 flex-1 flex-row-reverse"
            firstMinSize={activeRightMinSize}
            firstMaxSize={activeRightMaxSize}
            secondMinSize={canvasMinSize}
            dividerHitPx={5}
            onFirstSizeChange={onRightPanelSizeChange}
            firstSlot={rightPaneContent}
            secondSlot={canvasMain}
          />
        ) : (
          /* canvas only */
          canvasMain
        )}
      </div>
    </div>
  )
}

export default CwDesignEditorShell
