export type VoiceHoldGestureZone = 'hold' | 'cancel' | 'convertText'

export type VoiceHoldInteractionMode = 'swipe-up' | 'wechat-overlay'

export interface VoiceRecordEndPayload {
  cancelled: boolean
  convertToText: boolean
}
