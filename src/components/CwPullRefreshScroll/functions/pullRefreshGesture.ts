import type { CwPullRefreshScrollPullPhase } from '../types'

export function dampPullDistance(deltaY: number, maxPullDistance: number): number {
  if (deltaY <= 0) return 0
  const damped = deltaY * 0.45
  return Math.min(Math.round(damped), maxPullDistance)
}

export function resolvePullPhase(
  pullDistance: number,
  pullThreshold: number,
  refreshing: boolean,
): CwPullRefreshScrollPullPhase {
  if (refreshing) return 'refreshing'
  if (pullDistance <= 0) return 'idle'
  return pullDistance >= pullThreshold ? 'ready' : 'pulling'
}

export function pullIndicatorHeight(
  pullDistance: number,
  refreshing: boolean,
  pullThreshold: number,
): number {
  if (refreshing) return Math.max(pullThreshold, 48)
  return pullDistance
}
