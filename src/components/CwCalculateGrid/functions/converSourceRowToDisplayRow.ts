import type { DisplayRow, GlobalScope, ScopeDisplayRowMap, SourceRow } from '@zengchaowu/ui-shared/components/CwCalculateGrid/types'
import getKeyPathFromScopeAndKey from '@zengchaowu/ui-shared/components/CwCalculateGrid/functions/getKeyPathFromScopeAndKey'

export default (
  sourceRow: SourceRow,
  globalScope: GlobalScope,
  scopeDisplayRowMap: ScopeDisplayRowMap,
) => {
  const displayRow = {
    _data: sourceRow,
  } as unknown as DisplayRow
  for (const [key, _value] of Object.entries(sourceRow)) {
    displayRow[key] = undefined
  }
  Object.setPrototypeOf(displayRow, globalScope)
  const proxy = new Proxy(displayRow, {
    get(target, key, receiver) {
      if (typeof key === 'string') {
        // DryRun模式先从scope取值
        if (
          globalScope.__DRY_RUN__ === true &&
          globalScope.__DRY_RUN_SCOPE__ &&
          globalScope.__DRY_RUN_SCOPE__.has(
            getKeyPathFromScopeAndKey(target._data.id.value, key),
          )
        ) {
          return globalScope.__DRY_RUN_SCOPE__.get(
            getKeyPathFromScopeAndKey(target._data.id.value, key),
          )
        }

        if (globalScope.hasOwnProperty(key)) {
          return globalScope[key].result
        }
        if (scopeDisplayRowMap.has(key)) {
          return scopeDisplayRowMap.get(key)
        }
        if (!['_data'].includes(key)) {
          const field = target._data[key]
          if (field) {
            if (
              field.type === 'formula' &&
              globalScope.__CHAIN_CALL__ === true
            ) {
              return field.result
            } else {
              return field.value
            }
          }
        }
      }
      return Reflect.get(target, key, receiver)
    },
    set(target, key, value, receiver) {
      if (typeof key === 'string') {
        if (!['_data'].includes(key)) {
          const field = target._data[key]
          if (field) {
            if (field.type === 'formula') {
              if (globalScope.__CHAIN_CALL__ === true) {
                // 链调用，在DryRun模式下，将变更放到scope中
                if (
                  globalScope.__DRY_RUN__ === true &&
                  globalScope.__DRY_RUN_SCOPE__
                ) {
                  globalScope.__DRY_RUN_SCOPE__.set(
                    getKeyPathFromScopeAndKey(target._data.id.value, key),
                    value,
                  )
                } else {
                  if (field.result !== value) {
                    globalScope.__PATCH__?.push({
                      keyPath: getKeyPathFromScopeAndKey(
                        target._data.id.value,
                        key,
                      ),
                      patch: {
                        type: 'result',
                        from: field.result!,
                        to: value,
                      },
                    })
                    field.result = value
                  }
                }
              } else {
                // 非链调用，直接修改value值，不考虑display属性
                if (
                  globalScope.__DRY_RUN__ === true &&
                  globalScope.__DRY_RUN_SCOPE__
                ) {
                  globalScope.__DRY_RUN_SCOPE__.set(
                    getKeyPathFromScopeAndKey(target._data.id.value, key),
                    value,
                  )
                } else {
                  field._oldValue = field.value
                  field.value = value
                }
              }
            } else {
              // 非公式字段，在DryRun模式下，将变更放到scope中
              if (
                globalScope.__DRY_RUN__ === true &&
                globalScope.__DRY_RUN_SCOPE__
              ) {
                globalScope.__DRY_RUN_SCOPE__.set(
                  getKeyPathFromScopeAndKey(target._data.id.value, key),
                  value,
                )
              } else {
                // array 字段在计算场景下同样按字符串覆盖（与 Vue 实现一致）
                Object.assign(field, { value })
              }
            }
          }
        }
      }
      return Reflect.set(target, key, value, receiver)
    },
  })
  return proxy
}
