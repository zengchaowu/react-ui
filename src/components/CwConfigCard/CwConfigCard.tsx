import { useMemo, useState } from 'react'
import type {
  ComponentType,
  HTMLAttributes,
  ReactNode,
} from 'react'
import type {
  ConfigCardComponent,
  ConfigCardValue,
  CwConfigCardItem,
  CwConfigCardProps,
  CwConfigCardTexts,
} from './types'
import type { CwRichTextNode } from '../CwRichText/types'
import CwCard from '../CwCard/CwCard'
import CwIcon from '../CwIcon/CwIcon'
import { CwRichText } from '../CwRichText/CwRichText'
import { configCardBase } from './styles'
import { defaultCwConfigCardTexts } from './texts'

export interface CwConfigCardComponentProps
  extends CwConfigCardProps,
    Omit<HTMLAttributes<HTMLDivElement>, 'title' | 'children'> {}

export function CwConfigCard({
  title,
  collapsible = false,
  defaultExpanded = true,
  items = [],
  texts: textsProp,
  onExpandChange,
  onRichTextLinkClick,
  className,
  ...rest
}: CwConfigCardComponentProps) {
  const styles = configCardBase

  const texts: CwConfigCardTexts = useMemo(
    () => ({ ...defaultCwConfigCardTexts, ...(textsProp ?? {}) }),
    [textsProp],
  )

  // 仅用于折叠图标旋转，与 CwCard 内部状态同步
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  const handleExpandChange = (expanded: boolean) => {
    setIsExpanded(expanded)
    onExpandChange?.(expanded)
  }

  // 判断是否为组件
  function isComponent(value: ConfigCardValue | undefined): value is ConfigCardComponent {
    if (!value) return false
    if (typeof value === 'string') return false
    if (Array.isArray(value)) return false
    if (typeof value === 'object' && 'type' in value) return false
    // React 组件通常为函数，或带 $$typeof 的对象（forwardRef / memo / lazy）
    return (
      typeof value === 'function' ||
      (typeof value === 'object' && '$$typeof' in value)
    )
  }

  /** 当 item.value 为 richText 对象时返回 dsl，否则返回 undefined */
  function getRichTextDsl(item: CwConfigCardItem): CwRichTextNode[] | undefined {
    const value = item.value
    if (
      value &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      'type' in value &&
      value.type === 'richText'
    ) {
      return value.dsl
    }
    return undefined
  }

  /** 当 item.value 为 component 对象时返回 { component, props }，否则返回 undefined */
  function getComponentConfig(
    item: CwConfigCardItem,
  ): { component: ConfigCardComponent; props?: Record<string, unknown> } | undefined {
    const value = item.value
    if (
      value &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      'type' in value &&
      value.type === 'component'
    ) {
      return { component: value.component, props: value.props }
    }
    return undefined
  }

  // 获取值的样式类
  function getValueClass(item: CwConfigCardItem) {
    // 优先检查 richText 和 component prop
    if (item.richText) {
      return configCardBase.itemValueRichText
    }
    if (item.component) {
      return configCardBase.itemValueComponent
    }
    // 检查 value 的类型
    const value = item.value
    if (Array.isArray(value)) {
      return configCardBase.itemValueRichText
    }
    if (value && typeof value === 'object' && 'type' in value) {
      if (value.type === 'richText') {
        return configCardBase.itemValueRichText
      }
      if (value.type === 'component') {
        return configCardBase.itemValueComponent
      }
    }
    if (isComponent(value)) {
      return configCardBase.itemValueComponent
    }
    return configCardBase.itemValue
  }

  // 处理富文本链接点击
  const handleRichTextLinkClick = (href: string, event: MouseEvent) => {
    onRichTextLinkClick?.(href, event)
  }

  const renderRichText = (dsl: CwRichTextNode[]) => (
    <CwRichText
      appearance="configValue"
      dsl={dsl}
      texts={texts.richTextTexts}
      onLinkClick={handleRichTextLinkClick}
    />
  )

  const renderComponent = (
    component: ConfigCardComponent,
    componentProps?: Record<string, unknown>,
  ) => {
    const Component = component as ComponentType<Record<string, unknown>>
    return <Component {...(componentProps ?? {})} />
  }

  const renderValue = (item: CwConfigCardItem): ReactNode => {
    // 优先使用 richText prop（当 value 为字符串时）
    if (item.richText) {
      return renderRichText(item.richText)
    }

    // 优先使用 component prop（当 value 为字符串时）
    if (item.component) {
      return renderComponent(item.component, item.componentProps)
    }

    const value = item.value

    // 富文本值（数组形式）
    if (Array.isArray(value)) {
      return renderRichText(value)
    }

    // 富文本值（对象形式）
    const richTextDsl = getRichTextDsl(item)
    if (richTextDsl) {
      return renderRichText(richTextDsl)
    }

    // 组件值（对象形式）
    const componentConfig = getComponentConfig(item)
    if (componentConfig) {
      return renderComponent(componentConfig.component, componentConfig.props)
    }

    // 组件值（直接组件）
    if (isComponent(value)) {
      return renderComponent(value)
    }

    // 字符串值（最后兜底）
    if (typeof value === 'string') {
      return value
    }

    return null
  }

  return (
    <CwCard
      {...rest}
      appearance="config"
      collapsible={collapsible}
      defaultExpanded={defaultExpanded}
      showHeaderDivider
      className={className}
      onExpandChange={handleExpandChange}
      headerLeftSlot={
        title ? (
          <div className={styles.headerInner}>
            <div className={styles.title}>{title}</div>
            {collapsible ? (
              <div
                className={[
                  styles.collapseIcon,
                  !isExpanded ? 'rotate-180' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <CwIcon
                  name="common--dir--arrow-down-line"
                  prefix="icon"
                  size={styles.collapseIconStyles?.size ?? 1}
                  className={styles.collapseIconStyles?.class}
                />
              </div>
            ) : null}
          </div>
        ) : undefined
      }
    >
      {/* 内容区域（padding 由 CwCard appearance=config 的 body 提供，此处不再重复） */}
      <div>
        {items.map((item) => (
          <div key={item.key} className={styles.item}>
            {/* 标签（左侧，不换行） */}
            <div className={styles.itemLabel}>{item.label}</div>

            {/* 值（右侧，可换行） */}
            <div
              className={[getValueClass(item), item.valueColor]
                .filter(Boolean)
                .join(' ')}
            >
              {renderValue(item)}
            </div>
          </div>
        ))}
      </div>
    </CwCard>
  )
}

export default CwConfigCard
