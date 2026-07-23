import type { ComponentType, ReactNode, MutableRefObject, RefObject } from 'react'
import type { CwColProps } from '../CwRow/types';

// 组件配置
export interface ComponentConfig {
  /** 组件对象 */
  component: ComponentType<any>;
  /** 默认属性 */
  defaultProps?: Record<string, any>;
}

// 验证结果
export interface ValidationResult {
  /** 是否有效 */
  valid: boolean;
  /** 错误信息 */
  message?: string;
}

// 基础表单项配置
export type CwFormItemBaseConfig = {
  /** 字段名 */
  prop: string;
  /** 标签文本 */
  label?: string;
  /** 标签宽度，支持固定值或函数 */
  labelWidth?: string | ((formItem: CwFormItemBaseConfig) => string);
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否只读 */
  readonly?: boolean;
  /** 是否必填 */
  required?: boolean;
  /** 响应式栅格配置 */
  col?: CwColProps;
}

export type CwFormItemConfig = CwFormItemBaseConfig & {
  /** 组件配置 */
  componentConfig: ComponentConfig;
  /** 组件属性 */
  props?: Record<string, any>;
}

// 组件Props
export interface CwFormItemProps {
  /** 表单项配置 */
  config: CwFormItemConfig;
  /** 验证结果 */
  validationResult?: ValidationResult;
  /**
   * 自定义样式对象
   */
  styles?: Partial<CwFormItemStyles>;
  /**
   * 自定义文本对象
   */
  texts?: Partial<CwFormItemTexts>;
}

export interface CwFormItemStyles {
  // 根容器：基础样式 + 状态样式
  root: string
  rootNormal: string
  rootReadonly: string
  rootDisabled: string
  
  // 标签：基础样式 + 状态样式
  label: string
  labelNormal: string
  labelReadonly: string
  labelDisabled: string
  // 标签文本节点（用于挂载伪元素），基础样式
  labelText: string
  
  // 必填标记
  labelRequired: string
  labelRequiredNormal: string
  labelRequiredReadonly: string
  labelRequiredDisabled: string
  
  // 内容容器：基础样式
  content: string
  
  // 组件容器：基础样式
  component: string
  
  // 错误信息：基础样式
  error: string
}

export interface CwFormItemTexts {
  /** 必填提示文案 */
  requiredMessage?: string
}

// 组件事件
export interface CwFormItemEmits {
  /** 焦点事件 */
  (e: 'focus', event: FocusEvent): void;
  /** 失焦事件 */
  (e: 'blur', event: FocusEvent): void;
  /** 变化事件 */
  (e: 'change', event: Event): void;
}