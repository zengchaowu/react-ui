import type { CwChatAgentToolTimelineStyles } from './types'
import { FOCUS_VISIBLE_INTERACTIVE_CLASS } from '@zengchaowu/ui-shared/functions/ui/focusStyles'
import {
  agentToolHeaderChevronClass,
  agentToolHeaderChevronExpandedClass,
} from '../CwChatAgentToolStep/chrome'

export const agentToolTimelineBase: CwChatAgentToolTimelineStyles = {
  root:
    'cw-chat-agent-tool-timeline w-full min-w-0 max-w-full bg-transparent text-[var(--text-color-primary)]',
  header:
    `group flex w-full min-w-0 cursor-pointer items-center gap-1 border-0 bg-transparent px-0 py-1 text-left outline-none ${FOCUS_VISIBLE_INTERACTIVE_CLASS}`,
  headerChevron: agentToolHeaderChevronClass,
  headerChevronExpanded: agentToolHeaderChevronExpandedClass,
  headerLabel:
    '[font-size:var(--font-size-body)] leading-snug text-[var(--text-color-primary)]',
  list: 'flex flex-col gap-1.5 pl-4',
  step: 'min-w-0 rounded-md px-1.5 py-1',
  stepHeader:
    'group flex min-w-0 w-full cursor-pointer items-center gap-1.5 border-0 bg-transparent p-0 text-left outline-none hover:opacity-90',
  stepIcon: 'inline-flex h-4 w-4 shrink-0 items-center justify-center',
  stepIconRunning: 'text-[var(--brand-color-6)]',
  stepIconDone: 'text-[var(--success-color-6)]',
  stepIconError: 'text-[var(--error-color-6)]',
  stepName:
    'min-w-0 flex-1 truncate [font-size:var(--font-size-body)] font-medium leading-snug text-[var(--text-color-primary)]',
  stepStatus:
    'shrink-0 [font-size:var(--font-size-body)] text-[var(--text-color-secondary)]',
  stepDetail: 'mt-1 space-y-1 pl-5 pr-1 pb-1',
  stepDetailPre:
    'max-h-[8rem] overflow-auto whitespace-pre-wrap break-all rounded bg-[var(--bg-color-secondarycontainer)] px-2 py-1 [font-size:var(--font-size-body)] leading-relaxed text-[var(--text-color-secondary)] select-text cursor-text',
}
