import type JSZip from 'jszip'

/**
 * 解压后的 pptx 条目集合：按用途分三份，主线程拿到后不再做任何解压或 base64。
 * Worker 与主线程兜底（Node / 无 Worker 宿主）共用 buildArchivePayload，保证两条路径产物一致。
 */
export interface PptxArchivePayload {
  /** xml / rels 文本（Worker 内解压 + UTF-8 解码） */
  text: Record<string, string>
  /** 图片条目 → 已编码好的 dataUrl（base64 不在主线程做） */
  media: Record<string, string>
  /** 其余二进制条目（内嵌字体等）：Worker 转移所有权，主线程零拷贝拿到字节 */
  binary: Record<string, Uint8Array>
}

/** 支持的图片扩展名 → mime，空串表示不支持（如 emf/wmf，按原逻辑跳过） */
export function imageMimeOf(path: string) {
  const lower = path.toLowerCase()
  if (lower.endsWith('.png')) return 'image/png'
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg'
  if (lower.endsWith('.gif')) return 'image/gif'
  if (lower.endsWith('.webp')) return 'image/webp'
  if (lower.endsWith('.svg')) return 'image/svg+xml'
  return ''
}

function bytesToDataUrl(bytes: Uint8Array, mime: string) {
  let binary = ''
  const size = 0x8000
  for (let index = 0; index < bytes.length; index += size) {
    binary += String.fromCharCode(...bytes.subarray(index, index + size))
  }
  return `data:${mime};base64,${btoa(binary)}`
}

/** 图片条目 → dataUrl；mime 不支持时返回空串，调用方据此跳过 */
export function imageDataUrl(path: string, bytes: Uint8Array) {
  const mime = imageMimeOf(path)
  if (!mime) return ''
  // SVG 用文本形式，保持原有的 charset 写法
  if (mime === 'image/svg+xml') {
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(new TextDecoder('utf-8').decode(bytes))}`
  }
  return bytesToDataUrl(bytes, mime)
}

/** xml / rels 走文本条目，其余按二进制处理 */
export function isArchiveTextEntry(path: string) {
  return /\.(xml|rels)$/i.test(path)
}

/** 遍历压缩包条目，按用途归类；解压与 base64 都发生在这里（与调用方是否在 Worker 内无关） */
export async function buildArchivePayload(zip: JSZip): Promise<PptxArchivePayload> {
  const text: Record<string, string> = {}
  const media: Record<string, string> = {}
  const binary: Record<string, Uint8Array> = {}
  const decoder = new TextDecoder('utf-8')
  for (const [path, entry] of Object.entries(zip.files)) {
    if (entry.dir) continue
    const bytes = await entry.async('uint8array')
    if (isArchiveTextEntry(path)) {
      text[path] = decoder.decode(bytes)
      continue
    }
    const dataUrl = imageDataUrl(path, bytes)
    if (dataUrl) media[path] = dataUrl
    else binary[path] = bytes
  }
  return { text, media, binary }
}
