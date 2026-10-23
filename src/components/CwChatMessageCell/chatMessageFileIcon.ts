import { getAssetIconNameByExtension } from '@zengchaowu/shared/functions/file/getAssetIconNameByExtension'
import { mediaProbePathFromUrl } from '@zengchaowu/shared/functions/file/mediaProbePathFromUrl'
import { isHttpOrHttpsUrl } from '@zengchaowu/shared/functions/url/assetUrlGuards'
import { pathLastSegment } from '@zengchaowu/shared/functions/path/pathLastSegment'

function fileDisplayBasename(name: string): string {
  const s = name.trim()
  if (!s) return s
  return pathLastSegment(s) || s
}

/** 展示名 + 用于后缀推断 icon 的字符串（优先原始文件名，其次从 URL 路径截取） */
export function resolveChatFileDisplayAndIconLookup(m: {
  content?: string
  mediaOriginalFileName?: string
}): {
  display: string
  iconLookup: string
} {
  const orig = m.mediaOriginalFileName?.trim()
  const c = m.content?.trim() ?? ''
  if (orig) {
    const base = fileDisplayBasename(orig)
    return { display: base || orig, iconLookup: orig }
  }
  if (c && (isHttpOrHttpsUrl(c) || c.startsWith('blob:'))) {
    const path = mediaProbePathFromUrl(c)
    const seg = pathLastSegment(path)
    if (seg) {
      const dec = decodeURIComponent(seg)
      const base = fileDisplayBasename(dec)
      return { display: base || dec, iconLookup: dec }
    }
    return { display: '文件', iconLookup: 'file.dat' }
  }
  if (c) return { display: c, iconLookup: c }
  return { display: '文件', iconLookup: 'file.dat' }
}

/**
 * 根据文件名/路径后缀选择 asset 图标名（与 CwIcon prefix=icon 一致，如 png → common--media--image-line）
 */
export function chatFileNameToAssetIconName(fileName: string): string {
  return getAssetIconNameByExtension(fileName, { defaultIcon: 'common--nav--file-line' })
}
