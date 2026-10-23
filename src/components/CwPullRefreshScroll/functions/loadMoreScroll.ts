export function shouldTriggerLoadMore(
  scrollTop: number,
  scrollHeight: number,
  clientHeight: number,
  threshold: number,
): boolean {
  if (clientHeight <= 0 || scrollHeight <= 0) return false
  return scrollHeight - scrollTop - clientHeight <= threshold
}
