import { createContext, useContext } from 'react'
import type { CwStackPopApi } from './types'

/** CwStackPanelInner → 步骤内容的注入上下文（对应 Vue provide/inject） */
export const CwStackPopContext = createContext<CwStackPopApi | null>(null)

/** 与 Vue `CW_STACK_POP_API_KEY` 对应的 React Context 句柄 */
export const CW_STACK_POP_API_KEY = CwStackPopContext

export function useCwStackPopContext(): CwStackPopApi | null {
  return useContext(CwStackPopContext)
}
