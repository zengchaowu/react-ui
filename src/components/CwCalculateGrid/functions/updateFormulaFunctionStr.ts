import type { KeyPathFuncStrMap } from '../types'
import getKeyPathFromScopeAndKey from './getKeyPathFromScopeAndKey'

/**
 * 更新公式对应的函数字符串。
 * @param scope 作用域id
 * @param key 字段名
 * @param formula 公式字符串
 * @param keyPathFuncStrMap 公式函数字符串Map
 */
export default function updateFormulaFunctionStr(
  scope: string,
  key: string,
  formula: string,
  keyPathFuncStrMap: KeyPathFuncStrMap,
) {
  const funcStr = `with(this){ ${key} = ${formula}; }`
  const keyPath = getKeyPathFromScopeAndKey(scope, key)
  keyPathFuncStrMap.set(keyPath, funcStr)
  // 可选：调试日志
  // console.log('updateFormulaFunctionStr', keyPathFuncStrMap)
}
