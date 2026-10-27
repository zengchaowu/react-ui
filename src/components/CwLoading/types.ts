import type { HTMLAttributes } from 'react'
import type { CwLoadingAppearance, CwLoadingTexts } from '@zengchaowu/ui-shared/components/CwLoading/types'

export interface CwLoadingProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'size' | 'type'> {
  type?: 'spinner' | 'dots' | 'bars'
  size?: 'small' | 'medium' | 'large'
  appearance?: CwLoadingAppearance
  /** 附加到 spinner 圆环（非 root） */
  spinnerClass?: string
  texts?: Partial<CwLoadingTexts>
}
