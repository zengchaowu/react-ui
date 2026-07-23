import type { CwInputTexts } from '../CwInput/types'
import type { CwButtonTexts } from '../CwButton/types'
import type { CwCountDownButtonTexts } from '../CwCountDownButton/types'
import type { CwCheckboxStyles, CwCheckboxTexts } from '../CwCheckbox/types'
import type { CwSelectStyles, CwSelectTexts, CwSelectOption } from '../CwSelect/types'
import type { CwDynamicDialogStyles } from '../CwDynamicDialog/types'
import type { CwRichTextNode, CwRichTextStyles, CwRichTextTexts } from '../CwRichText/types'

export interface CwUnlockLoginDialogStyles {
  /** 根节点：布局用，外观由子类名承担 */
  root: string
  /** 窄屏顶区（含角标占位） */
  topBar: string
  /** 角标按钮（折叠角） */
  ribbon: string
  ribbonNormal: string
  ribbonFocused: string
  /** 主区域：.entry 步骤 */
  entryLayout: string
  entryLayoutWide: string
  /** 左栏（手机） */
  phoneColumn: string
  /** 右栏（扫码） */
  qrColumn: string
  /** 竖分割线（宽屏） */
  columnDivider: string
  /** +86 与手机号一行 */
  phoneRow: string
  countrySelectWrap: string
  phoneInputWrap: string
  nextButtonWrap: string
  /** 主按钮（下一步）布局 class */
  nextButton: string
  agreementRow: string
  thirdPartyRow: string
  thirdPartyLink: string
  /** 扫码区外框 */
  qrFrame: string
  qrImage: string
  qrMask: string
  qrRefreshRow: string
  qrHint: string
  /** OTP 步骤 */
  otpHeader: string
  otpBack: string
  otpBackNormal: string
  otpBackFocused: string
  otpTitleBar: string
  otpHelp: string
  otpHelpNormal: string
  otpHelpFocused: string
  otpMainTitle: string
  otpSub: string
  otpCellsRow: string
  otpCell: string
  otpCellActive: string
  otpCellFilled: string
  otpHiddenInput: string
  otpResendRow: string
  otpError: string
  globalError: string
  selectStyles?: Partial<CwSelectStyles>
  checkboxStyles?: Partial<CwCheckboxStyles>
  /** 协议富文本；默认由 texts 拼 DSL */
  richTextStyles?: Partial<CwRichTextStyles>
}

export interface CwUnlockLoginDialogTexts {
  title: string
  phonePlaceholder: string
  nextStep: string
  nextStepLoading: string
  agreementPrefix: string
  linkUserAgreement: string
  linkPrivacy: string
  linkDoubaoTerms: string
  douyinOneClick: string
  qrInstruction: string
  qrRefresh: string
  otpNavTitle: string
  /** 返回按钮无障碍标签 */
  backLabel: string
  otpMainTitle: string
  otpSentHint: string
  sendCodeButton: string
  countdownText: string
  otpVerifyLoading: string
  otpHelpLabel: string
  switchToQrLabel: string
  switchToPhoneLabel: string
  closeQrRefreshHint: string
  sendCodeError: string
  loginError: string
  loginErrorGeneral: string
  inputTexts?: Partial<CwInputTexts>
  selectTexts?: Partial<CwSelectTexts>
  primaryButtonTexts?: Partial<CwButtonTexts>
  checkboxTexts?: Partial<CwCheckboxTexts>
  countDownButtonTexts?: Partial<CwCountDownButtonTexts>
  richTextTexts?: Partial<CwRichTextTexts>
}

export interface CwUnlockLoginDialogContentProps {
  loading?: boolean
  styles?: Partial<CwUnlockLoginDialogStyles>
  texts?: Partial<CwUnlockLoginDialogTexts>
  /** 国家码选项，默认 +86 */
  countryCodeOptions?: CwSelectOption[]
  /** 二维码图片地址（可选） */
  qrImageSrc?: string
  /** 初始是否展示「刷新二维码」遮罩 */
  qrExpired?: boolean
  /** 覆盖默认协议富文本 DSL；不传则根据 texts 生成 */
  agreementDsl?: CwRichTextNode[]
  onSendCode?: (phone: string, dialCode: string) => Promise<{ success: boolean; error?: string }>
  onLogin?: (phone: string, code: string, dialCode: string) => Promise<{ success: boolean; userInfo?: any; token?: string; error?: string }>
  onAgreementLink?: (type: 'user' | 'privacy' | 'doubao') => void
  onDouyinLogin?: () => void
  onQrRefresh?: () => void | Promise<void>
  onOtpHelp?: () => void
}

export interface CwUnlockLoginDialogContentEmits {
  (e: 'success', data: { userInfo: any; token: string }): void
}

export interface ShowUnlockLoginDialogOptions {
  styles?: Partial<CwUnlockLoginDialogStyles>
  texts?: Partial<CwUnlockLoginDialogTexts>
  /** 合并到 CwDynamicDialog 容器样式（如加宽容器） */
  dialogStyles?: Partial<CwDynamicDialogStyles>
  countryCodeOptions?: CwSelectOption[]
  qrImageSrc?: string
  qrExpired?: boolean
  agreementDsl?: CwRichTextNode[]
  onSendCode?: (phone: string, dialCode: string) => Promise<{ success: boolean; error?: string }>
  onLogin?: (phone: string, code: string, dialCode: string) => Promise<{ success: boolean; userInfo?: any; token?: string; error?: string }>
  onAgreementLink?: (type: 'user' | 'privacy' | 'doubao') => void
  onDouyinLogin?: () => void
  onQrRefresh?: () => void | Promise<void>
  onOtpHelp?: () => void
  onSuccess?: (data: { userInfo: any; token: string }) => void
}

export interface ShowUnlockLoginDialogResult {
  userInfo: any
  token: string
}
