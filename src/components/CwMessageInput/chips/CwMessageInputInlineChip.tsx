import type { HTMLAttributes, PointerEvent, ReactNode } from 'react'
import CwIcon from '../../CwIcon/CwIcon'
import CwTruncateText from '../../CwTruncateText/CwTruncateText'
import {
  FILE_CHIP_LABEL_MAX_WIDTH,
  INLINE_CHIP_CLOSE_BTN_CLASS,
  INLINE_CHIP_CLOSE_ICON_CLASS,
  INLINE_CHIP_CLOSE_ICON_CW_ICON_STYLES,
  INLINE_CHIP_ICON_FALLBACK_CLASS,
  INLINE_CHIP_ICON_IMG_CLASS,
  INLINE_CHIP_LEADING_WRAP_CLASS,
} from './chipStyles'

export interface CwMessageInputInlineChipProps
  extends Omit<HTMLAttributes<HTMLSpanElement>, 'children' | 'onClose'> {
  /** 内层根 class（须含语义类，如 `FILE_CHIP_INNER_CLASS` / `USER_MENTION_INNER_CLASS`） */
  innerClass: string
  /** 展示文案（文件名为纯文本；@人一般为 `@昵称`） */
  text: string
  /** 是否展示前导区（图标或 `leading` 插槽） */
  showLeadingIcon?: boolean
  /** `showLeadingIcon` 且未使用插槽时：有 URL 则 `<img>` */
  iconUrl?: string
  /** 有前导、无 `iconUrl`、无插槽时的占位字符 */
  leadingFallbackText?: string
  /** 是否展示关闭区 */
  showClose?: boolean
  /** 文件引用等：关闭为图标（`span`），非 `<button>` */
  closeAsIcon?: boolean
  closeDisabled?: boolean
  closeAriaLabel?: string
  /** 主文案节点 class（非 `labelFilenameTruncate` 时） */
  labelClass?: string
  /** 文件名中间省略（`CwTruncateText` `placement="middle"`） */
  labelFilenameTruncate?: boolean
  /** 文件名截断时是否显示内置 tooltip；外层已有整颗 chip 的路径 tooltip 时传 false */
  labelTooltip?: boolean
  /** 绑定到内层根上的额外属性（如 data-*） */
  innerAttrs?: Record<string, string | undefined>
  /** 消息气泡等只读场景：不设 contenteditable=false，便于正文划选高亮 */
  readonly?: boolean
  /** Vue `#leading` 具名插槽 */
  leadingSlot?: ReactNode
  onClose?: () => void
}

export function CwMessageInputInlineChip({
  innerClass,
  text,
  showLeadingIcon = false,
  iconUrl,
  leadingFallbackText = '📄',
  showClose = false,
  closeAsIcon = false,
  closeDisabled = false,
  closeAriaLabel = '关闭',
  labelClass = 'cw-inline-chip-label min-w-0 shrink truncate',
  labelFilenameTruncate = false,
  labelTooltip = true,
  innerAttrs,
  readonly = false,
  leadingSlot,
  className,
  onClose,
  ...rest
}: CwMessageInputInlineChipProps) {
  function onClosePointerDown(event: PointerEvent<HTMLElement>) {
    event.preventDefault()
    event.stopPropagation()
  }

  function onCloseClick() {
    if (closeDisabled) return
    onClose?.()
  }

  return (
    <span
      {...rest}
      contentEditable={readonly ? undefined : false}
      className={[innerClass, className].filter(Boolean).join(' ')}
      {...innerAttrs}
    >
      {showLeadingIcon && (
        <span className={INLINE_CHIP_LEADING_WRAP_CLASS}>
          {leadingSlot ?? (
            iconUrl ? (
              <img
                src={iconUrl}
                className={INLINE_CHIP_ICON_IMG_CLASS}
                alt=""
                draggable={false}
              />
            ) : (
              <span className={INLINE_CHIP_ICON_FALLBACK_CLASS}>
                {leadingFallbackText}
              </span>
            )
          )}
        </span>
      )}
      {labelFilenameTruncate ? (
        <CwTruncateText
          text={text}
          placement="middle"
          tag="span"
          appearance="chip"
          maxWidth={FILE_CHIP_LABEL_MAX_WIDTH}
          title={text.trim() || undefined}
          showTooltip={labelTooltip}
        />
      ) : (
        <span className={labelClass} title={text.trim() || undefined}>
          {text}
        </span>
      )}
      {showClose && closeAsIcon && (
        <span
          role="button"
          tabIndex={-1}
          className={[
            INLINE_CHIP_CLOSE_ICON_CLASS,
            closeDisabled ? 'pointer-events-none opacity-50' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          aria-label={closeAriaLabel}
          aria-disabled={closeDisabled ? 'true' : undefined}
          onPointerDown={onClosePointerDown}
          onClick={(event) => {
            event.preventDefault()
            event.stopPropagation()
            onCloseClick()
          }}
        >
          <CwIcon
            name="common--status--close-line"
            size={INLINE_CHIP_CLOSE_ICON_CW_ICON_STYLES.size}
            className={INLINE_CHIP_CLOSE_ICON_CW_ICON_STYLES.class}
          />
        </span>
      )}
      {showClose && !closeAsIcon && (
        <div
          role="button"
          tabIndex={closeDisabled ? undefined : 0}
          className={[
            INLINE_CHIP_CLOSE_BTN_CLASS,
            closeDisabled ? '' : 'cursor-pointer',
          ]
            .filter(Boolean)
            .join(' ')}
          aria-label={closeAriaLabel}
          aria-disabled={closeDisabled ? 'true' : undefined}
          onPointerDown={onClosePointerDown}
          onClick={(event) => {
            event.preventDefault()
            event.stopPropagation()
            onCloseClick()
          }}
          onKeyDown={(event) => {
            if (event.key !== 'Enter' && event.key !== ' ') return
            event.preventDefault()
            event.stopPropagation()
            onCloseClick()
          }}
        >
          ×
        </div>
      )}
    </span>
  )
}

export default CwMessageInputInlineChip
