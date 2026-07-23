#!/usr/bin/env node
/**
 * 对比 vue-ui 与 react-ui 的 src/components 目录差集。
 * 缺或多即 exit 1。
 */
import { readdirSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const reactRoot = join(__dirname, '..')
const vueRoot = join(reactRoot, '..', 'vue-ui')

function listComponents(root) {
  const dir = join(root, 'src/components')
  if (!existsSync(dir)) return []
  return readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .filter((name) => /^(Cw|Tp|Page)/.test(name))
    .sort()
}

const vueNames = new Set(listComponents(vueRoot))
const reactNames = new Set(listComponents(reactRoot))

const missing = [...vueNames].filter((n) => !reactNames.has(n))
const extra = [...reactNames].filter((n) => !vueNames.has(n))

console.log(`[check:component-parity] vue=${vueNames.size} react=${reactNames.size}`)
if (missing.length) {
  console.error('Missing in react-ui:', missing.join(', '))
}
if (extra.length) {
  console.error('Extra in react-ui:', extra.join(', '))
}

if (missing.length || extra.length) {
  process.exit(1)
}
console.log('[check:component-parity] OK — directory sets match')
