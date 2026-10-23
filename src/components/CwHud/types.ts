import type { CwLoadingProps, CwLoadingTexts } from '../CwLoading/types'

export interface CwHudStyles {
  root: string
  mask: string
  panel: string
  text: string
}

export interface CwHudTexts {
  loadingTexts?: Partial<CwLoadingTexts>
}

export interface CwHudProps {
  /** 是否展示 */
  visible?: boolean
  /** 提示文案 */
  text?: string
  /** 是否显示半透明遮罩（false 时仅居中浮层，不挡全屏点击——一般仍配合单例使用） */
  mask?: boolean
  /** 与 CwLoading 一致 */
  loadingType?: CwLoadingProps['type']
  loadingSize?: CwLoadingProps['size']
  texts?: Partial<CwHudTexts>
  /** 点击遮罩是否关闭（默认 false，避免误触） */
  maskClosable?: boolean
  /** visible 变化（遮罩点击 / 关闭时回传 false） */
  onVisibleChange?: (value: boolean) => void
  /** 遮罩点击 */
  onMaskClick?: () => void
}
