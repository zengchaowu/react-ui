export interface FilenameDisplayOptions {
  /** 缩略时至少保留的主体前缀字符数，默认 2；放不下则退到 …扩展名 */
  headChars?: number
  ellipsis?: string
}

export interface FilenameDisplayResolution {
  text: string
  /** 相对全名有缩略 */
  abbreviated: boolean
  /** 最窄档：扩展名也放不下，用 RTL 保留后缀尾部 */
  tailRtl: boolean
}

const DEFAULT_RESOLUTION: FilenameDisplayResolution = {
  text: '',
  abbreviated: false,
  tailRtl: false,
}

/** 从完整文件名拆出「主体 + 扩展名（含点）」 */
export function splitFilenameExtension(name: string): { base: string; ext: string } {
  const s = name.trim()
  if (!s) return { base: '', ext: '' }
  const dot = s.lastIndexOf('.')
  if (dot <= 0 || dot === s.length - 1) return { base: s, ext: '' }
  const extBody = s.slice(dot + 1)
  if (!/^[a-zA-Z0-9]+$/.test(extBody) || extBody.length > 16) {
    return { base: s, ext: '' }
  }
  return { base: s.slice(0, dot), ext: s.slice(dot) }
}

function pushUnique(out: string[], value: string) {
  if (value && !out.includes(value)) out.push(value)
}

/**
 * 文件名展示候选（信息量从高到低），供非 DOM / 调试；DOM 测量请用 `resolveFilenameDisplay`。
 */
export function buildFilenameDisplayCandidates(
  name: string,
  options?: FilenameDisplayOptions,
): string[] {
  const s = name.trim()
  if (!s) return []
  const headChars = Math.max(1, options?.headChars ?? 2)
  const ellipsis = options?.ellipsis ?? '…'
  const { base, ext } = splitFilenameExtension(s)
  const baseChars = [...base]
  const out: string[] = []

  pushUnique(out, s)
  if (ext) {
    if (baseChars.length > headChars) {
      pushUnique(out, `${baseChars.slice(0, headChars).join('')}${ellipsis}${ext}`)
    }
    if (baseChars.length > 0) pushUnique(out, `${ellipsis}${ext}`)
    pushUnique(out, ext)
  } else if (baseChars.length > headChars) {
    pushUnique(out, `${baseChars.slice(0, headChars).join('')}${ellipsis}`)
    pushUnique(out, ellipsis)
  }
  return out
}

/**
 * 按容器宽度选取文件名展示：全名 → 尽量长的「前缀…扩展名」→ …扩展名 → 扩展名 → RTL 尾部。
 */
export function resolveFilenameDisplay(
  name: string,
  fits: (candidate: string) => boolean,
  options?: FilenameDisplayOptions,
): FilenameDisplayResolution {
  const s = name.trim()
  if (!s) return { ...DEFAULT_RESOLUTION }
  if (fits(s)) return { text: s, abbreviated: false, tailRtl: false }

  const minHead = Math.max(1, options?.headChars ?? 2)
  const ellipsis = options?.ellipsis ?? '…'
  const { base, ext } = splitFilenameExtension(s)
  const baseChars = [...base]
  const n = baseChars.length

  if (ext) {
    // 从长到短找能放下的最大前缀，铺满可用宽度并保留扩展名
    for (let headLen = n - 1; headLen >= minHead; headLen--) {
      const candidate = `${baseChars.slice(0, headLen).join('')}${ellipsis}${ext}`
      if (fits(candidate)) {
        return { text: candidate, abbreviated: true, tailRtl: false }
      }
    }
    const ellipsisExt = `${ellipsis}${ext}`
    if (fits(ellipsisExt)) {
      return { text: ellipsisExt, abbreviated: true, tailRtl: false }
    }
    if (fits(ext)) {
      return { text: ext, abbreviated: true, tailRtl: false }
    }
    return { text: ext, abbreviated: true, tailRtl: true }
  }

  for (let headLen = n - 1; headLen >= minHead; headLen--) {
    const candidate = `${baseChars.slice(0, headLen).join('')}${ellipsis}`
    if (fits(candidate)) {
      return { text: candidate, abbreviated: true, tailRtl: false }
    }
  }
  if (fits(ellipsis)) {
    return { text: ellipsis, abbreviated: true, tailRtl: false }
  }
  return { text: ellipsis, abbreviated: true, tailRtl: true }
}

/** 非 DOM 场景：取「全名放不下时」的首选缩略形（固定前缀档） */
export function truncateFilenameHeadExt(
  name: string,
  options?: FilenameDisplayOptions,
): string {
  const candidates = buildFilenameDisplayCandidates(name, options)
  if (candidates.length <= 1) return candidates[0] ?? ''
  return candidates[1] ?? candidates[0] ?? ''
}
