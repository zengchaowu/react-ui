import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
  type RefObject,
} from 'react'
import { buildEdgePath, screenToWorld } from '@zengchaowu/ui-shared/components/CwFlow/geometry'
import type { CwFlowHandleSide } from '@zengchaowu/ui-shared/components/CwFlow/styles'
import type {
  CwFlowConnection,
  CwFlowPoint,
  CwFlowRect,
  CwFlowViewport,
} from '@zengchaowu/ui-shared/components/CwFlow/types'

/** 手柄所在边的中点 */
function getHandlePoint(rect: CwFlowRect, side: CwFlowHandleSide): CwFlowPoint {
  switch (side) {
    case 'top':
      return { x: rect.x + rect.width / 2, y: rect.y }
    case 'bottom':
      return { x: rect.x + rect.width / 2, y: rect.y + rect.height }
    case 'left':
      return { x: rect.x, y: rect.y + rect.height / 2 }
    default:
      return { x: rect.x + rect.width, y: rect.y + rect.height / 2 }
  }
}

/** 连线草稿入参 */
export interface CwFlowConnectOptions {
  disabled: boolean
  rootRef: RefObject<HTMLElement | null>
  viewportRef: MutableRefObject<CwFlowViewport>
  getNodeRect: (id: string) => CwFlowRect | null
  onConnect?: (connection: CwFlowConnection) => void
}

/** 从四边手柄拖出草稿线并在目标节点释放时触发 connect */
export function useCwFlowConnect(options: CwFlowConnectOptions) {
  const [draft, setDraft] = useState<{ source: string; start: CwFlowPoint; end: CwFlowPoint } | null>(null)
  const draftRef = useRef(draft)
  draftRef.current = draft
  const getNodeRectRef = useRef(options.getNodeRect)
  getNodeRectRef.current = options.getNodeRect
  const disabledRef = useRef(options.disabled)
  disabledRef.current = options.disabled
  const handlersRef = useRef<{ move?: (event: PointerEvent) => void; up?: (event: PointerEvent) => void }>({})

  const localPoint = useCallback(
    (event: { clientX: number; clientY: number }): CwFlowPoint => {
      const rect = options.rootRef.current?.getBoundingClientRect()
      return { x: event.clientX - (rect?.left ?? 0), y: event.clientY - (rect?.top ?? 0) }
    },
    [options.rootRef],
  )

  const draftPath = useMemo(
    () => (draft ? buildEdgePath(draft.start, draft.end) : ''),
    [draft],
  )

  const startConnect = useCallback(
    (sourceId: string, event: { clientX: number; clientY: number }, side: CwFlowHandleSide = 'right') => {
      if (disabledRef.current) return
      const rect = getNodeRectRef.current(sourceId)
      if (!rect) return
      const start = getHandlePoint(rect, side)
      const end = screenToWorld(localPoint(event), options.viewportRef.current)
      setDraft({ source: sourceId, start, end })

      const move = (moveEvent: PointerEvent) => {
        setDraft((current) =>
          current
            ? {
                ...current,
                end: screenToWorld(localPoint(moveEvent), options.viewportRef.current),
              }
            : current,
        )
      }

      const up = (upEvent: PointerEvent) => {
        window.removeEventListener('pointermove', move)
        window.removeEventListener('pointerup', up)
        handlersRef.current = {}
        const current = draftRef.current
        setDraft(null)
        if (!current) return
        const element = document.elementFromPoint(upEvent.clientX, upEvent.clientY)
        const targetId = element?.closest('[data-cw-flow-node]')?.getAttribute('data-cw-flow-node')
        if (!targetId || targetId === current.source) return
        options.onConnect?.({ source: current.source, target: targetId })
      }

      handlersRef.current = { move, up }
      window.addEventListener('pointermove', move)
      window.addEventListener('pointerup', up)
    },
    [localPoint, options.onConnect, options.viewportRef],
  )

  useEffect(() => {
    const handlers = handlersRef.current
    return () => {
      if (handlers.move) window.removeEventListener('pointermove', handlers.move)
      if (handlers.up) window.removeEventListener('pointerup', handlers.up)
    }
  }, [])

  return { draft, draftPath, startConnect }
}
