/**
 * 注入 asset Symbol 精灵（与 iconfont.cn Symbol / asset.js 同思路）。
 * 由 sync-asset 从发布的 asset.js 抽出 asset.symbol.svg；纯 DOM 逻辑在 ui-shared。
 */
import sprite from '../../assets/asset/asset.symbol.svg?raw'
import { ensureAssetSymbolSpriteFrom } from '@zengchaowu/ui-shared/components/CwIcon/ensureAssetSymbolSprite'

export function ensureAssetSymbolSprite(): void {
  ensureAssetSymbolSpriteFrom(sprite)
}
