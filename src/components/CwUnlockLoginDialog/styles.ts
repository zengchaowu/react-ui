import type { CwUnlockLoginDialogStyles } from './types'
import type { CwSelectStyles } from '../CwSelect/types'
import type { CwCheckboxStyles } from '../CwCheckbox/types'
import type { CwRichTextStyles } from '../CwRichText/types'
import { INTERACTIVE_FOCUS_CLASS } from '../../utils/focusStyles'

export const defaultStyles: CwUnlockLoginDialogStyles = {
  /** 占满 dialog body，避免输入区被挤窄；min-w-0 配合 flex 子项收缩规则 */
  root: 'cw-unlock-login-dialog relative flex flex-col w-full min-w-0 px-6 pb-6 pt-1 min-h-0',
  topBar: 'flex justify-end h-8 shrink-0',
  ribbon:
    'inline-flex items-center justify-center w-10 h-10 outline-none focus:outline-none cursor-pointer touch-manipulation rounded-bl-[var(--radius-default)] bg-[var(--brand-color-6)] text-[var(--text-color-anti)]',
  ribbonNormal: 'transition-opacity duration-200 hover:opacity-90 active:opacity-80',
  ribbonFocused: INTERACTIVE_FOCUS_CLASS,
  entryLayout: 'flex flex-col gap-5 min-h-0',
  entryLayoutWide: 'md:flex-row md:gap-8 md:items-stretch',
  phoneColumn: 'flex flex-col gap-4 flex-1 min-w-0 w-full md:w-auto',
  /** 宽屏左侧表单较高时，二维码 + 说明在右栏内纵向居中 */
  qrColumn: 'flex flex-col items-center gap-3 flex-1 min-w-0 md:justify-center',
  columnDivider: 'hidden md:block w-px shrink-0 self-stretch bg-[var(--component-border)] scale-x-[0.5] origin-left',
  /** 与稿一致：区号 + 手机为一整条圆角灰底，左侧为 CwSelect */
  phoneRow:
    'flex flex-row items-stretch w-full min-w-0 gap-0 overflow-hidden rounded-[var(--radius-default)] border border-[var(--component-border)] bg-[var(--bg-color-secondarycontainer)]',
  countrySelectWrap:
    'flex min-h-0 w-[5.75rem] shrink-0 flex-col self-stretch hairline-border-r border-[var(--component-border)]',
  phoneInputWrap: 'flex min-h-0 min-w-0 flex-1 flex-col self-stretch',
  nextButtonWrap: 'w-full',
  nextButton: 'w-full !px-4 !py-3',
  agreementRow: 'flex flex-row gap-2 items-start',
  richTextStyles: {
    root: 'inline text-sm leading-relaxed',
    linkNormal: 'text-[var(--brand-color-6)] hover:opacity-90 touch-manipulation',
  } as Partial<CwRichTextStyles>,
  thirdPartyRow: 'flex justify-center pt-1',
  thirdPartyLink:
    'text-sm outline-none focus:outline-none cursor-pointer touch-manipulation text-[var(--brand-color-6)] hover:opacity-90',
  qrFrame:
    'relative flex h-[8.5rem] w-[8.5rem] max-w-full items-center justify-center overflow-hidden rounded-[var(--radius-default)] bg-[var(--bg-color-secondarycontainer)]',
  qrImage: 'w-full h-full object-contain',
  qrMask:
    'absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[var(--mask-active)] cursor-pointer',
  qrRefreshRow: 'flex flex-col items-center gap-1 text-[var(--text-color-primary)]',
  qrHint: 'text-xs text-center text-[var(--text-color-secondary)]',
  otpHeader: 'flex flex-row items-center justify-between gap-2 shrink-0 mb-2',
  otpBack:
    'inline-flex items-center justify-center w-9 h-9 rounded-full outline-none focus:outline-none cursor-pointer touch-manipulation text-[var(--text-color-primary)]',
  otpBackNormal: 'hover:bg-[var(--bg-color-component-hover)] active:bg-[var(--bg-color-secondarycomponent)]',
  otpBackFocused: INTERACTIVE_FOCUS_CLASS,
  otpTitleBar: 'text-xs text-[var(--text-color-secondary)]',
  otpHelp:
    'inline-flex items-center justify-center w-9 h-9 rounded-full outline-none focus:outline-none cursor-pointer touch-manipulation text-[var(--text-color-secondary)]',
  otpHelpNormal: 'hover:bg-[var(--bg-color-component-hover)]',
  otpHelpFocused: INTERACTIVE_FOCUS_CLASS,
  otpMainTitle: 'text-xl font-semibold text-center text-[var(--text-color-primary)]',
  otpSub: 'text-sm text-center text-[var(--text-color-secondary)] mt-2',
  otpCellsRow:
    'pointer-events-none flex flex-row justify-center gap-2 sm:gap-3 mt-6',
  otpCell:
    'flex h-12 w-10 select-none items-center justify-center rounded-[var(--radius-default)] border border-[var(--component-border)] bg-[var(--bg-color-container)] text-lg font-medium text-[var(--text-color-primary)] sm:h-12 sm:w-11',
  otpCellActive: 'border-[var(--brand-color-6)] ring-1 ring-[var(--focus-ring)] ring-offset-0',
  otpCellFilled: 'border-[var(--component-border)]',
  otpHiddenInput: 'absolute inset-0 w-full min-h-[3rem] cursor-text opacity-0',
  otpResendRow: 'flex justify-center mt-6',
  otpError: 'text-xs text-[var(--error-color-6)] mt-2 text-center',
  globalError:
    'mt-2 rounded-[var(--radius-default)] border border-[var(--error-color-focus)] bg-[var(--error-color-light)] p-3 text-sm text-[var(--error-color-6)]',
  selectStyles: {
    /** 高度随内容与右侧 CwInput（同 size）一致，由 phoneRow items-stretch 拉齐，不锁死 h-9 */
    root: 'flex min-h-0 w-full flex-1 flex-col self-stretch',
    popupStyles: {
      popup:
        'overflow-hidden rounded-[var(--radius-default)] border border-[var(--component-border)] bg-[var(--bg-color-container)] shadow-lg',
      trigger: 'block h-full min-h-0 w-full',
    },
    arrowIconStyles: {
      root: 'inline-flex items-center justify-center text-current text-[var(--text-color-secondary)]',
      size: 0.875,
    },
    suffix: 'flex flex-row flex-nowrap items-center justify-center shrink-0 pr-1.5',
  } as Partial<CwSelectStyles>,
  checkboxStyles: {} as Partial<CwCheckboxStyles>,
}
