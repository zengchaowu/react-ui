import type { HTMLAttributes, ReactNode } from 'react'
import type { CwImgStyles } from '@zengchaowu/ui-shared/components/CwImg/types'
import type { CwIconEmbed } from '@zengchaowu/ui-shared/components/CwIcon/types'
import type { CwAvatarBaseProps } from '@zengchaowu/ui-shared/components/CwAvatar/types'

export interface CwAvatarProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'size'>,
    CwAvatarBaseProps {
  /** `badge` 具名插槽 */
  badge?: ReactNode
}

/** @internal 默认 img 样式 */
export type { CwImgStyles }
