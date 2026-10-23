import {
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
} from 'react'
import { CwIcon } from '../CwIcon/CwIcon'
import { CwAutoCompleteEmail } from '../CwAutoCompleteEmail/CwAutoCompleteEmail'
import { CwLoading } from '../CwLoading/CwLoading'
import type { CwAutoCompleteEmailHandle } from '../CwAutoCompleteEmail/types'
import type { CwEditableEmailProps } from './types'
import { resolveEditableEmailStyles } from './editableEmailAppearance'
import { defaultTexts } from './texts'
import { useBrowserFocusVisible } from '../../hooks/useBrowserFocusVisible'

const DEFAULT_EMAIL_SUFFIXES: string[] = [
  '@qq.com',
  '@gmail.com',
  '@126.com',
  '@163.com',
  '@hotmail.com',
  '@yahoo.com',
  '@yahoo.com.cn',
  '@live.com',
  '@sohu.com',
  '@sina.com',
]

export function CwEditableEmail({
  value,
  asyncModify,
  disabled = false,
  readonly = false,
  placeholder: _placeholder,
  align = 'left',
  appearance = 'default',
  emailSuffixes = DEFAULT_EMAIL_SUFFIXES,
  debounce = 150,
  texts: textsProp,
  onChange,
  onSuccess,
  onError,
  className,
  ...rest
}: CwEditableEmailProps) {
  const styles = useMemo(
    () => resolveEditableEmailStyles(appearance ?? 'default', align),
    [appearance, align],
  )
  const texts = useMemo(
    () => ({ ...defaultTexts, ...(textsProp ?? {}) }),
    [textsProp],
  )

  // 状态管理
  const [isEditing, setIsEditing] = useState(false)
  const {
    isFocusVisible,
    handleFocus: handleFocusVisibleFocus,
    handleBlur: handleFocusVisibleBlur,
  } = useBrowserFocusVisible()
  const [isLoading, setIsLoading] = useState(false)
  const [editingValue, setEditingValue] = useState<string | null>(null)

  const originalValueRef = useRef<string | null>(null)
  const editingValueRef = useRef<string | null>(null)
  const hostRef = useRef<HTMLDivElement | null>(null)
  const autoCompleteEmailRef = useRef<CwAutoCompleteEmailHandle | null>(null)

  const canEdit = !disabled && !readonly
  const canEditRef = useRef(canEdit)
  canEditRef.current = canEdit
  const asyncModifyRef = useRef(asyncModify)
  asyncModifyRef.current = asyncModify
  const callbacksRef = useRef({ onChange, onSuccess, onError })
  callbacksRef.current = { onChange, onSuccess, onError }

  // tabindex 计算
  const tabIndex = disabled ? undefined : 0

  // 预览文本显示值
  const previewText = value || texts.placeholder
  // 是否有值（用于样式判断）
  const hasValue = !!value

  function updateEditingValue(next: string | null): void {
    editingValueRef.current = next
    setEditingValue(next)
  }

  /** 获取 input 元素（通过 CwAutoCompleteEmail -> CwAutoComplete -> CwInput） */
  function getInputElement(): HTMLInputElement | null {
    const element = hostRef.current?.querySelector('input')
    return element instanceof HTMLInputElement ? element : null
  }

  /** 退出编辑模式 */
  function exitEditing(): void {
    setIsEditing(false)
  }

  /** 开始编辑 */
  function startEditing(): void {
    if (!canEditRef.current) return

    setIsEditing(true)
    originalValueRef.current = value ?? null
    updateEditingValue(value ?? null)
  }

  // 处理预览点击
  function handlePreviewClick(): void {
    if (!canEditRef.current) return
    startEditing()
  }

  // 处理预览键盘事件
  function handlePreviewKeyDown(
    event: ReactKeyboardEvent<HTMLDivElement>,
  ): void {
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

  // 处理输入更新
  function handleInputUpdate(next: string | null): void {
    updateEditingValue(next)
  }

  // Focus 处理 - 只在键盘导航时显示 focus 样式
  function handleFocus(): void {
    if (disabled) return
    handleFocusVisibleFocus()
  }

  function handleBlur(): void {
    handleFocusVisibleBlur()
  }

  // 处理修改失败
  function handleModifyFailure(error: unknown): void {
    updateEditingValue(originalValueRef.current)
    exitEditing()
    callbacksRef.current.onError?.(error)
  }

  // 处理输入框失焦
  function handleInputBlur(): void {
    if (!canEditRef.current) return

    const current = editingValueRef.current

    // 如果值没有变化，直接退出编辑模式
    if (current === originalValueRef.current) {
      exitEditing()
      return
    }

    // 调用异步修改函数
    if (asyncModifyRef.current) {
      setIsLoading(true)
      void (async () => {
        try {
          const success = await asyncModifyRef.current!(current)
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

  // 编辑态：聚焦选中并绑定原生键盘事件（等价 Vue nextTick 后 addEventListener）
  useLayoutEffect(() => {
    if (!isEditing) return

    const inputElement = getInputElement()
    if (!inputElement) return

    const handleInputKeydown = (event: KeyboardEvent) => {
      if (!canEditRef.current) return

      // 检查下拉框是否打开
      const isDropdownOpen = autoCompleteEmailRef.current?.isVisible() ?? false

      if (event.key === 'Enter') {
        // 下拉框打开时交给下拉框的键盘逻辑处理
        if (isDropdownOpen) {
          return
        }
        // 下拉框未打开时才让输入框失焦
        event.preventDefault()
        getInputElement()?.blur()
      } else if (event.key === 'Escape') {
        // 下拉框打开时先让下拉框处理 Escape
        if (isDropdownOpen) {
          return
        }
        // 下拉框未打开时取消编辑
        event.preventDefault()
        updateEditingValue(originalValueRef.current)
        exitEditing()
        getInputElement()?.blur()
      }
    }

    inputElement.addEventListener('keydown', handleInputKeydown)
    inputElement.focus()
    inputElement.select()

    return () => {
      inputElement.removeEventListener('keydown', handleInputKeydown)
    }
    // 与 Vue 一致：仅在进入/退出编辑态时绑定与清理
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing])

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

          {/* 编辑图标 */}
          {!disabled && !readonly ? (
            <div
              className={[
                styles.editIconContainer,
                styles.editIconContainerNormal,
              ]
                .filter(Boolean)
                .join(' ')}
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
          ) : null}
        </div>
      ) : (
        // 编辑模式
        <div className={styles.editContainer} ref={hostRef}>
          <CwAutoCompleteEmail
            ref={autoCompleteEmailRef}
            className="min-w-0 flex-1"
            value={editingValue}
            placeholder={texts.placeholder}
            disabled={disabled}
            readonly={readonly}
            clearable={false}
            align={align}
            emailSuffixes={emailSuffixes}
            debounce={debounce}
            texts={texts.autoCompleteEmailTexts}
            onChange={handleInputUpdate}
            onBlur={handleInputBlur}
          />

          {/* Loading 指示器 */}
          {isLoading ? (
            <div className={styles.loadingContainer}>
              <CwLoading type="spinner" size="small" />
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}

export default CwEditableEmail
