import type { ReactNode } from 'react'

/** React 端占位：设计编辑器当前仅在 Vue/Web 端提供。 */
export interface CwDesignEditorProps {
  children?: ReactNode
  className?: string
}

export interface CwDesignEditorEmits {
  onReady?: (editor: unknown) => void
  onError?: (error: Error) => void
}

export type CwDesignEditorShapeTool = 'rect' | 'ellipse' | 'triangle'

export type CwDesignEditorTool =
  | 'select'
  | 'pan'
  | 'pen'
  | 'text'
  | 'rect'
  | 'ellipse'
  | 'line'
  | 'arrow'
  | 'polygon'
  | 'star'
  | 'triangle'

export type CwDesignEditorImportMode = 'replace' | 'append'

export interface CwDesignEditorExpose {
  getSvgString: () => string
  getSelectionSvgString: () => string
  loadSvgString: (raw: string, options?: Record<string, unknown>) => Promise<void>
  loadImageFile: (file: File, options?: Record<string, unknown>) => Promise<void>
  clearCanvas: () => void
  openImportPicker: (mode: CwDesignEditorImportMode) => void
  exportSvgToFile: () => void
  exportSelectedSvgToFile: () => void
  groupSelection: () => void
  frameSelection: () => void
  ungroupSelection: () => void
  addRectangle: () => void
  addCircle: () => void
  addTriangle: () => void
  addLine: () => void
  addText: () => void
  deleteSelection: () => void
  setTool: (tool: CwDesignEditorTool) => void
  undo: () => void
  redo: () => void
  getObjectCount: () => number
  getSelectionCount: () => number
  onDirty: (listener: () => void) => () => void
  getZoom: () => number
  getDocument: () => unknown
}

export type CwDesignEditorAiStreamPhase = 'plan' | 'execute' | 'oneshot'

export interface CwDesignEditorAiStreamHistoryItem {
  role: 'user' | 'assistant'
  content: string
}

export interface CwDesignEditorAiStreamParams {
  prompt: string
  selectionContext: string
  mode?: 'create' | 'edit'
  phase?: CwDesignEditorAiStreamPhase
  history?: CwDesignEditorAiStreamHistoryItem[]
  onDelta: (text: string) => void
  signal?: AbortSignal
}

export type CwDesignEditorAiStreamResult = { ok: true } | { ok: false; error: string }

export interface CwDesignEditorAiOptions {
  enabled: boolean
  agentDisplayName?: string
  stream: (params: CwDesignEditorAiStreamParams) => Promise<CwDesignEditorAiStreamResult>
}
