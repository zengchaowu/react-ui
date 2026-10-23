import type { ChatMessage } from '@zengchaowu/shared/types/im-chat'
import CwChatMessageComposer from '../../CwChatMessageComposer/CwChatMessageComposer'
import CwChatMessageList from '../../CwChatMessageList/CwChatMessageList'
import CwIcon from '../../CwIcon/CwIcon'
import {
  DESIGN_AI_AVATAR_FALLBACK_SRC,
  type DesignAiActivePlan,
  type DesignAiPlanTodoStatus,
} from '../composables/useFabricDesignEditorAiPanel'

export interface TpFabricDesignEditorAiPanelProps {
  agentDisplayName: string
  hasSelectionContext: boolean
  messages: ChatMessage[]
  streaming: boolean
  executingPlan: boolean
  busy: boolean
  ready: boolean
  activePlan: DesignAiActivePlan | null
  planAwaitingStart: boolean
  /** 等价 Vue `close` */
  onClose?: () => void
  /** 等价 Vue `clear` */
  onClear?: () => void
  /** 等价 Vue `stop` */
  onStop?: () => void
  /** 等价 Vue `start-plan` */
  onStartPlan?: () => void
  /** 等价 Vue `submit` */
  onSubmit?: (payload: { html: string; files: File[] }) => void
}

const avatarFallbackSrc = DESIGN_AI_AVATAR_FALLBACK_SRC

function noopDownload() {
  /* 设计助手侧栏无文件消息 */
}

function todoStatusMark(status: DesignAiPlanTodoStatus): string {
  if (status === 'done') return '✓'
  if (status === 'running') return '…'
  if (status === 'error') return '!'
  if (status === 'skipped') return '–'
  return '○'
}

export function TpFabricDesignEditorAiPanel({
  agentDisplayName,
  hasSelectionContext,
  messages,
  executingPlan,
  busy,
  ready,
  activePlan,
  planAwaitingStart,
  onClose,
  onClear,
  onStop,
  onStartPlan,
  onSubmit,
}: TpFabricDesignEditorAiPanelProps) {
  const composerPlaceholder = hasSelectionContext
    ? '描述要如何修改当前选中图层…'
    : '例如：生成一套基础组件库（Button / Input / Card）…'

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="flex shrink-0 items-center justify-between gap-2 hairline-border-b border-[var(--border-color)] px-3 py-2">
        <div className="min-w-0">
          <div className="truncate text-xs font-medium text-[var(--text-color-primary)]">
            AI 助手
          </div>
          <div className="truncate [font-size:var(--font-size-xs)] text-[var(--text-color-secondary)]">
            {agentDisplayName}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          <button
            type="button"
            className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[var(--text-color-secondary)] transition-colors hover:bg-[var(--bg-color-component-hover)] hover:text-[var(--text-color-primary)] disabled:opacity-40"
            title="清空会话"
            disabled={busy || messages.length === 0}
            onClick={() => onClear?.()}
          >
            <CwIcon name="common--action--trash-line" prefix="icon" size={0.875} />
          </button>
          <button
            type="button"
            className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[var(--text-color-secondary)] transition-colors hover:bg-[var(--bg-color-component-hover)] hover:text-[var(--text-color-primary)]"
            title="关闭"
            onClick={() => onClose?.()}
          >
            <CwIcon name="common--status--close-line" prefix="icon" size={0.875} />
          </button>
        </div>
      </header>

      {!ready ? (
        <p className="m-0 shrink-0 hairline-border-b border-[var(--border-color)] px-3 py-2 text-xs text-[var(--text-color-secondary)]">
          尚未配置设计画布助手。请管理员打开后台
          <strong className="text-[var(--text-color-primary)]">AI → 设计画布助手</strong>
          ，绑定并启用 Agent 后刷新页面。
        </p>
      ) : (
        <p className="m-0 shrink-0 hairline-border-b border-[var(--border-color)] px-3 py-1.5 text-xs text-[var(--text-color-secondary)]">
          {hasSelectionContext ? (
            <>
              当前将针对
              <strong className="text-[var(--text-color-primary)]">选中图层</strong>
              生成并替换。
            </>
          ) : (
            <>
              复杂任务会先出
              <strong className="text-[var(--text-color-primary)]">计划</strong>
              ，确认后按子任务追加到画布。
            </>
          )}
        </p>
      )}

      <div className="flex min-h-0 flex-1 flex-col">
        <CwChatMessageList
          className="min-h-0 flex-1"
          messages={messages}
          peerAvatarFallbackSrc={avatarFallbackSrc}
          mentionAvatarFallbackSrc={avatarFallbackSrc}
          downloadByUrl={noopDownload}
          alwaysFullWidthBubbles={true}
          texts={{ empty: '描述你想要的界面，开始对话…' }}
          rootClass="h-full min-h-0"
        />
      </div>

      {activePlan && (
        <div className="shrink-0 hairline-border-t border-[var(--border-color)] px-3 py-2">
          <div className="mb-1.5 text-xs font-medium text-[var(--text-color-primary)]">
            {activePlan.title}
          </div>
          <ul className="m-0 mb-2 list-none space-y-1 p-0">
            {activePlan.todos.map((todo) => (
              <li
                key={todo.id}
                className="flex items-start gap-1.5 text-xs text-[var(--text-color-secondary)]"
              >
                <span className="mt-0.5 shrink-0" aria-hidden="true">
                  {todoStatusMark(todo.status)}
                </span>
                <span
                  className={
                    todo.status === 'done'
                      ? 'text-[var(--text-color-secondary)] line-through'
                      : todo.status === 'running'
                        ? 'text-[var(--text-color-primary)]'
                        : todo.status === 'error'
                          ? 'text-[var(--error-color-6)]'
                          : ''
                  }
                >
                  {todo.content}
                  {todo.error ? <> — {todo.error}</> : null}
                </span>
              </li>
            ))}
          </ul>
          {planAwaitingStart ? (
            <button
              type="button"
              className="inline-flex h-8 w-full items-center justify-center rounded-md bg-[var(--brand-color-6)] text-xs font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40"
              disabled={!ready || busy}
              onClick={() => onStartPlan?.()}
            >
              开始执行
            </button>
          ) : executingPlan ? (
            <p className="m-0 text-xs text-[var(--text-color-secondary)]">
              正在执行子任务…可点停止中断。
            </p>
          ) : null}
        </div>
      )}

      <div className="shrink-0 px-2 pb-2 pt-1">
        <CwChatMessageComposer
          layoutVariant="workspace"
          mentionAvatarFallbackSrc={avatarFallbackSrc}
          disabled={!ready}
          enableAttachments={false}
          showToolbar={false}
          stopReplyActive={busy}
          workspaceShowAttachButton={false}
          placeholder={composerPlaceholder}
          onSubmit={(payload) => onSubmit?.(payload)}
          onStopAiReply={() => onStop?.()}
        />
      </div>
    </div>
  )
}

export default TpFabricDesignEditorAiPanel
