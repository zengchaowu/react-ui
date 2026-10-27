import type { MouseEvent, MouseEventHandler, ReactNode } from 'react'

import type { CwCellAppearance, CwCellGroupAppearance } from '@zengchaowu/ui-shared/components/CwCell/types'
import type { CwCellTexts } from '@zengchaowu/ui-shared/components/CwCell/types'

export interface CwCellProps {
  title?: string
  subtitle?: string
  showArrow?: boolean
  showUnderline?: boolean
  /**
   * 下划线对齐方式
   * - 'full': 整个宽度
   * - 'indent': 与标题左对齐
   */
  underlineAlign?: 'full' | 'indent'
  clickable?: boolean
  /** `rightSlot`：`cell` 与整行垂直居中；`title` 与标题同行 */
  rightPlacement?: 'cell' | 'title'
  /** 场景外观；布局用原生 class */
  appearance?: CwCellAppearance
  texts?: Partial<CwCellTexts>
  /** Vue `#content` 插槽 */
  contentSlot?: ReactNode
  /** Vue `#title` 插槽 */
  titleSlot?: ReactNode
  /** Vue `#title-right` 插槽 */
  titleRightSlot?: ReactNode
  /** Vue `#right` 插槽 */
  rightSlot?: ReactNode
  /** Vue `#subtitle` 插槽 */
  subtitleSlot?: ReactNode
  /** Vue `click` 事件 */
  onClick?: MouseEventHandler<HTMLDivElement>
}

export interface CwCellEmits {
  onClick?: (event: MouseEvent<HTMLDivElement>) => void
}

export interface CwCellGroupProps {
  /** 场景外观；布局用原生 class */
  appearance?: CwCellGroupAppearance
  /**
   * 注入子 Cell 的外观；默认与 `appearance` 同名（`default` 组不注入）
   * 可用 `form` 等仅存在于 Cell 的变体
   */
  cellAppearance?: CwCellAppearance
  cellTexts?: Partial<CwCellTexts>
  underlineAlign?: 'full' | 'indent'
}

export interface CwCellGroupEmits {
  // CwCellGroup本身不发出事件
}
