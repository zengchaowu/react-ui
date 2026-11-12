export interface CwPushAsideProps {
  /** 展开态，配合 `onUpdateOpen` 使用 */
  open?: boolean
  /** 侧栏宽度；数字按 px 处理 */
  width?: string | number
  /** 展开 / 收起过渡时长（毫秒） */
  duration?: number
  /** 展开时在主区上盖一层可点击关闭的遮罩 */
  scrim?: boolean
  /** 遮罩的无障碍标签 */
  scrimAriaLabel?: string
}

export interface CwPushAsideEmits {
  (e: 'update:open', value: boolean): void
  /** 点击遮罩关闭时触发 */
  (e: 'close'): void
}
