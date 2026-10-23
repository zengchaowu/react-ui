import JSZip from 'jszip'
import { buildArchivePayload, type PptxArchivePayload } from './archiveEntries'

interface PptxUnzipRequest {
  id: number
  buffer: ArrayBuffer
}
interface PptxUnzipSuccess {
  id: number
  payload: PptxArchivePayload
}
interface PptxUnzipFailure {
  id: number
  message: string
}

/** tsconfig 的 lib 只有 DOM，这里按结构断言拿到 Worker 全局作用域，避免引入 webworker lib 造成全局类型冲突 */
const scope = self as unknown as {
  onmessage: ((event: MessageEvent<PptxUnzipRequest>) => void) | null
  postMessage: (message: PptxUnzipSuccess | PptxUnzipFailure, transfer?: Transferable[]) => void
}

/**
 * pptx 解压全部丢给 Worker：JSZip 的 pako 解压和图片 base64 都是同步重活，
 * 主线程只拿解压好的文本/图片 dataUrl，自己做 DOMParser 建 deck。
 */
scope.onmessage = async (event) => {
  const { id, buffer } = event.data
  try {
    const started = performance.now()
    const zip = await JSZip.loadAsync(buffer)
    const payload = await buildArchivePayload(zip)
    // 二进制条目（内嵌字体可达十几 MB）转移所有权，主线程零拷贝收下
    const transfer = Object.values(payload.binary).map((bytes) => bytes.buffer as ArrayBuffer)
    const sizes = [payload.text, payload.media, payload.binary].map((group) => Object.keys(group).length)
    console.log(`[CwPptEditor] Worker 解压完成 +${Math.round(performance.now() - started)}ms（xml ${sizes[0]} / 图片 ${sizes[1]} / 其他 ${sizes[2]}）`)
    scope.postMessage({ id, payload }, transfer)
  } catch (error) {
    scope.postMessage({ id, message: error instanceof Error ? error.message : String(error) })
  }
}
