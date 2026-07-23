#!/usr/bin/env node
/**
 * 从 vue-ui 同步组件目录骨架：types/styles/texts/materialMeta + React stub。
 * 已实现组件（IMPLEMENTATIONS）不会被覆盖 .tsx / stories。
 */
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  copyFileSync,
  writeFileSync,
  statSync,
} from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const reactRoot = join(__dirname, '..')
const vueRoot = join(reactRoot, '..', 'vue-ui')
const vueComponents = join(vueRoot, 'src/components')
const reactComponents = join(reactRoot, 'src/components')

/** 已手写实现的组件：跳过覆盖 tsx / stories */
const IMPLEMENTATIONS = new Set(['CwButton', 'CwIcon'])

const COPY_FILES = [
  'types.ts',
  'styles.ts',
  'texts.ts',
  'materialMeta.ts',
]

function listVueComponents() {
  return readdirSync(vueComponents, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .filter((name) => /^(Cw|Tp|Page)/.test(name))
    .sort()
}

function ensureDir(dir) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
}

function stubTsx(name) {
  return `import type { ReactNode } from 'react'

export interface ${name}Props {
  children?: ReactNode
  className?: string
}

/**
 * Scaffold stub — port from vue-ui \`${name}\`.
 * Directory/types/styles aligned; implement behavior in a follow-up batch.
 */
export function ${name}({ children, className, ...rest }: ${name}Props & Record<string, unknown>) {
  return (
    <div data-cw="${name}" className={className} {...rest}>
      {children}
    </div>
  )
}

export default ${name}
`
}

function stubStories(name) {
  return `import type { Meta, StoryObj } from '@storybook/react'
import { ${name} } from './${name}'

const meta: Meta<typeof ${name}> = {
  title: '${name.startsWith('Tp') ? 'Tp' : name.startsWith('Page') ? 'Page' : 'Cw'}/${name}',
  component: ${name},
}

export default meta
type Story = StoryObj<typeof ${name}>

export const Default: Story = {
  args: {
    children: '${name}',
  },
}
`
}

function indexTs(name) {
  return `export { default as ${name} } from './${name}'
export * from './types'
`
}

function copyIfExists(src, dest) {
  if (!existsSync(src)) return false
  copyFileSync(src, dest)
  return true
}

function scaffoldOne(name) {
  const srcDir = join(vueComponents, name)
  const destDir = join(reactComponents, name)
  ensureDir(destDir)

  for (const file of COPY_FILES) {
    copyIfExists(join(srcDir, file), join(destDir, file))
  }

  // Ensure types.ts exists for stubs that don't have one yet
  const typesPath = join(destDir, 'types.ts')
  if (!existsSync(typesPath)) {
    writeFileSync(
      typesPath,
      `export interface ${name}Props {}\nexport interface ${name}Texts {}\n`,
      'utf8',
    )
  }

  const isImpl = IMPLEMENTATIONS.has(name)
  const tsxPath = join(destDir, `${name}.tsx`)
  const storiesPath = join(destDir, `${name}.stories.tsx`)
  const indexPath = join(destDir, 'index.ts')

  if (!isImpl) {
    writeFileSync(tsxPath, stubTsx(name), 'utf8')
    writeFileSync(storiesPath, stubStories(name), 'utf8')
  }

  if (!existsSync(indexPath) || !isImpl) {
    writeFileSync(indexPath, indexTs(name), 'utf8')
  }
}

function writeMainIndex(names) {
  const cwAndPage = names.filter((n) => n.startsWith('Cw') || n.startsWith('Page'))
  const lines = [
    `export type { CwComponentMaterialMeta, CwComponentMaterialType } from './component-material'`,
    '',
    '// ==================== Cw / Page（主入口；Tp 仅子路径） ====================',
    ...cwAndPage.map((n) => `export * from './components/${n}'`),
    '',
    '// ==================== Utils ====================',
    `export * from './utils/updateBrandColors'`,
    `export * from './utils/cwRemSize'`,
    `export {`,
    `  dispatchAppThemeChanged,`,
    `  isFinePointerPrimaryInput,`,
    `  readAppTheme,`,
    `  useAppThemeTick,`,
    `  useDelayedTrue,`,
    `  ZCW_APP_THEME_CHANGED_EVENT,`,
    `} from './utils/appThemeDom'`,
    `export {`,
    `  FORM_CONTROL_FOCUS_CLASS,`,
    `  FOCUS_VISIBLE_INTERACTIVE_CLASS,`,
    `  INTERACTIVE_FOCUS_CLASS,`,
    `  NATIVE_FOCUS_CLASS,`,
    `  withInteractiveFocus,`,
    `} from './utils/focusStyles'`,
    `export {`,
    `  CwPublicAssetBaseUrlContext,`,
    `  CwPublicAssetBaseUrlKey,`,
    `  resolveDefaultPublicAssetBaseUrl,`,
    `  usePublicAssetBaseUrl,`,
    `} from './utils/publicAssetBaseUrl'`,
    `export {`,
    `  APP_CHROME_SAFE_BOTTOM_CLASS,`,
    `  APP_CHROME_SAFE_TOP_CLASS,`,
    `  APP_OVERLAY_SAFE_BOTTOM_CLASS,`,
    `  APP_OVERLAY_SAFE_FOOTER_BOTTOM_CLASS,`,
    `  APP_OVERLAY_SAFE_LEFT_CLASS,`,
    `  APP_OVERLAY_SAFE_RIGHT_CLASS,`,
    `  APP_OVERLAY_SAFE_TOP_CLASS,`,
    `  APP_PAGE_CHROME_SAFE_BOTTOM_CLASS,`,
    `  APP_PAGE_CHROME_SAFE_TOP_CLASS,`,
    `  APP_PAGE_FOOTER_SAFE_BOTTOM_CLASS,`,
    `  APP_PAGE_SCROLL_SAFE_BOTTOM_CLASS,`,
    `  APP_TABBAR_SAFE_BOTTOM_CLASS,`,
    `} from './constants/appSafeAreaClasses'`,
    `export {`,
    `  CW_OVERLAY_MODAL_Z_CLASS,`,
    `  CW_OVERLAY_TOAST_Z_CLASS,`,
    `  bringOverlayHostToFront,`,
    `  scheduleBringOverlayHostToFront,`,
    `  CW_OVERLAY_LAYER_ATTR,`,
    `  CW_OVERLAY_LAYER_ID_ATTR,`,
    `  CW_OVERLAY_ACTIVE_ATTR,`,
    `} from './constants/cwOverlayStack'`,
    `export {`,
    `  acquireOverlayBodyScrollLock,`,
    `  releaseOverlayBodyScrollLock,`,
    `} from './constants/overlayBodyScrollLock'`,
    '',
  ]
  writeFileSync(join(reactRoot, 'src/index.ts'), `${lines.join('\n')}\n`, 'utf8')
}

function writeTpEntries(names) {
  const tp = names.filter((n) => n.startsWith('Tp'))
  const body = tp.map((n) => `export * from './components/${n}'`).join('\n')
  writeFileSync(
    join(reactRoot, 'src/tp-entries.ts'),
    `/** Tp 子路径聚合入口（不进主 barrel） */\n${body}\n`,
    'utf8',
  )
}

if (!existsSync(vueComponents)) {
  console.error('[scaffold] vue-ui components not found:', vueComponents)
  process.exit(1)
}

ensureDir(reactComponents)
const names = listVueComponents()
for (const name of names) {
  scaffoldOne(name)
}
writeMainIndex(names)
writeTpEntries(names)
console.log(`[scaffold] ${names.length} components synced from vue-ui`)
