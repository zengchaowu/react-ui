import { Group, Path, Point, util, type Canvas, type FabricObject, type TMat2D } from 'fabric'
import {
  applySceneNodesToPathInPlace,
  clonePenNodes,
  createPathFromSceneNodesWithCtor,
  mirrorHandle,
  pathObjectToSceneNodes,
  restoreFabricPathEditGeometry,
  snapshotFabricPathEditGeometry,
} from './penPathData.pure'
import { preparePenEditPath } from './resolvePenEditTarget.pure'
import type { PenNode, PenToolDefaults } from './types'
import {
  applyPaintLayersToObject,
  readFillLayers,
  readStrokeAlign,
  readStrokeLayers,
  removePaintClonesForObject,
} from '../../appearance/fabricEditorPaintLayers.pure'
import { assignDefaultFabricLayerName } from '../../layers/fabricLayerNaming.pure'
import { syncGroupsInteractionFromCanvasSelection } from '../../layers/fabricGroupPointerPolicy.pure'
import {
  resumeFabricLayerRefresh,
  suspendFabricLayerRefresh,
} from '../../layers/fabricLayerRefreshGate.pure'
import type { PenSession, PenToolMutableState } from './penToolSessionTypes'

type PathEditParentRef = {
  group: Group
  index: number
}

function transformPenNodesByMatrix(
  nodes: PenNode[],
  matrix: TMat2D,
): PenNode[] {
  return nodes.map((node) => {
    const anchor = util.transformPoint(new Point(node.x, node.y), matrix)
    const next: PenNode = { x: anchor.x, y: anchor.y }
    if (node.handleIn) {
      const tip = util.transformPoint(
        new Point(node.x + node.handleIn.x, node.y + node.handleIn.y),
        matrix,
      )
      next.handleIn = { x: tip.x - anchor.x, y: tip.y - anchor.y }
    }
    if (node.handleOut) {
      const tip = util.transformPoint(
        new Point(node.x + node.handleOut.x, node.y + node.handleOut.y),
        matrix,
      )
      next.handleOut = { x: tip.x - anchor.x, y: tip.y - anchor.y }
    }
    return next
  })
}

export function createPenToolSessionOps(options: {
  canvas: Canvas
  state: PenToolMutableState
  getDefaults: () => PenToolDefaults
  applyObjectControlStyle: (obj: FabricObject) => void
  onPathCommitted: (path: Path, replaced?: Path) => void
  canvasLock: { suspend: () => void; restore: () => void }
  overlay: { bind: () => void; unbind: () => void; requestRender: () => void }
  getCurrentTool: () => string
  setTool: (tool: 'select') => void
}) {
  const {
    canvas,
    state,
    getDefaults,
    applyObjectControlStyle,
    onPathCommitted,
    canvasLock,
    overlay,
    getCurrentTool,
    setTool,
  } = options

  function clearSession() {
    state.session = null
    state.drag = null
    state.previewNodes = null
    canvas.clearContext(canvas.contextTop)
    canvasLock.restore()
    overlay.requestRender()
    if (!state.session) overlay.unbind()
    resumeFabricLayerRefresh(canvas)
  }

  function reapplyPaintClonesForPath(path: Path): void {
    const fills = readFillLayers(path)
    const strokes = readStrokeLayers(path)
    const strokeWidth =
      typeof path.strokeWidth === 'number' && Number.isFinite(path.strokeWidth)
        ? path.strokeWidth
        : 1
    void applyPaintLayersToObject(
      canvas,
      path,
      fills,
      strokes,
      strokeWidth,
      readStrokeAlign(path),
    )
  }

  function commitDrawPath(closed: boolean) {
    if (!state.session || state.session.mode !== 'draw') return
    const nodes = state.session.nodes
    if (nodes.length < 2) {
      clearSession()
      return
    }
    const path = createPathFromSceneNodesWithCtor(Path, nodes, closed, getDefaults())
    canvas.add(path)
    assignDefaultFabricLayerName(canvas, path)
    canvas.setActiveObject(path)
    applyObjectControlStyle(path)
    onPathCommitted(path)
    clearSession()
    // 仍停留在钢笔工具时（回车/双击/闭合）完成后回到选择；切工具触发的提交则保留目标工具
    if (getCurrentTool() === 'pen') {
      setTool('select')
    }
  }

  function syncEditPathPreview() {
    if (state.session?.mode !== 'edit') return
    applySceneNodesToPathInPlace(
      state.session.sourcePath,
      state.session.nodes,
      state.session.closed,
    )
    canvas.requestRenderAll()
  }

  function commitEditPath() {
    if (!state.session || state.session.mode !== 'edit') return
    const { sourcePath, nodes, closed, parentRef } = state.session
    if (nodes.length < 2) {
      canvas.remove(sourcePath)
      if (parentRef && parentRef.group.getObjects().length === 0) {
        const host = parentRef.group.canvas ?? canvas
        if (host.getObjects().includes(parentRef.group)) {
          host.remove(parentRef.group)
        }
      }
      clearSession()
      canvas.discardActiveObject()
      canvas.requestRenderAll()
      return
    }
    applySceneNodesToPathInPlace(sourcePath, nodes, closed)
    reinsertPathIntoGroup(sourcePath, parentRef)
    clearSession()
    sourcePath.setCoords()
    canvas.setActiveObject(sourcePath)
    applyObjectControlStyle(sourcePath)
    syncGroupsInteractionFromCanvasSelection(canvas)
    onPathCommitted(sourcePath)
    reapplyPaintClonesForPath(sourcePath)
    canvas.requestRenderAll()
  }

  function cancelEditPath() {
    if (state.session?.mode !== 'edit') {
      clearSession()
      return
    }
    const { sourcePath, originalGeometry, parentRef } = state.session
    restoreFabricPathEditGeometry(sourcePath, originalGeometry)
    reinsertPathIntoGroup(sourcePath, parentRef)
    clearSession()
    reapplyPaintClonesForPath(sourcePath)
    syncGroupsInteractionFromCanvasSelection(canvas)
    canvas.requestRenderAll()
  }

  function startDrawSession(point: { x: number; y: number }) {
    canvas.discardActiveObject()
    state.session = {
      mode: 'draw',
      nodes: [{ x: point.x, y: point.y }],
      closed: false,
    }
    state.previewNodes = null
    overlay.bind()
    overlay.requestRender()
  }

  function startEditSession(path: Path) {
    // 必须先在「含 Group 变换」下取场景节点，再临时脱离编组并烘焙；
    // 否则子 Path 的 left/top 仍是组内坐标，形状会飞走，只剩 overlay 控制点。
    const parsed = pathObjectToSceneNodes(path)
    if (parsed.nodes.length === 0) return

    // 脱离编组会触发 object:removed/added；暂停图层刷新，编辑态不改动左侧树
    suspendFabricLayerRefresh(canvas)
    removePaintClonesForObject(canvas, path)
    canvas.discardActiveObject()

    const parentRef = detachPathFromGroupOntoCanvas(path)
    applySceneNodesToPathInPlace(path, parsed.nodes, parsed.closed)

    const originalGeometry = snapshotFabricPathEditGeometry(path)
    // 先挂上 session，再 suspend；否则 onToolChange 会误 clear 并关掉路径工具栏
    state.session = {
      mode: 'edit',
      sourcePath: path,
      nodes: clonePenNodes(parsed.nodes),
      closed: parsed.closed,
      selectedNodeIndices: [],
      originalGeometry,
      parentRef,
    }
    state.previewNodes = null
    canvasLock.suspend()
    overlay.bind()
    overlay.requestRender()
  }

  /**
   * 编辑前把 Path 临时提到画布根级；保留空编组，完成后再放回。
   * 同时打开可选中，避免编组 closed 策略残留 evented/selectable=false。
   */
  function detachPathFromGroupOntoCanvas(target: Path): PathEditParentRef | null {
    const parent = target.group
    if (!(parent instanceof Group)) {
      target.set({
        selectable: true,
        evented: true,
        hasControls: true,
        hasBorders: true,
      })
      return null
    }
    const index = parent.getObjects().indexOf(target)
    parent.remove(target)
    if (!canvas.getObjects().includes(target)) {
      canvas.add(target)
    }
    target.set({
      selectable: true,
      evented: true,
      hasControls: true,
      hasBorders: true,
    })
    return { group: parent, index: Math.max(0, index) }
  }

  /** 把场景坐标烘焙后的 Path 放回原编组（坐标转换到组局部） */
  function reinsertPathIntoGroup(
    target: Path,
    parentRef: PathEditParentRef | null,
  ): void {
    if (!parentRef) return
    const { group, index } = parentRef
    const stillOnCanvas =
      canvas.getObjects().includes(group) || Boolean(group.group)
    if (!stillOnCanvas && group.getObjects().length === 0) {
      // 编组已不在画布上且为空：放弃回插，Path 留在根级
      return
    }

    const { nodes, closed } = pathObjectToSceneNodes(target)
    if (nodes.length === 0) return

    if (canvas.getObjects().includes(target)) {
      canvas.remove(target)
    }

    const localNodes = transformPenNodesByMatrix(
      nodes,
      util.invertTransform(group.calcTransformMatrix()),
    )
    const insertAt = Math.min(index, group.size())
    group.insertAt(insertAt, target)
    applySceneNodesToPathInPlace(target, localNodes, closed)
    target.setCoords()
    group.setCoords()
  }

  function appendCornerNode(point: { x: number; y: number }) {
    if (!state.session || state.session.mode !== 'draw') return
    state.session.nodes.push({ x: point.x, y: point.y })
    state.previewNodes = null
    overlay.requestRender()
  }

  function appendSmoothNode(
    anchor: { x: number; y: number },
    handleOut: { x: number; y: number },
  ) {
    if (!state.session || state.session.mode !== 'draw') return
    // 手柄只作用在当前锚点（对称进出），不改写上一点的 handleOut，避免两点画出 S 弯
    state.session.nodes.push({
      x: anchor.x,
      y: anchor.y,
      handleIn: mirrorHandle(handleOut),
      handleOut: { ...handleOut },
    })
    state.previewNodes = null
    overlay.requestRender()
  }

  function tryStartPenEdit(
    target: FabricObject | undefined,
    scenePoint: { x: number; y: number },
  ): boolean {
    const path = preparePenEditPath(canvas, target, scenePoint)
    if (!path) return false
    startEditSession(path)
    return true
  }

  function hasPathEditSession(): boolean {
    return state.session?.mode === 'edit'
  }

  function enterPathEdit(
    target: FabricObject | undefined,
    scenePoint: { x: number; y: number },
    getReadonly: () => boolean,
  ): boolean {
    if (getReadonly()) return false
    if (state.session?.mode === 'edit') return true
    if (state.session?.mode === 'draw') return false
    return tryStartPenEdit(target, scenePoint)
  }

  return {
    clearSession,
    commitDrawPath,
    commitEditPath,
    cancelEditPath,
    startDrawSession,
    appendCornerNode,
    appendSmoothNode,
    tryStartPenEdit,
    syncEditPathPreview,
    hasPathEditSession,
    enterPathEdit,
  }
}

export function updateEditSessionNodes(
  session: Extract<PenSession, { mode: 'edit' }>,
  nodes: PenNode[],
) {
  session.nodes = nodes
}
