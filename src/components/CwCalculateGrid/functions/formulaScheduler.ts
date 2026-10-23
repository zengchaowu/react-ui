import type {
  GlobalScope,
  KeyPathDepsMap,
  KeyPathFuncStrMap,
  ScopeDisplayRowMap,
} from '../types'
import { sortFormulaKeyPaths } from './evaluateAllFormulas'
import getScopeFromKeypath from './getScopeFromKeypath'
import runFormulaKeyPath from './runFormulaKeyPath'
import { recordTopo } from './editTiming'

export interface CalculateIdleTiming {
  totalMs: number
  formulaCount: number
}

const IDLE_BUDGET_MS = 12
const schedulers = new WeakMap<KeyPathDepsMap, FormulaScheduler>()
const dependsOnByMap = new WeakMap<KeyPathDepsMap, Map<string, string[]>>()

export function noteDependsOn(map: KeyPathDepsMap, user: string, dep: string) {
  let reverse = dependsOnByMap.get(map)
  if (!reverse) {
    reverse = new Map()
    dependsOnByMap.set(map, reverse)
  }
  const list = reverse.get(user)
  if (list) {
    if (!list.includes(dep)) list.push(dep)
  } else {
    reverse.set(user, [dep])
  }
}

export function forgetDependsOn(map: KeyPathDepsMap, user: string, dep: string) {
  const list = dependsOnByMap.get(map)?.get(user)
  if (!list) return
  const index = list.indexOf(dep)
  if (index >= 0) list.splice(index, 1)
}

function dependsOnOf(map: KeyPathDepsMap, user: string) {
  return dependsOnByMap.get(map)?.get(user) ?? []
}

interface IdleTask {
  cancel: () => void
}

function requestIdle(callback: () => void): IdleTask {
  if (typeof window.requestIdleCallback === 'function') {
    const id = window.requestIdleCallback(() => callback(), { timeout: 250 })
    return { cancel: () => window.cancelIdleCallback(id) }
  }
  const id = window.setTimeout(callback, 16)
  return { cancel: () => window.clearTimeout(id) }
}

class FormulaScheduler {
  private readonly fresh = new Set<string>()
  private advance: (() => boolean) | null = null
  private order: string[] | null = null
  private orderIndex = new Map<string, number>()
  private cursor = 0
  private users = 0
  private stopped = false
  private pending: IdleTask | null = null
  private idleStartedAt = 0
  private idleCount = 0
  private idleNotified = false
  private onBatch: ((scopes: string[]) => void) | null = null
  private readonly scopeGetters = new Set<() => string[]>()

  constructor(
    private readonly keyPathDepsMap: KeyPathDepsMap,
    private readonly keyPathFuncStrMap: KeyPathFuncStrMap,
    private readonly scopeDisplayRowMap: ScopeDisplayRowMap,
    private readonly globalScope: GlobalScope,
    private readonly onIdle: (timing: CalculateIdleTiming) => void,
  ) {}

  retain() {
    this.users += 1
    this.stopped = false
    return () => {
      this.users -= 1
      if (this.users <= 0) this.stop()
    }
  }

  registerScopes(getScopes: () => string[]) {
    this.scopeGetters.add(getScopes)
    return () => {
      this.scopeGetters.delete(getScopes)
    }
  }

  setAdvance(advance: () => boolean) {
    const previous = this.advance
    if (!previous) {
      this.advance = advance
      return
    }
    this.advance = () => previous() || advance()
  }

  setOnBatch(listener: (scopes: string[]) => void) {
    this.onBatch = listener
  }

  ensureVisible() {
    const scopes: string[] = []
    for (const getScopes of this.scopeGetters) scopes.push(...getScopes())
    return this.ensureScopes(scopes)
  }

  /**
   * 只跑视口里依赖已经齐的公式。前面的链还没建好时不顺着依赖往回追。
   */
  ensureReady(scopes: Iterable<string>) {
    const candidates = new Set<string>()
    for (const scope of scopes) {
      const row = this.scopeDisplayRowMap.get(scope)
      if (!row) continue
      for (const [key, field] of Object.entries(row._data)) {
        if (field?.type === 'formula') candidates.add(`${scope}.${key}`)
      }
    }
    if (candidates.size === 0) return [] as string[]
    const ready = new Set<string>()
    const memo = new Map<string, boolean>()
    const visiting = new Set<string>()
    const canRun = (keyPath: string): boolean => {
      const cached = memo.get(keyPath)
      if (cached != null) return cached
      if (this.fresh.has(keyPath)) {
        memo.set(keyPath, true)
        return true
      }
      if (!candidates.has(keyPath)) {
        if (this.keyPathFuncStrMap.has(keyPath)) {
          memo.set(keyPath, false)
          return false
        }
        const readyValue = this.scopeDisplayRowMap.has(getScopeFromKeypath(keyPath))
        memo.set(keyPath, readyValue)
        return readyValue
      }
      if (visiting.has(keyPath)) return false
      visiting.add(keyPath)
      for (const dep of dependsOnOf(this.keyPathDepsMap, keyPath)) {
        if (!canRun(dep)) {
          visiting.delete(keyPath)
          memo.set(keyPath, false)
          return false
        }
      }
      visiting.delete(keyPath)
      memo.set(keyPath, true)
      return true
    }
    for (const keyPath of candidates) {
      if (!this.fresh.has(keyPath) && canRun(keyPath)) ready.add(keyPath)
    }
    if (ready.size === 0) return [] as string[]
    return this.runFormulas(this.sortNeeded(ready))
  }

  ensureScopes(scopes: Iterable<string>) {
    const needed = new Set<string>()
    this.collectFormulas(scopes, needed)
    if (needed.size === 0) return [] as string[]
    return this.runFormulas(this.sortNeeded(needed))
  }

  invalidate(keyPaths: readonly string[]) {
    let rewind = this.order ? this.order.length : 0
    for (const keyPath of keyPaths) {
      if (!this.keyPathFuncStrMap.has(keyPath)) continue
      this.fresh.delete(keyPath)
      const index = this.orderIndex.get(keyPath)
      if (index != null && index < rewind) rewind = index
    }
    if (this.order && rewind < this.cursor) this.cursor = rewind
    this.idleCount = 0
    this.idleStartedAt = performance.now()
    this.idleNotified = false
    this.schedule()
  }

  start() {
    this.idleCount = 0
    this.idleStartedAt = performance.now()
    this.idleNotified = false
    this.schedule()
  }

  private stop() {
    this.stopped = true
    this.pending?.cancel()
    this.pending = null
  }

  private schedule() {
    if (this.pending || this.stopped || this.users <= 0) return
    this.pending = requestIdle(() => {
      this.pending = null
      this.pump()
    })
  }

  private pump() {
    if (this.stopped || this.users <= 0) return
    if (this.advance) {
      const more = this.advance()
      if (more) {
        this.schedule()
        return
      }
      this.advance = null
    }
    if (!this.order) {
      this.order = sortFormulaKeyPaths(this.keyPathFuncStrMap, this.keyPathDepsMap)
      this.orderIndex = new Map(this.order.map((keyPath, index) => [keyPath, index]))
      this.cursor = 0
    }
    const budgetStarted = performance.now()
    const touched = new Set<string>()
    this.globalScope.__CHAIN_CALL__ = true
    while (this.cursor < this.order.length && performance.now() - budgetStarted < IDLE_BUDGET_MS) {
      const keyPath = this.order[this.cursor]
      this.cursor += 1
      if (this.fresh.has(keyPath)) continue
      if (
        !runFormulaKeyPath(
          keyPath,
          this.keyPathFuncStrMap,
          this.scopeDisplayRowMap,
          this.globalScope,
        )
      ) {
        continue
      }
      this.fresh.add(keyPath)
      this.idleCount += 1
      touched.add(getScopeFromKeypath(keyPath))
    }
    this.globalScope.__CHAIN_CALL__ = false
    this.publish([...touched])
    if (this.cursor < this.order.length) {
      this.schedule()
      return
    }
    if (this.idleNotified) return
    this.idleNotified = true
    this.onIdle({
      totalMs: Math.round((performance.now() - this.idleStartedAt) * 10) / 10,
      formulaCount: this.idleCount,
    })
  }

  private runFormulas(sorted: string[]) {
    const touched = new Set<string>()
    this.globalScope.__CHAIN_CALL__ = true
    if (!this.globalScope.__PATCH__) this.globalScope.__PATCH__ = []
    for (const keyPath of sorted) {
      if (this.fresh.has(keyPath) || !this.depsSatisfied(keyPath)) continue
      if (
        !runFormulaKeyPath(
          keyPath,
          this.keyPathFuncStrMap,
          this.scopeDisplayRowMap,
          this.globalScope,
        )
      ) {
        continue
      }
      this.fresh.add(keyPath)
      this.idleCount += 1
      touched.add(getScopeFromKeypath(keyPath))
    }
    this.globalScope.__CHAIN_CALL__ = false
    const scopes = [...touched]
    this.publish(scopes)
    return scopes
  }

  private publish(scopes: string[]) {
    if (scopes.length > 0) this.onBatch?.(scopes)
  }

  private depsSatisfied(keyPath: string) {
    for (const dep of dependsOnOf(this.keyPathDepsMap, keyPath)) {
      if (this.fresh.has(dep)) continue
      if (this.keyPathFuncStrMap.has(dep)) return false
      if (!this.scopeDisplayRowMap.has(getScopeFromKeypath(dep))) return false
    }
    return true
  }

  private collectFormulas(scopes: Iterable<string>, needed: Set<string>) {
    const stack: string[] = []
    for (const scope of scopes) {
      const row = this.scopeDisplayRowMap.get(scope)
      if (!row) continue
      for (const [key, field] of Object.entries(row._data)) {
        if (field?.type === 'formula') stack.push(`${scope}.${key}`)
      }
    }
    while (stack.length > 0) {
      const keyPath = stack.pop() as string
      if (needed.has(keyPath) || !this.keyPathFuncStrMap.has(keyPath)) continue
      needed.add(keyPath)
      for (const dep of dependsOnOf(this.keyPathDepsMap, keyPath)) {
        if (!this.keyPathFuncStrMap.has(dep) || this.fresh.has(dep)) continue
        stack.push(dep)
      }
    }
  }

  private sortNeeded(needed: Set<string>) {
    const started = performance.now()
    const indegree = new Map<string, number>()
    for (const keyPath of needed) indegree.set(keyPath, 0)
    for (const keyPath of needed) {
      for (const dep of dependsOnOf(this.keyPathDepsMap, keyPath)) {
        if (!needed.has(dep) || !this.keyPathFuncStrMap.has(dep)) continue
        indegree.set(keyPath, (indegree.get(keyPath) ?? 0) + 1)
      }
    }
    const queue: string[] = []
    for (const [keyPath, degree] of indegree) {
      if (degree === 0) queue.push(keyPath)
    }
    const sorted: string[] = []
    const seen = new Set<string>()
    let head = 0
    while (head < queue.length) {
      const keyPath = queue[head]
      head += 1
      if (seen.has(keyPath)) continue
      seen.add(keyPath)
      sorted.push(keyPath)
      const users = this.keyPathDepsMap.get(keyPath)
      if (!users) continue
      for (const user of users) {
        if (!needed.has(user) || !this.keyPathFuncStrMap.has(user)) continue
        const next = (indegree.get(user) ?? 1) - 1
        indegree.set(user, next)
        if (next === 0) queue.push(user)
      }
    }
    for (const keyPath of needed) {
      if (!seen.has(keyPath)) sorted.push(keyPath)
    }
    recordTopo(performance.now() - started)
    return sorted
  }
}

export function retainFormulaScheduler(
  keyPathDepsMap: KeyPathDepsMap,
  keyPathFuncStrMap: KeyPathFuncStrMap,
  scopeDisplayRowMap: ScopeDisplayRowMap,
  globalScope: GlobalScope,
  onIdle: (timing: CalculateIdleTiming) => void,
) {
  let scheduler = schedulers.get(keyPathDepsMap)
  if (!scheduler) {
    scheduler = new FormulaScheduler(
      keyPathDepsMap,
      keyPathFuncStrMap,
      scopeDisplayRowMap,
      globalScope,
      onIdle,
    )
    schedulers.set(keyPathDepsMap, scheduler)
  }
  const release = scheduler.retain()
  return { scheduler, release }
}
