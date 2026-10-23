export function toSliderCaptchaDataUrl(base64: string): string {
  return `data:image/png;base64,${base64}`
}

export function preloadSliderCaptchaImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve()
    img.onerror = () => reject(new Error('image-load-failed'))
    img.src = src
  })
}

export function clampSliderOffset(value: number, max: number): number {
  if (!Number.isFinite(value) || max <= 0) return 0
  return Math.min(Math.max(0, value), max)
}

export function mapHandleOffsetToApiOffset(
  handleOffset: number,
  handleMax: number,
  puzzleApiMax: number,
): number {
  if (!handleMax) return 0
  return Math.round(handleOffset * (puzzleApiMax / handleMax))
}
