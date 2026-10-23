/** 钢笔锚点（场景坐标） */
export type PenNode = {
  x: number
  y: number
  /** 相对锚点的入控制柄 */
  handleIn?: { x: number; y: number }
  /** 相对锚点的出控制柄 */
  handleOut?: { x: number; y: number }
}

export type PenDrawPhase =
  | 'idle'
  | 'placing'
  | 'dragging-handle'

export type PenEditHit =
  | { kind: 'anchor'; index: number }
  | { kind: 'handleIn'; index: number }
  | { kind: 'handleOut'; index: number }
  | { kind: 'close'; index: 0 }

export type PenToolDefaults = {
  fill: string
  stroke: string
  strokeWidth: number
}
