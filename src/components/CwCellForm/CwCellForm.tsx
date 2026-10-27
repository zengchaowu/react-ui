import { useEffect, useMemo, useRef, useState } from 'react'
import type { HTMLAttributes } from 'react'
import CwCard from '../CwCard/CwCard'
import CwCell from '../CwCell/CwCell'
import CwCellGroup from '../CwCell/CwCellGroup'
import type {
  CwCellFormItemConfig,
  CwCellFormProps,
} from './types'
import type { CwFormItemComponent } from '../CwFormItem/types'
import { cellFormBase } from '@zengchaowu/ui-shared/components/CwCellForm/styles'
import { defaultCwCellFormTexts } from '@zengchaowu/ui-shared/components/CwCellForm/texts'

export interface CwCellFormComponentProps
  extends CwCellFormProps,
    Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'className' | 'onChange'> {}

type CwCellFormRightAction = NonNullable<CwCellFormItemConfig['rightAction']>

function getRightActionComponent(
  rightAction: CwCellFormRightAction,
): CwFormItemComponent {
  if (typeof rightAction === 'object' && 'component' in rightAction) {
    return rightAction.component
  }
  return rightAction
}

function getRightActionProps(
  rightAction: CwCellFormRightAction,
): Record<string, unknown> {
  if (typeof rightAction === 'object' && 'component' in rightAction) {
    return rightAction.props || {}
  }
  return {}
}

export function CwCellForm({
  title,
  items = [],
  value,
  disabled = false,
  readonly = false,
  itemContentInnerClass = '',
  texts: textsProp,
  onChange,
  onFieldChange,
  className,
  ...rest
}: CwCellFormComponentProps) {
  const styles = cellFormBase

  const texts = useMemo(
    () => ({
      ...defaultCwCellFormTexts,
      ...(textsProp ?? {}),
    }),
    [textsProp],
  )

  const [formData, setFormData] = useState<Record<string, unknown>>(() => ({
    ...value,
  }))
  const formDataRef = useRef<Record<string, unknown>>({ ...value })

  useEffect(() => {
    const next = { ...value }
    formDataRef.current = next
    setFormData(next)
  }, [value])

  function shouldShowUnderline(
    item: CwCellFormItemConfig,
    index: number,
  ): boolean {
    if (item.showDivider === false) return false
    return index < items.length - 1
  }

  function getFormItemComponent(item: CwCellFormItemConfig): CwFormItemComponent {
    return item.componentConfig.component
  }

  function getFormItemProps(item: CwCellFormItemConfig): Record<string, unknown> {
    const baseProps = item.componentConfig.defaultProps || {}
    const itemProps = item.props || {}
    // Cell 行已有下划线：plain 无框、随内容收缩贴右
    const merged: Record<string, unknown> = {
      appearance: 'plain',
      inputAppearance: 'plain',
      align: 'right',
      ...baseProps,
      ...itemProps,
    }

    merged.disabled = disabled || item.disabled || false
    merged.readonly = readonly || item.readonly || false

    return merged
  }

  function handleFieldChange(field: string, fieldValue: unknown) {
    if (disabled || readonly) return
    const next = { ...formDataRef.current, [field]: fieldValue }
    formDataRef.current = next
    setFormData(next)
    onChange?.(next)
    onFieldChange?.(field, fieldValue)
  }

  return (
    <CwCard
      {...rest}
      appearance="form"
      showHeaderDivider={false}
      texts={texts.cardTexts}
      className={className}
      headerLeftSlot={
        title ? <div className={styles.title}>{title}</div> : undefined
      }
    >
      <CwCellGroup cellAppearance="form" underlineAlign="full">
        {items.map((item, index) => {
          const ItemComponent = getFormItemComponent(item)
          const rightAction = item.rightAction
          const RightAction = rightAction
            ? getRightActionComponent(rightAction)
            : null
          const rightActionProps = rightAction
            ? getRightActionProps(rightAction)
            : {}

          return (
            <CwCell
              key={item.prop}
              title={item.required ? undefined : item.label}
              showUnderline={shouldShowUnderline(item, index)}
              showArrow={false}
              titleSlot={
                item.required ? (
                  <span className={styles.itemLabelRequired}>{item.label}</span>
                ) : undefined
              }
              rightSlot={
                <div
                  className={[styles.itemContentInner, itemContentInnerClass]
                    .filter(Boolean)
                    .join(' ')}
                >
                  <ItemComponent
                    {...getFormItemProps(item)}
                    value={formData[item.prop]}
                    onChange={(nextValue: unknown) =>
                      handleFieldChange(item.prop, nextValue)
                    }
                  />
                  {RightAction ? (
                    <>
                      <div className={styles.rightDivider} />
                      <div className="shrink-0">
                        <RightAction {...rightActionProps} />
                      </div>
                    </>
                  ) : null}
                </div>
              }
            />
          )
        })}
      </CwCellGroup>
    </CwCard>
  )
}

export default CwCellForm
