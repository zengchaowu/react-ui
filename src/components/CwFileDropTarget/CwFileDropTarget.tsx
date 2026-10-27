import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type DragEvent as ReactDragEvent,
  type HTMLAttributes,
} from 'react'
import { hasExternalFileDrag } from '@zengchaowu/shared/functions/dom/fileDrag'
import { CwIcon } from '../CwIcon'
import { fileDropTargetBase } from '@zengchaowu/ui-shared/components/CwFileDropTarget/styles'
import { defaultCwFileDropTargetTexts } from '@zengchaowu/ui-shared/components/CwFileDropTarget/texts'
import type { CwFileDropTargetProps } from './types'
import type { CwFileDropTargetTexts } from '@zengchaowu/ui-shared/components/CwFileDropTarget/types'

export interface CwFileDropTargetComponentProps
  extends CwFileDropTargetProps,
    Omit<
      HTMLAttributes<HTMLDivElement>,
      | 'children'
      | 'onDragEnter'
      | 'onDragOver'
      | 'onDragLeave'
      | 'onDrop'
      | 'onDropCapture'
    > {
  className?: string
}

export function CwFileDropTarget({
  disabled = false,
  showOverlay = true,
  texts: textsProp,
  overlaySlot,
  children,
  className,
  onFilesDrop,
  ...rest
}: CwFileDropTargetComponentProps) {
  const texts: CwFileDropTargetTexts = {
    ...defaultCwFileDropTargetTexts,
    ...(textsProp ?? {}),
  }

  const [dragActive, setDragActive] = useState(false)
  const dragActiveRef = useRef(false)
  const dragDepthRef = useRef(0)
  const listeningDragEndRef = useRef(false)

  function updateDragActive(value: boolean) {
    dragActiveRef.current = value
    setDragActive(value)
  }

  const clearDragState = useCallback(() => {
    dragDepthRef.current = 0
    dragActiveRef.current = false
    setDragActive(false)
    if (!listeningDragEndRef.current || typeof window === 'undefined') return
    listeningDragEndRef.current = false
    window.removeEventListener('dragend', clearDragState)
  }, [])

  const ensureDragEndListen = useCallback(() => {
    if (listeningDragEndRef.current || typeof window === 'undefined') return
    listeningDragEndRef.current = true
    // 子节点 capture + stopPropagation 时本组件可能收不到 drop；拖拽取消也靠 dragend 收尾
    window.addEventListener('dragend', clearDragState)
  }, [clearDragState])

  const teardownDragEndListen = useCallback(() => {
    if (!listeningDragEndRef.current || typeof window === 'undefined') return
    listeningDragEndRef.current = false
    window.removeEventListener('dragend', clearDragState)
  }, [clearDragState])

  useEffect(
    () => () => {
      teardownDragEndListen()
    },
    [teardownDragEndListen],
  )

  function canAccept(dt: DataTransfer | null | undefined): boolean {
    if (disabled) return false
    return hasExternalFileDrag(dt)
  }

  function onDragEnter(event: ReactDragEvent<HTMLDivElement>) {
    if (!canAccept(event.dataTransfer)) return
    event.preventDefault()
    dragDepthRef.current += 1
    updateDragActive(true)
    ensureDragEndListen()
  }

  function onDragOver(event: ReactDragEvent<HTMLDivElement>) {
    if (!canAccept(event.dataTransfer)) return
    event.preventDefault()
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy'
  }

  function onDragLeave() {
    if (!dragActiveRef.current) return
    dragDepthRef.current = Math.max(0, dragDepthRef.current - 1)
    if (dragDepthRef.current === 0) clearDragState()
  }

  /** capture：先于子节点（如 Fabric 画布）处理 drop，避免高亮卡住 */
  function onDropCapture() {
    clearDragState()
  }

  function onDrop(event: ReactDragEvent<HTMLDivElement>) {
    clearDragState()
    if (!canAccept(event.dataTransfer)) return
    const list = event.dataTransfer?.files
    if (!list?.length) return
    event.preventDefault()
    event.stopPropagation()
    onFilesDrop?.(Array.from(list))
  }

  return (
    <div
      {...rest}
      className={[
        fileDropTargetBase.root,
        showOverlay && dragActive ? fileDropTargetBase.rootDragActive : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      onDragEnter={onDragEnter}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDropCapture={onDropCapture}
      onDrop={onDrop}
    >
      <div
        className={[
          fileDropTargetBase.content,
          showOverlay && dragActive
            ? fileDropTargetBase.contentHiddenWhileDrag
            : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {children}
      </div>
      {showOverlay ? (
        <div
          className={[
            fileDropTargetBase.overlay,
            dragActive ? fileDropTargetBase.overlayActive : '',
          ]
            .filter(Boolean)
            .join(' ')}
          aria-hidden="true"
        >
          <div className={fileDropTargetBase.overlayInner}>
            {overlaySlot ?? (
              <>
                <span className={fileDropTargetBase.overlayIcon}>
                  <CwIcon
                    name="common--action--upload-line"
                    prefix="icon"
                    size={2}
                  />
                </span>
                <span className={fileDropTargetBase.overlayText}>
                  {texts.hint}
                </span>
              </>
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default CwFileDropTarget
