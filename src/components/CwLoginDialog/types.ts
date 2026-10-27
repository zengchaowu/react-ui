import type { HTMLAttributes } from 'react'
import type { TokenPair } from '@zengchaowu/shared/types/auth'
import type {
  WechatPcQrcodeGenerateResult,
  WechatPcQrcodeLoginStatus,
} from '@zengchaowu/shared/functions/wechat/openPlatform/resolveWechatPcQrcodeLoginSession'
import type { CwInputTexts } from '@zengchaowu/ui-shared/components/CwInput/types'
import type { CwButtonTexts } from '@zengchaowu/ui-shared/components/CwButton/types'
import type { CwCountDownButtonTexts } from '@zengchaowu/ui-shared/components/CwCountDownButton/types'
import type { CwCheckboxTexts } from '@zengchaowu/ui-shared/components/CwCheckbox/types'
import type { CwSelectTexts, CwSelectOption } from '../CwSelect/types'
import type { CwRichTextNode, CwRichTextTexts } from '@zengchaowu/ui-shared/components/CwRichText/types'
import type { CwLoginDialogAgreementLink } from '@zengchaowu/ui-shared/components/CwLoginDialog/types'

export interface CwLoginDialogThirdPartyLink {
  id: string
  label: string
}

export interface CwLoginDialogStyles {
  /** 根节点：布局用，外观由子类名承担 */
  root: string
  /** 窄屏根节点内边距（与 rootWide 互斥） */
  rootStacked: string
  /** 宽屏根节点内边距（与 rootStacked 互斥） */
  rootWide: string
  /** 窄屏右上角扫码/手机切换角标 */
  ribbonSlot: string
  ribbon: string
  ribbonNormal: string
  ribbonFocused: string
  ribbonClip: string
  ribbonClipInner: string
  /** 窄屏全屏页入口：左上角返回，关闭登录层 */
  pageCloseRow: string
  /** 入口步骤标题（左栏 / 手机视图） */
  entryTitle: string
  /** 窄屏标题右侧留白（给角标） */
  entryTitleNarrow: string
  /** 主区域：entry 步骤 */
  entryLayout: string
  entryLayoutStacked: string
  entryLayoutWide: string
  /** 左栏（手机） */
  phoneColumn: string
  phoneColumnStacked: string
  phoneColumnWide: string
  /** 标题与输入之间的弹性占位（较小） */
  phoneFormSpacerTop: string
  /** 输入与协议之间的弹性占位（较大） */
  phoneFormSpacer: string
  /** 手机号 + 下一步 */
  phoneFormBody: string
  /** 协议 / 第三方（贴底） */
  phoneFormFooter: string
  /** 右栏（扫码） */
  qrColumn: string
  qrColumnStacked: string
  qrColumnWide: string
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
  /** 微信 WxLogin 容器 */
  qrWxHost: string
  /** 未勾选协议时扫码遮罩 */
  qrAgreementMask: string
  qrAgreementMaskText: string
  qrHint: string
  oneTapPanel: string
  oneTapPhone: string
  oneTapHint: string
  oneTapOther: string
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
  /** 区号 Select 下拉浮层壳（透传 CwSelect popupClass） */
  selectPopupClass?: string
  /** 区号 Select trigger 包裹层（透传 CwSelect popupTriggerClass） */
  selectPopupTriggerClass?: string
}

/** 展示文案均由调用方传入，组件内不含产品默认文案 */
export interface CwLoginDialogTexts {
  title: string
  phonePlaceholder: string
  nextStep: string
  nextStepLoading: string
  agreementPrefix: string
  /** 未勾选协议时拦截登录的提示（手机号下一步 / 微信扫码） */
  agreementRequiredError?: string
  qrInstruction: string
  /** 微信二维码加载中占位（可选） */
  qrPlaceholder?: string
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
  sendCodeError: string
  loginError: string
  loginErrorGeneral: string
  /** 窄屏顶栏标题（与系统设置等页的 CwNavBar 对齐） */
  navTitle?: string
  /** 本机号一键登录标题 */
  oneTapTitle?: string
  oneTapButton?: string
  oneTapOther?: string
  oneTapHint?: string
  oneTapLoading?: string
  inputTexts?: Partial<CwInputTexts>
  selectTexts?: Partial<CwSelectTexts>
  primaryButtonTexts?: Partial<CwButtonTexts>
  checkboxTexts?: Partial<CwCheckboxTexts>
  countDownButtonTexts?: Partial<CwCountDownButtonTexts>
  richTextTexts?: Partial<CwRichTextTexts>
}

export type CwLoginDialogCarrierOneTap = {
  maskedPhone?: string
  carrier?: string
  onLogin: () => Promise<{
    success: boolean
    userInfo?: unknown
    token?: string
    error?: string
  }>
}

/** 打开后再补齐一键登录的只读 ref（Vue 为 shallowRef；React 用 subscribe 触发重渲染） */
export type CwLoginDialogCarrierOneTapRef = {
  readonly current?: CwLoginDialogCarrierOneTap
  subscribe?: (listener: () => void) => () => void
}

export interface CwLoginDialogContentProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  loading?: boolean
  /** 展示文案（必填，由业务侧传入） */
  texts: CwLoginDialogTexts
  /** 透传 CwSelect 下拉浮层壳 class */
  selectPopupClass?: string
  /** 透传 CwSelect trigger 包裹层 class */
  selectPopupTriggerClass?: string
  /** 国家码选项，默认 +86 */
  countryCodeOptions?: CwSelectOption[]
  /** 协议链接；与 agreementDsl 二选一，优先 agreementDsl */
  agreementLinks?: CwLoginDialogAgreementLink[]
  /** 覆盖默认协议富文本 DSL */
  agreementDsl?: CwRichTextNode[]
  /** 底部第三方登录入口（可选） */
  thirdPartyLinks?: CwLoginDialogThirdPartyLink[]
  /** 有 generate + poll 时启用微信扫码列（开放平台或公众号关注码） */
  generateWechatQrcode?: () => Promise<WechatPcQrcodeGenerateResult>
  pollWechatLogin?: (options: {
    state: string
    signal?: AbortSignal
  }) => Promise<WechatPcQrcodeLoginStatus>
  onWechatSuccess?: (pair: TokenPair) => void | Promise<void>
  onSendCode?: (phone: string, dialCode: string) => Promise<{ success: boolean; error?: string }>
  onLogin?: (phone: string, code: string, dialCode: string) => Promise<{ success: boolean; userInfo?: unknown; token?: string; error?: string }>
  onAgreementLink?: (id: string) => void
  onThirdPartyLogin?: (id: string) => void
  onOtpHelp?: () => void
  /**
   * 窄屏短信页上的「手机号一键登录」。宽屏忽略。
   */
  carrierOneTap?: CwLoginDialogCarrierOneTap
  /** 打开后再写入时优先；与 carrierOneTap 同时存在时以 ref 当前值为准 */
  carrierOneTapRef?: CwLoginDialogCarrierOneTapRef
  /**
   * `full`：入口与验证码同页切换（宽屏 / 无外层栈）。
   * `entry`：只渲染手机号入口，发送成功后抛 `request-otp` 供 CwStack push。
   * `otp`：只渲染验证码页。
   */
  variant?: 'full' | 'entry' | 'otp'
  initialPhone?: string
  initialDialCode?: string
  /** 登录成功（对应 Vue `success` 事件） */
  onSuccess?: (data: { userInfo: unknown; token: string }) => void
  /** 取消（对应 Vue `cancel` 事件） */
  onCancel?: () => void
  /** 入口发送成功、需要外层栈 push 验证码页（对应 Vue `request-otp` 事件） */
  onRequestOtp?: (payload: { phone: string; dialCode: string }) => void
  className?: string
}

/** 组件实例句柄（对应 Vue `defineExpose`） */
export interface CwLoginDialogContentHandle {
  reset: () => void
}

export type CwLoginDialogMobileStackProps = Omit<
  CwLoginDialogContentProps,
  'variant' | 'initialPhone' | 'initialDialCode' | 'loading' | 'onRequestOtp'
>

export interface ShowLoginDialogOptions {
  /** 展示文案（必填，由业务侧传入） */
  texts: CwLoginDialogTexts
  /** 追加到 CwDynamicDialog modal content 壳的 class */
  dialogContentClass?: string
  /** 追加到 CwDynamicDialog body 壳的 class */
  dialogBodyClass?: string
  selectPopupClass?: string
  selectPopupTriggerClass?: string
  countryCodeOptions?: CwSelectOption[]
  agreementLinks?: CwLoginDialogAgreementLink[]
  agreementDsl?: CwRichTextNode[]
  thirdPartyLinks?: CwLoginDialogThirdPartyLink[]
  generateWechatQrcode?: CwLoginDialogContentProps['generateWechatQrcode']
  pollWechatLogin?: CwLoginDialogContentProps['pollWechatLogin']
  onWechatSuccess?: CwLoginDialogContentProps['onWechatSuccess']
  onSendCode?: (phone: string, dialCode: string) => Promise<{ success: boolean; error?: string }>
  onLogin?: (phone: string, code: string, dialCode: string) => Promise<{ success: boolean; userInfo?: unknown; token?: string; error?: string }>
  onAgreementLink?: (id: string) => void
  onThirdPartyLogin?: (id: string) => void
  onOtpHelp?: () => void
  onSuccess?: (data: { userInfo: unknown; token: string }) => void
  carrierOneTap?: CwLoginDialogCarrierOneTap
  /**
   * 打开后再补齐一键登录（入口页会跟着刷新）。
   * 与 carrierOneTap 同时存在时以 Ref 当前值为准。
   */
  carrierOneTapRef?: CwLoginDialogCarrierOneTapRef
}

export interface ShowLoginDialogResult {
  userInfo: unknown
  token: string
}

/** Vue 事件签名兼容导出（React 侧以同名 onXxx 回调使用） */
export interface CwLoginDialogContentEmits {
  (e: 'success', data: { userInfo: any; token: string }): void
  (e: 'cancel'): void
  (e: 'request-otp', payload: { phone: string; dialCode: string }): void
}
