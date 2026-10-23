import { useState, type ReactNode } from 'react'
import { pathBasename } from '@zengchaowu/shared/functions/path/pathBasename'
import { buildLineUnifiedDiff } from '@zengchaowu/shared/functions/diff/lineUnifiedDiff'
import { pickToolPathFromPreview } from '@zengchaowu/shared/functions/ai/agentToolDisplayPolicy'
import { FOCUS_VISIBLE_INTERACTIVE_CLASS } from '@zengchaowu/ui-shared/functions/ui/focusStyles'
import { designPxToRemNum } from '@zengchaowu/ui-shared/functions/ui/cwRemSize'
import { CwFileIcon } from '../CwFileIcon'
import { CwIcon } from '../CwIcon'
import type { CwChatFileChangeBlockProps } from './types'

const FILE_ICON_SIZE = designPxToRemNum(12)

/** 等价 Vue `CwAgentToolShimmerLabel` */
function ShimmerLabel({
  active = false,
  className,
  children,
}: {
  active?: boolean
  className?: string
  children: ReactNode
}) {
  return (
    <span
      className={[
        'cw-agent-tool-shimmer-label',
        active ? 'cw-agent-tool-shimmer-label--active' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </span>
  )
}

function rowClass(type: string): string {
  if (type === 'add')
    return 'bg-[color-mix(in_srgb,var(--success-color-6)_12%,transparent)] text-[var(--success-color-7)]'
  if (type === 'del')
    return 'bg-[color-mix(in_srgb,var(--error-color-6)_12%,transparent)] text-[var(--error-color-7)]'
  if (type === 'skip') return 'text-[var(--text-color-placeholder)] italic'
  return 'text-[var(--text-color-secondary)]'
}

function rowPrefix(type: string): string {
  if (type === 'add') return '+'
  if (type === 'del') return '-'
  return ' '
}

export function CwChatFileChangeBlock({
  chatMessageId,
  step,
  review = null,
  onOpenPath,
  className,
  ...rest
}: CwChatFileChangeBlockProps) {
  const running = step.status === 'running'

  const pathLabel = (() => {
    const fromReview = String(review?.path ?? '').trim()
    if (fromReview) return fromReview
    return pickToolPathFromPreview(step.argsPreview) || ''
  })()

  const fileName = pathBasename(pathLabel) || pathLabel || 'file'

  const diff = review ? buildLineUnifiedDiff(review.before, review.after) : null

  const canExpand = !!diff && !running

  const [expanded, setExpanded] = useState(true)

  function onToggleExpand() {
    if (!canExpand) return
    setExpanded((value) => !value)
  }

  function onOpen() {
    const p = pathLabel.trim()
    if (!p) return
    onOpenPath?.(p)
  }

  return (
    <div
      {...rest}
      className={[
        'w-full min-w-0 overflow-hidden rounded-lg border border-[var(--border-color)] bg-[var(--bg-color-container)]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      data-cw-chat-message-bubble-body
      data-chat-message-id={chatMessageId}
      data-cw-chat-file-change
      data-cw-chat-file-change-card
    >
      <div className="flex min-w-0 items-center gap-1 px-2 py-1.5">
        <button
          type="button"
          className={[
            'flex min-w-0 flex-1 items-center gap-1.5 border-0 bg-transparent p-0 text-left outline-none',
            FOCUS_VISIBLE_INTERACTIVE_CLASS,
          ]
            .filter(Boolean)
            .join(' ')}
          title={pathLabel || undefined}
          disabled={!canExpand}
          onClick={onToggleExpand}
        >
          {canExpand ? (
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
          ) : null}
          <CwFileIcon
            path={pathLabel || fileName}
            size={FILE_ICON_SIZE}
            className="shrink-0 select-none"
          />
          <ShimmerLabel
            active={running}
            className="min-w-0 truncate [font-size:var(--font-size-body)] leading-snug text-[var(--text-color-primary)]"
          >
            {fileName}
          </ShimmerLabel>
          {diff && (diff.added > 0 || diff.removed > 0) ? (
            <span className="shrink-0 font-mono tabular-nums leading-none [font-size:var(--font-size-body)]">
              {diff.added > 0 ? (
                <span className="text-[var(--success-color-6)]">
                  +{diff.added}
                </span>
              ) : null}
              {diff.removed > 0 ? (
                <span
                  className={[
                    'text-[var(--error-color-6)]',
                    diff.added > 0 ? 'ml-0.5' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  -{diff.removed}
                </span>
              ) : null}
            </span>
          ) : null}
        </button>
        {pathLabel ? (
          <button
            type="button"
            className={[
              'shrink-0 border-0 bg-transparent px-1 py-0.5 [font-size:var(--font-size-body)] leading-none text-[var(--text-color-secondary)] outline-none hover:text-[var(--text-color-primary)]',
              FOCUS_VISIBLE_INTERACTIVE_CLASS,
            ]
              .filter(Boolean)
              .join(' ')}
            title="在编辑器中打开"
            onClick={onOpen}
          >
            Open
          </button>
        ) : null}
      </div>

      {expanded && diff && canExpand ? (
        <div className="max-h-[16rem] overflow-auto border-t border-[var(--border-color)] font-mono [font-size:var(--font-size-body)] leading-relaxed">
          {diff.lines.map((row, i) => (
            <div
              key={i}
              className={[
                'flex whitespace-pre px-2 py-px',
                rowClass(row.type),
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {row.type === 'skip' ? (
                <span className="text-[var(--text-color-placeholder)]">
                  … {row.skipped ?? 0} unchanged lines …
                </span>
              ) : (
                <>
                  <span className="w-8 shrink-0 select-none pr-2 text-right opacity-50">
                    {row.newLine ?? row.oldLine ?? ''}
                  </span>
                  <span className="select-none opacity-70">
                    {rowPrefix(row.type)}
                  </span>
                  <span className="min-w-0">{row.text}</span>
                </>
              )}
            </div>
          ))}
          {diff.lines.length === 0 ? (
            <div className="px-2 py-2 text-[var(--text-color-placeholder)]">
              No line changes
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

export default CwChatFileChangeBlock
