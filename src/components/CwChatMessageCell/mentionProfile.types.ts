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

/** 与 vue-ui `CwMessageInput/types` 的 `CwMessageInputMentionItem` 对齐（React 侧尚未拆分 chips） */
export interface CwMessageInputMentionItem {
  id: string
  label: string
  avatar?: string
  kind?: 'user' | 'file' | 'folder'
  path?: string
}
