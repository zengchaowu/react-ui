/**
 * 注入 iconfont Symbol 精灵（与 iconfont.cn Symbol / iconfont.js 同思路）。
 */
import sprite from '../../assets/iconfont/iconfont.symbol.svg?raw'

const SPRITE_ID = 'cw_iconfont_symbol_sprite'

export function ensureIconfontSymbolSprite(): void {
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
