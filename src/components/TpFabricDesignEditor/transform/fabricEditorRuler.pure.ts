/** 顶/左侧标尺厚度（CSS 像素） */
export const FABRIC_EDITOR_RULER_SIZE_PX = 20

export type FabricRulerTick = {
  /** 沿标尺方向的屏幕坐标（相对标尺起点） */
  pos: number
  /** 场景坐标值 */
  value: number
  major: boolean
}

export type FabricRulerPaintColors = {
  background: string
  border: string
  tick: string
  label: string
}

/** 取 1/2/5×10^n，使主刻度在屏幕上接近 targetScreenPx */
export function niceFabricRulerStep(
  sceneStepHint: number,
): number {
  const x = Math.abs(sceneStepHint) || 1
  const exp = 10 ** Math.floor(Math.log10(x))
  const f = x / exp
  const nf = f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10
  return nf * exp
}

/**
 * 按视口变换生成水平或垂直标尺刻度。
 * screen = scene * zoom + pan
 */
export function collectFabricRulerTicks(options: {
  axisLengthPx: number
  zoom: number
  pan: number
  /** 主刻度期望屏幕间距 */
  majorTargetScreenPx?: number
}): FabricRulerTick[] {
  const {
    axisLengthPx,
    zoom,
    pan,
    majorTargetScreenPx = 64,
  } = options
  if (!(axisLengthPx > 0) || !(zoom > 0)) return []

  const majorStep = niceFabricRulerStep(majorTargetScreenPx / zoom)
  const minorStep = majorStep / 5
  const sceneStart = (0 - pan) / zoom
  const sceneEnd = (axisLengthPx - pan) / zoom
  const first =
    Math.floor(Math.min(sceneStart, sceneEnd) / minorStep) * minorStep
  const last = Math.max(sceneStart, sceneEnd)

  const ticks: FabricRulerTick[] = []
  const eps = minorStep * 1e-6
  for (let v = first; v <= last + eps; v += minorStep) {
    const rounded = Math.abs(v) < eps ? 0 : v
    const pos = rounded * zoom + pan
    if (pos < -1 || pos > axisLengthPx + 1) continue
    const major =
      Math.abs(Math.round(rounded / majorStep) * majorStep - rounded) < eps
    ticks.push({ pos, value: rounded, major })
  }
  return ticks
}

export function formatFabricRulerLabel(value: number): string {
  if (Number.isInteger(value)) return String(value)
  const abs = Math.abs(value)
  if (abs >= 100) return String(Math.round(value))
  if (abs >= 10) return (Math.round(value * 10) / 10).toString()
  return (Math.round(value * 100) / 100).toString()
}

export function paintFabricEditorRulers(
  ctx: CanvasRenderingContext2D,
  options: {
    width: number
    height: number
    zoom: number
    panX: number
    panY: number
    sizePx?: number
    colors: FabricRulerPaintColors
  },
): void {
  const {
    width,
    height,
    zoom,
    panX,
    panY,
    colors,
  } = options
  const size = options.sizePx ?? FABRIC_EDITOR_RULER_SIZE_PX
  if (!(width > 0) || !(height > 0)) return

  ctx.clearRect(0, 0, width, height)

  // 水平标尺（顶）
  ctx.fillStyle = colors.background
  ctx.fillRect(size, 0, width - size, size)
  // 垂直标尺（左）
  ctx.fillRect(0, size, size, height - size)
  // 左上角
  ctx.fillRect(0, 0, size, size)

  ctx.strokeStyle = colors.border
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(size, size - 0.5)
  ctx.lineTo(width, size - 0.5)
  ctx.moveTo(size - 0.5, size)
  ctx.lineTo(size - 0.5, height)
  ctx.stroke()

  ctx.fillStyle = colors.tick
  ctx.strokeStyle = colors.tick
  ctx.font = '10px system-ui, -apple-system, sans-serif'
  ctx.textBaseline = 'middle'

  const hTicks = collectFabricRulerTicks({
    axisLengthPx: width - size,
    zoom,
    pan: panX - size,
  })
  for (const tick of hTicks) {
    const x = size + tick.pos
    if (x < size || x > width) continue
    const len = tick.major ? 8 : 4
    ctx.beginPath()
    ctx.moveTo(x + 0.5, size)
    ctx.lineTo(x + 0.5, size - len)
    ctx.stroke()
    if (tick.major) {
      ctx.fillStyle = colors.label
      ctx.textAlign = 'center'
      ctx.fillText(formatFabricRulerLabel(tick.value), x, size - 12)
      ctx.fillStyle = colors.tick
    }
  }

  const vTicks = collectFabricRulerTicks({
    axisLengthPx: height - size,
    zoom,
    pan: panY - size,
  })
  for (const tick of vTicks) {
    const y = size + tick.pos
    if (y < size || y > height) continue
    const len = tick.major ? 8 : 4
    ctx.beginPath()
    ctx.moveTo(size, y + 0.5)
    ctx.lineTo(size - len, y + 0.5)
    ctx.stroke()
    if (tick.major) {
      ctx.save()
      ctx.fillStyle = colors.label
      ctx.translate(10, y)
      ctx.rotate(-Math.PI / 2)
      ctx.textAlign = 'center'
      ctx.fillText(formatFabricRulerLabel(tick.value), 0, 0)
      ctx.restore()
      ctx.fillStyle = colors.tick
    }
  }
}
