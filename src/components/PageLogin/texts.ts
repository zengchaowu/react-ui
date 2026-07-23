export interface PageLoginTexts {
  welcome: string
  segmentSms: string
  segmentPassword: string
  phonePlaceholder: string
  phoneOrEmailPlaceholder: string
  codePlaceholder: string
  passwordPlaceholder: string
  sendCodeButton: string
  loginButton: string
  loggingIn: string
  privacyPrefix: string
  privacyLink: string
  forgotPassword: string
  ssoLogin: string
  noAccount: string
  register: string
  sendCodeError: string
  loginError: string
  loginErrorGeneral: string
  wechatLoginTitle: string
  wechatLoginHint: string
  qrcodePlaceholder: string
  appleLogin: string
  wechatDisclaimer: string
  privacyAgreement: string
  phoneOrEmail: string
  registerLabel: string
  phoneRegister: string
  switchQrcodeLabel: string
  switchPhoneLabel: string
  qrcodeImageAlt: string
}

export function defaultPageLoginTexts(productName = 'App'): PageLoginTexts {
  return {
    welcome: `欢迎使用 ${productName}`,
    segmentSms: '短信登录',
    segmentPassword: '密码登录',
    phonePlaceholder: '请输入手机号',
    phoneOrEmailPlaceholder: '请输入手机号码或邮箱',
    codePlaceholder: '验证码',
    passwordPlaceholder: '请输入密码',
    sendCodeButton: '发送',
    loginButton: '登录',
    loggingIn: '登录中...',
    privacyPrefix: '阅读并同意',
    privacyLink: '隐私政策',
    forgotPassword: '忘记密码',
    ssoLogin: '使用SSO登录',
    noAccount: '还没有账号? ',
    register: '注册',
    sendCodeError: '发送失败，请稍后重试',
    loginError: '登录失败，请检查验证码',
    loginErrorGeneral: '登录失败，请稍后重试',
    wechatLoginTitle: '微信扫码一键登录',
    wechatLoginHint: '扫码后关注公众号即可完成注册登录',
    qrcodePlaceholder: '二维码占位',
    appleLogin: 'Apple 登录',
    wechatDisclaimer: `未注册的微信号将自动创建${productName}账号，注册登录`,
    privacyAgreement: '即代表同意',
    phoneOrEmail: '手机号/邮箱',
    registerLabel: '注册',
    phoneRegister: '手机号/邮箱注册',
    switchQrcodeLabel: '微信扫码登录',
    switchPhoneLabel: '其他登录方式',
    qrcodeImageAlt: '微信扫码登录',
  }
}

/** @deprecated 使用 defaultPageLoginTexts */
export const defaultTexts = defaultPageLoginTexts
