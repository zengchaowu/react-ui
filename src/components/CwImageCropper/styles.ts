import type { CwImageCropperStyles } from './types'

export const cropperBase: CwImageCropperStyles = {
  // 根容器：基础 + 状态
  root: 'cw-image-cropper flex flex-col',
  rootNormal: '',
  rootDisabled: 'cursor-not-allowed',
  rootReadonly: 'cursor-default',

  // 裁剪容器：基础 + 状态（黑色背景）
  container: 'relative w-full h-full overflow-hidden select-none bg-[var(--scrim-base)]',
  containerNormal: '',
  containerDisabled: 'bg-[var(--scrim-base)]',
  containerReadonly: '',

  // 图片包装器：基础
  imageWrapper: 'absolute inset-0 flex items-center justify-center select-none',
  image: 'max-w-full max-h-full object-contain select-none',
  // CwImageFit 根容器样式
  imageFitRoot: 'absolute inset-0 select-none',

  // 裁剪框：基础 + 状态（无边框和颜色）
  cropBox: 'absolute bg-transparent',
  cropBoxNormal: 'cursor-move',
  cropBoxDisabled: 'cursor-not-allowed',
  cropBoxReadonly: 'cursor-default',

  // 裁剪手柄：四个角显示，半透明主色圆形（增加响应区域）
  // 手柄容器使用更大的尺寸（32px）提供更大的点击区域
  cropHandle: 'absolute flex items-center justify-center',
  cropHandleNormal: 'cursor-pointer',
  cropHandleDisabled: 'cursor-not-allowed',
  cropHandleReadonly: 'cursor-default',
  // 手柄内部视觉元素（20px 圆形）
  cropHandleInner: 'w-5 h-5 rounded-full bg-[var(--brand-color-6)] opacity-50',

  // 取消按钮（容器左下角）：基础 + 状态（无背景，只显示图标）
  cancelButton: 'absolute bottom-4 left-4 w-8 h-8 flex items-center justify-center outline-none transition-opacity',
  cancelButtonNormal: 'text-[var(--text-color-anti)] cursor-pointer hover:opacity-80',
  cancelButtonDisabled: 'text-[var(--text-color-anti)] opacity-50 cursor-not-allowed',
  cancelButtonReadonly: 'text-[var(--text-color-anti)] opacity-50 cursor-default',

  // 确认按钮（容器右下角）：基础 + 状态（无背景，只显示图标）
  confirmButton: 'absolute bottom-4 right-4 w-8 h-8 flex items-center justify-center outline-none transition-opacity',
  confirmButtonNormal: 'text-[var(--text-color-anti)] cursor-pointer hover:opacity-80',
  confirmButtonDisabled: 'text-[var(--text-color-anti)] opacity-50 cursor-not-allowed',
  confirmButtonReadonly: 'text-[var(--text-color-anti)] opacity-50 cursor-default',

  // 遮罩层：基础（黑色背景）
  overlay: 'absolute pointer-events-none bg-[var(--mask-active)]'
}
