export function parseFabricEditorHexInput(raw: string): string | null {
  const t = raw.trim().replace(/^#/, '')
  if (!/^[0-9a-fA-F]{6}$/.test(t)) return null
  return `#${t.toLowerCase()}`
}

export function parseFabricEditorOpacityPercentInput(
  raw: number | string,
): number | null {
  if (raw === '' || raw === '-') return null
  const n =
    typeof raw === 'number'
      ? Math.round(raw)
      : parseInt(String(raw).trim().replace(/%$/, ''), 10)
  if (!Number.isFinite(n)) return null
  return Math.max(0, Math.min(100, n))
}

export function parseFabricEditorStrokeWidthInput(
  raw: number | string | undefined,
  fallback: number,
): number {
  if (raw === undefined || raw === '' || raw === '-') return fallback
  const w = Math.round(typeof raw === 'number' ? raw : parseFloat(String(raw)))
  if (!Number.isFinite(w)) return fallback
  return Math.max(0, Math.min(80, w))
}

export function parseFabricEditorStrokeAlignInput(
  value: unknown,
): 'inside' | 'center' | 'outside' | null {
  if (value === 'inside' || value === 'center' || value === 'outside') return value
  return null
}

export function formatFabricEditorHexInputValue(hex: string): string {
  return hex.replace(/^#/, '').toUpperCase()
}

export function formatFabricEditorOpacityInputValue(opacity: number): string {
  return `${opacity}%`
}

export function parseFabricEditorIntegerInput(
  raw: number | string | undefined,
): number | null {
  if (raw === undefined || raw === '' || raw === '-') return null
  const n = Math.round(typeof raw === 'number' ? raw : parseFloat(String(raw)))
  return Number.isFinite(n) ? n : null
}
