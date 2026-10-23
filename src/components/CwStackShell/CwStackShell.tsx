import { useCallback, useEffect, useMemo, useRef, type HTMLAttributes } from 'react'
import { CwStack } from '../CwStack'
import type { CwStackComponent, CwStackHandle } from '../CwStack'
import type { CwStackShellProps } from './types'
import { stackShellBase } from './styles'

export interface CwStackShellComponentProps
  extends CwStackShellProps,
    Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'className'> {
  className?: string
}

export function CwStackShell({
  stack,
  slideTransition = true,
  contentInset = false,
  listSlot,
  detailSlot,
  className,
  ...rest
}: CwStackShellComponentProps) {
  const stackRef = useRef<CwStackHandle | null>(null)
  const initializedRef = useRef(false)

  const stackModeRef = useRef(stack)
  stackModeRef.current = stack

  const listSlotRef = useRef(listSlot)
  listSlotRef.current = listSlot
  const detailSlotRef = useRef(detailSlot)
  detailSlotRef.current = detailSlot

  const layerClass = contentInset ? stackShellBase.layerInset : stackShellBase.layer
  const layerClassRef = useRef(layerClass)
  layerClassRef.current = layerClass

  const ListView = useMemo<CwStackComponent>(() => {
    function CwStackShellListView() {
      return <div className={layerClassRef.current}>{listSlotRef.current}</div>
    }
    return CwStackShellListView
  }, [])

  const DetailView = useMemo<CwStackComponent>(() => {
    function CwStackShellDetailView() {
      return <div className={layerClassRef.current}>{detailSlotRef.current}</div>
    }
    return CwStackShellDetailView
  }, [])

  const syncStackState = useCallback(() => {
    const s = stackRef.current
    if (!s) return
    if (!initializedRef.current) {
      s.beginSilentStackBatch()
      try {
        s.clear()
        s.push(ListView)
        if (stackModeRef.current === 'detail') s.push(DetailView)
      } finally {
        // 对应 Vue nextTick：让本批 push 不播转场
        queueMicrotask(() => s.endSilentStackBatch())
      }
      initializedRef.current = true
      return
    }
    if (stackModeRef.current === 'detail') {
      if (s.size() < 2) s.push(DetailView)
      return
    }
    while (s.size() > 1) s.pop()
  }, [DetailView, ListView])

  useEffect(() => {
    syncStackState()
  }, [stack, syncStackState])

  return (
    <div {...rest} className={[stackShellBase.root, className].filter(Boolean).join(' ')}>
      <CwStack
        ref={stackRef}
        slideTransition={slideTransition}
        opaqueLayerBackground={!contentInset}
        className={stackShellBase.stackRoot}
      />
    </div>
  )
}

export default CwStackShell
