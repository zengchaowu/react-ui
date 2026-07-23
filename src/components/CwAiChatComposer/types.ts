export interface CwAiChatComposerProps {
  modelValue: string
  disabled?: boolean
  sending?: boolean
  showAttach?: boolean
  /** 左侧语音按钮 */
  showVoice?: boolean
  /** 语音按钮 iconfont 名（无 `icon-` 前缀） */
  voiceIcon?: string
  minRows?: number
  maxRows?: number
  /** 窄屏：未聚焦 inline 单行；聚焦 stacked 最多 2 行。子元素绝对定位，位置由 layoutGeometry 计算 */
  narrowCompactLayout?: boolean
  styles?: Partial<CwAiChatComposerStyles>
  texts?: Partial<CwAiChatComposerTexts>
}

export interface CwAiChatComposerEmits {
  (e: 'update:modelValue', value: string): void
  (e: 'submit'): void
  (e: 'stop'): void
  (e: 'attach-click'): void
  (e: 'voice-mode-change', active: boolean): void
  (e: 'voice-record-start'): void
  (e: 'voice-record-end', payload: import('./voiceHoldTypes').VoiceRecordEndPayload): void
}

export interface CwAiChatComposerStyles {
  root: string
  shell: string
  /** TipTap 编辑区容器（原 textarea 区域） */
  editorField: string
  /** 窄屏未聚焦：单行裁剪 */
  editorFieldCompact?: string
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
