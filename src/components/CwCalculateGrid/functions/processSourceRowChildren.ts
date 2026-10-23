import type {
  DisplayRow,
  KeyPathDepsMap,
  KeyPathFuncStrMap,
  ScopeDisplayRowMap,
  SourceRow,
} from '../types'
import getKeyPathFromScopeAndKey from './getKeyPathFromScopeAndKey'
import processFormulaDeps from './processFormulaDeps'

export default (
  sourceRow: SourceRow,
  scopeDisplayRowMap: ScopeDisplayRowMap,
  keyPathDepsMap: KeyPathDepsMap,
  keyPathFuncStrMap: KeyPathFuncStrMap,
) => {
  if (sourceRow.children && sourceRow.children.value.length > 0) {
    const displayRowChildren: DisplayRow[] = []
    for (const scope of sourceRow.children.value) {
      const displayRow = scopeDisplayRowMap.get(scope)
      if (displayRow) {
        displayRowChildren.push(displayRow)
      }
    }
    for (const [key, field] of Object.entries(sourceRow)) {
      if (field?.type === 'formula') {
        field.defaultValue = displayRowChildren
          .map(item =>
            item.id ? getKeyPathFromScopeAndKey(item.id, key) : undefined,
          )
          .filter(item => item !== undefined)
          .join('+')
        processFormulaDeps(
          key,
          field,
          keyPathDepsMap,
          keyPathFuncStrMap,
          sourceRow,
        )
      }
    }
  }
}
