import type { CwCardTexts } from '../CwCard/types'
import type { CwFormItemConfig as CwFormItemConfigBase } from '../CwFormItem/types'
import type {
  CwFormItemComponent,
  ComponentConfig,
  ValidationResult,
} from '../CwFormItem/types'

/** CwCellForm 表单项：左标签 / 右控件的 Cell 行 */
export interface CwCellFormItemConfig extends CwFormItemConfigBase {
  /** 组件配置 */
  componentConfig: ComponentConfig
  /** 组件属性 */
  props?: Record<string, unknown>
  /** 验证函数，接收完整的表单数据并返回验证结果 */
  validate?: (formData: Record<string, unknown>) => ValidationResult
  /** 右侧操作区域（如「获取验证码」按钮） */
  rightAction?:
    | CwFormItemComponent
    | { component: CwFormItemComponent; props?: Record<string, unknown> }
  /** 是否显示底部分隔线（默认 true） */
  showDivider?: boolean
}

/** @internal */
export interface CwCellFormStyles {
  title: string
  itemLabelRequired: string
  itemContentInner: string
  rightDivider: string
}

export interface CwCellFormTexts {
  /** 内嵌 {@link CwCard} */
  cardTexts?: Partial<CwCardTexts>
}

export interface CwCellFormProps {
  /** 标题（不传则不显示头部） */
  title?: string
  /** 表单项配置数组 */
  items?: CwCellFormItemConfig[]
  /** 表单数据（Vue `modelValue`） */
  value?: Record<string, unknown>
  /** 是否禁用整个表单 */
  disabled?: boolean
  /** 是否只读 */
  readonly?: boolean
  /** 右侧表单项内层容器追加 class（如统一宽度） */
  itemContentInnerClass?: string
  texts?: Partial<CwCellFormTexts>
  /** Vue `update:modelValue` */
  onChange?: (value: Record<string, unknown>) => void
  /** Vue `fieldChange` */
  onFieldChange?: (field: string, value: unknown) => void
  className?: string
}

export interface CwCellFormEmits {
  onChange?: (value: Record<string, unknown>) => void
  onFieldChange?: (field: string, value: unknown) => void
}
