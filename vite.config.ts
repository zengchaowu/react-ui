import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import react from '@vitejs/plugin-react'

const pkgRoot = resolve(__dirname)
const srcRoot = resolve(pkgRoot, 'src')

const pkg = JSON.parse(readFileSync(resolve(pkgRoot, 'package.json'), 'utf8'))
const packageDeps = new Set([
  ...Object.keys(pkg.dependencies ?? {}),
  ...Object.keys(pkg.peerDependencies ?? {}),
  ...Object.keys(pkg.optionalDependencies ?? {}),
])

const LIB_BUILD_MODES = new Set(['lib', 'lib-fast'])
const LIB_ENTRIES = ['index', 'style', 'tp-entries'] as const

const LIB_ICONFONT_ROOT_ASSETS = [
  'assets/iconfont/iconfont.js',
  'assets/iconfont/iconfont.symbol.svg',
  'assets/iconfont/iconfont.css',
  'assets/iconfont/iconfont.woff2',
  'assets/iconfont/iconfont.woff',
  'assets/iconfont/iconfont.ttf',
] as const

function removeFilesBySuffix(dir: string, suffix: string): void {
  if (!existsSync(dir)) return
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = resolve(dir, entry.name)
    if (entry.isDirectory()) {
      removeFilesBySuffix(fullPath, suffix)
    } else if (entry.name.endsWith(suffix)) {
      rmSync(fullPath)
    }
  }
}

function libAssetPostProcess() {
  return {
    name: 'lib-asset-post-process',
    apply: 'build' as const,
    closeBundle: {
      order: 'post' as const,
      handler() {
        mkdirSync(resolve(pkgRoot, 'dist'), { recursive: true })
        for (const rel of LIB_ICONFONT_ROOT_ASSETS) {
          const src = resolve(srcRoot, rel)
          if (!existsSync(src)) {
            console.warn(`[lib-asset-post-process] skip missing ${rel}`)
            continue
          }
          const base = rel.split('/').pop()
          if (!base) continue
          try {
            copyFileSync(src, resolve(pkgRoot, 'dist', base))
          } catch (err) {
            console.warn(`[lib-asset-post-process] copy failed ${rel}:`, err)
          }
        }
        const cssMap: Record<string, string> = {
          'assets/tailwind.css': 'tailwind.css',
          'assets/hairline.css': 'hairline.css',
          'assets/tokens/tokens.css': 'tokens.css',
          'assets/iconfont/iconfont.css': 'iconfont.css',
        }
        for (const [rel, out] of Object.entries(cssMap)) {
          const src = resolve(srcRoot, rel)
          if (!existsSync(src)) {
            console.warn(`[lib-asset-post-process] skip missing ${rel}`)
            continue
          }
          try {
            copyFileSync(src, resolve(pkgRoot, 'dist', out))
          } catch (err) {
            console.warn(`[lib-asset-post-process] copy failed ${rel}:`, err)
          }
        }
        removeFilesBySuffix(resolve(pkgRoot, 'dist'), '.d.ts.map')
      },
    },
  }
}

function isExternal(id: string) {
  if (id.startsWith('\0') || id.startsWith(srcRoot)) return false
  if (id.includes('node_modules')) return true
  for (const dep of packageDeps) {
    if (id === dep || id.startsWith(`${dep}/`)) return true
  }
  return false
}

export default defineConfig(({ mode }) => {
  const isLibBuild = LIB_BUILD_MODES.has(mode)
  const skipDts = mode === 'lib-fast'

  return {
    plugins: [
      react(),
      ...(isLibBuild
        ? [
            ...(skipDts
              ? []
              : [
                  dts({
                    entryRoot: 'src',
                    outDir: 'dist',
                    insertTypesEntry: true,
                    declarationMap: false,
                    compilerOptions: {
                      declarationMap: false,
                    },
                    include: [
                      'src/index.ts',
                      'src/style.ts',
                      'src/tp-entries.ts',
                      'src/component-material/**/*',
                      'src/components/**/*',
                      'src/hooks/**/*',
                      'src/constants/**/*',
                      'src/lib/**/*',
                      'src/utils/**/*',
                      'src/assets/tokens/**/*.ts',
                    ],
                    exclude: [
                      'src/**/*.stories.tsx',
                      'src/**/*.stories.ts',
                      'src/**/materialMeta.ts',
                    ],
                  }),
                ]),
            libAssetPostProcess(),
          ]
        : []),
    ],
    publicDir: isLibBuild ? false : 'public',
    build: {
      cssCodeSplit: true,
      minify: isLibBuild ? false : undefined,
      lib: {
        entry: {
          index: resolve(srcRoot, 'index.ts'),
          style: resolve(srcRoot, 'style.ts'),
          'tp-entries': resolve(srcRoot, 'tp-entries.ts'),
        },
        formats: ['es'],
      },
      rollupOptions: {
        preserveEntrySignatures: 'strict',
        external: isExternal,
        output: {
          preserveModules: true,
          preserveModulesRoot: srcRoot,
          entryFileNames: (chunkInfo) => {
            const name = chunkInfo.name ?? 'index'
            if (LIB_ENTRIES.includes(name as (typeof LIB_ENTRIES)[number])) {
              return `${name}.js`
            }
            return '[name].js'
          },
          assetFileNames: (assetInfo) => {
            const name = assetInfo.name ?? 'asset'
            if (name.endsWith('.css')) {
              if (name.includes('tailwind')) return 'tailwind.css'
              if (name.includes('tokens')) return 'tokens.css'
              if (name.includes('hairline')) return 'hairline.css'
              if (name.includes('iconfont')) return 'iconfont.css'
              return `${name.replace(/^assets\//, '').replace(/\.css$/, '')}.css`
            }
            return 'assets/[name][extname]'
          },
        },
      },
    },
  }
})
