import type { HTMLAttributes } from 'react'
import type { CwSlotTexts } from '@zengchaowu/ui-shared/components/CwSlot/types'

export interface CwSlotProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** 块级演示：在父容器内居中显示固定 24×24 占位 */
  block?: boolean
  texts?: Partial<CwSlotTexts>
}

/** Vue 事件签名兼容导出（React 侧以同名 onXxx 回调使用） */
export interface CwSlotEmits {
  // 纯展示占位，无事件
}
