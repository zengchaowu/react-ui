export interface CalculateEditTiming {
  topoMs: number
  logMs: number
  formulaCompileMs: number
  formulaRunMs: number
  formulaCount: number
  refreshMs: number
  virtualMs: number
  renderMs: number
  flashMs: number
  flashCount: number
  paintMs: number
  totalMs: number
}

export interface CalculateLoadTiming {
  buildRowsMs: number
  sortMs: number
  formulaCompileMs: number
  formulaRunMs: number
  formulaCount: number
  refreshMs: number
  virtualMs: number
  renderMs: number
  paintMs: number
  totalMs: number
}

interface EditTimingBucket {
  topoMs: number
  logMs: number
  formulaCompileMs: number
  formulaRunMs: number
  formulaCount: number
  buildRowsMs: number
  flashMs: number
  flashCount: number
}

let bucket: EditTimingBucket | null = null

export function beginEditTiming() {
  bucket = {
    topoMs: 0,
    logMs: 0,
    formulaCompileMs: 0,
    formulaRunMs: 0,
    formulaCount: 0,
    buildRowsMs: 0,
    flashMs: 0,
    flashCount: 0,
  }
}

export function recordTopo(ms: number) {
  if (!bucket) return
  bucket.topoMs += ms
}

export function recordBuildRows(ms: number) {
  if (!bucket) return
  bucket.buildRowsMs += ms
}

export function recordLog(ms: number) {
  if (!bucket) return
  bucket.logMs += ms
}

export function recordFormula(compileMs: number, runMs: number) {
  if (!bucket) return
  bucket.formulaCompileMs += compileMs
  bucket.formulaRunMs += runMs
  bucket.formulaCount += 1
}

export function recordFlash(ms: number) {
  if (!bucket) return
  bucket.flashMs += ms
  bucket.flashCount += 1
}

export function takeEditTiming(): EditTimingBucket | null {
  const current = bucket
  bucket = null
  return current
}
