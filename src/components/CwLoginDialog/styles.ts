import type { CwLoginDialogStyles } from './types'
import { INTERACTIVE_FOCUS_CLASS } from '@zengchaowu/ui-shared/functions/ui/focusStyles'

export const cwLoginDialogBase: CwLoginDialogStyles = {
  root: 'cw-unlock-login-dialog relative flex flex-col w-full min-w-0 min-h-0',
  /** 窄/宽屏内边距互斥（由 isWide 切换，禁止 md:px-*） */
  rootStacked: 'px-5 pb-5 pt-3',
  rootWide: 'px-6 pb-6 pt-6',
  ribbonSlot: 'absolute top-0 right-0 z-[var(--z-index-sticky)] h-12 w-12',
  ribbon:
    'relative h-full w-full outline-none focus:outline-none cursor-pointer touch-manipulation',
  ribbonNormal: 'transition-opacity duration-200 hover:opacity-90 active:opacity-80',
  ribbonFocused: INTERACTIVE_FOCUS_CLASS,
  ribbonClip: 'pointer-events-none absolute inset-0 overflow-hidden',
  ribbonClipInner:
    'absolute inset-0 flex items-center justify-center bg-[var(--brand-color-6)] text-[var(--text-color-anti)]',
  entryTitle:
    'shrink-0 text-xl font-semibold leading-snug text-[var(--text-color-primary)] mb-0',
  /** 窄屏标题为角标留出右侧空间（由 isWide 切换） */
  entryTitleNarrow: 'pr-10',
  /** 宽屏靠 items-stretch 拉齐左右栏高度；勿对子项写 h-full，否则 % 高度无法解析时 stretch 失效 */
  entryLayout: 'flex min-h-0 w-full',
  /** 与 entryLayoutWide 互斥；禁止 flex-col + md:flex-row */
  entryLayoutStacked: 'flex-col gap-5',
  /** stretch 让左栏拿到与扫码列相同的确定高度，spacer 才能 flex-1 吃满 */
  entryLayoutWide: 'flex-row gap-0 items-stretch',
  phoneColumn: 'flex min-h-0 min-w-0 flex-col gap-3 self-stretch',
  phoneColumnStacked: 'w-full flex-1',
  /** 宽屏左栏固定 20rem，避免和扫码列等分后把协议挤到链接中间换行 */
  phoneColumnWide: 'w-80 shrink-0 justify-start pr-6',
  /** 标题与输入之间：较小弹性，输入略偏上 */
  phoneFormSpacerTop: 'min-h-0 w-full flex-1',
  /** 输入与协议之间：更大弹性，协议仍落底 */
  phoneFormSpacer: 'min-h-0 w-full flex-[2]',
  /** 手机号 + 下一步 */
  phoneFormBody: 'flex w-full shrink-0 flex-col gap-3',
  /** 协议 / 第三方：落在左栏最底部 */
  phoneFormFooter: 'flex w-full shrink-0 flex-col gap-3',
  /** 扫码列基础：内容定高；勿在窄屏叠放时加 basis-0/flex-1/min-h-0，否则会塌成近 0 高 */
  qrColumn: 'flex flex-col items-center justify-center gap-2',
  /** 窄屏独占扫码：按二维码自然高度撑开弹层 */
  qrColumnStacked: 'w-full shrink-0',
  /** 宽屏吃掉左栏 20rem 之外的剩余宽度，二维码在列内居中 */
  qrColumnWide: 'min-h-0 min-w-0 flex-1 self-stretch pl-6',
  columnDivider:
    'block w-px shrink-0 self-stretch bg-[var(--border-color)] scale-x-[0.5] origin-center',
  /**
   * 与下一步按钮同高（py-3 + text-sm = 44px）。
   * 区内 CwInput/CwSelect 是 embedded，会跳过 medium 的 h-9 和内边距，高度必须由这一行兜住。
   */
  phoneRow:
    'flex h-11 flex-row items-stretch w-full min-w-0 gap-0 overflow-hidden rounded-xl border border-[var(--border-color)] bg-[var(--bg-color-secondarycontainer)]',
  /**
   * 区号列只包住「+86」和箭头。左右内边距放在 CwInput 上，触发器才等于整列宽，下拉才能对齐。
   * 须加 min/max-width，否则内部 input 默认 size=20 会撑破并挤扁手机号。
   * embedded 的 CwInput 根是 block，不把内层撑满行高时文案会贴顶。
   */
  countrySelectWrap:
    'flex min-h-0 w-[4.5rem] min-w-[4.5rem] max-w-[4.5rem] shrink-0 overflow-hidden flex-col self-stretch hairline-border-r border-[var(--border-color)] [&_.cw-input]:flex [&_.cw-input]:h-full [&_.cw-input]:min-h-0 [&_.cw-input]:flex-col [&_.cw-input]:pl-3 [&_.cw-input>div]:h-full [&_.cw-input>div]:min-h-0',
  phoneInputWrap:
    'flex min-h-0 min-w-[10rem] flex-1 flex-col self-stretch overflow-hidden pl-3 [&_.cw-input]:flex [&_.cw-input]:h-full [&_.cw-input]:min-h-0 [&_.cw-input]:flex-col [&_.cw-input>div]:h-full [&_.cw-input>div]:min-h-0',
  nextButtonWrap: 'w-full',
  nextButton: 'w-full !rounded-xl !px-4 !py-3',
  /** 多行协议：方框贴第一行，而不是在两行之间垂直居中 */
  agreementRow:
    'flex w-full min-w-0 flex-row items-start [&_.cw-checkbox]:w-full [&_.cw-checkbox]:items-start [&_.cw-checkbox>:first-child]:mt-0.5',
  thirdPartyRow: 'flex flex-row flex-wrap items-center justify-center gap-x-5 gap-y-2 pt-1',
  thirdPartyLink:
    'text-sm outline-none focus:outline-none cursor-pointer touch-manipulation text-[var(--brand-color-6)] hover:opacity-90',
  /** 扫码/快捷登录容器：无外框，iframe 绝对定位避免 intrinsic 撑开 */
  qrFrame:
    'relative flex h-[13.75rem] w-[13.75rem] max-w-full min-h-0 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-transparent p-0',
  qrWxHost:
    'relative h-full w-full min-h-0 min-w-0 overflow-hidden border-0 bg-transparent [&_iframe]:absolute [&_iframe]:inset-0 [&_iframe]:h-full [&_iframe]:w-full [&_iframe]:max-h-full [&_iframe]:max-w-full [&_iframe]:border-0',
  /** 未勾选协议时遮住扫码区；用浅底画出二维码占位，避免和弹窗底融成一块空白 */
  qrAgreementMask:
    'absolute inset-0 z-[var(--z-index-above)] flex items-center justify-center rounded-xl border border-[var(--border-color)] bg-[var(--bg-color-secondarycontainer)] px-4',
  qrAgreementMaskText:
    'text-sm leading-relaxed text-center text-[var(--text-color-secondary)]',
  qrHint: 'max-w-[13.75rem] text-xs leading-relaxed text-center text-[var(--text-color-secondary)]',
  /** 窄屏全屏页入口：左上角返回，关闭登录层 */
  pageCloseRow: 'flex flex-row items-center shrink-0 -mt-1 mb-2',
  otpHeader: 'flex flex-row items-center justify-between gap-2 shrink-0 mb-2',
  otpBack:
    'inline-flex items-center justify-center w-9 h-9 rounded-full outline-none focus:outline-none cursor-pointer touch-manipulation text-[var(--text-color-primary)]',
  otpBackNormal:
    'hover:bg-[var(--bg-color-component-hover)] active:bg-[var(--bg-color-secondarycomponent)]',
  otpBackFocused: INTERACTIVE_FOCUS_CLASS,
  otpTitleBar: 'text-xs text-[var(--text-color-secondary)]',
  otpHelp:
    'inline-flex items-center justify-center w-9 h-9 rounded-full outline-none focus:outline-none cursor-pointer touch-manipulation text-[var(--text-color-secondary)]',
  otpHelpNormal: 'hover:bg-[var(--bg-color-component-hover)]',
  otpHelpFocused: INTERACTIVE_FOCUS_CLASS,
  otpMainTitle: 'text-xl font-semibold text-center text-[var(--text-color-primary)]',
  otpSub: 'text-sm text-center text-[var(--text-color-secondary)] mt-2',
  otpCellsRow:
    'pointer-events-none flex flex-row justify-center gap-3 mt-6',
  otpCell:
    'flex h-12 w-11 select-none items-center justify-center rounded-xl border border-[var(--border-color)] bg-[var(--bg-color-container)] text-lg font-medium text-[var(--text-color-primary)]',
  otpCellActive: 'border-[var(--brand-color-6)] ring-1 ring-[var(--focus-ring)] ring-offset-0',
  otpCellFilled: 'border-[var(--border-color)]',
  otpHiddenInput: 'absolute inset-0 w-full min-h-[3rem] cursor-text opacity-0',
  otpResendRow: 'flex justify-center mt-6',
  otpError: 'text-xs text-[var(--error-color-6)] mt-2 text-center',
  globalError:
    'mt-2 rounded-xl border border-[var(--error-color-focus)] bg-[var(--error-color-light)] p-3 text-sm text-[var(--error-color-6)]',
  oneTapPanel: 'flex min-h-0 w-full flex-1 flex-col gap-3',
  oneTapPhone: 'text-2xl font-semibold tracking-wide text-[var(--text-color-primary)]',
  oneTapHint: 'text-xs leading-relaxed text-[var(--text-color-secondary)]',
  oneTapOther:
    'text-sm outline-none focus:outline-none cursor-pointer touch-manipulation text-[var(--brand-color-6)] hover:opacity-90',
  /** 触发器铺满行高，内部文案垂直居中，整列可点。下拉壳不在这里覆盖，沿用 CwSelect 的圆角。 */
  selectPopupTriggerClass:
    'flex h-full min-h-0 w-full items-stretch [&>div]:flex [&>div]:h-full [&>div]:w-full [&>div]:min-w-0 [&>div]:items-center',
}
