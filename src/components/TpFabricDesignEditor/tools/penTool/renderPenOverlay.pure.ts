import { tokenSolidColors } from '../../../../assets/tokens/tokenSolidColors'
import type { PenNode } from './types'

/** 屏幕像素尺寸；绘制时除以 zoom，放大缩小外观不变 */
const ANCHOR_RADIUS_PX = 4
const HANDLE_RADIUS_PX = 3

export function renderPenToolOverlay(options: {
  ctx: CanvasRenderingContext2D
  vpt: number[]
  nodes: PenNode[]
  closed: boolean
  previewNodes?: PenNode[] | null
  selectedNodeIndices?: number[]
  marquee?: {
    start: { x: number; y: number }
    current: { x: number; y: number }
  } | null
  drawPathStroke?: boolean
}): void {
  const {
    ctx,
    vpt,
    nodes,
    closed,
    previewNodes,
    selectedNodeIndices = [],
    marquee,
    drawPathStroke = true,
  } = options
  const drawNodes = previewNodes ?? nodes
  if (drawNodes.length === 0 && !marquee) return

  const selectedSet = new Set(selectedNodeIndices)
  const zoom = Math.hypot(vpt[0] ?? 1, vpt[1] ?? 0) || 1
  const px = 1 / zoom

  ctx.save()
  ctx.setTransform(vpt[0], vpt[1], vpt[2], vpt[3], vpt[4], vpt[5])

  if (drawNodes.length > 0) {
    if (drawPathStroke) {
      strokePath(ctx, drawNodes, closed || Boolean(previewNodes), px)
    }

    for (let i = 0; i < drawNodes.length; i++) {
      const node = drawNodes[i]!
      const selected = selectedSet.has(i)
      drawHandleLine(ctx, node, node.handleIn, selected, px)
      drawHandleLine(ctx, node, node.handleOut, selected, px)
      if (node.handleIn) {
        fillHandle(
          ctx,
          node.x + node.handleIn.x,
          node.y + node.handleIn.y,
          tokenSolidColors.brandColor5,
          selected,
          px,
        )
      }
      if (node.handleOut) {
        fillHandle(
          ctx,
          node.x + node.handleOut.x,
          node.y + node.handleOut.y,
          tokenSolidColors.brandColor5,
          selected,
          px,
        )
      }
      fillAnchor(
        ctx,
        node.x,
        node.y,
        selected,
        i === 0 && !closed && nodes.length > 2,
        px,
      )
    }
  }

  if (marquee) {
    const left = Math.min(marquee.start.x, marquee.current.x)
    const top = Math.min(marquee.start.y, marquee.current.y)
    const width = Math.abs(marquee.current.x - marquee.start.x)
    const height = Math.abs(marquee.current.y - marquee.start.y)
    ctx.fillStyle = tokenSolidColors.brandColor6SelectionFill
    ctx.fillRect(left, top, width, height)
    ctx.strokeStyle = tokenSolidColors.brandColor6
    ctx.lineWidth = 1 * px
    ctx.setLineDash([4 * px, 3 * px])
    ctx.strokeRect(left, top, width, height)
    ctx.setLineDash([])
  }

  ctx.restore()
}

function strokePath(
  ctx: CanvasRenderingContext2D,
  nodes: PenNode[],
  closed: boolean,
  px: number,
): void {
  if (nodes.length === 0) return
  ctx.beginPath()
  const first = nodes[0]!
  ctx.moveTo(first.x, first.y)
  for (let i = 1; i < nodes.length; i++) {
    appendSegmentToContext(ctx, nodes[i - 1]!, nodes[i]!)
  }
  if (closed && nodes.length > 1) {
    appendSegmentToContext(ctx, nodes[nodes.length - 1]!, nodes[0]!)
    ctx.closePath()
  }
  ctx.strokeStyle = tokenSolidColors.brandColor6
  ctx.lineWidth = 1.5 * px
  ctx.setLineDash([])
  ctx.stroke()
}

function appendSegmentToContext(
  ctx: CanvasRenderingContext2D,
  from: PenNode,
  to: PenNode,
): void {
  const out = from.handleOut
  const inn = to.handleIn
  if (out && inn) {
    ctx.bezierCurveTo(
      from.x + out.x,
      from.y + out.y,
      to.x + inn.x,
      to.y + inn.y,
      to.x,
      to.y,
    )
    return
  }
  if (out) {
    ctx.bezierCurveTo(from.x + out.x, from.y + out.y, to.x, to.y, to.x, to.y)
    return
  }
  if (inn) {
    ctx.bezierCurveTo(from.x, from.y, to.x + inn.x, to.y + inn.y, to.x, to.y)
    return
  }
  ctx.lineTo(to.x, to.y)
}

function drawHandleLine(
  ctx: CanvasRenderingContext2D,
  node: PenNode,
  handle: { x: number; y: number } | undefined,
  emphasized: boolean,
  px: number,
): void {
  if (!handle) return
  if (handle.x === 0 && handle.y === 0) return
  ctx.beginPath()
  ctx.moveTo(node.x, node.y)
  ctx.lineTo(node.x + handle.x, node.y + handle.y)
  ctx.strokeStyle = tokenSolidColors.brandColor4
  ctx.lineWidth = (emphasized ? 1.5 : 1) * px
  ctx.stroke()
}

function fillAnchor(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  selected: boolean,
  closable: boolean,
  px: number,
): void {
  ctx.beginPath()
  ctx.arc(x, y, ANCHOR_RADIUS_PX * px, 0, Math.PI * 2)
  ctx.fillStyle = selected
    ? tokenSolidColors.brandColor6
    : tokenSolidColors.white
  ctx.fill()
  ctx.strokeStyle = selected
    ? tokenSolidColors.white
    : tokenSolidColors.brandColor6
  ctx.lineWidth = (selected ? 2 : 1.5) * px
  ctx.setLineDash(closable ? [2 * px, 2 * px] : [])
  ctx.stroke()
  ctx.setLineDash([])
}

function fillHandle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string,
  emphasized: boolean,
  px: number,
): void {
  const r = (emphasized ? HANDLE_RADIUS_PX + 0.5 : HANDLE_RADIUS_PX) * px
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
  ctx.fillStyle = color
  ctx.fill()
  ctx.strokeStyle = tokenSolidColors.white
  ctx.lineWidth = (emphasized ? 1.5 : 1) * px
  ctx.stroke()
}
