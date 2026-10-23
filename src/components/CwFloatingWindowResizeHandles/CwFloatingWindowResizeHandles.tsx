import {
  FLOATING_WINDOW_RESIZE_EDGES,
  type FloatingWindowResizeEdge,
} from '@zengchaowu/shared/functions/ui/floatingWindowGeometry'
import './cw-floating-window-resize-handles.css'
import type { CwFloatingWindowResizeHandlesProps } from './types'

export function CwFloatingWindowResizeHandles({
  visible = true,
  onResizePointerdown,
}: CwFloatingWindowResizeHandlesProps) {
  if (!visible) return null

  return (
    <>
      {FLOATING_WINDOW_RESIZE_EDGES.map((edge: FloatingWindowResizeEdge) => (
        <div
          key={edge}
          className="cw-floating-window-resize-handle"
          data-edge={edge}
          aria-hidden="true"
          onPointerDown={(event) => onResizePointerdown?.(edge, event.nativeEvent)}
        />
      ))}
    </>
  )
}

export default CwFloatingWindowResizeHandles
