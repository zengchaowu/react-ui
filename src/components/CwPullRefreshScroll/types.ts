import type { HTMLAttributes, ReactNode, UIEventHandler } from 'react'
import type { CwPullRefreshScrollTexts, CwPullRefreshScrollExpose } from '@zengchaowu/ui-shared/components/CwPullRefreshScroll/types'

export interface CwPullRefreshScrollProps {
  /** 禁用下拉刷新 */
  refreshDisabled?: boolean
  /** 禁用触底加载更多 */
  loadMoreDisabled?: boolean
  /** 受控：正在下拉刷新 */
  refreshing?: boolean
  /** 受控：正在加载更多 */
  loadingMore?: boolean
  /** 是否还有更多（为 false 时不再触发 loadMore） */
  hasMore?: boolean
  /** 下拉释放触发刷新的距离（px） */
  pullThreshold?: number
  /** 最大下拉拖拽距离（px） */
  maxPullDistance?: number
  /** 距底部多少 px 触发加载更多 */
  loadMoreThreshold?: number
  /** 返回 Promise 时自动在完成后结束刷新态（非受控 refreshing 时） */
  onRefresh?: () => void | Promise<void>
  /** 返回 Promise 时自动在完成后结束加载更多态（非受控 loadingMore 时） */
  onLoadMore?: () => void | Promise<void>
  /** 是否显示 CwDiv 自定义滚动条（默认 false） */
  showScrollbar?: boolean
  texts?: Partial<CwPullRefreshScrollTexts>
  /** 受控刷新态变化（对应 Vue `update:refreshing`） */
  onRefreshingChange?: (value: boolean) => void
  /** 受控加载更多态变化（对应 Vue `update:loadingMore`） */
  onLoadingMoreChange?: (value: boolean) => void
  /** 滚动事件 */
  onScroll?: UIEventHandler<HTMLDivElement>
  /** 默认插槽 */
  children?: ReactNode
  /** 具名插槽 footer */
  footerSlot?: ReactNode
  className?: string
}

export type CwPullRefreshScrollComponentProps = CwPullRefreshScrollProps &
  Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'className' | 'onScroll'>

export type CwPullRefreshScrollHandle = CwPullRefreshScrollExpose
