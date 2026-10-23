import { useState } from 'react'
import type { CwSocialActionState, CwSocialSidebarProps, SocialAction } from './types'

export function CwSocialSidebar({ actions = [], onAction }: CwSocialSidebarProps) {
  // 内部状态管理
  const [actionStates, setActionStates] = useState<Record<string, CwSocialActionState>>({})

  // 计算显示的动作列表
  const displayActions = actions.map((action) => ({
    ...action,
    active: actionStates[action.key]?.active ?? action.active,
  }))

  // 格式化数字显示
  function formatCount(count: number): string {
    if (count >= 10000) {
      return (count / 10000).toFixed(1) + '万'
    }
    return count.toString()
  }

  // 处理动作点击
  function handleActionClick(action: SocialAction) {
    if (action.clickable === false) return

    const newState: CwSocialActionState = {}

    // 如果是可切换状态的动作（如点赞、收藏）
    if (action.activeColor) {
      const currentActive = actionStates[action.key]?.active ?? action.active
      newState.active = !currentActive
      setActionStates((prev) => ({
        ...prev,
        [action.key]: { ...prev[action.key], ...newState },
      }))
    }

    onAction?.({
      key: action.key,
      action: {
        ...action,
        ...newState,
      },
      newState,
    })
  }

  return (
    <div className="flex flex-col items-center space-y-6 py-4 px-2">
      {displayActions.map((action) => (
        <div
          key={action.key}
          className={[
            'flex flex-col items-center space-y-1 group',
            action.clickable !== false ? 'cursor-pointer' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          onClick={() => handleActionClick(action)}
        >
          <div className="w-12 h-12 flex items-center justify-center rounded-full">
            <div
              className={[
                'w-6 h-6 transition-all duration-200 group-hover:rotate-12 group-hover:scale-110',
                action.active && action.activeColor
                  ? action.activeColor
                  : 'text-[var(--text-color-anti)]',
                action.active ? 'fill-current' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              dangerouslySetInnerHTML={{ __html: action.icon }}
            />
          </div>
          {action.count !== undefined || action.text ? (
            <span className="text-[var(--text-color-anti)] text-xs font-medium">
              {action.count !== undefined ? formatCount(action.count) : action.text}
            </span>
          ) : null}
        </div>
      ))}
    </div>
  )
}

export default CwSocialSidebar
