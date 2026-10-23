import { useEffect, useMemo, useState } from 'react'
import { CwIcon } from '../CwIcon'
import { FOCUS_VISIBLE_INTERACTIVE_CLASS } from '@zengchaowu/ui-shared/functions/ui/focusStyles'
import type {
  CwChatQueuedOutboundDockProps,
  CwChatQueuedOutboundItem,
} from './types'

function previewText(item: CwChatQueuedOutboundItem): string {
  const t = String(item.content ?? '').replace(/\s+/g, ' ').trim()
  if (t) return t
  const n = item.attachmentCount ?? 0
  if (n > 0) return n === 1 ? '1 attachment' : `${n} attachments`
  return '(empty)'
}

function attachmentLabel(item: CwChatQueuedOutboundItem): string | null {
  const n = item.attachmentCount ?? 0
  if (n <= 0) return null
  return n === 1 ? '1 attachment' : `${n} attachments`
}

export function CwChatQueuedOutboundDock({
  items,
  defaultExpanded = true,
  onRemove,
  className,
  ...rest
}: CwChatQueuedOutboundDockProps) {
  const [expanded, setExpanded] = useState(defaultExpanded)

  useEffect(() => {
    setExpanded(defaultExpanded)
  }, [defaultExpanded])

  const headerLabel = useMemo(() => {
    const n = items.length
    if (n === 1) return '1 Queued Message'
    return `${n} Queued Messages`
  }, [items.length])

  if (items.length === 0) return null

  return (
    <div
      className={[
        'cw-chat-queued-outbound-dock mx-3 -mb-px shrink-0 overflow-hidden rounded-t-xl border border-b-0 border-[var(--border-color)] bg-[var(--bg-color-container)]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      data-cw-chat-queued-outbound
      {...rest}
    >
      <div className="flex items-center gap-2 px-2.5 py-1.5">
        <button
          type="button"
          className={[
            'flex min-w-0 flex-1 items-center gap-1 border-0 bg-transparent p-0 text-left outline-none',
            FOCUS_VISIBLE_INTERACTIVE_CLASS,
          ]
            .filter(Boolean)
            .join(' ')}
          aria-expanded={expanded ? 'true' : 'false'}
          onClick={() => setExpanded((value) => !value)}
        >
          <CwIcon
            name="common--dir--arrow-right-line"
            prefix="icon"
            size={0.625}
            className={[
              'shrink-0 text-[var(--text-color-placeholder)] transition-transform',
              expanded ? 'rotate-90' : '',
            ]
              .filter(Boolean)
              .join(' ')}
          />
          <span className="truncate [font-size:var(--font-size-xs)] font-normal text-[var(--text-color-primary)]">
            {headerLabel}
          </span>
        </button>
      </div>

      <ul
        className="m-0 max-h-60 list-none space-y-1.5 overflow-y-auto border-t border-[var(--border-color)] px-2.5 py-2"
        style={expanded ? undefined : { display: 'none' }}
      >
        {items.map((item) => {
          const label = attachmentLabel(item)
          return (
            <li
              key={item.clientMessageId}
              className="group flex min-w-0 items-center gap-2"
            >
              <span
                className="h-2 w-2 shrink-0 rounded-full border border-[var(--text-color-placeholder)] bg-transparent"
                aria-hidden="true"
              />
              <div className="min-w-0 flex-1">
                <p className="m-0 line-clamp-3 whitespace-pre-wrap break-words [font-size:var(--font-size-caption)] leading-snug text-[var(--text-color-primary)]">
                  {previewText(item)}
                </p>
                {label && (
                  <p className="m-0 mt-0.5 [font-size:var(--font-size-xs)] text-[var(--text-color-placeholder)]">
                    {label}
                  </p>
                )}
              </div>
              <button
                type="button"
                className="invisible inline-flex h-5 w-5 shrink-0 items-center justify-center rounded border-0 bg-transparent p-0 text-[var(--text-color-placeholder)] outline-none hover:bg-[var(--bg-color-component-hover)] hover:text-[var(--text-color-primary)] group-hover:visible"
                aria-label="Remove queued message"
                onClick={() => onRemove?.(item.clientMessageId)}
              >
                <CwIcon name="common--status--close-line" prefix="icon" size={0.75} />
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default CwChatQueuedOutboundDock
