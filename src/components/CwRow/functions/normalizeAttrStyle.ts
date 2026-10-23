/** CwCol inheritAttrs:false 时合并透传 style */
export function normalizeAttrStyle(extra: unknown): Record<string, string> {
  if (!extra) return {}
  if (typeof extra === 'object' && !Array.isArray(extra)) {
    return { ...(extra as Record<string, string>) }
  }
  if (typeof extra !== 'string') return {}

  const out: Record<string, string> = {}
  for (const part of extra.split(';')) {
    const idx = part.indexOf(':')
    if (idx <= 0) continue
    const key = part.slice(0, idx).trim()
    const val = part.slice(idx + 1).trim()
    if (key && val) out[key] = val
  }
  return out
}
