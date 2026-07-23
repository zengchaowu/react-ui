import type { CwFileUploadAppearance, CwFileUploadStyles } from './types'
import { INTERACTIVE_FOCUS_CLASS } from '../../utils/focusStyles'

export const defaultStyles: CwFileUploadStyles = {
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
  fileItemReady: 'border-[var(--border-color-light)] bg-[var(--bg-color-container)]',
  fileItemError: 'border-[var(--border-color-light)] bg-[var(--button-danger-tint-active-bg)]',
  fileItemUploading: 'border-[var(--border-color-light)] bg-[var(--button-brand-tint-active-bg)]',
  fileItemSuccess: 'border-[var(--border-color-light)] bg-[var(--success-color-light)]',
  fileItemNormal: 'cursor-pointer',
  fileItemDisabled: 'cursor-not-allowed',
  fileItemReadonly: 'cursor-default',

  fileInfo: 'absolute inset-0 w-full h-full',
  filePreview: 'relative w-full h-full',
  filePreviewImage: 'w-full h-full object-cover',
  fileStatusOverlay:
    'absolute inset-0 bg-[var(--mask-active)] flex items-center justify-center flex-col gap-2',
  fileName: 'text-xs font-medium truncate text-center',
  spinner:
    'w-6 h-6 border-2 border-[var(--text-color-anti)] border-t-transparent rounded-full animate-spin',
  fileActionsContainer: 'absolute inset-0',
  deleteButton:
    'absolute top-0 right-0 cursor-pointer transition-opacity duration-200 hover:opacity-80 w-4 h-4 overflow-hidden',
  deleteButtonBg:
    'absolute top-0 right-0 w-4 h-4 bg-[var(--mask-active)] [clip-path:circle(100%_at_100%_0%)]',
  deleteButtonIcon:
    'absolute top-0 right-0 text-[var(--text-color-anti)] flex items-center justify-center w-3 h-3',
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
      'border-[color-mix(in_srgb,var(--component-border)_70%,transparent)]',
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
