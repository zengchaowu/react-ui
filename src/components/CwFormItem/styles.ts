import type { CwFormItemStyles } from './types'

export const defaultStyles: CwFormItemStyles = {
  // 根容器：基础样式（布局）+ 状态样式
  root: 'cw-form-item flex flex-col',
  rootNormal: '',
  rootReadonly: '',
  rootDisabled: '',
  
  // 标签：基础样式（布局、字体、间距）+ 状态样式（颜色）
  label: 'text-sm font-medium mb-2',
  labelNormal: 'text-[var(--text-color-primary)]',
  labelReadonly: 'text-[var(--text-color-primary)]',
  labelDisabled: 'text-[var(--text-color-disabled)]',
  // 标签文本节点（用于挂载伪元素，承担定位上下文）
  labelText: 'relative inline-block',
  
  // 必填标记
  labelRequired: 'after:content-["*"] after:absolute after:left-full after:ml-1',
  labelRequiredNormal: 'after:text-[var(--error-color-6)]',
  labelRequiredReadonly: 'after:text-[var(--error-color-6)]',
  labelRequiredDisabled: 'after:text-[var(--text-color-disabled)]',
  
  // 内容容器：基础样式（布局）
  content: 'flex-grow min-w-0 flex flex-col',
  
  // 组件容器：基础样式（布局）；w-full 避免横向 flex 下子项仅随内容收缩（如 Textarea）
  component: 'flex min-w-0 w-full flex-1 flex-col',
  
  // 错误信息：基础样式（字体、颜色、间距）
  error: 'text-[var(--error-color-6)] text-xs mt-1'
}
