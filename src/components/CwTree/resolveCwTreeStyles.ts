import type { CwTreeStyles, CwTreeSize } from './types'
import { treeBase } from './styles'
import type { CwTreeStylesOverride } from './cwTreeStylesOverride'

export function resolveCwTreeStyles(
  size: CwTreeSize,
  override?: CwTreeStylesOverride,
): CwTreeStyles {
  const sizeClass = {
    small: treeBase.sizeSmall,
    medium: treeBase.sizeMedium,
    large: treeBase.sizeLarge,
  }[size]

  const base = { ...treeBase, ...(override ?? {}) }
  return {
    ...base,
    nodeContent: `${base.nodeContent} ${sizeClass}`.trim(),
  }
}
