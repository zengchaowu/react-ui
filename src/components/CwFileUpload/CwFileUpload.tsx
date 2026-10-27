import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react'
import CwIcon from '../CwIcon/CwIcon'
import CwFileIcon from '../CwFileIcon/CwFileIcon'
import CwLoading from '../CwLoading/CwLoading'
import type { CwFileUploadHandle, CwFileUploadProps } from './types'
import type { UploadFile } from '@zengchaowu/ui-shared/components/CwFileUpload/types'
import { appearanceStyles, fileUploadBase } from '@zengchaowu/ui-shared/components/CwFileUpload/styles'
import { defaultTexts } from '@zengchaowu/ui-shared/components/CwFileUpload/texts'

const fileUploadOverlaySpinnerClass =
  'border-solid rounded-full border-t-[var(--text-color-anti)] border-r-[var(--text-color-anti)] border-b-transparent border-l-transparent animate-spin'

let isKeyboardUser = false
let mouseDownTime = 0
let focusVisibleListenerCount = 0

function handleDocumentKeyDown(event: KeyboardEvent) {
  if (event.key === 'Tab') {
    isKeyboardUser = true
  }
}

function handleDocumentMouseDown() {
  mouseDownTime = Date.now()
  isKeyboardUser = false
}

function handleDocumentTouchStart() {
  isKeyboardUser = false
}

function shouldShowFocus(): boolean {
  const timeSinceMouseDown = Date.now() - mouseDownTime
  if (timeSinceMouseDown < 100) {
    return false
  }
  return isKeyboardUser
}

/** React 版 `useBrowserFocusVisible`：区分键盘导航与鼠标点击 */
function useBrowserFocusVisible() {
  const [isFocusVisible, setIsFocusVisible] = useState(false)

  useEffect(() => {
    if (focusVisibleListenerCount === 0) {
      document.addEventListener('keydown', handleDocumentKeyDown, true)
      document.addEventListener('mousedown', handleDocumentMouseDown, true)
      document.addEventListener('touchstart', handleDocumentTouchStart, true)
    }
    focusVisibleListenerCount++
    return () => {
      focusVisibleListenerCount--
      if (focusVisibleListenerCount === 0) {
        document.removeEventListener('keydown', handleDocumentKeyDown, true)
        document.removeEventListener('mousedown', handleDocumentMouseDown, true)
        document.removeEventListener('touchstart', handleDocumentTouchStart, true)
      }
    }
  }, [])

  const handleFocus = useCallback(() => {
    setIsFocusVisible(shouldShowFocus())
  }, [])

  const handleBlur = useCallback(() => {
    setIsFocusVisible(false)
  }, [])

  return { isFocusVisible, handleFocus, handleBlur }
}

export const CwFileUpload = forwardRef<CwFileUploadHandle, CwFileUploadProps>(
  function CwFileUpload(
    {
      disabled = false,
      readonly = false,
      accept,
      multiple = false,
      maxCount,
      showUploadArea: showUploadAreaProp = true,
      deletable = true,
      appearance = 'default',
      value = [],
      texts,
      uploadArea,
      actions,
      onChange,
      onRemove,
      onItemClick,
      onRetry,
      onSelect,
      onError: _onError,
      onSuccess: _onSuccess,
      onPreview: _onPreview,
      handleOversize: _handleOversize,
      handleOverMinSize: _handleOverMinSize,
      handleInvalidFormat: _handleInvalidFormat,
      upload: _upload,
      className,
      ...rest
    },
    ref,
  ) {
    const styles = useMemo(
      () => ({
        ...fileUploadBase,
        ...(appearanceStyles[appearance || 'default'] ?? {}),
      }),
      [appearance],
    )
    const resolvedTexts = useMemo(
      () => ({ ...defaultTexts, ...(texts ?? {}) }),
      [texts],
    )

    const fileInputRef = useRef<HTMLInputElement | null>(null)
    const { isFocusVisible, handleFocus, handleBlur } = useBrowserFocusVisible()

    const fileList = value || []

    const isImagePreview = (file: UploadFile): boolean =>
      Boolean(file.url && file.type?.startsWith('image/'))

    const showUploadArea = useMemo(() => {
      if (showUploadAreaProp === false) {
        return false
      }
      if (maxCount && fileList.length >= maxCount) {
        return false
      }
      return true
    }, [showUploadAreaProp, maxCount, fileList.length])

    const uploadAreaTabIndex = disabled ? undefined : 0

    const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
      if (disabled || readonly) return

      const target = event.target
      const files = target.files

      if (!files || files.length === 0) return
      const fileArray = Array.from(files)
      const remainingSlots = maxCount
        ? Math.max(0, maxCount - fileList.length)
        : fileArray.length
      const filesToAdd = fileArray.slice(0, remainingSlots)
      onSelect?.(filesToAdd)

      // 清空 input 值，以便可以重复选择同一文件
      target.value = ''
    }

    const handleFileItemClick = (file: UploadFile) => {
      if (disabled || readonly) return
      onItemClick?.(file)
    }

    const chooseFile = useCallback(() => {
      if (disabled || readonly) return
      fileInputRef.current?.click()
    }, [disabled, readonly])

    const handleUploadAreaClick = () => {
      if (disabled || readonly) return
      chooseFile()
    }

    const handleUploadAreaFocus = () => {
      if (disabled) return
      handleFocus()
    }

    const handleUploadAreaBlur = () => {
      handleBlur()
    }

    const handleUploadAreaKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
      if (disabled) return
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        handleUploadAreaClick()
      }
    }

    const handleRemove = (file: UploadFile) => {
      if (disabled || readonly) return
      onRemove?.(file)
    }

    const handleRetry = (file: UploadFile) => {
      if (disabled || readonly) return
      onRetry?.(file)
    }

    useImperativeHandle(
      ref,
      () => ({
        chooseFile,
        getFileList: () => [...fileList],
        clearFilesList: () => {
          onChange?.([])
        },
        remove: handleRemove,
        retry: handleRetry,
      }),
    )

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
        {/* 文件列表 */}
        {fileList.map((file) => (
          <div
            key={file.uid}
            className={[
              styles.fileItem,
              file.status === 'failed'
                ? styles.fileItemError
                : file.status === 'uploading'
                  ? styles.fileItemUploading
                  : file.status === 'success'
                    ? styles.fileItemSuccess
                    : styles.fileItemReady,
              disabled
                ? styles.fileItemDisabled
                : readonly
                  ? styles.fileItemReadonly
                  : styles.fileItemNormal,
            ]
              .filter(Boolean)
              .join(' ')}
            onClick={() => handleFileItemClick(file)}
          >
            <div className={styles.fileInfo}>
              {/* 图片：缩略图 */}
              {isImagePreview(file) ? (
                <div className={styles.filePreview}>
                  <img src={file.url} alt={file.name} className={styles.filePreviewImage} />
                </div>
              ) : (
                /* 非图片：CwFileIcon + 文件名 */
                <div className={styles.fileDocPreview}>
                  <CwFileIcon path={file.name} size={1.75} />
                  <div className={styles.fileName} title={file.name}>
                    {file.name}
                  </div>
                </div>
              )}

              {/* 状态覆盖层（上传中 / 失败 / 等待） */}
              {(file.status === 'uploading' ||
                file.status === 'failed' ||
                file.status === 'ready') && (
                <div className={styles.fileStatusOverlay}>
                  {file.status === 'failed' ? (
                    <div>
                      <CwIcon name="common--status--close-line" size={1.5} />
                    </div>
                  ) : (
                    <div>
                      <CwLoading
                        type="spinner"
                        size="medium"
                        spinnerClass={fileUploadOverlaySpinnerClass}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* 删除（图片 / 文件统一挂在格子右上角） */}
              {deletable && !readonly && !disabled && (
                <div
                  className={styles.deleteButton}
                  role="button"
                  aria-label={resolvedTexts.delete}
                  onClick={(event) => {
                    event.stopPropagation()
                    event.preventDefault()
                    handleRemove(file)
                  }}
                >
                  <div className={styles.deleteButtonBg} />
                  <div className={styles.deleteButtonIcon}>
                    <CwIcon name="common--status--close-line" size={0.75} />
                  </div>
                </div>
              )}

              {actions && <div className={styles.fileActionsContainer}>{actions(file)}</div>}
            </div>
          </div>
        ))}

        {/* 上传区域 */}
        {showUploadArea && (
          <div
            className={[
              styles.uploadArea,
              disabled
                ? styles.uploadAreaDisabled
                : readonly
                  ? styles.uploadAreaReadonly
                  : styles.uploadAreaNormal,
              isFocusVisible && !disabled ? styles.uploadAreaFocused : '',
            ]
              .filter(Boolean)
              .join(' ')}
            tabIndex={uploadAreaTabIndex}
            role="button"
            aria-disabled={disabled ? 'true' : 'false'}
            aria-readonly={readonly ? 'true' : 'false'}
            onClick={handleUploadAreaClick}
            onFocus={handleUploadAreaFocus}
            onBlur={handleUploadAreaBlur}
            onKeyDown={handleUploadAreaKeyDown}
          >
            {/* 上传区域内容：可以通过 uploadArea 自定义 */}
            {uploadArea ?? <CwIcon name="common--action--upload-line" prefix="icon" size={2} />}
          </div>
        )}

        {/* 隐藏的文件输入（始终存在，以支持外部调用方法） */}
        <input
          ref={fileInputRef}
          className={styles.fileInput}
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={disabled || readonly}
          onChange={handleFileSelect}
        />
      </div>
    )
  },
)

export default CwFileUpload
