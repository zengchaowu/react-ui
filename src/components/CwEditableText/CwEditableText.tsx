import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type {
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
} from 'react'
import CwIcon from '../CwIcon/CwIcon'
import CwInput from '../CwInput/CwInput'
import CwLoading from '../CwLoading/CwLoading'
import type { CwEditableTextProps } from './types'
import { resolveEditableTextStyles } from './editableTextAppearance'
import { defaultTexts } from './texts'
import { useBrowserFocusVisible } from '../../hooks/useBrowserFocusVisible'

export function CwEditableText({
  value,
  asyncModify,
  defaultEditing = false,
  spellcheck,
  disabled = false,
  readonly = false,
  placeholder: _placeholder,
  align = 'left',
  appearance = 'plain',
  editIconVisibility = 'always',
  texts: textsProp,
  onChange,
  onSuccess,
  onCancel,
  onError,
  className,
  ...rest
}: CwEditableTextProps) {
  const resolvedAppearance = useMemo(
    () => resolveEditableTextStyles(appearance, align),
    [appearance, align],
  )
  const styles = resolvedAppearance.styles
  const inputAppearance = resolvedAppearance.inputAppearance
  const isPlainAppearance = inputAppearance === 'plain'

  const texts = useMemo(
    () => ({ ...defaultTexts, ...(textsProp ?? {}) }),
    [textsProp],
  )

  const canEdit = !disabled && !readonly
  const shouldStartEditing = Boolean(defaultEditing) && canEdit

  const [isEditing, setIsEditing] = useState(shouldStartEditing)
  const [isComposing, setIsComposing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [editingValue, setEditingValue] = useState(
    shouldStartEditing ? (value ?? '') : '',
  )

  const {
    isFocusVisible,
    handleFocus: handleFocusVisibleFocus,
    handleBlur: handleFocusVisibleBlur,
  } = useBrowserFocusVisible()

  const inputHostRef = useRef<HTMLDivElement | null>(null)
  const originalValueRef = useRef(shouldStartEditing ? (value ?? '') : '')
  const editingValueRef = useRef(editingValue)
  const canEditRef = useRef(canEdit)
  canEditRef.current = canEdit
  const asyncModifyRef = useRef(asyncModify)
  asyncModifyRef.current = asyncModify
  const callbacksRef = useRef({ onChange, onSuccess, onCancel, onError })
  callbacksRef.current = { onChange, onSuccess, onCancel, onError }

  const tabIndex = disabled ? undefined : 0

  const previewText = value || texts.placeholder
  const hasValue = Boolean(value)

  const savingTextClass = styles.savingText
    ? [styles.savingText, styles.previewTextAlign].filter(Boolean).join(' ')
    : [
        styles.previewText,
        styles.previewTextNormal,
        styles.previewTextAlign,
      ].join(' ')

  /**
   * plain 编辑：sizer 负责可见字形（与预览同一套 previewText），input 绝对铺满且文字透明，
   * 只提供光标/选区/键盘；IME 合成期间临时显示 input 字并藏 sizer。
   * shell 用 flex + justify-end/start：预览靠 row-reverse 贴边，编辑态 sizer 仍是缩宽 inline-flex，须由 shell 推到右侧。
   */
  const plainEditShellClass = [
    'relative flex w-full min-w-0 max-w-full items-center',
    align === 'right' ? 'justify-end' : 'justify-start',
  ].join(' ')

  const plainEditSizerClass = [
    'pointer-events-none relative min-w-0 max-w-full whitespace-pre',
    isComposing ? 'invisible' : '',
    styles.previewText,
    disabled
      ? styles.previewTextDisabled
      : editingValue
        ? styles.previewTextNormal
        : styles.previewTextEmpty,
    styles.previewTextAlign,
  ]
    .filter(Boolean)
    .join(' ')

  const plainEditInputClass = [
    'absolute inset-0 z-[var(--z-index-above)] block h-full max-h-full min-h-0 w-full max-w-full min-w-0',
    '[&>div]:!h-full [&>div]:!min-h-0 [&>div]:!max-h-full',
    '[&_input]:!h-full [&_input]:!min-h-0 [&_input]:!max-h-full',
    isComposing
      ? '[&_input]:!text-[var(--text-color-primary)]'
      : '[&_input]:!text-transparent [&_input]:caret-[var(--text-color-primary)]',
  ].join(' ')

  const editIconClass = [
    styles.editIconContainer,
    styles.editIconContainerNormal,
    editIconVisibility === 'hover'
      ? styles.editIconContainerHoverReveal
      : styles.editIconContainerVisible,
  ]
    .filter(Boolean)
    .join(' ')

  function updateEditingValue(next: string): void {
    editingValueRef.current = next
    setEditingValue(next)
  }

  function getInputElement(): HTMLInputElement | null {
    const element = inputHostRef.current?.querySelector('input')
    return element instanceof HTMLInputElement ? element : null
  }

  function exitEditing(): void {
    setIsComposing(false)
    setIsEditing(false)
  }

  // 开始编辑
  function startEditing(): void {
    if (!canEditRef.current) return

    setIsEditing(true)
    setIsComposing(false)
    originalValueRef.current = value ?? ''
    updateEditingValue(value ?? '')
  }

  // 处理输入更新
  function handleInputUpdate(next: string): void {
    updateEditingValue(next)
  }

  // 处理修改失败
  function handleModifyFailure(error: unknown): void {
    updateEditingValue(originalValueRef.current)
    exitEditing()
    callbacksRef.current.onError?.(error)
  }

  // 处理输入框失焦
  function handleInputBlur(): void {
    setIsComposing(false)

    if (!canEditRef.current) return

    const current = editingValueRef.current

    // 如果值没有变化，直接退出编辑模式
    if (current === originalValueRef.current) {
      exitEditing()
      callbacksRef.current.onCancel?.()
      return
    }

    // 调用异步修改函数
    const modify = asyncModifyRef.current
    if (modify) {
      setIsLoading(true)
      void (async () => {
        try {
          const success = await modify(current)
          if (success) {
            callbacksRef.current.onChange?.(current)
            callbacksRef.current.onSuccess?.(current)
            exitEditing()
          } else {
            handleModifyFailure(false)
          }
        } catch (error) {
          handleModifyFailure(error)
        } finally {
          setIsLoading(false)
        }
      })()
    } else {
      callbacksRef.current.onChange?.(current)
      exitEditing()
    }
  }

  // 处理输入框键盘事件
  function handleInputKeydown(event: KeyboardEvent): void {
    if (!canEditRef.current) return

    if (event.key === 'Enter') {
      event.preventDefault()
      getInputElement()?.blur()
    } else if (event.key === 'Escape') {
      event.preventDefault()
      updateEditingValue(originalValueRef.current)
      exitEditing()
      callbacksRef.current.onCancel?.()
    }
  }

  // 处理预览点击
  function handlePreviewClick(): void {
    if (!canEditRef.current) return
    startEditing()
  }

  // 处理预览键盘事件
  function handlePreviewKeyDown(event: ReactKeyboardEvent<HTMLDivElement>): void {
    if (!canEditRef.current) return

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      startEditing()
    }
  }

  // 处理编辑图标点击
  function handleEditClick(event: ReactMouseEvent<HTMLDivElement>): void {
    event.stopPropagation()
    if (!canEditRef.current) return
    startEditing()
  }

  // Focus 处理 - 只在键盘导航时显示 focus 样式
  function handleFocus(): void {
    if (disabled) return
    handleFocusVisibleFocus()
  }

  function handleBlur(): void {
    handleFocusVisibleBlur()
  }

  // 编辑态：统一绑定原生键盘/合成事件，并聚焦选中（等价 Vue nextTick 后 focusEditingInput）
  useLayoutEffect(() => {
    if (!isEditing) return

    const inputElement = getInputElement()
    if (!inputElement) return

    setIsComposing(false)

    const onKeyDown = (event: KeyboardEvent) => handleInputKeydown(event)
    const onCompositionStart = () => setIsComposing(true)
    const onCompositionEnd = () => setIsComposing(false)

    inputElement.addEventListener('keydown', onKeyDown)
    inputElement.addEventListener('compositionstart', onCompositionStart)
    inputElement.addEventListener('compositionend', onCompositionEnd)

    inputElement.focus()
    inputElement.select()

    return () => {
      inputElement.removeEventListener('keydown', onKeyDown)
      inputElement.removeEventListener('compositionstart', onCompositionStart)
      inputElement.removeEventListener('compositionend', onCompositionEnd)
    }
  }, [isEditing, isLoading])

  useEffect(() => {
    if (defaultEditing && canEditRef.current && !isEditing) {
      startEditing()
    }
    // 与 Vue 一致：仅监听 defaultEditing 从 false 变 true
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultEditing])

  return (
    <div
      {...rest}
      className={[
        styles.root,
        disabled
          ? styles.rootDisabled
          : readonly
            ? styles.rootReadonly
            : styles.rootNormal,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* 预览模式 */}
      {!isEditing ? (
        <div
          className={[
            styles.previewContainer,
            disabled
              ? styles.previewContainerDisabled
              : readonly
                ? styles.previewContainerReadonly
                : styles.previewContainerNormal,
            isFocusVisible && !disabled ? styles.previewContainerFocused : '',
          ]
            .filter(Boolean)
            .join(' ')}
          tabIndex={tabIndex}
          role="button"
          aria-label={texts.edit}
          aria-disabled={disabled ? 'true' : 'false'}
          onClick={handlePreviewClick}
          onKeyDown={handlePreviewKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
        >
          {/* 预览文本 */}
          <span
            className={[
              styles.previewText,
              disabled
                ? styles.previewTextDisabled
                : !hasValue
                  ? styles.previewTextEmpty
                  : readonly
                    ? styles.previewTextReadonly
                    : styles.previewTextNormal,
              styles.previewTextAlign,
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {previewText}
          </span>

          {/* 编辑图标（w=0 锚点，不撑宽布局） */}
          {!disabled && !readonly && editIconVisibility !== 'never' ? (
            <span className={styles.overlayAnchor}>
              <div
                className={editIconClass}
                role="button"
                aria-label={texts.edit}
                onClick={handleEditClick}
              >
                <CwIcon
                  name="common--action--edit-line"
                  prefix="icon"
                  size={styles.iconStyles?.size ?? 1}
                  className={styles.iconStyles?.class}
                />
              </div>
            </span>
          ) : null}
        </div>
      ) : isPlainAppearance ? (
        // 编辑模式 plain：可见 sizer 与预览同字形；input 透明叠字，避免 span/input 度量差导致上下跳 1px
        <div className={styles.editContainer} ref={inputHostRef}>
          {isLoading ? (
            <>
              <span className={savingTextClass}>{editingValue}</span>
              <span className={styles.overlayAnchor}>
                <CwLoading
                  type="spinner"
                  appearance="inlineText"
                  className={styles.overlayLoading}
                />
              </span>
            </>
          ) : (
            <div className={plainEditShellClass}>
              <span className={plainEditSizerClass} aria-hidden="true">
                {editingValue || texts.placeholder}
              </span>
              <CwInput
                value={editingValue}
                placeholder=""
                disabled={disabled}
                readonly={readonly}
                clearable={false}
                align={align}
                appearance="plain"
                spellcheck={spellcheck}
                className={plainEditInputClass}
                texts={texts.inputTexts}
                onChange={handleInputUpdate}
                onBlur={handleInputBlur}
              />
            </div>
          )}
        </div>
      ) : (
        // 编辑模式 default 等
        <div className={styles.editContainer} ref={inputHostRef}>
          {isLoading ? (
            <>
              <span className={savingTextClass}>{editingValue}</span>
              <span className={styles.overlayAnchor}>
                <CwLoading
                  type="spinner"
                  appearance="inlineText"
                  className={styles.overlayLoading}
                />
              </span>
            </>
          ) : (
            <CwInput
              value={editingValue}
              placeholder={texts.placeholder}
              disabled={disabled}
              readonly={readonly}
              clearable={false}
              align={align}
              appearance={inputAppearance}
              spellcheck={spellcheck}
              className="min-w-0 flex-1"
              texts={texts.inputTexts}
              onChange={handleInputUpdate}
              onBlur={handleInputBlur}
            />
          )}
        </div>
      )}
    </div>
  )
}

export default CwEditableText
