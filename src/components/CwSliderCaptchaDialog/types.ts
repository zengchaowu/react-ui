import type { CwIconEmbed } from '../CwIcon/types'

/** 与 API `SLIDER_WIDTH`（设计稿 300px @16）对齐的 rem 宽度 */
export const CW_SLIDER_CAPTCHA_WIDTH_REM = 18.75

export interface CwSliderCaptchaChallenge {
  challengeId: string
  /** PNG base64（不含 data: 前缀） */
  backgroundImage: string
  puzzleImage: string
  puzzleY: number
  width: number
  height: number
  pieceWidth: number
  pieceHeight: number
}

export interface CwSliderCaptchaDialogStyles {
  root: string
  loading: string
  imageStage: string
  backgroundImage: string
  puzzleImage: string
  toolbar: string
  toolbarBtn: string
  refreshMask: string
  refreshBadge: string
  track: string
  progress: string
  hint: string
  handle: string
  footer: string
  error: string
  iconStyles?: CwIconEmbed
  toolbarIconStyles?: CwIconEmbed
}

export interface CwSliderCaptchaDialogTexts {
  title: string
  loading: string
  hint: string
  refreshing: string
  refresh: string
  refreshAriaLabel: string
  helpAriaLabel: string
  serviceAriaLabel: string
  handleAriaLabel: string
  loadError: string
  verifyError: string
  imageLoadError: string
  notReady: string
}

export type GenerateSliderCaptchaChallenge = () => Promise<CwSliderCaptchaChallenge>

export type VerifySliderCaptchaOffset = (
  challengeId: string,
  offsetX: number,
) => Promise<string>

export interface ShowSliderCaptchaDialogOptions {
  texts?: Partial<CwSliderCaptchaDialogTexts>
  /** 拉取滑块挑战（站点注入 API） */
  onGenerate: GenerateSliderCaptchaChallenge
  /** 校验偏移并返回 captcha token */
  onVerify: VerifySliderCaptchaOffset
  onSuccess?: (token: string) => void
}

export type ShowSliderCaptchaDialogResult = string | 'cancel'
