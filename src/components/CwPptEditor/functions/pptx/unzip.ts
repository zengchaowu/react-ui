import { buildArchivePayload, type PptxArchivePayload } from '../archiveEntries'

/**
 * pptx 解压 Worker：创建一次复用。pako 解压和图片 base64 都是同步重活，放主线程会卡住渲染，
 * 统一交给 Worker；Node 脚本 / 无 Worker 宿主退回主线程原地解压（行为一致）。
 */
export let unzipWorker: Worker | null = null
export let unzipWorkerBroken = false
export let unzipTaskSeq = 0
export const unzipTasks = new Map<number, { resolve: (payload: PptxArchivePayload) => void; reject: (error: Error) => void }>()

export function failUnzipTasks(error: Error) {
  for (const task of unzipTasks.values()) task.reject(error)
  unzipTasks.clear()
}

export async function getUnzipWorker() {
  if (unzipWorkerBroken || typeof Worker === 'undefined') return null
  if (unzipWorker) return unzipWorker
  try {
    const { default: PptxUnzipWorker } = await import('../pptx.worker?worker&inline')
    const worker = new PptxUnzipWorker()
    worker.onmessage = (event: MessageEvent<{ id: number; payload?: PptxArchivePayload; message?: string }>) => {
      const task = unzipTasks.get(event.data.id)
      if (!task) return
      unzipTasks.delete(event.data.id)
      if (event.data.payload) task.resolve(event.data.payload)
      else task.reject(new Error(event.data.message || '解压失败'))
    }
    // Worker 脚本加载失败：中断在途任务并整体降级，避免每次解析都白等一次超时
    worker.onerror = () => {
      failUnzipTasks(new Error('解压 Worker 加载失败'))
      worker.terminate()
      unzipWorker = null
      unzipWorkerBroken = true
    }
    unzipWorker = worker
    return worker
  } catch (error) {
    console.warn('[CwPptEditor] 无法创建解压 Worker，将退回主线程解压', error)
    unzipWorkerBroken = true
    return null
  }
}

/** 主线程兜底：与 Worker 内完全同一份解压实现，只是跑在主线程 */
export async function unzipOnMainThread(buffer: ArrayBuffer) {
  const { default: JSZip } = await import('jszip')
  return buildArchivePayload(await JSZip.loadAsync(buffer))
}

/** 解压 pptx：Worker 优先，失败时退回主线程，保证功能不因宿主差异缺失 */
export async function loadPptxArchive(buffer: ArrayBuffer): Promise<PptxArchivePayload> {
  const worker = await getUnzipWorker()
  if (!worker) return unzipOnMainThread(buffer)
  return new Promise<PptxArchivePayload>((resolve, reject) => {
    const id = ++unzipTaskSeq
    unzipTasks.set(id, { resolve, reject })
    worker.postMessage({ id, buffer })
  }).catch(async (error) => {
    console.warn('[CwPptEditor] Worker 解压失败，退回主线程解压', error)
    return unzipOnMainThread(buffer)
  })
}
