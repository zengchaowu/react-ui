/** @人 chip / tooltip 展示用资料 */
export interface CwImMentionProfile {
  label: string
  avatar?: string
}

export type CwImMentionProfileResolver = (
  userId: string,
) => CwImMentionProfile | undefined

/** 点击 @人 tooltip 打开资料页时携带的数据 */
export interface CwImMentionProfileClickPayload {
  userId: string
  label: string
  avatar?: string
}
