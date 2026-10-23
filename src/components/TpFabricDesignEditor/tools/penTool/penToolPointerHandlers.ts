import type { Canvas, FabricObject, TPointerEvent } from 'fabric'
import {
  buildPreviewNodes,
  clonePenNodes,
  collectPenAnchorIndicesInRect,
  hitTestPenNodes,
  mirrorHandle,
} from './penPathData.pure'
import {
  PEN_DRAG_HANDLE_THRESHOLD_SQ,
  type PenToolMutableState,
} from './penToolSessionTypes'
import { updateEditSessionNodes } from './penToolSessionOps'

const MARQUEE_CLICK_THRESHOLD_SQ = 4

type SessionOps = {
  commitDrawPath: (closed: boolean) => void
  commitEditPath: () => void
  startDrawSession: (point: { x: number; y: number }) => void
  appendCornerNode: (point: { x: number; y: number }) => void
  appendSmoothNode: (
    anchor: { x: number; y: number },
    handleOut: { x: number; y: number },
  ) => void
  tryStartPenEdit: (
    target: FabricObject | undefined,
    scenePoint: { x: number; y: number },
  ) => boolean
  syncEditPathPreview: () => void
  hasPathEditSession: () => boolean
}

export function createPenToolPointerHandlers(options: {
  canvas: Canvas
  state: PenToolMutableState
  ops: SessionOps
  getReadonly: () => boolean
  isPenDrawActive: () => boolean
  getViewportTool?: () => 'select' | 'hand'
  overlay: { requestRender: () => void }
}) {
  const {
    canvas,
    state,
    ops,
    getReadonly,
    isPenDrawActive,
    getViewportTool,
    overlay,
  } = options

  function handleEditMouseDown(point: { x: number; y: number }, zoom: number) {
    if (state.session?.mode !== 'edit') return false

    const hit = hitTestPenNodes(
      state.session.nodes,
      state.session.closed,
      point,
      zoom,
    )
    if (hit) {
      if (hit.kind === 'close') {
        state.session.closed = true
        ops.commitEditPath()
        return true
      }

      const selected = state.session.selectedNodeIndices
      if (hit.kind === 'anchor' && selected.includes(hit.index)) {
        state.drag = {
          kind: 'edit',
          hit,
          startPoint: point,
          snapshot: clonePenNodes(state.session.nodes),
          moveIndices: [...selected],
        }
      } else if (hit.kind === 'anchor') {
        state.session.selectedNodeIndices = [hit.index]
        state.drag = {
          kind: 'edit',
          hit,
          startPoint: point,
          snapshot: clonePenNodes(state.session.nodes),
          moveIndices: [hit.index],
        }
      } else {
        state.session.selectedNodeIndices = [hit.index]
        state.drag = {
          kind: 'edit',
          hit,
          startPoint: point,
          snapshot: clonePenNodes(state.session.nodes),
          moveIndices: [hit.index],
        }
      }
      overlay.requestRender()
      return true
    }

    // 空白处按下：开始框选控制点
    state.session.selectedNodeIndices = []
    state.drag = {
      kind: 'marquee',
      startPoint: point,
      currentPoint: point,
    }
    overlay.requestRender()
    return true
  }

  function onMouseDown(opt: { e: TPointerEvent; target?: FabricObject }) {
    if (getReadonly()) return
    const e = opt.e
    if ('button' in e && e.button !== 0) return

    // 路径编辑下切换抓手时，交给视口平移，不拦截节点编辑
    if (ops.hasPathEditSession() && !isPenDrawActive() && getViewportTool?.() === 'hand') {
      return
    }

    const point = canvas.getScenePoint(e)
    const zoom = canvas.getZoom()

    if (ops.hasPathEditSession()) {
      canvas.discardActiveObject()
      if (handleEditMouseDown(point, zoom)) {
        if (e.cancelable) e.preventDefault()
        e.stopPropagation?.()
      }
      return
    }

    if (!isPenDrawActive()) return

    if (state.session?.mode === 'draw') {
      const hit = hitTestPenNodes(state.session.nodes, false, point, zoom)
      if (hit?.kind === 'close') {
        ops.commitDrawPath(true)
        return
      }
      state.drag = {
        kind: 'draw-handle',
        start: point,
        cursor: point,
      }
      return
    }

    if (ops.tryStartPenEdit(opt.target, point)) return
    ops.startDrawSession(point)
  }

  function onMouseMove(opt: { e: TPointerEvent }) {
    if (getReadonly()) return
    const point = canvas.getScenePoint(opt.e)
    const canEdit = ops.hasPathEditSession()
    if (!canEdit && !isPenDrawActive()) return

    if (state.drag?.kind === 'draw-handle' && state.session?.mode === 'draw') {
      state.drag.cursor = point
      const dx = point.x - state.drag.start.x
      const dy = point.y - state.drag.start.y
      const handle =
        dx * dx + dy * dy >= PEN_DRAG_HANDLE_THRESHOLD_SQ
          ? { x: dx, y: dy }
          : null
      state.previewNodes = buildPreviewNodes(
        state.session.nodes,
        point,
        handle,
        state.drag.start,
      )
      overlay.requestRender()
      return
    }

    if (state.drag?.kind === 'marquee' && state.session?.mode === 'edit') {
      state.drag.currentPoint = point
      overlay.requestRender()
      return
    }

    if (state.drag?.kind === 'edit' && state.session?.mode === 'edit') {
      const dx = point.x - state.drag.startPoint.x
      const dy = point.y - state.drag.startPoint.y
      const nodes = clonePenNodes(state.drag.snapshot)
      const hit = state.drag.hit

      if (hit.kind === 'anchor') {
        for (const index of state.drag.moveIndices) {
          const node = nodes[index]
          if (!node) continue
          node.x += dx
          node.y += dy
        }
      } else {
        const node = nodes[hit.index]
        if (!node) return
        if (hit.kind === 'handleOut') {
          node.handleOut = {
            x: (state.drag.snapshot[hit.index]?.handleOut?.x ?? 0) + dx,
            y: (state.drag.snapshot[hit.index]?.handleOut?.y ?? 0) + dy,
          }
          if (node.handleOut) node.handleIn = mirrorHandle(node.handleOut)
        } else if (hit.kind === 'handleIn') {
          node.handleIn = {
            x: (state.drag.snapshot[hit.index]?.handleIn?.x ?? 0) + dx,
            y: (state.drag.snapshot[hit.index]?.handleIn?.y ?? 0) + dy,
          }
          if (node.handleIn) node.handleOut = mirrorHandle(node.handleIn)
        }
      }

      updateEditSessionNodes(state.session, nodes)
      ops.syncEditPathPreview()
      return
    }

    if (state.session?.mode === 'draw' && state.session.nodes.length > 0 && !state.drag) {
      state.previewNodes = buildPreviewNodes(state.session.nodes, point, null)
      overlay.requestRender()
    }
  }

  function onMouseUp(opt: { e: TPointerEvent }) {
    if (getReadonly()) return
    const point = canvas.getScenePoint(opt.e)
    const canEdit = ops.hasPathEditSession()
    if (!canEdit && !isPenDrawActive()) return

    if (state.drag?.kind === 'draw-handle' && state.session?.mode === 'draw') {
      const start = state.drag.start
      const dx = point.x - start.x
      const dy = point.y - start.y
      // 锚点落在按下位置：单击直角点，拖拽则在该点拉出对称手柄
      if (dx * dx + dy * dy >= PEN_DRAG_HANDLE_THRESHOLD_SQ) {
        ops.appendSmoothNode(start, { x: dx, y: dy })
      } else {
        ops.appendCornerNode(start)
      }
      state.drag = null
      state.previewNodes = buildPreviewNodes(state.session.nodes, point, null)
      overlay.requestRender()
      return
    }

    if (state.drag?.kind === 'marquee' && state.session?.mode === 'edit') {
      const start = state.drag.startPoint
      const end = point
      const dx = end.x - start.x
      const dy = end.y - start.y
      if (dx * dx + dy * dy < MARQUEE_CLICK_THRESHOLD_SQ) {
        state.session.selectedNodeIndices = []
      } else {
        state.session.selectedNodeIndices = collectPenAnchorIndicesInRect(
          state.session.nodes,
          {
            left: start.x,
            top: start.y,
            right: end.x,
            bottom: end.y,
          },
        )
      }
      state.drag = null
      overlay.requestRender()
      return
    }

    if (state.drag?.kind === 'edit') {
      state.drag = null
      overlay.requestRender()
    }
  }

  function onDblClick() {
    if (!isPenDrawActive()) return
    if (state.session?.mode === 'draw') {
      ops.commitDrawPath(false)
    }
  }

  return { onMouseDown, onMouseMove, onMouseUp, onDblClick }
}
