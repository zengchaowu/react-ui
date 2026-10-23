import { useMemo } from 'react'
import type {
  CSSProperties,
  HTMLAttributes,
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
  ReactNode,
} from 'react'
import type {
  CwFeatureCardGridProps,
  CwFeatureCardItem,
} from './types'
import { resolveFeatureCardGridStyles } from './featureCardGridAppearance'
import { defaultCwFeatureCardGridTexts } from './texts'
import CwCard from '../CwCard/CwCard'
import CwIcon from '../CwIcon/CwIcon'
import CwGrid from '../CwGrid/CwGrid'

export interface CwFeatureCardGridComponentProps
  extends CwFeatureCardGridProps,
    Omit<HTMLAttributes<HTMLDivElement>, 'title' | 'children'> {}

export function CwFeatureCardGrid({
  items = [],
  title,
  maxItems,
  layout = 'fixed',
  columns = 5,
  appearance = 'default',
  texts: textsProp,
  iconSlot,
  className,
  ...rest
}: CwFeatureCardGridComponentProps) {
  const styles = useMemo(
    () => resolveFeatureCardGridStyles(appearance ?? 'default'),
    [appearance],
  )

  const texts = useMemo(
    () => ({ ...defaultCwFeatureCardGridTexts, ...(textsProp ?? {}) }),
    [textsProp],
  )

  const resolvedLayout = layout || 'fixed'

  // 根据 maxItems 控制展示数量
  const displayItems = useMemo(() => {
    if (maxItems && maxItems > 0) {
      return items.slice(0, maxItems)
    }
    return items
  }, [items, maxItems])

  // 用于 CwGrid 的列数：
  // - fixed 模式：直接使用 props.columns
  // - auto 模式：根据展示数量自适应，但最多 5 列，避免单行过挤
  const gridColumns = useMemo(() => {
    if (resolvedLayout === 'fixed') {
      return Math.max(1, columns || 1)
    }
    const count = displayItems.length || 1
    return Math.min(count, 5)
  }, [resolvedLayout, columns, displayItems])

  const getIconBoxStyle = (item: CwFeatureCardItem): CSSProperties => {
    const style: CSSProperties = {}
    if (item.iconBgColor) {
      style.backgroundColor = item.iconBgColor
    }
    if (item.iconColor) {
      style.color = item.iconColor
    }
    return style
  }

  const getIconStyles = (item: CwFeatureCardItem) => {
    if (item.iconColor) {
      return {
        ...styles.iconStyles,
        class: `${styles.iconStyles?.class || ''} text-[${item.iconColor}]`,
      }
    }
    return styles.iconStyles
  }

  const handleItemClick = (
    item: CwFeatureCardItem,
    event: ReactMouseEvent<HTMLDivElement>,
  ) => {
    if (item.disabled) {
      event.preventDefault()
      event.stopPropagation()
      return
    }

    // 单项回调
    if (item.onClick) {
      item.onClick(item, event)
    }
  }

  const handleItemKeyDown = (
    item: CwFeatureCardItem,
    event: ReactKeyboardEvent<HTMLDivElement>,
  ) => {
    if (item.disabled) return
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleItemClick(item, event as unknown as ReactMouseEvent<HTMLDivElement>)
    }
  }

  const renderIcon = (item: CwFeatureCardItem): ReactNode => {
    const customIcon =
      typeof iconSlot === 'function' ? iconSlot({ item }) : iconSlot
    if (customIcon != null) return customIcon

    if (item.image) {
      return (
        <img
          src={item.image}
          alt={item.label}
          className="max-w-full max-h-full object-contain"
        />
      )
    }
    if (item.icon) {
      const iconStyles = getIconStyles(item)
      return (
        <CwIcon
          name={item.icon}
          prefix="icon"
          size={iconStyles?.size ?? 1}
          className={iconStyles?.class}
        />
      )
    }
    return null
  }

  return (
    <CwCard
      {...rest}
      appearance="grid-cards"
      showHeaderDivider={false}
      texts={texts.cardTexts}
      className={className}
      headerLeftSlot={
        title ? <div className={styles.title}>{title}</div> : undefined
      }
    >
      {/* 功能卡片网格（使用 CwGrid 保证换行时左对齐、不跑中间） */}
      <div className="w-full">
        {displayItems.length > 0 ? (
          <CwGrid
            columns={gridColumns}
            gutter={8}
            rowGap={8}
            wrap
            justify="start"
            align="top"
            className="w-full"
          >
            {displayItems.map((item) => (
              <div
                key={item.key}
                className={[styles.item, item.disabled ? styles.itemDisabled : '']
                  .filter(Boolean)
                  .join(' ')}
                role="button"
                tabIndex={item.disabled ? undefined : 0}
                aria-disabled={item.disabled ? 'true' : 'false'}
                aria-label={item.label}
                onClick={(event) => handleItemClick(item, event)}
                onKeyDown={(event) => handleItemKeyDown(item, event)}
              >
                <div className={styles.iconBox} style={getIconBoxStyle(item)}>
                  {renderIcon(item)}
                </div>
                <div className={styles.label}>{item.label}</div>
                {item.description ? (
                  <div className={styles.description}>{item.description}</div>
                ) : null}
              </div>
            ))}
          </CwGrid>
        ) : null}
      </div>
    </CwCard>
  )
}

export default CwFeatureCardGrid
