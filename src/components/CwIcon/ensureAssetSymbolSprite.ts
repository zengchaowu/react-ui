/**
 * 注入 asset Symbol 精灵（与 iconfont.cn Symbol / asset.js 同思路）。
 * 由 sync-asset 从发布的 asset.js 抽出 asset.symbol.svg。
 */
import sprite from '../../assets/asset/asset.symbol.svg?raw'

const SPRITE_ID = 'cw_asset_symbol_sprite'

export function ensureAssetSymbolSprite(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(SPRITE_ID)) return
  if (!sprite?.includes('<svg')) return

  const host = document.createElement('div')
  host.innerHTML = sprite
  const svg = host.querySelector('svg')
  if (!svg) return

  svg.id = SPRITE_ID
  svg.setAttribute('aria-hidden', 'true')
  svg.style.position = 'absolute'
  svg.style.width = '0'
  svg.style.height = '0'
  svg.style.overflow = 'hidden'

  const root = document.body ?? document.documentElement
  root.insertBefore(svg, root.firstChild)
}
