import type { HTMLAttributes } from 'react'
import type { VoiceRecordEndPayload } from './voiceHoldTypes'

export type CwAiChatComposerLayout = 'wide' | 'narrow'

export interface CwAiChatComposerProps {
  /** 草稿内容（Vue `modelValue`） */
  value: string
  disabled?: boolean
  sending?: boolean
  showAttach?: boolean
  /** 左侧语音按钮 */
  showVoice?: boolean
  /** 语音按钮 iconfont 名（无 `icon-` 前缀） */
  voiceIcon?: string
  minRows?: number
  maxRows?: number
  /**
   * 宿主侧待发附件数量。>0 时：允许发送（可无正文），窄屏展开主操作。
   */
  pendingAttachmentCount?: number
  /**
   * 宽屏 / 窄屏布局。
   * - `wide`：桌面卡片壳；底栏「语音+附件」左、「发送」右常显；按 minRows~maxRows 增高
   * - `narrow`：IM 条；未聚焦 inline 单行；聚焦 stacked 最多 2 行，发送随草稿展开
   */
  layout?: CwAiChatComposerLayout
  texts?: Partial<CwAiChatComposerTexts>
  /** Vue `update:modelValue` */
  onChange?: (value: string) => void
  /** Vue `submit` */
  onSubmit?: () => void
  /** Vue `stop` */
  onStop?: () => void
  /** Vue `attach-click` */
  onAttachClick?: () => void
  /** Vue `voice-mode-change` */
  onVoiceModeChange?: (active: boolean) => void
  /** Vue `voice-record-start` */
  onVoiceRecordStart?: () => void
  /** Vue `voice-record-end` */
  onVoiceRecordEnd?: (payload: VoiceRecordEndPayload) => void
}

export interface CwAiChatComposerHandle {
  focus: () => void
  enterVoiceMode: () => void
  exitVoiceMode: () => void
}

export type CwAiChatComposerComponentProps = CwAiChatComposerProps &
  Omit<
    HTMLAttributes<HTMLDivElement>,
    'children' | 'onChange' | 'onSubmit' | 'onSelect'
  >

export interface CwAiChatComposerStyles {
  root: string
  shell: string
  /** narrow IM 条壳 */
  shellNarrow?: string
  /** wide 桌面卡片壳（圆角 / 底色） */
  shellWide?: string
  /** 编辑区容器（原 textarea 区域） */
  editorField: string
  /** inline 单行（如语音模式）：编辑区与图标同高 */
  editorFieldInline?: string
  /** 达到 maxRows 后允许内部滚动 */
  editorFieldScrollable?: string
  /** 窄屏未触顶：禁止内部滚动 */
  editorFieldNarrow?: string
  attachBtn: string
  voiceBtn: string
  sendBtn: string
  stopBtn: string
  sendBtnDisabled: string
  sendSlot: string
  /** 语音模式：按住说话区域 */
  voiceHoldArea?: string
  voiceHoldAreaDisabled?: string
  voiceHoldAreaActive?: string
  voiceHoldAreaCancel?: string
  /** 按住录音时工具栏按钮/图标反色（需 ! 覆盖按钮默认色） */
  toolbarBtnVoiceHold?: string
  voiceHint?: string
}

export interface CwAiChatComposerTexts {
  placeholder: string
  attachAriaLabel: string
  voiceAriaLabel: string
  keyboardAriaLabel: string
  holdToSpeakLabel: string
  voiceRecordingHint: string
  sendAriaLabel: string
  stopAriaLabel: string
}


/** Vue 事件签名兼容导出（React 侧以同名 onXxx 回调使用） */
export interface CwAiChatComposerEmits {
  (e: 'update:modelValue', value: string): void
  (e: 'submit'): void
  (e: 'stop'): void
  (e: 'attach-click'): void
  (e: 'voice-mode-change', active: boolean): void
  (e: 'voice-record-start'): void
  (e: 'voice-record-end', payload: import('./voiceHoldTypes').VoiceRecordEndPayload): void
}
