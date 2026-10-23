import type { CwFileUploadAppearance, CwFileUploadStyles } from './types'
import { INTERACTIVE_FOCUS_CLASS } from '@zengchaowu/ui-shared/functions/ui/focusStyles'

export const fileUploadBase: CwFileUploadStyles = {
  root: 'cw-file-upload flex flex-wrap gap-4 outline-none focus:outline-none',
  rootNormal: '',
  rootDisabled: '',
  rootReadonly: '',

  uploadArea:
    'relative flex flex-col items-center justify-center rounded-lg outline-none focus:outline-none w-[5.625rem] h-[5.625rem]',
  uploadAreaNormal: 'bg-[var(--bg-color-secondarycontainer)] cursor-pointer',
  uploadAreaDisabled: 'bg-[var(--bg-color-component-disabled)] cursor-not-allowed',
  uploadAreaReadonly: 'bg-[var(--bg-color-secondarycontainer)] cursor-default',
  uploadAreaFocused: INTERACTIVE_FOCUS_CLASS,

  fileItem:
    'relative flex flex-col items-center gap-2 rounded-lg border transition-colors duration-200 w-[5.625rem] h-[5.625rem] overflow-hidden',
  fileItemReady: 'border-[var(--border-color)] bg-[var(--bg-color-container)]',
  fileItemError: 'border-[var(--border-color)] bg-[var(--button-danger-tint-active-bg)]',
  fileItemUploading: 'border-[var(--border-color)] bg-[var(--button-brand-tint-active-bg)]',
  /** 成功即常态展示，勿铺 success 浅绿底（非图文件格会整块发绿） */
  fileItemSuccess: 'border-[var(--border-color)] bg-[var(--bg-color-container)]',
  fileItemNormal: 'cursor-pointer',
  fileItemDisabled: 'cursor-not-allowed',
  fileItemReadonly: 'cursor-default',

  fileInfo: 'absolute inset-0 h-full w-full',
  filePreview: 'relative h-full w-full',
  filePreviewImage: 'h-full w-full object-cover',
  fileDocPreview:
    'flex h-full w-full flex-col items-center justify-center gap-1 px-1.5 pb-1.5 pt-2',
  fileStatusOverlay:
    'absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[var(--mask-active)]',
  fileName:
    'w-full truncate text-center text-[0.625rem] font-medium leading-tight text-[var(--text-color-primary)]',
  spinner:
    'w-6 h-6 border-2 border-[var(--text-color-anti)] border-t-transparent rounded-full animate-spin',
  fileActionsContainer: 'absolute inset-0',
  deleteButton:
    'absolute top-0 right-0 z-[var(--z-index-above)] h-4 w-4 cursor-pointer overflow-hidden transition-opacity duration-200 hover:opacity-80',
  deleteButtonBg:
    'absolute top-0 right-0 h-4 w-4 bg-[var(--mask-active)] [clip-path:circle(100%_at_100%_0%)]',
  deleteButtonIcon:
    'absolute top-0 right-0 flex h-3 w-3 items-center justify-center text-[var(--text-color-anti)]',
  errorIcon: 'inline-flex items-center justify-center text-[var(--text-color-anti)]',
  deleteButtonIconStyle: 'inline-flex items-center justify-center text-[var(--text-color-anti)]',
  uploadIcon: 'inline-flex items-center justify-center text-[var(--text-color-placeholder)]',
  uploadIconDisabled: 'inline-flex items-center justify-center text-[var(--text-color-disabled)]',
  fileInput: 'hidden',
}

export const appearanceStyles: Record<
  CwFileUploadAppearance,
  Partial<CwFileUploadStyles>
> = {
  default: {},
  dashed: {
    root: 'cw-file-upload w-full outline-none focus:outline-none',
    uploadArea: [
      'relative flex w-full items-center justify-center rounded-lg border border-dashed outline-none focus:outline-none',
      'border-[color-mix(in_srgb,var(--border-color)_70%,transparent)]',
      'bg-[color-mix(in_srgb,var(--bg-color-container)_55%,transparent)]',
      'px-3 py-3 text-[0.8125rem] text-[var(--text-color-secondary)]',
      'hover:bg-[color-mix(in_srgb,var(--text-color-anti)_4%,transparent)]',
    ].join(' '),
    uploadAreaNormal: 'cursor-pointer',
  },
  profile: {
    uploadArea:
      'relative flex flex-col items-center justify-center rounded-lg outline-none focus:outline-none w-[7.0625rem] h-[7.0625rem]',
    uploadAreaNormal: 'bg-[var(--bg-color-secondarycontainer)] cursor-pointer',
    uploadAreaDisabled: 'bg-[var(--bg-color-component-disabled)] cursor-not-allowed',
    uploadAreaReadonly: 'bg-[var(--bg-color-secondarycontainer)] cursor-default',
    fileItem:
      'relative flex flex-col items-center gap-2 rounded-lg border transition-colors duration-200 overflow-hidden w-[7.0625rem] h-[7.0625rem]',
    fileItemNormal: 'cursor-pointer',
    fileItemDisabled: 'cursor-not-allowed',
    fileItemReadonly: 'cursor-default',
  },
}
