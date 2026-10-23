import type { FloatingWindowResizeEdge } from '@zengchaowu/shared/functions/ui/floatingWindowGeometry'

export interface CwFloatingWindowResizeHandlesProps {
  /** Hide when maximized */
  visible?: boolean
  /** 手柄按下（由外层开始拖拽 resize） */
  onResizePointerdown?: (edge: FloatingWindowResizeEdge, event: PointerEvent) => void
}
