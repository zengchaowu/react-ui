/**
 * 内嵌字体解压 Worker。
 * pptx 的 .fntdata 是 EOT 容器（通常带 MicroType Express 压缩），eotToTtf 内部是纯同步循环，
 * 单个中文字体可达数秒，跑在主线程会把首屏整段卡死，因此放到 Worker 里执行。
 */
import { eotToTtf } from 'mtx-decompressor'

interface FontDecompressRequest {
  id: number
  bytes: Uint8Array
}

interface FontDecompressSuccess {
  id: number
  ttf: Uint8Array
}

interface FontDecompressFailure {
  id: number
  message: string
}

/** tsconfig 的 lib 只有 DOM，这里按结构断言拿到 Worker 全局作用域，避免引入 webworker lib 造成全局类型冲突 */
const scope = self as unknown as {
  onmessage: ((event: MessageEvent<FontDecompressRequest>) => void) | null
  postMessage: (message: FontDecompressSuccess | FontDecompressFailure, transfer?: Transferable[]) => void
}

function isSfnt(bytes: Uint8Array) {
  if (bytes.length < 4) return false
  // 0x00010000 / 'OTTO' / 'true' / 'ttcf'
  return (
    (bytes[0] === 0 && bytes[1] === 1 && bytes[2] === 0 && bytes[3] === 0) ||
    (bytes[0] === 0x4f && bytes[1] === 0x54 && bytes[2] === 0x54 && bytes[3] === 0x4f) ||
    (bytes[0] === 0x74 && bytes[1] === 0x72 && bytes[2] === 0x75 && bytes[3] === 0x65) ||
    (bytes[0] === 0x74 && bytes[1] === 0x74 && bytes[2] === 0x63 && bytes[3] === 0x66)
  )
}

scope.onmessage = (event) => {
  const { id, bytes } = event.data
  try {
    // 少数文件直接内嵌未压缩的 SFNT，无需解压
    const ttf = isSfnt(bytes) ? bytes : eotToTtf(bytes)
    if (!isSfnt(ttf)) throw new Error('解压结果不是合法 SFNT')
    // 转移所有权，避免把整份字体再复制一遍回主线程
    scope.postMessage({ id, ttf }, [ttf.buffer as ArrayBuffer])
  } catch (error) {
    scope.postMessage({ id, message: error instanceof Error ? error.message : String(error) })
  }
}
