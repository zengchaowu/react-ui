import { useReactiveRef, type ReactiveRef } from './reactivity'
import {
  FABRIC_EDITOR_APPEND_STAGGER_PX,
  isFabricEditorImportableFile,
  isFabricEditorRasterImageFile,
  isFabricEditorSvgFile,
} from '@zengchaowu/ui-shared/components/TpFabricDesignEditor/import/fabricEditorImageImport.pure'
import type { TpFabricDesignEditorImportMode } from '../types'

type FileImportEmit = (e: 'error', err: Error) => void

export function useFabricSvgImport(options: {
  getReadonly: () => boolean
  getDefaultImportMode: () => TpFabricDesignEditorImportMode
  loadSvgString: (
    text: string,
    opts: {
      replace: boolean
      sourceFileName?: string
      placeAt?: { x: number; y: number }
    },
  ) => Promise<void>
  loadImageFile: (
    file: File,
    opts: {
      replace: boolean
      placeAt?: { x: number; y: number }
    },
  ) => Promise<void>
  emit: FileImportEmit
}) {
  const fileInputRef = useReactiveRef<HTMLInputElement | undefined>()
  const pendingImportKind = useReactiveRef<TpFabricDesignEditorImportMode>('replace')

  function openFilePicker(mode: TpFabricDesignEditorImportMode) {
    pendingImportKind.value = mode
    fileInputRef.value?.click()
  }

  async function importDesignFiles(payload: {
    files: File[]
    mode: TpFabricDesignEditorImportMode
    placeAt?: { x: number; y: number }
  }) {
    const { files, mode, placeAt } = payload
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]!
        if (!isFabricEditorImportableFile(file)) {
          options.emit(
            'error',
            new Error(
              `跳过不支持的文件：${file.name}（请使用 .svg / .png / .jpg）`,
            ),
          )
          continue
        }

        const replace = mode === 'replace' && i === 0
        const dropPoint =
          placeAt && !replace
            ? {
                x: placeAt.x + i * FABRIC_EDITOR_APPEND_STAGGER_PX,
                y: placeAt.y + i * FABRIC_EDITOR_APPEND_STAGGER_PX,
              }
            : undefined

        if (isFabricEditorSvgFile(file)) {
          const text = await file.text()
          await options.loadSvgString(text, {
            replace,
            sourceFileName: file.name,
            placeAt: dropPoint,
          })
          continue
        }

        if (isFabricEditorRasterImageFile(file)) {
          await options.loadImageFile(file, {
            replace,
            placeAt: dropPoint,
          })
        }
      }
    } catch {
      /* load* 已 emit */
    }
  }

  function onFileChange(ev: Event) {
    const input = ev.target as HTMLInputElement
    const files = Array.from(input.files ?? [])
    input.value = ''
    if (!files.length) return
    void importDesignFiles({ files, mode: pendingImportKind.value })
  }

  function onCanvasFilesDrop(
    files: File[],
    placeAt?: { x: number; y: number },
  ) {
    if (options.getReadonly() || !files.length) return
    // 拖放到画布始终追加，避免选中图层时误走「替换画布」
    void importDesignFiles({
      files,
      mode: 'append',
      placeAt,
    })
  }

  return {
    fileInputRef,
    openFilePicker,
    onFileChange,
    onCanvasFilesDrop,
  }
}

export type FabricSvgImportRefs = {
  fileInputRef: ReactiveRef<HTMLInputElement | undefined>
}
