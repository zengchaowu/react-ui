/** 无限循环坐标下选取距 current 最近的等价目标（最短吸附路径） */
export function pickShortestLoopScrollTarget(
  current: number,
  target: number,
  copySize: number,
): number {
  if (copySize <= 0 || !Number.isFinite(current) || !Number.isFinite(target)) {
    return target
  }

  let best = target
  let bestDist = Math.abs(target - current)

  for (const delta of [-copySize, copySize]) {
    const candidate = target + delta
    const dist = Math.abs(candidate - current)
    if (dist < bestDist) {
      bestDist = dist
      best = candidate
    }
  }

  return best
}
