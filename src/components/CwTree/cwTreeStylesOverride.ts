import { createContext, useContext } from 'react'
import type { CwTreeStylesOverride } from '@zengchaowu/ui-shared/components/CwTree/types'

export type { CwTreeStylesOverride }

/** 库内组件（如 CwNavigationTree）注入的树节点样式覆盖，不对业务开放 */
export const CW_TREE_STYLES_OVERRIDE_CONTEXT =
  createContext<CwTreeStylesOverride | undefined>(undefined)

export function useCwTreeStylesOverride(): CwTreeStylesOverride | undefined {
  return useContext(CW_TREE_STYLES_OVERRIDE_CONTEXT)
}
