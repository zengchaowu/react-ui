import { useMemo } from 'react'
import type { CSSProperties } from 'react'
import type {
  CwMessageInputFieldLayout,
  CwMessageInputProps,
  CwMessageInputTexts,
} from '../types'
import { resolveMessageInputLayoutClasses } from '../styles'
import { defaultCwMessageInputTexts } from '../texts'

const COMPOSER_LINE_HEIGHT_REM = 1.5

/** 输入区布局：样式类、文案、占位符与固定行高/自动增高（等价 Vue `useComposerLayout`） */
export function useComposerLayout(
  props: Pick<
    CwMessageInputProps,
    | 'fieldLayout'
    | 'texts'
    | 'placeholder'
    | 'fixedTextareaRows'
    | 'textareaMinRows'
    | 'textareaMaxRows'
    | 'textareaFieldPadYRem'
  >,
) {
  const {
    fieldLayout,
    texts: textsProp,
    placeholder,
    fixedTextareaRows,
    textareaMinRows,
    textareaMaxRows,
    textareaFieldPadYRem,
  } = props

  const styles = useMemo(
    () => resolveMessageInputLayoutClasses(fieldLayout as CwMessageInputFieldLayout),
    [fieldLayout],
  )

  const texts = useMemo<CwMessageInputTexts>(
    () => ({ ...defaultCwMessageInputTexts, ...(textsProp ?? {}) }),
    [textsProp],
  )

  const placeholderResolved = placeholder ?? texts.placeholder

  // ---- 固定行高 / 自动增高 ----
  const fieldStyle = useMemo<CSSProperties>(() => {
    const minR = textareaMinRows
    const maxR = textareaMaxRows
    if (
      minR != null &&
      maxR != null &&
      minR > 0 &&
      maxR >= minR &&
      (fixedTextareaRows == null || fixedTextareaRows <= 0)
    ) {
      const padY = textareaFieldPadYRem ?? 1.75
      return {
        minHeight: `${padY + COMPOSER_LINE_HEIGHT_REM * minR}rem`,
        maxHeight: `${padY + COMPOSER_LINE_HEIGHT_REM * maxR}rem`,
        overflowY: 'auto',
        flex: '0 0 auto',
      }
    }
    const rowCount = fixedTextareaRows
    if (rowCount == null || rowCount <= 0) return {}
    const lineHRem = 1.25
    const padRem = 0.625
    const hRem = lineHRem * rowCount + padRem + padRem
    return {
      minHeight: `${hRem}rem`,
      maxHeight: `${hRem}rem`,
      overflowY: 'auto',
      flex: '0 0 auto',
    }
  }, [fixedTextareaRows, textareaFieldPadYRem, textareaMaxRows, textareaMinRows])

  return { styles, texts, placeholderResolved, fieldStyle }
}
