import type { CSSProperties, HTMLAttributes, ReactNode } from 'react'
import type { CwPushAsideProps } from './types'

export interface CwPushAsideComponentProps
  extends CwPushAsideProps,
    Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'className' | 'style'> {
  className?: string
  style?: CSSProperties
  /** 侧栏内容（宽度由组件控制，内部自己撑满即可） */
  children?: ReactNode
  /** 主区内容 */
  main?: ReactNode
  /** open 变化回调（对应 Vue 的 v-model:open） */
  onUpdateOpen?: (open: boolean) => void
  /** 点击遮罩关闭时触发 */
  onClose?: () => void
}

/**
 * CwPushAside 推入式侧栏（移动端抽屉形态）。
 *
 * 与覆盖式抽屉不同：展开时主区**整体平移**到右侧（保持自身宽度，不重新排版），
 * 收起后侧栏滑出视口左侧。实现是「一条比容器宽 sideWidth 的轨道 + translateX」，
 * 所以主区内容不会因侧栏展开而 reflow。
 *
 * - `children`：侧栏内容
 * - `main`：主区内容
 * - 收起时侧栏自动 `inert` + `aria-hidden`，不会被 Tab 聚焦
 *
 * 根节点用 `overflow-clip`：`overflow-hidden` 仍是可滚动容器，
 * 点击被推出去的主区会因焦点滚动把整条轨道滚偏。
 */
export function CwPushAside({
  open = false,
  width = '17.5rem',
  duration = 300,
  scrim = true,
  scrimAriaLabel = '关闭侧栏',
  children,
  main,
  className,
  style,
  onUpdateOpen,
  onClose,
  ...rest
}: CwPushAsideComponentProps) {
  const widthStyle = typeof width === 'number' ? `${width}px` : width

  const paneStyle: CSSProperties = { width: widthStyle }

  const trackStyle: CSSProperties = {
    width: `calc(100% + ${widthStyle})`,
    transform: open ? 'translateX(0)' : `translateX(-${widthStyle})`,
    transitionDuration: `${duration}ms`,
  }

  function close(): void {
    if (!open) return
    onUpdateOpen?.(false)
    onClose?.()
  }

  const rootClassName = [
    'cw-push-aside',
    'relative',
    'h-full',
    'w-full',
    'min-h-0',
    'min-w-0',
    'overflow-clip',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const trackClassName = [
    'cw-push-aside__track',
    'flex',
    'h-full',
    'transition-transform',
    'ease-in-out',
    'will-change-transform',
    'motion-reduce:transition-none',
  ].join(' ')

  return (
    <div className={rootClassName} style={style} {...rest}>
      <div className={trackClassName} style={trackStyle}>
        <div
          className="cw-push-aside__pane h-full min-w-0 shrink-0 overflow-hidden"
          style={paneStyle}
          aria-hidden={open ? undefined : true}
          // @ts-expect-error inert is a valid HTML attribute in modern browsers
          inert={open ? undefined : true}
        >
          {children}
        </div>

        <div className="cw-push-aside__main relative flex h-full min-w-0 flex-1 flex-col overflow-hidden">
          {main}

          {scrim && open ? (
            <button
              type="button"
              className="cw-push-aside__scrim absolute inset-0 z-[1] cursor-pointer border-0 bg-[var(--mask-active)] p-0"
              aria-label={scrimAriaLabel}
              onClick={close}
            />
          ) : null}
        </div>
      </div>
    </div>
  )
}

export default CwPushAside
