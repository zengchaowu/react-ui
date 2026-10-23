/**
 * 将文案模板中的占位符替换为实际手机号与国家码。
 */
export function formatOtpSentHint(template: string, dialCode: string, phone: string): string {
  return template.replace('{dialCode}', dialCode).replace('{phone}', phone)
}
