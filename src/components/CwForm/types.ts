import type { ComponentType, ReactNode, MutableRefObject, RefObject } from 'react'
import type { CwFormItemConfig as CwFormItemConfigBase } from '../CwFormItem/types';
import type { ComponentConfig } from '../CwFormItem/types';
import type { ValidationResult } from '../CwFormItem/types';
import type { CwRowProps, CwColProps } from '../CwRow/types';
import type { CwFormItemStyles } from '../CwFormItem/types';
// CwForm 中扩展的 CwFormItemConfig
export interface CwFormItemConfigInForm extends CwFormItemConfigBase {
  /** 验证函数，接收完整的表单数据并返回验证结果 */
  validate?: (formData: Record<string, any>) => ValidationResult;
  /** 传递给 CwFormItem 的样式（用于单项横向/左侧标签等布局） */
  formItemStyles?: Partial<CwFormItemStyles>;
}

// 表单项全局配置
export interface CwFormItemGlobalConfig {
  /** 默认的列属性配置 */
  col?: CwColProps;
}

// 布局配置
export interface CwFormLayoutConfig {
  /** 最大显示行数 */
  maxRows?: number;
  /** 栅格布局配置 */
  grid?: CwRowProps;
  /** 使用原生 form 元素；为 true 时输入框回车触发 submit 事件 */
  native?: boolean;
}

// 表单配置
export interface CwFormConfig {
  /** 表单项配置数组 */
  items: CwFormItemConfigInForm[];
  /** 表单项全局配置 */
  item?: CwFormItemGlobalConfig;
  /** 布局配置 */
  layout?: CwFormLayoutConfig;
}

// 表单Props
export interface CwFormProps {
  /** 表单配置 */
  config: CwFormConfig;
  /** 表单数据 */
  modelValue: Record<string, any>;
  /** 是否禁用整个表单 */
  disabled?: boolean;
  /** 是否只读 */
  readonly?: boolean;
  /** 自定义样式对象（仅表单根容器相关） */
  styles?: Partial<CwFormStyles>;
  /** 自定义文本对象 */
  texts?: Partial<CwFormTexts>;
}

export interface CwFormStyles {
  // 根容器：基础样式 + 状态样式
  root: string;
  rootNormal: string;
  rootReadonly: string;
  rootDisabled: string;
  /** layout.native 时用于承接回车提交的隐藏按钮 */
  nativeSubmitTrigger?: string;
}

export interface CwFormTexts {
  /** 必填提示文案 */
  requiredMessage?: string;
}

// 表单事件
export interface CwFormEmits {
  /** 表单数据变化事件 */
  (e: 'update:modelValue', value: Record<string, any>): void;
  /** 字段变化事件 */
  (e: 'fieldChange', field: string, value: any): void;
  /** 原生 form 提交（layout.native 为 true 时，如回车） */
  (e: 'submit', value: Record<string, any>): void;
}

// CwForm 组件实例暴露的属性和方法
export interface CwFormExposed {
  /** 表单数据 */
  formData: MutableRefObject<Record<string, any>>;
  /** 折叠状态（响应式） */
  isCollapsed: boolean;
}
