import type { CwChatAgentToolTimelineStyles } from './types'
import { FOCUS_VISIBLE_INTERACTIVE_CLASS } from '../../utils/focusStyles'

export const defaultCwChatAgentToolTimelineStyles: CwChatAgentToolTimelineStyles = {
  root:
    'cw-chat-agent-tool-timeline w-full min-w-0 max-w-full rounded-lg border border-[var(--component-border)] bg-[var(--bg-color-secondarycontainer)] text-[var(--text-color-primary)]',
  header:
    `flex w-full min-w-0 cursor-pointer items-center gap-1.5 border-0 bg-transparent px-2.5 py-1.5 text-left outline-none transition-colors hover:bg-[var(--bg-color-component-hover)] ${FOCUS_VISIBLE_INTERACTIVE_CLASS}`,
  headerChevron:
    'shrink-0 text-[var(--text-color-placeholder)] transition-transform duration-150',
  headerChevronExpanded: 'rotate-90',
  headerLabel:
    '[font-size:var(--font-size-caption)] leading-snug text-[var(--text-color-secondary)]',
  list: 'flex flex-col gap-0 border-t border-[var(--border-color-extra-light)] px-1 py-1',
  step: 'min-w-0 rounded-md px-1.5 py-1',
  stepHeader:
    'flex min-w-0 w-full cursor-pointer items-center gap-1.5 border-0 bg-transparent p-0 text-left outline-none hover:opacity-90',
  stepIcon: 'inline-flex h-4 w-4 shrink-0 items-center justify-center',
  stepIconRunning: 'text-[var(--brand-color-6)]',
  stepIconDone: 'text-[var(--success-color-6)]',
  stepIconError: 'text-[var(--error-color-6)]',
  stepName:
    'min-w-0 flex-1 truncate [font-size:var(--font-size-caption)] font-medium leading-snug',
  stepStatus:
    'shrink-0 [font-size:var(--font-size-caption)] text-[var(--text-color-placeholder)]',
  stepDetail: 'mt-1 space-y-1 pl-5 pr-1 pb-1',
  stepDetailPre:
    'max-h-[8rem] overflow-auto whitespace-pre-wrap break-all rounded bg-[var(--bg-color-container)] px-2 py-1 [font-size:var(--font-size-caption)] leading-relaxed text-[var(--text-color-secondary)] select-text cursor-text',
}
