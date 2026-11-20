import type { CwTreeSize, CwTreeStyles } from './types'
import { treeBase } from './styles'
import type { CwTreeStylesOverride } from './cwTreeStylesOverride'
import { resolveCwTreeStyles as resolveCwTreeStylesBase } from '@zengchaowu/ui-shared/components/CwTree/resolveCwTreeStyles'

/**
 * 解析 CwTree 样式（React 适配：注入本端 treeBase 后交由 ui-shared 统一计算）
 */
export function resolveCwTreeStyles(
  size: CwTreeSize,
  override?: CwTreeStylesOverride,
): CwTreeStyles {
  return resolveCwTreeStylesBase(size, treeBase, override)
}
