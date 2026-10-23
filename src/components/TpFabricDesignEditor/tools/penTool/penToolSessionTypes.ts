import type { Path } from 'fabric'
import type { PenEditHit, PenNode } from './types'
import type { FabricPathEditGeometrySnapshot } from './penPathData.pure'

export type PenSession =
  | { mode: 'draw'; nodes: PenNode[]; closed: false }
  | {
      mode: 'edit'
      sourcePath: Path
      nodes: PenNode[]
      closed: boolean
      /** 当前选中的锚点下标（支持框选多选） */
      selectedNodeIndices: number[]
      originalGeometry: FabricPathEditGeometrySnapshot
      /** 编辑前所属编组；完成/取消后放回，避免分组被拆掉 */
      parentRef: { group: import('fabric').Group; index: number } | null
    }

export type PenDragState =
  | {
      kind: 'draw-handle'
      start: { x: number; y: number }
      cursor: { x: number; y: number }
    }
  | {
      kind: 'edit'
      hit: PenEditHit
      startPoint: { x: number; y: number }
      snapshot: PenNode[]
      /** 一并拖动的锚点（含当前 hit 锚点） */
      moveIndices: number[]
    }
  | {
      kind: 'marquee'
      startPoint: { x: number; y: number }
      currentPoint: { x: number; y: number }
    }

export type PenToolInteractionSnapshot = {
  selectable: boolean
  evented: boolean
  hasControls: boolean
  hasBorders: boolean
  hoverCursor: string | undefined
  lockMovementX: boolean
  lockMovementY: boolean
}

export type FabricPenToolController = {
  onToolChange: () => void
  enterPathEdit: (
    target: import('fabric').FabricObject | undefined,
    scenePoint: { x: number; y: number },
  ) => boolean
  commitPathEdit: () => void
  cancelPathEdit: () => void
  hasPathEditSession: () => boolean
}

export type PenToolMutableState = {
  session: PenSession | null
  drag: PenDragState | null
  previewNodes: PenNode[] | null
}

export const PEN_DRAG_HANDLE_THRESHOLD_SQ = 9
