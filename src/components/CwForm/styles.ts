import type { CwFormStyles } from './types'

export const defaultStyles: CwFormStyles = {
  // 根容器：基础样式 + 状态样式
  root: 'cw-form w-full',
  rootNormal: '',
  rootReadonly: '',
  rootDisabled: 'pointer-events-none',
  /** 原生 form 默认提交钮（多字段时回车依赖此按钮触发 submit） */
  nativeSubmitTrigger:
    'absolute h-px w-px overflow-hidden whitespace-nowrap border-0 p-0 opacity-0',
}
