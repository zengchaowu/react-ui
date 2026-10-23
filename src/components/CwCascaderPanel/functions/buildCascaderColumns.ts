import type {
  CwCascaderPanelOption,
  CwCascaderPanelValue,
} from '../types'

/** 按选中路径展开多列选项 */
export function buildCascaderColumns(
  options: CwCascaderPanelOption[] | undefined,
  path: CwCascaderPanelValue[] | undefined,
): CwCascaderPanelOption[][] {
  const result: CwCascaderPanelOption[][] = []
  let levelOptions: CwCascaderPanelOption[] = options || []
  result.push(levelOptions)
  const values = path || []
  for (let i = 0; i < values.length; i++) {
    const value = values[i]
    const node = levelOptions.find((o) => o.value === value)
    const children = node?.children || []
    if (children.length > 0) {
      result.push(children)
      levelOptions = children
    } else {
      break
    }
  }
  return result
}
