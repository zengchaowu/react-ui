import { createContext } from 'react'

export type CwTreeReorderPosition = 'before' | 'after' | 'inside'

export type CwTreeReorderDropTarget = {
  key: string | number
  position: CwTreeReorderPosition
}

export type CwTreeReorderContext = {
  draggingKey: string | number | null
  dropTarget: CwTreeReorderDropTarget | null
  startDrag: (key: string | number) => void
  endDrag: () => void
  setDropTarget: (key: string | number, position: CwTreeReorderPosition) => void
  clearDropTarget: () => void
}

export const CW_TREE_REORDER_CONTEXT =
  createContext<CwTreeReorderContext | null>(null)
