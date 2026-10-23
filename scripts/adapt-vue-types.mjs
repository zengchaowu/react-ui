#!/usr/bin/env node
/**
 * 将从 vue-ui 复制的 types 中的 Vue 类型映射为 React 等价类型。
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const srcRoot = join(__dirname, '..', 'src')

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name)
    const st = statSync(full)
    if (st.isDirectory()) walk(full, out)
    else if (/\.(ts|tsx)$/.test(name) && !name.includes('.stories.')) out.push(full)
  }
  return out
}

function adaptFile(file) {
  let code = readFileSync(file, 'utf8')
  if (!/\bvue\b|\.vue['"]/.test(code)) return false
  const before = code

  // import('vue').Ref<...> 跨行泛型（含 `=>` 箭头，单行正则会在 `>` 处截断）
  code = code.replace(
    /import\(['"]vue['"]\)\.(?:Ref|ComputedRef)<\s*\n([\s\S]*?)\n\s*>/g,
    '$1',
  )

  // import('vue').ComputedRef<T> / Ref<T> / InjectionKey<T>
  code = code.replace(/import\(['"]vue['"]\)\.ComputedRef<([^>]+)>/g, '$1')
  code = code.replace(/import\(['"]vue['"]\)\.Ref<([^>]+)>/g, '$1')
  code = code.replace(/import\(['"]vue['"]\)\.InjectionKey<([^>]+)>/g, 'unknown /* InjectionKey<$1> */')
  code = code.replace(/import\(['"]vue['"]\)\.Component\b/g, 'import("react").ComponentType<any>')
  code = code.replace(/import\(['"]vue['"]\)\.VNode\b/g, 'import("react").ReactNode')
  code = code.replace(/import\(['"]vue['"]\)\.MaybeRef<([^>]+)>/g, '$1')

  // strip `import type { ... } from 'vue'`
  code = code.replace(/import\s+type\s+\{[^}]+\}\s+from\s+['"]vue['"]\s*;?\s*/g, '')
  code = code.replace(/import\s+\{[^}]+\}\s+from\s+['"]vue['"]\s*;?\s*/g, '')

  // bare Vue type names → React
  code = code.replace(/\bVNodeChild\b/g, 'ReactNode')
  code = code.replace(/\bVNode\b/g, 'ReactNode')
  code = code.replace(/\bMaybeRef<([^>]+)>/g, '$1')
  code = code.replace(/\bComputedRef<([^>]+)>/g, '$1')
  code = code.replace(/\bRef<([^>]+)>/g, 'import("react").MutableRefObject<$1>')
  code = code.replace(/\bComponent\b(?!\s*Type)(?!\s*<)/g, 'import("react").ComponentType<any>')
  code = code.replace(/\bas\s+InjectionKey<[^>]+>/g, '')
  code = code.replace(/\bInjectionKey<([^>]+)>/g, 'unknown')

  // Remove .vue imports
  code = code.replace(/import\s+[^;]+from\s+['"][^'"]+\.vue['"]\s*;?\s*/g, '')

  if (
    /\bReactNode\b|\bComponentType\b/.test(code) &&
    !/from ['"]react['"]/.test(code) &&
    !/import\(['"]react['"]\)/.test(code)
  ) {
    code = `import type { ComponentType, ReactNode } from 'react'\n${code}`
  }

  if (code !== before) {
    writeFileSync(file, code, 'utf8')
    return true
  }
  return false
}

let n = 0
for (const file of walk(srcRoot)) {
  if (adaptFile(file)) n++
}
console.log(`[adapt-vue-types] adapted ${n} files`)
