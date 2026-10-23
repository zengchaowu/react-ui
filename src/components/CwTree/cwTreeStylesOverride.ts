import { createContext, useContext } from 'react'
import type { CwTreeStyles } from './types'

/** 库内组件（如 CwNavigationTree）注入的树节点样式覆盖，不对业务开放 */
export type CwTreeStylesOverride = Partial<CwTreeStyles>

export const CW_TREE_STYLES_OVERRIDE_CONTEXT =
  createContext<CwTreeStylesOverride | undefined>(undefined)

export function useCwTreeStylesOverride(): CwTreeStylesOverride | undefined {
  return useContext(CW_TREE_STYLES_OVERRIDE_CONTEXT)
}
