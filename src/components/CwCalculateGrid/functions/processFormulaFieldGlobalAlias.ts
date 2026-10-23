import type { FormulaField, GlobalScope, KeyPathDepsMap } from '../types'
import updateKeyPathDeps from './updateKeyPathDeps'
import getKeyPathFromScopeAndKey from './getKeyPathFromScopeAndKey'
import { noteDependsOn } from './formulaScheduler'

export default (
  field: FormulaField,
  globalScope: GlobalScope,
  scope: string,
  key: string,
  keyPathDepsMap: KeyPathDepsMap,
) => {
  if (field.globalAlias) {
    globalScope[field.globalAlias] = field
    const keyPath = getKeyPathFromScopeAndKey(scope, key)
    updateKeyPathDeps(keyPathDepsMap, keyPath, new Set([field.globalAlias]))
    noteDependsOn(keyPathDepsMap, field.globalAlias, keyPath)
  }
}
