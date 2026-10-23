import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react'
import { showDynamicSheet } from '../CwDynamicSheet/showDynamicSheet'
import type { ShowDynamicSheetReturn } from '../CwDynamicSheet/showDynamicSheet'
import type { CwDynamicSheetConfig } from '../CwDynamicSheet/types'
import { defaultTexts as defaultSheetTexts } from '../CwDynamicSheet/texts'
import { CW_OVERLAY_SHEET_BOTTOM_ROUNDED_CONTENT_CLASS } from '@zengchaowu/ui-shared/constants/cwOverlayHeaderTitle'
import CwButtonGroup from '../CwButtonGroup/CwButtonGroup'
import type { CwButtonGroupButton } from '../CwButtonGroup/types'
import CwFilterSheetContent from './CwFilterSheetContent'
import type { CwFilterSheetController } from './CwFilterSheetContent'
import type {
  CwFilterSheetHandle,
  CwFilterSheetProps,
  CwFilterSheetValues,
} from './types'
import {
  filterSheetBase,
  FILTER_SHEET_BODY_CLASS,
  FILTER_SHEET_FOOTER_BAR_CLASS,
} from './styles'
import { defaultTexts } from './texts'

export interface CwFilterSheetComponentProps extends CwFilterSheetProps {}

export const CwFilterSheet = forwardRef<
  CwFilterSheetHandle,
  CwFilterSheetComponentProps
>(function CwFilterSheet(
  {
    title = '',
    sections = [],
    buttons = [],
    disabled = false,
    readonly = false,
    texts: textsProp,
    onValuesChange,
    onConfirm,
    onReset,
    onClose,
  },
  ref,
) {
  const texts = useMemo(
    () => ({ ...defaultTexts, ...(textsProp ?? {}) }),
    [textsProp],
  )

  const sheetInstanceRef = useRef<ShowDynamicSheetReturn | null>(null)
  const controllerRef = useRef<CwFilterSheetController | null>(null)

  const callbacksRef = useRef({
    onValuesChange,
    onConfirm,
    onReset,
    onClose,
  })
  callbacksRef.current = { onValuesChange, onConfirm, onReset, onClose }

  // 关闭 Sheet
  const closeSheet = useCallback(() => {
    const instance = sheetInstanceRef.current
    if (instance) {
      sheetInstanceRef.current = null
      instance.close()
    }
    callbacksRef.current.onClose?.()
  }, [])

  // 处理重置
  const handleReset = useCallback(() => {
    controllerRef.current?.reset()
    callbacksRef.current.onReset?.()
  }, [])

  // 处理确认
  const handleConfirm = useCallback(() => {
    const values: CwFilterSheetValues = controllerRef.current?.getValues() ?? {}
    callbacksRef.current.onConfirm?.(values)
    closeSheet()
  }, [closeSheet])

  // 显示 Sheet
  const show = useCallback(() => {
    if (disabled || readonly) {
      return
    }

    // 如果已经有打开的 Sheet，先关闭
    if (sheetInstanceRef.current) {
      closeSheet()
    }

    controllerRef.current = null

    // 创建头部内容
    const header = (
      <div className="flex items-center justify-between">
        <span className={filterSheetBase.headerTitle}>
          {texts.title || title}
        </span>
      </div>
    )

    // 创建底部按钮区域。CwButtonGroup 默认 reverse，需撑满底栏后 justify-end 才会从右边开始排。
    const footer =
      buttons.length > 0 ? (
        <CwButtonGroup
          className="w-full"
          buttons={buttons.map(
            (button, index): CwButtonGroupButton => ({
              id: index,
              label: button.label,
              variant: button.type === 'primary' ? 'brand' : 'secondary',
              onClick: () => {
                button.onClick?.(controllerRef.current?.getValues() ?? {})
              },
            }),
          )}
        />
      ) : (
        <CwButtonGroup
          className="w-full"
          buttons={[
            {
              id: 'reset',
              label: texts.resetText,
              variant: 'secondary',
              onClick: handleReset,
            },
            {
              id: 'confirm',
              label: texts.confirmText,
              variant: 'brand',
              onClick: handleConfirm,
            },
          ]}
        />
      )

    // Sheet 配置
    const sheetConfig: CwDynamicSheetConfig = {
      header,
      footer,
      direction: 'bottom',
      closeOnClickOutside: true,
      bodyPadding: false,
      content: { class: CW_OVERLAY_SHEET_BOTTOM_ROUNDED_CONTENT_CLASS },
      body: { class: FILTER_SHEET_BODY_CLASS },
      footerBar: { class: FILTER_SHEET_FOOTER_BAR_CLASS },
    }

    const instance = showDynamicSheet({
      component: (
        <CwFilterSheetContent
          sections={sections}
          disabled={disabled}
          readonly={readonly}
          onValuesChange={(values) =>
            callbacksRef.current.onValuesChange?.(values)
          }
          onReady={(controller) => {
            controllerRef.current = controller
          }}
        />
      ),
      config: sheetConfig,
      texts: defaultSheetTexts,
    })

    sheetInstanceRef.current = instance

    // 监听 Promise resolve，当 Sheet 关闭时清理
    instance.promise.then(() => {
      if (sheetInstanceRef.current === instance) {
        sheetInstanceRef.current = null
      }
    })
  }, [
    disabled,
    readonly,
    closeSheet,
    texts,
    title,
    buttons,
    handleReset,
    handleConfirm,
    sections,
  ])

  // 暴露方法
  useImperativeHandle(ref, () => ({ show, close: closeSheet }), [
    show,
    closeSheet,
  ])

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      closeSheet()
    }
  }, [closeSheet])

  return null
})

export default CwFilterSheet
