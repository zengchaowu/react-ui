function adjFrac(adjust: Record<string, number> | undefined, name: string, dflt: number) {
  const raw = adjust?.[name]
  if (raw == null) return dflt
  return Math.min(Math.max(raw / 100000, 0), 1)
}

/** 正六边形，viewBox 0–100，adj 默认 25000（左右内缩） */
export function hexagonPoints100(adjust?: Record<string, number>) {
  const inset = adjFrac(adjust, 'adj', 0.25) * 100
  const right = 100 - inset
  return `${inset},0 ${right},0 100,50 ${right},100 ${inset},100 0,50`
}

/** roundRect adj → CSS border-radius 百分比（相对各边） */
export function roundRectRadiusPercent(adjust?: Record<string, number>) {
  const adj = adjust?.adj ?? 16667
  return Math.min(50, adj / 1000)
}

/** 直角三角形：直角在左下（OOXML rtTriangle 默认） */
export function rtTrianglePoints100() {
  return '0,100 0,0 100,100'
}

export function polygonClipPathFromPoints100(points: string) {
  const pairs = points
    .trim()
    .split(/\s+/)
    .map((pair) => {
      const [x, y] = pair.split(',')
      return `${x}% ${y}%`
    })
  return `polygon(${pairs.join(', ')})`
}
