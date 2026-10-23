import type { Canvas, FabricObject } from 'fabric'
import { createPenToolCanvasLock } from './penToolCanvasLock'
import {
  createPenToolChangeHandler,
  createPenToolKeyboardHandlers,
} from './penToolKeyboardHandlers'
import { createPenToolOverlay } from './penToolOverlay'
import { createPenToolPointerHandlers } from './penToolPointerHandlers'
import { createPenToolSessionOps } from './penToolSessionOps'
import type {
  FabricPenToolController,
  PenToolMutableState,
} from './penToolSessionTypes'
import type { PenToolDefaults } from './types'

export function attachFabricPenTool(options: {
  canvas: Canvas
  getReadonly: () => boolean
  getCurrentTool: () => string
  getViewportTool?: () => 'select' | 'hand'
  getDefaults: () => PenToolDefaults
  onPathCommitted: (path: import('fabric').Path, replaced?: import('fabric').Path) => void
  applyObjectControlStyle: (obj: FabricObject) => void
  onPathEditSessionChange?: (active: boolean) => void
  setTool: (tool: 'select') => void
}): () => void {
  const {
    canvas,
    getReadonly,
    getCurrentTool,
    getViewportTool,
    getDefaults,
    onPathCommitted,
    applyObjectControlStyle,
    onPathEditSessionChange,
    setTool,
  } = options

  const state: PenToolMutableState = {
    session: null,
    drag: null,
    previewNodes: null,
  }

  const canvasLock = createPenToolCanvasLock(
    canvas,
    getCurrentTool,
    onPathEditSessionChange,
  )
  const overlay = createPenToolOverlay(canvas, () => state)

  const ops = createPenToolSessionOps({
    canvas,
    state,
    getDefaults,
    applyObjectControlStyle,
    onPathCommitted,
    canvasLock,
    overlay,
    getCurrentTool,
    setTool,
  })

  function isPenDrawActive(): boolean {
    return (
      getCurrentTool() === 'pen' &&
      !getReadonly() &&
      getViewportTool?.() !== 'hand'
    )
  }

  const pointer = createPenToolPointerHandlers({
    canvas,
    state,
    ops,
    getReadonly,
    isPenDrawActive,
    getViewportTool,
    overlay,
  })

  const keyboard = createPenToolKeyboardHandlers({
    state,
    ops,
    getReadonly,
    isPenDrawActive,
  })

  const { onToolChange } = createPenToolChangeHandler({
    canvas,
    state,
    ops,
    getCurrentTool,
    isPenDrawActive,
    overlay,
  })

  function enterPathEdit(
    target: FabricObject | undefined,
    scenePoint: { x: number; y: number },
  ): boolean {
    return ops.enterPathEdit(target, scenePoint, getReadonly)
  }

  canvas.on('mouse:down', pointer.onMouseDown)
  canvas.on('mouse:move', pointer.onMouseMove)
  canvas.on('mouse:up', pointer.onMouseUp)
  canvas.on('mouse:dblclick', pointer.onDblClick)
  window.addEventListener('keydown', keyboard.onKeyDown, { capture: true })

  penToolControllers.set(canvas, {
    onToolChange,
    enterPathEdit,
    commitPathEdit: ops.commitEditPath,
    cancelPathEdit: ops.cancelEditPath,
    hasPathEditSession: ops.hasPathEditSession,
  })

  return () => {
    penToolControllers.delete(canvas)
    canvas.off('mouse:down', pointer.onMouseDown)
    canvas.off('mouse:move', pointer.onMouseMove)
    canvas.off('mouse:up', pointer.onMouseUp)
    canvas.off('mouse:dblclick', pointer.onDblClick)
    window.removeEventListener('keydown', keyboard.onKeyDown, { capture: true })
    if (state.session?.mode === 'edit') {
      ops.commitEditPath()
    }
    ops.clearSession()
    overlay.unbind()
  }
}

const penToolControllers = new WeakMap<Canvas, FabricPenToolController>()

export function notifyFabricPenToolChange(canvas: Canvas | undefined): void {
  if (!canvas) return
  penToolControllers.get(canvas)?.onToolChange()
}

export function enterFabricPathEdit(
  canvas: Canvas | undefined,
  target: FabricObject | undefined,
  scenePoint: { x: number; y: number },
): boolean {
  if (!canvas) return false
  return penToolControllers.get(canvas)?.enterPathEdit(target, scenePoint) ?? false
}

export function hasFabricPathEditSession(canvas: Canvas | undefined): boolean {
  if (!canvas) return false
  return penToolControllers.get(canvas)?.hasPathEditSession() ?? false
}

export function commitFabricPathEdit(canvas: Canvas | undefined): void {
  if (!canvas) return
  penToolControllers.get(canvas)?.commitPathEdit()
}

export function cancelFabricPathEdit(canvas: Canvas | undefined): void {
  if (!canvas) return
  penToolControllers.get(canvas)?.cancelPathEdit()
}

export type { FabricPenToolController } from './penToolSessionTypes'
