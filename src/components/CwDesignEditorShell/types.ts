export interface CwDesignEditorShellStyles {
  root: string
  header: string
  toolRail: string
  body: string
  leftPanel: string
  canvas: string
  inspector: string
  assistant: string
}

export interface CwDesignEditorShellProps {
  showToolRail?: boolean
  showLeftPanel?: boolean
  showInspector?: boolean
  /** Right AI assistant rail (mutually exclusive with inspector; controlled by parent) */
  showAssistant?: boolean
  /** Left panel width (rem/px), resizable */
  leftPanelSize?: number | string
  leftPanelMinSize?: number | string
  leftPanelMaxSize?: number | string
  /** Inspector width (rem/px), resizable */
  inspectorPanelSize?: number | string
  inspectorPanelMinSize?: number | string
  inspectorPanelMaxSize?: number | string
  /** AI assistant width (rem/px), resizable */
  assistantPanelSize?: number | string
  assistantPanelMinSize?: number | string
  assistantPanelMaxSize?: number | string
  /** Canvas min width; side-panel drag will not shrink below this */
  canvasMinSize?: number | string
}
