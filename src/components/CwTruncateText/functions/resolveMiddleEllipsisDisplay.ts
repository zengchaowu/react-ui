export interface MiddleEllipsisResolution {
  text: string
  abbreviated: boolean
}

const IDLE: MiddleEllipsisResolution = { text: '', abbreviated: false }

/**
 * 仅在 `fits(全名)` 为 false 时做中间省略（保留尽可能多的首尾字符）。
 */
export function resolveMiddleEllipsisDisplay(
  name: string,
  fits: (candidate: string) => boolean,
  ellipsis = '…',
): MiddleEllipsisResolution {
  const s = name.trim()
  if (!s) return { ...IDLE }
  if (fits(s)) return { text: s, abbreviated: false }

  const chars = [...s]
  const n = chars.length
  if (n <= 1) return { text: ellipsis, abbreviated: true }

  for (let keep = n; keep >= 2; keep--) {
    const head = Math.ceil(keep / 2)
    const tail = Math.floor(keep / 2)
    const candidate =
      chars.slice(0, head).join('') + ellipsis + chars.slice(n - tail).join('')
    if (fits(candidate)) {
      return { text: candidate, abbreviated: true }
    }
  }

  return { text: ellipsis, abbreviated: true }
}
