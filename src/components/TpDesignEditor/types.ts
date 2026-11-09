import type { ReactNode } from 'react'

/** React 端占位：设计编辑器当前仅在 Vue/Web 端提供。 */
export interface TpDesignEditorProps {
  children?: ReactNode
  className?: string
}

export interface TpDesignEditorEmits {
  onReady?: (editor: unknown) => void
  onError?: (error: Error) => void
}
