import type { CwChatAgentToolStepStyles } from './types'
import { FOCUS_VISIBLE_INTERACTIVE_CLASS } from '@zengchaowu/ui-shared/functions/ui/focusStyles'
import {
  agentToolHeaderChevronClass,
  agentToolHeaderChevronExpandedClass,
} from './chrome'

export const agentToolStepBase: CwChatAgentToolStepStyles = {
  root:
    'cw-chat-agent-tool-step w-full min-w-0 max-w-full overflow-hidden rounded-lg border border-[var(--border-color)] bg-[var(--chat-message-card-bg)] text-[var(--text-color-primary)]',
  header:
    `group flex w-full min-w-0 cursor-pointer items-center gap-1.5 border-0 bg-transparent px-2 py-1 text-left outline-none transition-colors hover:bg-[var(--bg-color-secondarycontainer)] ${FOCUS_VISIBLE_INTERACTIVE_CLASS}`,
  headerStatic:
    'flex w-full min-w-0 items-center gap-1.5 px-2 py-1 text-left',
  headerChevron: agentToolHeaderChevronClass,
  headerChevronExpanded: agentToolHeaderChevronExpandedClass,
  stepIcon: 'inline-flex h-4 w-4 shrink-0 items-center justify-center',
  stepIconRunning: 'text-[var(--brand-color-6)]',
  stepIconDone: 'text-[var(--success-color-6)]',
  stepIconError: 'text-[var(--error-color-6)]',
  stepName:
    'min-w-0 flex-1 truncate [font-size:var(--font-size-body)] font-medium leading-snug text-[var(--text-color-primary)]',
  stepStatus:
    'shrink-0 [font-size:var(--font-size-body)] text-[var(--text-color-placeholder)]',
  stepDetail: 'space-y-1 hairline-border-t border-[var(--border-color)] px-2 py-1',
  stepDetailPre:
    'max-h-[6rem] overflow-auto whitespace-pre-wrap break-all rounded bg-[var(--bg-color-secondarycontainer)] px-2 py-1 [font-size:var(--font-size-body)] leading-snug text-[var(--text-color-secondary)] select-text cursor-text',
}

export type CwChatAgentToolStepLayout = 'standalone' | 'logLine'

const agentToolLogLineBase: CwChatAgentToolStepStyles = {
  root: 'cw-chat-agent-tool-log w-full min-w-0 max-w-full bg-transparent text-[var(--text-color-primary)]',
  header: `group flex w-full min-w-0 cursor-pointer items-center gap-1 border-0 bg-transparent px-0 py-1 text-left outline-none ${FOCUS_VISIBLE_INTERACTIVE_CLASS}`,
  headerStatic: 'flex w-full min-w-0 items-center gap-1 px-0 py-1 text-left',
  headerChevron: agentToolHeaderChevronClass,
  headerChevronExpanded: agentToolHeaderChevronExpandedClass,
  stepIcon: 'inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center',
  stepIconRunning: 'text-[var(--brand-color-6)]',
  stepIconDone: 'text-[var(--text-color-secondary)]',
  stepIconError: 'text-[var(--error-color-6)]',
  stepName:
    'min-w-0 flex-1 truncate [font-size:var(--font-size-body)] font-normal leading-snug text-[var(--text-color-primary)]',
  stepStatus: 'hidden',
  stepDetail: 'space-y-1 pl-4 pb-1',
  stepDetailPre:
    'max-h-[8rem] overflow-auto whitespace-pre-wrap break-all [font-size:var(--font-size-body)] leading-relaxed text-[var(--text-color-secondary)] select-text cursor-text',
}

export function resolveAgentToolStepLayoutClasses(
  layout: CwChatAgentToolStepLayout,
): CwChatAgentToolStepStyles {
  if (layout === 'logLine') return agentToolLogLineBase
  return agentToolStepBase
}
