/**
 * Resolve a CSS custom property to a canvas-usable color via the live theme on `el`.
 * Prefer this over `tokenSolidColors` when the paint must follow `data-theme`.
 */
export function resolveElementCssColor(
  el: Element,
  cssVar: string,
  fallback: string,
  property: 'color' | 'backgroundColor' = 'color',
): string {
  const name = cssVar.startsWith('--') ? cssVar : `--${cssVar}`
  const doc = el.ownerDocument
  const probe = doc.createElement('span')
  probe.style.cssText =
    'position:absolute;left:0;top:0;width:0;height:0;overflow:hidden;pointer-events:none;visibility:hidden'
  if (property === 'backgroundColor') {
    probe.style.backgroundColor = `var(${name})`
  } else {
    probe.style.color = `var(${name})`
  }
  el.appendChild(probe)
  const resolved = getComputedStyle(probe)[property]
  probe.remove()
  if (
    !resolved ||
    resolved === 'transparent' ||
    resolved === 'rgba(0, 0, 0, 0)'
  ) {
    return fallback
  }
  return resolved
}

/** Parse rgb/rgba() from getComputedStyle into 0–255 channels. */
export function parseCssRgbChannels(
  color: string,
): [number, number, number] | null {
  const legacy = color.match(
    /rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/i,
  )
  if (legacy) {
    return [Number(legacy[1]), Number(legacy[2]), Number(legacy[3])]
  }
  const modern = color.match(
    /rgba?\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)/i,
  )
  if (modern) {
    return [Number(modern[1]), Number(modern[2]), Number(modern[3])]
  }
  return null
}
