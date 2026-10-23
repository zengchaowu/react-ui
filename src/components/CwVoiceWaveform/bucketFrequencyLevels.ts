/** 人声主要能量集中在低频段，忽略过高频 bin */
const VOICE_BIN_START = 2
const VOICE_BIN_END_RATIO = 0.55

/**
 * 将 AnalyserNode 频域采样切成 barCount 段，归一化到 [minLevel, maxLevel]。
 */
export function bucketFrequencyLevels(
  data: Uint8Array,
  barCount: number,
  minLevel = 0.22,
  maxLevel = 1,
): number[] {
  if (barCount <= 0) return []

  const endBin = Math.max(
    VOICE_BIN_START + barCount,
    Math.floor(data.length * VOICE_BIN_END_RATIO),
  )
  const range = endBin - VOICE_BIN_START
  if (range <= 0) {
    return Array.from({ length: barCount }, () => minLevel)
  }

  const out: number[] = []
  for (let i = 0; i < barCount; i++) {
    const binStart = VOICE_BIN_START + Math.floor((i / barCount) * range)
    const binEnd = VOICE_BIN_START + Math.floor(((i + 1) / barCount) * range)
    let peak = 0
    for (let j = binStart; j < binEnd; j++) {
      peak = Math.max(peak, data[j] ?? 0)
    }
    const normalized = peak / 255
    const curved = Math.pow(normalized, 0.6)
    out.push(minLevel + curved * (maxLevel - minLevel))
  }
  return out
}
