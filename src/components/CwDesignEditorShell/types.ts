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
  /** 右侧 AI 助手侧栏（与检视器互斥由父组件控制） */
  showAssistant?: boolean
  styles?: Partial<CwDesignEditorShellStyles>
}
