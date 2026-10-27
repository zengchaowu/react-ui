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
import { defaultTexts as defaultSheetTexts } from '@zengchaowu/ui-shared/components/CwDynamicSheet/texts'
import CwCascaderSheetContent from './CwCascaderSheetContent'
import type {
  CwCascaderSheetHandle,
  CwCascaderSheetOption,
  CwCascaderSheetProps,
} from './types'
import { cascaderSheetBase, CASCADER_SHEET_BODY_CLASS } from '@zengchaowu/ui-shared/components/CwCascaderSheet/styles'
import { defaultTexts } from './texts'
import { CW_OVERLAY_SHEET_BOTTOM_ROUNDED_CONTENT_CLASS } from '@zengchaowu/ui-shared/constants/cwOverlayHeaderTitle'

export interface CwCascaderSheetComponentProps extends CwCascaderSheetProps {}

export const CwCascaderSheet = forwardRef<
  CwCascaderSheetHandle,
  CwCascaderSheetComponentProps
>(function CwCascaderSheet(
  {
    options = [],
    value,
    title = '',
    disabled = false,
    readonly = false,
    texts: textsProp,
    onChange,
    onClose,
  },
  ref,
) {
  const texts = useMemo(
    () => ({ ...defaultTexts, ...(textsProp ?? {}) }),
    [textsProp],
  )

  const componentIdRef = useRef('')
  if (!componentIdRef.current) {
    componentIdRef.current = `cw-cascader-sheet-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 11)}`
  }
  const componentId = componentIdRef.current

  const sheetInstanceRef = useRef<ShowDynamicSheetReturn | null>(null)

  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  const closeSheet = useCallback(() => {
    const instance = sheetInstanceRef.current
    if (instance) {
      sheetInstanceRef.current = null
      instance.close()
    }
    onCloseRef.current?.()
  }, [])

  const show = useCallback(() => {
    if (disabled || readonly) {
      return
    }

    const existing = sheetInstanceRef.current
    if (existing) {
      sheetInstanceRef.current = null
      existing.close()
      onCloseRef.current?.()
    }

    const header = (
      <div className={cascaderSheetBase.headerContainer}>
        <span className={cascaderSheetBase.headerTitle}>
          {title || texts.title}
        </span>
      </div>
    )

    const sheetConfig: CwDynamicSheetConfig = {
      header,
      direction: 'bottom',
      closeOnClickOutside: true,
      bodyPadding: false,
      content: { class: CW_OVERLAY_SHEET_BOTTOM_ROUNDED_CONTENT_CLASS },
      body: { class: CASCADER_SHEET_BODY_CLASS },
    }

    const instance = showDynamicSheet({
      component: (
        <CwCascaderSheetContent
          options={options}
          initialValue={value ?? []}
          disabled={disabled}
          readonly={readonly}
          emptyText={texts.empty}
          idPrefix={componentId}
          onChange={(nextValue, option: CwCascaderSheetOption | null) =>
            onChangeRef.current?.(nextValue, option)
          }
          onComplete={closeSheet}
          onRequestClose={closeSheet}
        />
      ),
      config: sheetConfig,
      texts: defaultSheetTexts,
    })

    sheetInstanceRef.current = instance

    instance.promise.then(() => {
      // 手动 closeSheet 已置空实例；此处只处理点击外部等宿主关闭
      if (sheetInstanceRef.current === instance) {
        sheetInstanceRef.current = null
        onCloseRef.current?.()
      }
    })
  }, [
    disabled,
    readonly,
    options,
    value,
    title,
    texts,
    componentId,
    closeSheet,
  ])

  useImperativeHandle(ref, () => ({ show }), [show])

  useEffect(() => {
    return () => {
      const instance = sheetInstanceRef.current
      if (instance) {
        sheetInstanceRef.current = null
        instance.close()
      }
    }
  }, [])

  return null
})

export default CwCascaderSheet
