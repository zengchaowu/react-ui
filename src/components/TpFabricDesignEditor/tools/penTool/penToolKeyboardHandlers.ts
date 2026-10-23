import { removePenNodes } from './penPathData.pure'
import type { PenToolMutableState } from './penToolSessionTypes'

type SessionOps = {
  commitDrawPath: (closed: boolean) => void
  commitEditPath: () => void
  cancelEditPath: () => void
  clearSession: () => void
  syncEditPathPreview: () => void
  hasPathEditSession: () => boolean
}

export function createPenToolKeyboardHandlers(options: {
  state: PenToolMutableState
  ops: SessionOps
  getReadonly: () => boolean
  isPenDrawActive: () => boolean
}) {
  const { state, ops, getReadonly, isPenDrawActive } = options

  function onKeyDown(e: KeyboardEvent) {
    const canHandle =
      !getReadonly() && (isPenDrawActive() || ops.hasPathEditSession())
    if (!canHandle) return

    if (e.key === 'Escape') {
      e.preventDefault()
      e.stopPropagation()
      if (state.session?.mode === 'draw' && state.session.nodes.length >= 2) {
        ops.commitDrawPath(false)
        return
      }
      if (state.session?.mode === 'edit') {
        ops.cancelEditPath()
        return
      }
      ops.clearSession()
      return
    }

    if (e.key === 'Enter') {
      if (state.session?.mode === 'edit') {
        e.preventDefault()
        e.stopPropagation()
        ops.commitEditPath()
        return
      }
      if (state.session?.mode === 'draw' && state.session.nodes.length >= 2) {
        e.preventDefault()
        e.stopPropagation()
        ops.commitDrawPath(false)
      }
      return
    }

    if (
      (e.key === 'Delete' || e.key === 'Backspace') &&
      state.session?.mode === 'edit' &&
      state.session.selectedNodeIndices.length > 0
    ) {
      e.preventDefault()
      e.stopPropagation()
      const result = removePenNodes(
        state.session.nodes,
        state.session.selectedNodeIndices,
        state.session.closed,
      )
      state.session.nodes = result.nodes
      state.session.closed = result.closed
      state.session.selectedNodeIndices = []
      if (state.session.nodes.length < 2) {
        ops.commitEditPath()
      } else {
        ops.syncEditPathPreview()
      }
    }
  }

  return { onKeyDown }
}

export function createPenToolChangeHandler(options: {
  canvas: import('fabric').Canvas
  state: PenToolMutableState
  ops: SessionOps
  getCurrentTool: () => string
  isPenDrawActive: () => boolean
  overlay: { bind: () => void }
}) {
  const { canvas, state, ops, getCurrentTool, isPenDrawActive, overlay } = options

  function onToolChange() {
    if (isPenDrawActive()) {
      canvas.selection = false
      overlay.bind()
      return
    }

    if (!state.session) return

    if (state.session.mode === 'draw' && state.session.nodes.length >= 2) {
      ops.commitDrawPath(false)
      return
    }

    if (state.session.mode === 'edit' && getCurrentTool() === 'select') {
      return
    }

    if (state.session.mode === 'edit') {
      ops.commitEditPath()
      return
    }

    ops.clearSession()
  }

  return { onToolChange }
}
