import type { LoginMethod } from '../PageLoginMobile/types'
import type { PageLoginTexts } from './texts'

export type PageLoginView = 'form' | 'qrcode'

export interface PageLoginProps {
  /** 产品名称，用于欢迎语 */
  productName?: string
  /** 当前视图：form 手机/密码登录，qrcode 微信扫码 */
  view?: PageLoginView
  /** 是否加载中 */
  loading?: boolean
  /** 二维码图片 URL（qrcode 视图） */
  qrcodeUrl?: string
  /** 样式覆盖 */
  styles?: Partial<PageLoginStyles>
  /** 文案覆盖 */
  texts?: Partial<PageLoginTexts>
  /** 发送验证码回调 */
  onSendCode?: (phone: string) => Promise<{ success: boolean; error?: string } | void>
  /** 登录回调 */
  onLogin?: (phone: string, codeOrPassword: string, method: LoginMethod) => Promise<{ success: boolean; token?: string; userInfo?: unknown; error?: string } | void>
}

export interface PageLoginStyles {
  root: string
  card: string
  switchSlot: string
  qrcodeBox: string
  qrcodeImage: string
  wechatFooter: string
}

export interface PageLoginEmits {
  'update:view': [value: PageLoginView]
  sendCode: [phone: string]
  login: [phone: string, codeOrPassword: string, method: LoginMethod]
  privacyClick: []
  forgotPasswordClick: []
  ssoClick: []
  registerClick: []
  appleLoginClick: []
}
