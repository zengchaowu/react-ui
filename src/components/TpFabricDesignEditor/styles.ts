/** Tp 编辑器根容器样式（顶栏工具 + 左图层 | 画布 | 右检查器） */
export const defaultTpFabricDesignEditorRootClass =
  'relative flex h-full min-h-0 w-full flex-col overflow-hidden bg-[var(--bg-color-page)]'

/** 透明底画布后的棋盘格舞台（类名 `tp-fabric-editor-stage`） */
export const tpFabricEditorStageClass =
  'tp-fabric-editor-stage min-h-0 h-full w-full [&_.canvas-container]:box-border [&_.canvas-container]:h-full [&_.canvas-container]:max-h-full [&_.canvas-container]:w-full [&_.canvas-container]:max-w-full [&_.canvas-container]:bg-transparent [&_.canvas-container_canvas]:bg-transparent'
