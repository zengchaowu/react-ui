import { createContext, useContext } from 'react'

/** CwRow → CwCol：列间距（左右 padding 各 gutter/2） */
export const CwRowGutterContext = createContext<number | undefined>(undefined)

/** CwGrid → Row/Col：实测列数 + gutter（Row 用 column-gap，Col 用 calc 列宽） */
export interface CwGridMeasuredLayout {
  columns: number
  gutter: number
}

export const CwGridMeasuredLayoutContext = createContext<
  CwGridMeasuredLayout | undefined
>(undefined)

export function useCwRowGutter(): number | undefined {
  return useContext(CwRowGutterContext)
}

export function useCwGridMeasuredLayout(): CwGridMeasuredLayout | undefined {
  return useContext(CwGridMeasuredLayoutContext)
}

/** Vue InjectionKey 兼容别名（React 侧直接当 Context 使用） */
export const cwRowGutterKey = CwRowGutterContext
/** Vue InjectionKey 兼容别名（React 侧直接当 Context 使用） */
export const cwGridMeasuredLayoutKey = CwGridMeasuredLayoutContext
